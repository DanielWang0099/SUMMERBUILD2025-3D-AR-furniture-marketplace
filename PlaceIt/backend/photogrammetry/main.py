import subprocess
import os
import argparse
import sys
import shutil

def run_command(command, cwd=None, check=True, capture_output=False, text=True, timeout=None):
    """
    Helper function to execute shell commands.

    Args:
        command (list): A list of strings representing the command and its arguments.
        cwd (str, optional): The current working directory for the command. Defaults to None.
        check (bool, optional): If True, raise a CalledProcessError if the command returns a non-zero exit code. Defaults to True.
        capture_output (bool, optional): If True, capture stdout and stderr. Defaults to False.
        text (bool, optional): If True, stdout and stderr are returned as strings. Defaults to True.
        timeout (int, optional): If set, the command will be killed if it doesn't complete within this many seconds. Defaults to None.

    Raises:
        subprocess.CalledProcessError: If check is True and the command returns a non-zero exit code.
        FileNotFoundError: If the command executable is not found.
        Exception: For any other unexpected errors during command execution.
    """
    print(f"Executing command: {' '.join(command)}")
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            check=check,
            capture_output=capture_output,
            text=text,
            timeout=timeout
        )
        if capture_output:
            print(f"STDOUT:\n{result.stdout}")
            if result.stderr:
                print(f"STDERR:\n{result.stderr}")
        return result
    except subprocess.CalledProcessError as e:
        print(f"Command failed with exit code {e.returncode}: {e.cmd}", file=sys.stderr)
        if e.stdout:
            print(f"STDOUT:\n{e.stdout}", file=sys.stderr)
        if e.stderr:
            print(f"STDERR:\n{e.stderr}", file=sys.stderr)
        raise # Re-raise to be caught by the main try-except block
    except FileNotFoundError:
        print(f"Error: Command '{command[0]}' not found. Make sure it's in your system's PATH or specify its full path.", file=sys.stderr)
        raise
    except Exception as e:
        print(f"An unexpected error occurred while running command: {e}", file=sys.stderr)
        raise

def extract_frames(video_path, output_images_dir, fps):
    """
    Extracts frames from a video using FFmpeg.

    Args:
        video_path (str): Full path to the input video file.
        output_images_dir (str): Directory where extracted image frames will be saved.
        fps (int): Frames per second to extract.
    """
    print(f"\n--- Part 1: Frame Extraction (FFmpeg) ---")
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video input file not found: {video_path}")

    os.makedirs(output_images_dir, exist_ok=True)

    command = [
        'ffmpeg',
        '-i', video_path,
        '-vf', f'fps={fps}',
        os.path.join(output_images_dir, 'frame_%04d.jpg')
    ]
    run_command(command)
    print(f"Frames extracted to: {output_images_dir}")

def run_colmap_sfm(workspace_path, image_path, undistorted_output_path):
    """
    Performs Structure-from-Motion (SfM) using COLMAP.

    Args:
        workspace_path (str): The root workspace for COLMAP, where databases, sparse models are stored.
        image_path (str): Path to the directory containing input images for COLMAP.
        undistorted_output_path (str): Path where undistorted images and dense reconstruction will be saved.
    """
    print(f"\n--- Part 2: Structure-from-Motion (COLMAP) ---")

    # Ensure necessary COLMAP output directories exist
    # COLMAP creates 'sparse' and 'database.db' directly in workspace_path
    # 'sparse/0' subdirectory is created by automatic_reconstructor
    os.makedirs(os.path.join(workspace_path, 'sparse'), exist_ok=True)
    os.makedirs(undistorted_output_path, exist_ok=True)

    # COLMAP automatic_reconstructor
    print("Running COLMAP automatic_reconstructor...")
    command_reconstruct = [
        'colmap', 'automatic_reconstructor',
        '--workspace_path', workspace_path,
        '--image_path', image_path,
        '--single_camera', 'true' # Assuming single camera setup
    ]
    run_command(command_reconstruct)
    print("COLMAP automatic_reconstructor completed.")

    # COLMAP image_undistorter
    print("Running COLMAP image_undistorter...")
    colmap_sparse_input = os.path.join(workspace_path, 'sparse', '0')
    if not os.path.exists(colmap_sparse_input):
        raise FileNotFoundError(f"COLMAP sparse model (sparse/0) not found at {colmap_sparse_input}. SfM might have failed.")

    command_undistort = [
        'colmap', 'image_undistorter',
        '--image_path', image_path,
        '--input_path', colmap_sparse_input,
        '--output_path', undistorted_output_path
    ]
    run_command(command_undistort)
    print("COLMAP image_undistorter completed.")

def run_openmvs_reconstruction(openmvs_bin_path, colmap_undistorted_output_path, mvs_output_dir):
    """
    Performs 3D mesh reconstruction using OpenMVS tools.

    Args:
        openmvs_bin_path (str): Path to the directory containing OpenMVS executable files.
        colmap_undistorted_output_path (str): Path to the output directory from COLMAP's image_undistorter.
        mvs_output_dir (str): Directory for OpenMVS intermediate and final OBJ output.
    """
    print(f"\n--- Part 3: 3D Mesh Reconstruction (OpenMVS) ---")

    # Ensure OpenMVS output directory exists
    os.makedirs(mvs_output_dir, exist_ok=True)

    # Store current working directory to restore later
    original_cwd = os.getcwd()
    
    try:
        # Change to OpenMVS bin directory
        print(f"Changing working directory to: {openmvs_bin_path}")
        os.chdir(openmvs_bin_path)

        # Define executable names (without full paths since we're in the bin directory)
        interface_colmap = 'InterfaceColmap'
        densify_point_cloud = 'DensifyPointCloud'
        reconstruct_mesh = 'ReconstructMesh'
        refine_mesh = 'RefineMesh'
        texture_mesh = 'TextureMesh'

        # Define MVS scene file paths (use absolute paths)
        mvs_scene_file = os.path.abspath(os.path.join(mvs_output_dir, 'scene.mvs'))
        densified_scene_file = os.path.abspath(os.path.join(mvs_output_dir, 'scene_dense.mvs'))
        reconstructed_mesh_file = os.path.abspath(os.path.join(mvs_output_dir, 'scene_dense_mesh.mvs'))
        refined_mesh_file = os.path.abspath(os.path.join(mvs_output_dir, 'scene_dense_mesh_refine.mvs'))
        textured_obj_file = os.path.abspath(os.path.join(mvs_output_dir, 'scene_textured_mesh.obj'))

        # Convert relative paths to absolute paths
        colmap_undistorted_output_path = os.path.abspath(colmap_undistorted_output_path)
        mvs_output_dir = os.path.abspath(mvs_output_dir)

        # 1. InterfaceColmap: Convert COLMAP output to MVS format
        print("Running InterfaceColmap...")
        command_interface = [
            interface_colmap,
            '-i', colmap_undistorted_output_path,
            '-o', mvs_scene_file,
            '-w', colmap_undistorted_output_path
        ]
        run_command(command_interface, cwd=openmvs_bin_path)
        print("InterfaceColmap completed.")

        # 2. DensifyPointCloud: Generate a dense point cloud
        print("Running DensifyPointCloud...")
        command_densify = [
            densify_point_cloud,
            mvs_scene_file,
            '-w', mvs_output_dir
        ]
        run_command(command_densify, cwd=openmvs_bin_path)
        print("DensifyPointCloud completed.")

        # 3. ReconstructMesh: Create a mesh from the dense point cloud
        print("Running ReconstructMesh...")
        command_reconstruct_mesh = [
            reconstruct_mesh,
            densified_scene_file,
            '-w', mvs_output_dir
        ]
        run_command(command_reconstruct_mesh, cwd=openmvs_bin_path)
        print("ReconstructMesh completed.")

        # 4. RefineMesh: Refine the reconstructed mesh
        print("Running RefineMesh...")
        command_refine_mesh = [
            refine_mesh,
            reconstructed_mesh_file,
            '-w', mvs_output_dir
        ]
        run_command(command_refine_mesh, cwd=openmvs_bin_path)
        print("RefineMesh completed.")

        # 5. TextureMesh: Apply textures to the refined mesh and export as OBJ
        print("Running TextureMesh...")
        command_texture = [
            texture_mesh,
            refined_mesh_file,
            '--working-folder', mvs_output_dir,
            '--output-file', textured_obj_file,
            '--export-type', 'obj'
        ]
        run_command(command_texture, cwd=openmvs_bin_path)
        print(f"TextureMesh completed, OBJ file generated at: {textured_obj_file}")

    finally:
        # Always restore the original working directory
        print(f"Restoring working directory to: {original_cwd}")
        os.chdir(original_cwd)

def convert_obj_to_glb(obj_path, glb_path):
    """
    Converts an OBJ file to a GLB file.
    Assumes obj_to_glb_cleanup.py is located in the same directory as this script.

    Args:
        obj_path (str): Full path to the input OBJ file.
        glb_path (str): Full path for the output GLB file.
    """
    print(f"\n--- Part 4: OBJ to GLB Conversion ---")
    if not os.path.exists(obj_path):
        raise FileNotFoundError(f"OBJ input file not found for GLB conversion: {obj_path}")

    # Determine the path to obj_to_glb_cleanup.py, assuming it's a sibling script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    obj_to_glb_script = os.path.join(script_dir, 'obj_to_glb_cleanup.py')

    if not os.path.exists(obj_to_glb_script):
        raise FileNotFoundError(f"OBJ to GLB conversion script not found: {obj_to_glb_script}. Please ensure '{obj_to_glb_script}' exists.")

    command = [
        'blender',
        '--background',
        '--python', obj_to_glb_script,
        '--',  # everything after this is passed to your script
        obj_path,
        glb_path
    ]
    run_command(command)
    print(f"OBJ converted to GLB: {glb_path}")

def main():
    """
    Main function to parse arguments and orchestrate the photogrammetry pipeline.
    """
    parser = argparse.ArgumentParser(description="Run photogrammetry pipeline (FFmpeg, COLMAP, OpenMVS, OBJ to GLB).")
    parser.add_argument('--workspace', required=True, help='Root directory for all photogrammetry work (e.g., /path/to/photogrammetry/furniture_id).')
    parser.add_argument('--video_input', required=True, help='Full path to the input video file (e.g., /path/to/photogrammetry/furniture_id/video/video.mp4).')
    parser.add_argument('--output_dir', required=True, help='Output directory for the final GLB file and OpenMVS intermediate files (e.g., /path/to/photogrammetry/furniture_id/output).')
    parser.add_argument('--openmvs', required=True, help='Path to the OpenMVS bin directory (e.g., C:\\OpenMVS\\bin).')
    args = parser.parse_args()

    # Assign parsed arguments to variables
    workspace = args.workspace
    video_path = args.video_input
    openmvs_bin_path = args.openmvs
    final_glb_output_dir = args.output_dir # This directory will host both MVS intermediates and the final GLB

    # Define internal directory paths relative to the workspace
    images_dir = os.path.join(workspace, 'images')
    colmap_undistorted_dir = os.path.join(workspace, 'undistorted_output')

    # Create all necessary directories if they don't exist
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(colmap_undistorted_dir, exist_ok=True)
    os.makedirs(final_glb_output_dir, exist_ok=True) # This is also the MVS intermediate output directory

    try:
        print(f"Starting photogrammetry pipeline in workspace: {workspace}")
        print(f"Video input: {video_path}")
        print(f"OpenMVS bin path: {openmvs_bin_path}")
        print(f"Final GLB and MVS output directory: {final_glb_output_dir}")

        # Execute Part 1: Frame Extraction
        extract_frames(video_path, images_dir, fps=1)

        # Execute Part 2: Structure-from-Motion (SfM) with COLMAP
        run_colmap_sfm(workspace, images_dir, colmap_undistorted_dir)

        # Execute Part 3: 3D Mesh Reconstruction with OpenMVS
        # The MVS output directory is the same as the final GLB output directory
        run_openmvs_reconstruction(openmvs_bin_path, colmap_undistorted_dir, final_glb_output_dir)

        # Execute Part 4: OBJ to GLB Conversion
        obj_file_to_convert = os.path.join(final_glb_output_dir, 'scene_textured_mesh.obj')
        final_glb_file = os.path.join(final_glb_output_dir, 'scene_textured_mesh.glb')
        convert_obj_to_glb(obj_file_to_convert, final_glb_file)

        print("\nPhotogrammetry pipeline completed successfully.")

    except Exception as e:
        print(f"\n!!! An error occurred during the photogrammetry pipeline: {e}", file=sys.stderr)
        sys.exit(1) # Exit with a non-zero status code to indicate failure

if __name__ == '__main__':
    main()