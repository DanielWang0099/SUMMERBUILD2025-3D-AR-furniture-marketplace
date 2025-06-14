import bpy
import sys
import math
import os
import bmesh # Import the bmesh module for mesh manipulation

# --- Cleanup Functions ---

def merge_by_distance(obj, distance=0.001):
    """
    Merges vertices that are within a certain distance of each other.
    Uses bmesh for more reliable operation in Blender 4.4+
    """
    if obj.type != 'MESH':
        print(f"Skipping merge_by_distance for non-mesh object: {obj.name}")
        return

    print(f"Merging vertices by distance ({distance}) for {obj.name}...")
    
    # Ensure object is active AND selected before going to edit mode
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True) 
    
    # Force context update
    bpy.context.view_layer.update()
    
    # Enter edit mode
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Use bmesh for more reliable vertex merging
    bm = bmesh.from_edit_mesh(obj.data)
    
    # Remove doubles using bmesh
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=distance)
    
    # Update the mesh
    bmesh.update_edit_mesh(obj.data)
    
    # Exit edit mode
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update()
    obj.select_set(False)
    print("Merge by distance complete (using bmesh).")

def merge_by_distance_fallback(obj, distance=0.001):
    """
    Fallback method using different operator names that might exist in Blender 4.4
    """
    if obj.type != 'MESH':
        print(f"Skipping merge_by_distance_fallback for non-mesh object: {obj.name}")
        return

    print(f"Trying fallback merge methods for {obj.name}...")
    
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True) 
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.context.view_layer.update()
    
    bpy.ops.mesh.select_all(action='SELECT')
    
    # Try different operator names that might exist
    operators_to_try = [
        ('mesh.remove_doubles', {'threshold': distance}),
        ('mesh.merge_by_distance', {'distance': distance}),
        ('mesh.vertices_smooth', {}),  # As a last resort
    ]
    
    success = False
    for op_name, kwargs in operators_to_try:
        try:
            op = getattr(bpy.ops.mesh, op_name.split('.')[-1], None)
            if op and hasattr(op, '__call__'):
                op(**kwargs)
                print(f"Successfully used {op_name}")
                success = True
                break
        except (AttributeError, RuntimeError) as e:
            print(f"Operator {op_name} failed: {e}")
            continue
    
    if not success:
        print("Warning: All merge methods failed, using bmesh fallback")
        # Use bmesh as absolute fallback
        bm = bmesh.from_edit_mesh(obj.data)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=distance)
        bmesh.update_edit_mesh(obj.data)
    
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update()
    obj.select_set(False)

def recalculate_normals(obj, inside=False):
    """
    Recalculates the normals of the mesh to ensure correct face orientation.
    """
    if obj.type != 'MESH':
        print(f"Skipping recalculate_normals for non-mesh object: {obj.name}")
        return

    print(f"Recalculating normals for {obj.name}...")
    
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.context.view_layer.update() 
    
    bpy.ops.mesh.select_all(action='SELECT')
    
    # Try the standard operator first
    try:
        bpy.ops.mesh.normals_make_consistent(inside=inside)
        print("Normals recalculated using standard operator.")
    except (AttributeError, RuntimeError) as e:
        print(f"Standard normals operator failed: {e}")
        # Fallback to bmesh
        try:
            bm = bmesh.from_edit_mesh(obj.data)
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
            bmesh.update_edit_mesh(obj.data)
            print("Normals recalculated using bmesh fallback.")
        except Exception as e2:
            print(f"Bmesh normals fallback also failed: {e2}")
    
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update() 
    obj.select_set(False)

def clean_and_isolate_largest_mesh(obj):
    """
    Separates the mesh into its connected components,
    then keeps only the largest component and deletes others.
    """
    if obj.type != 'MESH':
        print(f"Skipping clean_and_isolate_largest_mesh for non-mesh object: {obj.name}")
        return obj

    print(f"Attempting to isolate largest mesh component for {obj.name}...")
    
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.context.view_layer.update()

    bpy.ops.mesh.select_all(action='SELECT')
    
    try:
        bpy.ops.mesh.separate(type='LOOSE')
    except (AttributeError, RuntimeError) as e:
        print(f"Mesh separation failed: {e}")
        bpy.ops.object.mode_set(mode='OBJECT')
        return obj

    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update()

    # Find the newly created objects
    separated_objects = [o for o in bpy.context.selected_objects if o.type == 'MESH']

    if len(separated_objects) <= 1:
        print("No separate mesh components found after separation.")
        return obj

    # Find the largest object based on vertex count
    largest_obj = None
    max_verts = -1

    for sep_obj in separated_objects:
        vert_count = len(sep_obj.data.vertices)
        if vert_count > max_verts:
            max_verts = vert_count
            largest_obj = sep_obj

    if largest_obj:
        print(f"Identified '{largest_obj.name}' as the largest component with {max_verts} vertices.")
        # Delete all other separated objects
        bpy.ops.object.select_all(action='DESELECT') 
        objects_to_remove = []
        for sep_obj in separated_objects:
            if sep_obj != largest_obj:
                obj_name = sep_obj.name  # Store name before deletion
                objects_to_remove.append((sep_obj, obj_name))
        
        # Delete the objects
        for sep_obj, obj_name in objects_to_remove:
            sep_obj.select_set(True)
            bpy.data.objects.remove(sep_obj, do_unlink=True)
            print(f"Removed disconnected object: {obj_name}")
        
        bpy.context.view_layer.objects.active = largest_obj
        largest_obj.select_set(True)
        bpy.context.view_layer.update()
        return largest_obj 
    else:
        print("Could not find a largest component to isolate. Keeping original object.")
        return obj

def fill_holes(obj, max_sides=32):
    """
    Attempts to fill holes in the mesh using bmesh for more reliability.
    """
    if obj.type != 'MESH':
        print(f"Skipping fill_holes for non-mesh object: {obj.name}")
        return

    print(f"Attempting to fill holes (max_sides={max_sides}) for {obj.name}...")
    
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.context.view_layer.update()
    
    # Use bmesh for hole detection and filling
    bm = bmesh.from_edit_mesh(obj.data)
    
    # Find boundary edges (potential holes)
    boundary_edges = [e for e in bm.edges if e.is_boundary]
    
    if boundary_edges:
        print(f"Found {len(boundary_edges)} boundary edges. Attempting to fill holes...")
        
        # Select boundary edges
        bpy.ops.mesh.select_all(action='DESELECT')
        bpy.ops.mesh.select_non_manifold()
        
        # Try to fill holes
        try:
            bpy.ops.mesh.fill_holes(sides=max_sides)
            print("Holes filled successfully.")
        except (AttributeError, RuntimeError) as e:
            print(f"Standard fill_holes failed: {e}")
            # Try bmesh fill
            try:
                bmesh.ops.holes_fill(bm, edges=boundary_edges)
                bmesh.update_edit_mesh(obj.data)
                print("Holes filled using bmesh.")
            except Exception as e2:
                print(f"Bmesh hole filling also failed: {e2}")
    else:
        print("No boundary edges (potential holes) found.")

    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update()
    obj.select_set(False)

def decimate_mesh(obj, ratio=0.75):
    """
    Reduces the polygon count of the mesh using a Decimate modifier.
    """
    if obj.type != 'MESH':
        print(f"Skipping decimate_mesh for non-mesh object: {obj.name}")
        return

    print(f"Decimating mesh (ratio={ratio}) for {obj.name}...")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update()

    # Add decimate modifier
    modifier = obj.modifiers.new(name="AutoDecimate", type='DECIMATE')
    modifier.ratio = ratio

    # Apply the modifier
    try:
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        print("Decimate modifier applied.")
    except RuntimeError as e:
        print(f"Warning: Could not apply decimate modifier for {obj.name}: {e}")
        # Clean up the modifier if it failed to apply
        obj.modifiers.remove(modifier)
    
    bpy.context.view_layer.update()
    obj.select_set(False)

# --- Debug function to check available operators ---
def debug_available_mesh_operators():
    """Debug function to print available mesh operators"""
    print("\n--- Available mesh operators ---")
    mesh_ops = [op for op in dir(bpy.ops.mesh) if not op.startswith('_')]
    for op in sorted(mesh_ops):
        if 'merge' in op.lower() or 'double' in op.lower() or 'distance' in op.lower():
            print(f"  {op}")
    print("--- End of mesh operators ---\n")

# --- Main Script Logic ---

def main():
    try:
        argv = sys.argv
        print(f"Full argv: {argv}")

        if "--" not in argv:
            if bpy.context.space_data: # Check if running in Blender GUI
                print("Running in Blender GUI, using dummy arguments for testing.")
                script_args = [
                    "C:/Users/danie/.vscode/Colmap-Msv-3D/photogrammetry_project/output/scene_textured_mesh.obj",
                    "C:/Users/danie/.vscode/Colmap-Msv-3D/photogrammetry_project/output/final_model_cleaned.glb"
                ]
            else:
                raise ValueError("No '--' separator found in arguments. This script expects command-line arguments after '--'.")
        else:
            script_args = argv[argv.index("--") + 1:]

        print(f"Script args: {script_args}")

        if len(script_args) != 2:
            raise ValueError(f"Expected 2 arguments (input_obj_path, output_glb_path), got {len(script_args)}: {script_args}")

        input_obj = os.path.abspath(script_args[0])
        output_glb = os.path.abspath(script_args[1])

        if not os.path.exists(input_obj):
            raise FileNotFoundError(f"OBJ file not found: {input_obj}")

        print(f"\n--- Starting Blender Cleanup and Conversion ---")
        print(f"Input OBJ: {input_obj}")
        print(f"Output GLB: {output_glb}")
        print(f"Blender version: {bpy.app.version_string}")

        # Debug available operators
        debug_available_mesh_operators()

        # Ensure factory settings are loaded for a clean slate
        bpy.ops.wm.read_factory_settings(use_empty=True)
        print("Blender factory settings loaded.")

        # Delete all default objects (Cube, Camera, Light)
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()
        print("All default objects deleted for a clean scene.")
        bpy.context.view_layer.update()

        # Try to enable glTF 2.0 add-on
        try:
            bpy.ops.preferences.addon_enable(module="io_scene_gltf2")
            print("Enabled glTF 2.0 add-on.")
        except Exception as e:
            print(f"Warning: Could not explicitly enable glTF2 addon: {e}")

        # Import OBJ file
        print("\nImporting OBJ file...")
        try:
            bpy.ops.wm.obj_import(filepath=input_obj)
            print(f"Successfully imported {input_obj}")
        except AttributeError:
            print(f"ERROR: The 'wm.obj_import' operator was not found.")
            import traceback
            traceback.print_exc()
            sys.exit(1)
        
        bpy.context.view_layer.update()

        if not bpy.context.selected_objects:
            raise RuntimeError("No objects were imported from the OBJ file.")

        # Get and join imported objects if multiple
        main_obj = bpy.context.selected_objects[0]
        
        if len(bpy.context.selected_objects) > 1:
            print(f"Multiple objects ({len(bpy.context.selected_objects)}) imported. Joining them.")
            
            for obj_to_select in bpy.context.selected_objects:
                obj_to_select.select_set(True)
            bpy.context.view_layer.objects.active = main_obj
            
            bpy.ops.object.join()
            bpy.context.view_layer.update()
            main_obj = bpy.context.active_object
            print(f"Objects joined. New main object: {main_obj.name}")

        print(f"Working on imported object: {main_obj.name}")

        # --- Automated Mesh Cleanup Steps ---
        print("\n--- Starting Automated Mesh Cleanup ---")

        # 1. Merge by Distance: Use the more reliable bmesh method
        merge_by_distance(main_obj, distance=0.0001) 

        # 2. Recalculate Normals
        recalculate_normals(main_obj, inside=False) 

        # 3. Isolate Largest Mesh Component
        main_obj = clean_and_isolate_largest_mesh(main_obj)

        # 4. Fill Holes (Optional)
        fill_holes(main_obj, max_sides=32)

        # 5. Decimate Mesh (Optional, uncomment if needed)
        # decimate_mesh(main_obj, ratio=0.75)

        print("\n--- Mesh Cleanup Complete ---")


        bpy.context.view_layer.objects.active = main_obj
        main_obj.select_set(True)
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.context.view_layer.update()
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.transform.rotate(value=math.radians(180), orient_axis='X') # Example: flip 180 on X-axis
        bpy.ops.object.mode_set(mode='OBJECT')
        bpy.context.view_layer.update()
        # IMPORTANT: Even after rotating in Edit Mode, still apply object transforms
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        bpy.context.view_layer.update()


        # Check for UVs and Materials
        print("Checking for UVs and Materials...")
        if not main_obj.data.uv_layers:
            print("WARNING: Imported OBJ has no UV layers.")
        if not main_obj.data.materials:
            print("WARNING: Imported OBJ has no materials.")

        print("Applying all transforms (Location, Rotation, Scale)...")
        bpy.context.view_layer.objects.active = main_obj # Ensure it's active
        main_obj.select_set(True) # Ensure it's selected
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        bpy.context.view_layer.update() # Update after applying transforms
        print("Transforms applied.")

        # Export to GLB
        print("\nExporting to GLB...")
        output_dir = os.path.dirname(output_glb)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        bpy.context.view_layer.objects.active = main_obj
        main_obj.select_set(True)
        bpy.context.view_layer.update()

        bpy.ops.export_scene.gltf(
            filepath=output_glb,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_image_format='AUTO',
            export_materials='EXPORT',
            export_texcoords=True,
            export_normals=True,
            export_cameras=False,
            export_lights=False,
            export_animations=False,
        )

        print(f"\nSuccessfully exported cleaned model → {output_glb}")

    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()