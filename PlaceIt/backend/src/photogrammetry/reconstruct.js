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
  // __dirname is backend/src/photogrammetry, so ../../../ gets to the project root
  const projectRoot = path.resolve(__dirname, '../../');
  const photogrammetryRoot = path.join(projectRoot, 'photogrammetry');

  // Define the dedicated workspace for this furniture ID inside the photogrammetry folder
  const workRoot = path.join(photogrammetryRoot, furnitureId.toString());

  console.log(`Starting 3D reconstruction for furnitureId: ${furnitureId}`);
  console.log(`Dedicated workspace: ${workRoot}`);

  // Create the dedicated workspace directory
  await fs.mkdir(workRoot, { recursive: true });

  let videoAssetId = null; // To store the ID of the video media asset for job tracking
  let videoUrl = null; // To store the video URL for job creation
  let jobId = null; // To store the job ID for tracking

  try {
    // 1. Download 360-video into <workRoot>/video/video.mp4
    const videoDir = path.join(workRoot, 'video');
    const videoDestPath = path.join(videoDir, 'video.mp4');
    await fs.mkdir(videoDir, { recursive: true }); // Ensure video directory exists inside workRoot

    // Fetch and store the video media asset details, especially its ID
    const mediaAsset = await fetchFurnitureVideo(furnitureId, videoDestPath);
    videoAssetId = mediaAsset.id; // Store the video asset ID
    videoUrl = mediaAsset.url; // Store the video URL    // 2. Atomic check-and-create for job to prevent race conditions
    console.log(`Checking for existing model_generation_job for furnitureId: ${furnitureId}, videoAssetId: ${videoAssetId}`);
    
    // First, try to find any existing job for this furniture + video combination
    const { data: existingJob, error: checkJobErr } = await supabase
      .from('model_generation_jobs')
      .select('id, status, output_model_url')
      .eq('furniture_id', furnitureId)
      .eq('video_asset_id', videoAssetId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (checkJobErr && checkJobErr.code !== 'PGRST116') { // PGRST116 means "No rows found"
      console.error(`Error checking existing model_generation_job: ${checkJobErr.message}`);
      throw new Error(`Failed to check existing job: ${checkJobErr.message}`);
    }

    if (existingJob) {
      jobId = existingJob.id;
      console.log(`Found existing job with ID: ${jobId}, status: ${existingJob.status}`);
      
      // Check if job is already completed
      if (existingJob.status === 'completed') {
        console.log(`Job for furnitureId ${furnitureId} is already completed. Model URL: ${existingJob.output_model_url}`);
        return; // Exit early - no need to reprocess
      }
      
      // Check if job is currently processing
      if (existingJob.status === 'processing') {
        console.log(`Job for furnitureId ${furnitureId} is already processing. Skipping to avoid duplicate processing.`);
        return; // Exit early - avoid duplicate processing
      }
      
      // If job exists but failed or is pending, update it to retry
      console.log(`Updating existing job status from '${existingJob.status}' to 'processing'`);
      const { error: updateJobErr } = await supabase
        .from('model_generation_jobs')
        .update({ 
          status: 'processing',
          error_message: null, // Clear previous error
          error_code: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .eq('status', existingJob.status); // Add status condition to prevent conflicts

      if (updateJobErr) {
        console.error(`Failed to update existing job to 'processing': ${updateJobErr.message}`);
        throw new Error(`Failed to update job status: ${updateJobErr.message}`);
      }
    } else {
      // No existing job found, try to create a new one atomically
      console.log(`No existing job found. Creating new model_generation_job for furnitureId: ${furnitureId}`);
      
      // If fetchFurnitureVideo doesn't return the URL, fetch it from media_assets table
      if (!videoUrl) {
        console.log(`Fetching video URL from media_assets table for videoAssetId: ${videoAssetId}`);
        const { data: mediaAssetData, error: fetchUrlErr } = await supabase
          .from('media_assets')
          .select('url')
          .eq('id', videoAssetId)
          .single();

        if (fetchUrlErr) {
          console.error(`Failed to fetch video URL from media_assets: ${fetchUrlErr.message}`);
          throw new Error(`Failed to fetch video URL: ${fetchUrlErr.message}`);
        }
        
        videoUrl = mediaAssetData.url;
      }

      // Attempt atomic insert with unique constraint handling
      const { data: newJob, error: createJobErr } = await supabase
        .from('model_generation_jobs')
        .insert([{
          furniture_id: furnitureId,
          video_asset_id: videoAssetId,
          video_url: videoUrl,
          status: 'processing', // Set directly to processing to claim the job
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (createJobErr) {
        // Check if this is a unique constraint violation (job already exists)
        if (createJobErr.code === '23505' || createJobErr.message.includes('duplicate') || createJobErr.message.includes('unique')) {
          console.log(`Job already exists for furnitureId: ${furnitureId}, videoAssetId: ${videoAssetId}. Another process created it.`);
          // Re-query to get the existing job
          const { data: retryJob, error: retryErr } = await supabase
            .from('model_generation_jobs')
            .select('id, status')
            .eq('furniture_id', furnitureId)
            .eq('video_asset_id', videoAssetId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (retryErr) {
            throw new Error(`Failed to fetch existing job after conflict: ${retryErr.message}`);
          }
          
          // If the other job is processing, exit gracefully
          if (retryJob.status === 'processing') {
            console.log(`Another process is already processing this job. Exiting.`);
            return;
          }
          
          jobId = retryJob.id;
        } else {
          console.error(`Failed to create new model_generation_job: ${createJobErr.message}`);
          throw new Error(`Failed to create job: ${createJobErr.message}`);
        }
      } else {
        jobId = newJob.id;
        console.log(`Created new job with ID: ${jobId}`);
      }
    }

    // 3. Run photogrammetry pipeline (photogrammetry/main.py)
    const pythonScriptPath = path.join(photogrammetryRoot, 'main.py');
    console.log(`Python script path: ${pythonScriptPath}`);

    // The Python script's CWD will be the main 'photogrammetry' folder.
    // It will then be instructed to use the 'workRoot' as its workspace.
    await runPython(
      [
        pythonScriptPath,
        '--workspace', workRoot, // Python script will use this as its working directory
        '--video_input', videoDestPath, // Pass the explicit video path to Python script
        '--output_dir', path.join(workRoot, 'output'), // Ensure output directory is also in workspace
        '--openmvs', process.env.OPENMVS_LOCAL_PATH // e.g. C:\OpenMVS\bin
      ],
      photogrammetryRoot // Set CWD for the Python process to the main photogrammetry folder
    );

    // 4. Upload GLB back to Supabase
    const glbOutputFolder = path.join(workRoot, 'output');
    const glbFilename = 'scene_textured_mesh.glb'; // Standard output filename from main.py
    const glbPath = path.join(glbOutputFolder, glbFilename);
    const glbStoragePath = `${furnitureId}/model.glb`; // Path in Supabase Storage bucket

    // Check if GLB file exists before reading
    try {
      await fs.access(glbPath); // This will throw an error if the file does not exist
    } catch (e) {
      // Update job status to 'failed' if GLB is not found
      await supabase.from('model_generation_jobs')
        .update({ 
          status: 'failed', 
          error_message: `GLB output file not found: ${e.message}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      throw new Error(`GLB output file not found at ${glbPath}. Photogrammetry failed to produce output. Error: ${e.message}`);
    }

    const glbBytes = await fs.readFile(glbPath);

    console.log(`Uploading GLB model for furnitureId: ${furnitureId}`);
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('furniture-models') // Ensure this bucket exists in Supabase Storage
      .upload(glbStoragePath, glbBytes, {
        contentType: 'model/gltf-binary',
        upsert: true // Overwrite if already exists
      });

    if (uploadErr) {
      // Update job status to 'failed' if upload fails
      await supabase.from('model_generation_jobs')
        .update({ 
          status: 'failed', 
          error_message: `GLB upload failed: ${uploadErr.message}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
      throw new Error(`Failed to upload GLB model to Supabase Storage: ${uploadErr.message}`);
    }
    console.log(`GLB model uploaded to Supabase Storage: ${glbStoragePath}`);

    // Get the public URL of the uploaded GLB
    const { data: publicUrlData } = supabase.storage
      .from('furniture-models')
      .getPublicUrl(glbStoragePath);

    const publicGlbUrl = publicUrlData.publicUrl;
    if (!publicGlbUrl) {
      console.warn(`Could not get public URL for ${glbStoragePath}. Database update will proceed without it.`);
    }

    // 5. Update Database Tables
    console.log(`Updating database for furnitureId: ${furnitureId}`);
    // A. Update 'furniture' table
    const { error: updateFurnitureErr } = await supabase
      .from('furniture')
      .update({
        has_3d_model: true,
        has_ar_support: true,
        updated_at: new Date().toISOString(), // Manually update timestamp if trigger isn't enough
      })
      .eq('id', furnitureId);

    if (updateFurnitureErr) {
      console.error(`Failed to update 'furniture' table for ${furnitureId}: ${updateFurnitureErr.message}`);
      // Decide if this should be a fatal error or just logged. For now, log and continue.
    } else {
      console.log(`'furniture' table updated for ${furnitureId}`);
    }

    // B. Insert/Update 'media_assets' table for the 3D model
    // Check if a 'model_3d' entry already exists for this furniture to avoid duplicates
    const { data: existingModelAsset, error: checkAssetErr } = await supabase
      .from('media_assets')
      .select('id')
      .eq('furniture_id', furnitureId)
      .eq('type', 'model_3d')
      .limit(1)
      .single();

    if (checkAssetErr && checkAssetErr.code !== 'PGRST116') { // PGRST116 means "No rows found"
      console.error(`Error checking existing media_asset for 3D model: ${checkAssetErr.message}`);
    }

    const modelAssetData = {
      furniture_id: furnitureId,
      type: 'model_3d',
      url: publicGlbUrl,
      filename: glbFilename,
      file_size: glbBytes.length, // Size in bytes
      mime_type: 'model/gltf-binary',
      alt_text: `3D model of furniture ID ${furnitureId}`,
      is_primary: true, // Assuming this is the primary 3D model
    };

    if (existingModelAsset) {
      // Update existing entry
      console.log(`Updating existing 'media_assets' entry for 3D model of ${furnitureId}`);
      const { error: updateAssetErr } = await supabase
        .from('media_assets')
        .update(modelAssetData)
        .eq('id', existingModelAsset.id);

      if (updateAssetErr) {
        console.error(`Failed to update 'media_assets' for 3D model for ${furnitureId}: ${updateAssetErr.message}`);
      } else {
        console.log(`'media_assets' updated for 3D model of ${furnitureId}`);
      }
    } else {
      // Insert new entry
      console.log(`Inserting new 'media_assets' entry for 3D model of ${furnitureId}`);
      const { error: insertAssetErr } = await supabase
        .from('media_assets')
        .insert([modelAssetData]);

      if (insertAssetErr) {
        console.error(`Failed to insert 'media_assets' for 3D model for ${furnitureId}: ${insertAssetErr.message}`);
      } else {
        console.log(`'media_assets' inserted for 3D model of ${furnitureId}`);
      }
    }

    // C. Update 'model_generation_jobs' table to completed
    console.log(`Updating 'model_generation_jobs' status to 'completed' for jobId: ${jobId}`);
    const { error: finalUpdateJobErr } = await supabase
      .from('model_generation_jobs')
      .update({
        status: 'completed',
        output_model_url: publicGlbUrl,
        error_message: null, // Clear any previous errors
        error_code: null,
        updated_at: new Date().toISOString(), // Manually update timestamp if trigger isn't enough
        // TODO: Add processing_time_seconds calculation if start time is tracked
      })
      .eq('id', jobId);

    if (finalUpdateJobErr) {
      console.error(`Failed to finalize 'model_generation_jobs' for jobId ${jobId}: ${finalUpdateJobErr.message}`);
    } else {
      console.log(`'model_generation_jobs' finalized for jobId: ${jobId}`);
    }

    console.log(`3D reconstruction completed successfully for furnitureId: ${furnitureId}`);

  } catch (overallError) {
    console.error(`Overall error during reconstruction for ${furnitureId}:`, overallError.message);
    // Attempt to update model_generation_jobs to 'failed' if a job was initiated
    if (jobId) {
        console.log(`Attempting to mark model_generation_job as 'failed' for jobId: ${jobId}...`);
        const { error: failJobErr } = await supabase
            .from('model_generation_jobs')
            .update({
                status: 'failed',
                error_message: overallError.message,
                updated_at: new Date().toISOString()
            })
            .eq('id', jobId);
        if (failJobErr) {
            console.error(`Failed to mark model_generation_job as 'failed' for jobId ${jobId}: ${failJobErr.message}`);
        } else {
            console.log(`Model generation job marked as 'failed' for jobId: ${jobId}.`);
        }
    }
    throw overallError; // Re-throw the error to indicate failure
  } finally {
    // Always clean up the furniture-specific directory
    console.log(`Cleaning up dedicated workspace: ${workRoot}`);
    await cleanupWorkspace(workRoot, furnitureId);
    console.log(`Cleaned up workspace for ${furnitureId}`);
  }
}

// CommonJS export
module.exports = {
  reconstructFurniture,
};