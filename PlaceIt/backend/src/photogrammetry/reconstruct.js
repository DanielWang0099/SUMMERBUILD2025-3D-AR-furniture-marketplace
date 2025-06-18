require('dotenv').config(); // Load environment variables from .env file
const { createClient } = require('@supabase/supabase-js');
const { spawn } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
// IMPORTANT: Use the Service Role Key for backend operations (if available)
// Fallback to ANON_KEY only if SERVICE_ROLE_KEY is not set (for development convenience, but avoid in production)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Downloads a video asset related to a furniture item from Supabase Storage or an external URL.
 *
 * @param {string} furnitureId The ID of the furniture item.
 * @param {string} destFile The full path where the video should be saved.
 * @returns {Promise<object>} A promise that resolves with the media asset object ({ id, url }) when the video is downloaded.
 * @throws {Error} If the DB lookup fails, no video is found, or download fails.
 */
async function fetchFurnitureVideo(furnitureId, destFile) {
  // 1. query the DB row to get the video URL and its ID
  const { data: media, error: qErr } = await supabase
    .from('media_assets')
    .select('id, url') // Select ID as well
    .eq('furniture_id', furnitureId)
    .eq('type', 'video')
    .limit(1)
    .single();

  if (qErr) {
    throw new Error(`DB lookup failed for video URL for furniture ID ${furnitureId}: ${qErr.message}`);
  }
  if (!media) {
    throw new Error(`No video asset found for furniture item ID: ${furnitureId}`);
  }

  const videoUrl = media.url;

  // Ensure the destination directory exists before writing the file
  await fs.mkdir(path.dirname(destFile), { recursive: true });

  // 2. recognize Supabase Storage URLs or plain HTTP(S) download
  const u = new URL(videoUrl);
  const pathParts = u.pathname.split('/').filter(Boolean); // Filter(Boolean) removes empty strings

  // Check for the typical Supabase storage path pattern: /storage/v1/object/public/<bucket>/<key>
  const isStorage = pathParts[0] === 'storage' && pathParts[1] === 'v1' && pathParts[2] === 'object';

  if (isStorage) {
    // Determine bucket and object key from the URL path
    // Example: /storage/v1/object/public/furniture-videos/furniture-id-123/video.mp4
    const bucket = pathParts[4]; // 'furniture-videos' in the example
    const objectKey = pathParts.slice(5).join('/'); // 'furniture-id-123/video.mp4' in the example

    console.log(`Downloading from Supabase Storage: bucket='${bucket}', objectKey='${objectKey}'`);

    const { data: blob, error: dErr } =
      await supabase.storage.from(bucket).download(objectKey);

    if (dErr) {
      throw new Error(`Supabase Storage download failed for ${objectKey}: ${dErr.message}`);
    }
    if (!blob) {
      throw new Error(`Supabase Storage download returned empty blob for ${objectKey}`);
    }

    // Convert blob to Buffer and write to file
    await fs.writeFile(destFile, Buffer.from(await blob.arrayBuffer()));
    console.log(`Video downloaded to: ${destFile}`);
  } else {
    // plain HTTP(S) download
    console.log(`Downloading video from external URL: ${videoUrl}`);
    const res = await fetch(videoUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} error when downloading video from ${videoUrl}`);
    }

    // Use stream pipeline for efficient large file downloads
    await pipeline(res.body, createWriteStream(destFile));
    console.log(`Video downloaded to: ${destFile}`);
  }
  return media; // Return the full media object including its ID
}

/**
 * Runs a Python script and waits for its exit.
 * @param {string[]} args Arguments to pass to the Python script.
 * @param {string} cwd The current working directory for the Python script.
 * @returns {Promise<void>} A promise that resolves if the script exits successfully, rejects otherwise.
 */
function runPython(args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`Running Python script: python ${args.join(' ')} in ${cwd}`);
    // stdio: 'inherit' streams stdout/stderr from Python to Node's console
    const proc = spawn('python', args, { cwd, stdio: 'inherit' });

    proc.on('exit', code => {
      if (code === 0) {
        console.log('Python script exited successfully.');
        resolve();
      } else {
        const errorMessage = `Python script exited with code ${code}`;
        console.error(errorMessage);
        reject(new Error(errorMessage));
      }
    });

    proc.on('error', err => {
      console.error('Failed to start Python process:', err);
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });
  });
}


/**
 * Aggressively cleans up workspace directories and OpenMVS temporary files
 * @param {string} workRoot - The workspace root directory
 * @param {string} furnitureId - The furniture ID for logging
 */
async function cleanupWorkspace(workRoot, furnitureId) {
  console.log(`Starting aggressive cleanup for workspace: ${workRoot}`);
  
  try {
    // First, try to remove the entire workspace directory
    await fs.rm(workRoot, { recursive: true, force: true });
    console.log(`Removed workspace directory: ${workRoot}`);
    
    // Also clean up any potential OpenMVS temp files that might be lingering
    // OpenMVS sometimes creates temp files in system temp directories
    const tempDirs = [
      process.env.TEMP,
      process.env.TMP,
      '/tmp',
      path.join(require('os').homedir(), 'tmp')
    ].filter(Boolean);
    
    for (const tempDir of tempDirs) {
      if (await fs.access(tempDir).then(() => true).catch(() => false)) {
        try {
          const files = await fs.readdir(tempDir);
          const mvsTempFiles = files.filter(file => 
            file.includes('mvs') || 
            file.includes('openmvs') || 
            file.includes(furnitureId)
          );
          
          for (const file of mvsTempFiles) {
            const filePath = path.join(tempDir, file);
            await fs.rm(filePath, { recursive: true, force: true });
            console.log(`Cleaned temp file: ${filePath}`);
          }
        } catch (err) {
          console.warn(`Could not clean temp directory ${tempDir}:`, err.message);
        }
      }
    }
    
  } catch (error) {
    console.error(`Error during workspace cleanup:`, error.message);
  }
}

/**
 * Public API: Creates or refreshes a 3D mesh for a furniture item using photogrammetry.
 * The process involves downloading a video, running a Python photogrammetry pipeline,
 * and uploading the resulting GLB model to Supabase Storage.
 *
 * @param {string} furnitureId The unique ID of the furniture item.
 * @returns {Promise<void>} A promise that resolves when the reconstruction is complete.
 */
async function reconstructFurniture(furnitureId) {
  // Determine the root of the project to find the 'photogrammetry' folder
  const projectRoot = path.resolve(__dirname, '../../');
  const photogrammetryRoot = path.join(projectRoot, 'photogrammetry');
  const workRoot = path.join(photogrammetryRoot, furnitureId.toString());

  console.log(`Starting 3D reconstruction for furnitureId: ${furnitureId}`);
  console.log(`Dedicated workspace: ${workRoot}`);

  // Create the dedicated workspace directory
  await fs.mkdir(workRoot, { recursive: true });

  let videoAssetId = null;
  let videoUrl = null;
  let jobId = null;

  try {
    // 1. Download 360-video into <workRoot>/video/video.mp4
    const videoDir = path.join(workRoot, 'video');
    const videoDestPath = path.join(videoDir, 'video.mp4');
    await fs.mkdir(videoDir, { recursive: true });

    // Fetch and store the video media asset details
    const mediaAsset = await fetchFurnitureVideo(furnitureId, videoDestPath);
    videoAssetId = mediaAsset.id;
    videoUrl = mediaAsset.url;

    // 2. ATOMIC job creation/claiming - SINGLE SOURCE OF TRUTH
    console.log(`Managing job for furnitureId: ${furnitureId}, videoAssetId: ${videoAssetId}`);
    
    // Use a transaction-like approach with proper error handling
    let jobCreated = false;
    let attemptCount = 0;
    const maxAttempts = 3;

    while (!jobCreated && attemptCount < maxAttempts) {
      attemptCount++;
      console.log(`Job management attempt ${attemptCount}/${maxAttempts}`);

      // First, try to find any existing job for this furniture + video combination
      const { data: existingJob, error: checkJobErr } = await supabase
        .from('model_generation_jobs')
        .select('id, status, output_model_url')
        .eq('furniture_id', furnitureId)
        .eq('video_asset_id', videoAssetId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (checkJobErr && checkJobErr.code !== 'PGRST116') {
        console.error(`Error checking existing job: ${checkJobErr.message}`);
        throw new Error(`Failed to check existing job: ${checkJobErr.message}`);
      }

      if (existingJob) {
        jobId = existingJob.id;
        console.log(`Found existing job with ID: ${jobId}, status: ${existingJob.status}`);
        
        // Handle different statuses
        if (existingJob.status === 'completed') {
          console.log(`Job already completed. Model URL: ${existingJob.output_model_url}`);
          return; // Exit early - work is done
        }
        
        if (existingJob.status === 'processing') {
          console.log(`Job already processing. Exiting to avoid duplicate work.`);
          return; // Exit early - another process is working
        }
        
        // Job exists but is failed/pending - try to claim it by updating to processing
        console.log(`Attempting to claim existing job (status: ${existingJob.status})`);
        const { error: claimJobErr } = await supabase
          .from('model_generation_jobs')
          .update({ 
            status: 'processing',
            error_message: null,
            error_code: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId)
          .eq('status', existingJob.status); // Prevent race conditions

        if (claimJobErr) {
          console.log(`Failed to claim existing job: ${claimJobErr.message}. Will retry.`);
          continue; // Retry the loop
        }
        
        console.log(`Successfully claimed existing job: ${jobId}`);
        jobCreated = true;
      } else {
        // No existing job - try to create one
        console.log(`Creating new job for furnitureId: ${furnitureId}`);
        
        const { data: newJob, error: createJobErr } = await supabase
          .from('model_generation_jobs')
          .insert([{
            furniture_id: furnitureId,
            video_asset_id: videoAssetId,
            video_url: videoUrl,
            status: 'processing', // Immediately claim it
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select('id')
          .single();

        if (createJobErr) {
          // Check for unique constraint violation (race condition)
          if (createJobErr.code === '23505' || 
              createJobErr.message.includes('duplicate') || 
              createJobErr.message.includes('unique')) {
            console.log(`Race condition detected: job created by another process. Retrying...`);
            continue; // Retry to find and claim the job
          } else {
            console.error(`Failed to create job: ${createJobErr.message}`);
            throw new Error(`Failed to create job: ${createJobErr.message}`);
          }
        } else {
          jobId = newJob.id;
          console.log(`Successfully created and claimed new job: ${jobId}`);
          jobCreated = true;
        }
      }
    }

    if (!jobCreated) {
      throw new Error(`Failed to create or claim job after ${maxAttempts} attempts`);
    }

    // 3. Run photogrammetry pipeline
    const pythonScriptPath = path.join(photogrammetryRoot, 'main.py');
    console.log(`Running photogrammetry pipeline: ${pythonScriptPath}`);

    await runPython(
      [
        pythonScriptPath,
        '--workspace', workRoot,
        '--video_input', videoDestPath,
        '--output_dir', path.join(workRoot, 'output'),
        '--openmvs', process.env.OPENMVS_LOCAL_PATH
      ],
      photogrammetryRoot
    );

    // 4. Upload GLB to Supabase Storage
    const glbOutputFolder = path.join(workRoot, 'output');
    const glbFilename = 'scene_textured_mesh.glb';
    const glbPath = path.join(glbOutputFolder, glbFilename);
    const glbStoragePath = `${furnitureId}/model.glb`;

    // Verify GLB file exists
    try {
      await fs.access(glbPath);
    } catch (e) {
      await updateJobStatus(jobId, 'failed', `GLB output file not found: ${e.message}`);
      throw new Error(`GLB output file not found at ${glbPath}`);
    }

    const glbBytes = await fs.readFile(glbPath);
    console.log(`Uploading GLB model for furnitureId: ${furnitureId}`);

    const { error: uploadErr } = await supabase.storage
      .from('furniture-models')
      .upload(glbStoragePath, glbBytes, {
        contentType: 'model/gltf-binary',
        upsert: true
      });

    if (uploadErr) {
      await updateJobStatus(jobId, 'failed', `GLB upload failed: ${uploadErr.message}`);
      throw new Error(`Failed to upload GLB: ${uploadErr.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('furniture-models')
      .getPublicUrl(glbStoragePath);

    const publicGlbUrl = publicUrlData.publicUrl;

    // 5. Update all database tables
    console.log(`Updating database for furnitureId: ${furnitureId}`);

    // Update furniture table
    await supabase
      .from('furniture')
      .update({
        has_3d_model: true,
        has_ar_support: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', furnitureId);

    // Handle media_assets for 3D model
    await upsertModelMediaAsset(furnitureId, publicGlbUrl, glbFilename, glbBytes.length);

    // Mark job as completed
    await updateJobStatus(jobId, 'completed', null, publicGlbUrl);

    console.log(`3D reconstruction completed successfully for furnitureId: ${furnitureId}`);

  } catch (overallError) {
    console.error(`Error during reconstruction for ${furnitureId}:`, overallError.message);
    
    // Update job status to failed if we have a job ID
    if (jobId) {
      await updateJobStatus(jobId, 'failed', overallError.message);
    }
    
    throw overallError;
  } finally {
    // Cleanup workspace
    console.log(`Cleaning up workspace: ${workRoot}`);
    await cleanupWorkspace(workRoot, furnitureId);
  }
}

// Helper function to update job status consistently
async function updateJobStatus(jobId, status, errorMessage = null, outputUrl = null) {
  console.log(`Updating job ${jobId} status to: ${status}`);
  
  const updateData = {
    status: status,
    updated_at: new Date().toISOString()
  };
  
  if (status === 'failed') {
    updateData.error_message = errorMessage;
  } else if (status === 'completed') {
    updateData.output_model_url = outputUrl;
    updateData.error_message = null;
    updateData.error_code = null;
  }
  
  const { error } = await supabase
    .from('model_generation_jobs')
    .update(updateData)
    .eq('id', jobId);
    
  if (error) {
    console.error(`Failed to update job ${jobId} status: ${error.message}`);
  }
}

// Helper function to handle media_assets upsert
async function upsertModelMediaAsset(furnitureId, publicGlbUrl, glbFilename, fileSize) {
  const { data: existingAsset, error: checkErr } = await supabase
    .from('media_assets')
    .select('id')
    .eq('furniture_id', furnitureId)
    .eq('type', 'model_3d')
    .single();

  const assetData = {
    furniture_id: furnitureId,
    type: 'model_3d',
    url: publicGlbUrl,
    filename: glbFilename,
    file_size: fileSize,
    mime_type: 'model/gltf-binary',
    alt_text: `3D model of furniture ID ${furnitureId}`,
    is_primary: true
  };

  if (checkErr && checkErr.code !== 'PGRST116') {
    console.error(`Error checking existing media asset: ${checkErr.message}`);
    return;
  }

  if (existingAsset) {
    await supabase
      .from('media_assets')
      .update(assetData)
      .eq('id', existingAsset.id);
    console.log(`Updated media_assets for furnitureId: ${furnitureId}`);
  } else {
    await supabase
      .from('media_assets')
      .insert([assetData]);
    console.log(`Inserted media_assets for furnitureId: ${furnitureId}`);
  }
}

// CommonJS export
module.exports = {
  reconstructFurniture,
};