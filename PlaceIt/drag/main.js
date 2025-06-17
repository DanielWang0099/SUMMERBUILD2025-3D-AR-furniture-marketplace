// main.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

class DragControls {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.dragObjects = [];
        this.isDragging = false;
        this.draggedObject = null;
        this.dragOffset = new THREE.Vector3();
        this.dragPlane = new THREE.Plane();
        this.intersection = new THREE.Vector3();
        this.initialDragPosition = new THREE.Vector3();
        
        // Touch-specific properties
        this.isTouch = false;
        this.touchId = null;
        
        this.setupEventListeners();
    }
    
    addDragObject(object) {
        this.dragObjects.push(object);
        object.userData.draggable = true;
    }
    
    // Remove an object from draggable objects
    removeDragObject(object) {
        const index = this.dragObjects.indexOf(object);
        if (index > -1) {
            this.dragObjects.splice(index, 1);
        }
    }
    
    // Add all meshes in a GLTF scene as draggable
    addGLTFSceneAsDraggable(gltfScene) {
        // Store reference to the root object for dragging
        gltfScene.userData.draggable = true;
        gltfScene.userData.isGLTFRoot = true;
        this.dragObjects.push(gltfScene);
        
        // Also add all child meshes for raycasting detection
        gltfScene.traverse((child) => {
            if (child.isMesh) {
                child.userData.gltfRoot = gltfScene; // Reference back to root
            }
        });
    }
    
    setupEventListeners() {
        const canvas = this.renderer.domElement;
        
        // Mouse events
        canvas.addEventListener('mousedown', this.onPointerDown.bind(this));
        canvas.addEventListener('mousemove', this.onPointerMove.bind(this));
        canvas.addEventListener('mouseup', this.onPointerUp.bind(this));
        
        // Touch events
        canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        canvas.addEventListener('touchcancel', this.onTouchEnd.bind(this), { passive: false });
        
        // Prevent default behaviors
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        canvas.style.touchAction = 'none';
    }
    
    updatePointerPosition(clientX, clientY) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    // Mouse event handlers
    onPointerDown(event) {
        if (this.isTouch) return;
        this.updatePointerPosition(event.clientX, event.clientY);
        this.startDrag();
    }
    
    onPointerMove(event) {
        if (this.isTouch) return;
        this.updatePointerPosition(event.clientX, event.clientY);
        if (this.isDragging) {
            this.updateDrag();
        }
    }
    
    onPointerUp(event) {
        if (this.isTouch) return;
        this.endDrag();
    }
    
    // Touch event handlers
    onTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1 && !this.isDragging) {
            const touch = event.touches[0];
            this.isTouch = true;
            this.touchId = touch.identifier;
            this.updatePointerPosition(touch.clientX, touch.clientY);
            this.startDrag();
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        if (this.isDragging && this.touchId !== null) {
            const touch = Array.from(event.touches).find(t => t.identifier === this.touchId);
            if (touch) {
                this.updatePointerPosition(touch.clientX, touch.clientY);
                this.updateDrag();
            }
        }
    }
    
    onTouchEnd(event) {
        event.preventDefault();
        const activeTouchIds = Array.from(event.touches).map(t => t.identifier);
        if (this.touchId !== null && !activeTouchIds.includes(this.touchId)) {
            this.endDrag();
            this.isTouch = false;
            this.touchId = null;
        }
    }
    
    startDrag() {
        this.raycaster.setFromCamera(this.pointer, this.camera);
        
        // Create array of all meshes for intersection testing
        const meshes = [];
        this.scene.traverse((child) => {
            if (child.isMesh && child.userData.gltfRoot) {
                meshes.push(child);
            }
        });
        
        const intersects = this.raycaster.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            const intersect = intersects[0];
            const gltfRoot = intersect.object.userData.gltfRoot;
            
            if (gltfRoot && gltfRoot.userData.draggable) {
                this.isDragging = true;
                this.draggedObject = gltfRoot; // Drag the root object, not the individual mesh
                
                // Create a more stable drag plane at the object's Y level
                // This ensures consistent behavior regardless of camera angle
                this.dragPlane.setFromNormalAndCoplanarPoint(
                    new THREE.Vector3(0, 1, 0), // Y-axis normal (horizontal plane)
                    new THREE.Vector3(0, this.draggedObject.position.y, 0)
                );
                
                // Get the initial intersection point on our drag plane
                this.raycaster.ray.intersectPlane(this.dragPlane, this.initialDragPosition);
                
                // Visual feedback - add emissive to all materials in the GLTF
                this.setEmissiveForGLTF(this.draggedObject, 0x333333);
                this.renderer.domElement.style.cursor = 'grabbing';
                
                // Scale effect for touch
                if (this.isTouch) {
                    this.draggedObject.scale.multiplyScalar(1.1);
                }
                
                console.log('Started dragging object:', this.draggedObject);
            }
        }
    }
    
    updateDrag() {
        if (!this.isDragging || !this.draggedObject) return;
        
        this.raycaster.setFromCamera(this.pointer, this.camera);
        
        if (this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection)) {
            // Calculate the difference from initial drag position
            const deltaX = this.intersection.x - this.initialDragPosition.x;
            const deltaZ = this.intersection.z - this.initialDragPosition.z;
            
            // Apply movement with consistent sensitivity
            // Use a smaller, more consistent multiplier
            const sensitivity = 0.4;
            this.draggedObject.position.x += deltaX * sensitivity;
            this.draggedObject.position.z += deltaZ * sensitivity;
            
            // Update initial position for next frame
            this.initialDragPosition.copy(this.intersection);
        }
    }
    
    endDrag() {
        if (this.isDragging && this.draggedObject) {
            // Remove visual feedback
            this.setEmissiveForGLTF(this.draggedObject, 0x000000);
            this.renderer.domElement.style.cursor = 'default';
            
            // Reset scale
            if (this.isTouch) {
                this.draggedObject.scale.divideScalar(1.1);
            }
            
            console.log('Ended dragging object');
        }
        
        this.isDragging = false;
        this.draggedObject = null;
    }
    
    // Helper method to set emissive color for all materials in a GLTF
    setEmissiveForGLTF(gltfObject, color) {
        gltfObject.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        if (mat.emissive) mat.emissive.setHex(color);
                    });
                } else {
                    if (child.material.emissive) {
                        child.material.emissive.setHex(color);
                    }
                }
            }
        });
    }
    
    // Method to move selected object up/down in Y-axis
    moveObjectY(direction) {
        if (this.draggedObject || this.getSelectedObject()) {
            const object = this.draggedObject || this.getSelectedObject();
            const moveAmount = 0.1;
            object.position.y += direction > 0 ? moveAmount : -moveAmount;
            console.log(`Moved object ${direction > 0 ? 'up' : 'down'} to Y:`, object.position.y);
        }
    }
    
    // Get the first draggable object for Y-axis movement when nothing is being dragged
    getSelectedObject() {
        return this.dragObjects.length > 0 ? this.dragObjects[0] : null;
    }
    
    get isCurrentlyDragging() {
        return this.isDragging;
    }
    
    get currentDraggedObject() {
        return this.draggedObject;
    }
}

// Y-axis control buttons class
class YAxisControls {
    constructor(dragControls) {
        this.dragControls = dragControls;
        this.createButtons();
        this.setupEventListeners();
    }
    
    createButtons() {
        // Container for buttons
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 100;
        `;
        
        // Up button
        this.upButton = document.createElement('button');
        this.upButton.innerHTML = '▲';
        this.upButton.style.cssText = `
            width: 60px;
            height: 60px;
            border: none;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
            font-size: 24px;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
            user-select: none;
            touch-action: manipulation;
        `;
        
        // Down button
        this.downButton = document.createElement('button');
        this.downButton.innerHTML = '▼';
        this.downButton.style.cssText = this.upButton.style.cssText;
        
        this.container.appendChild(this.upButton);
        this.container.appendChild(this.downButton);
        document.body.appendChild(this.container);
        
        // Add hover effects
        [this.upButton, this.downButton].forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.background = 'rgba(255, 255, 255, 1)';
                button.style.transform = 'scale(1.1)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = 'rgba(255, 255, 255, 0.9)';
                button.style.transform = 'scale(1)';
            });
        });
    }
    
    setupEventListeners() {
        // Mouse events
        this.upButton.addEventListener('mousedown', () => this.startContinuousMovement(1));
        this.upButton.addEventListener('mouseup', () => this.stopContinuousMovement());
        this.upButton.addEventListener('mouseleave', () => this.stopContinuousMovement());
        
        this.downButton.addEventListener('mousedown', () => this.startContinuousMovement(-1));
        this.downButton.addEventListener('mouseup', () => this.stopContinuousMovement());
        this.downButton.addEventListener('mouseleave', () => this.stopContinuousMovement());
        
        // Touch events
        this.upButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startContinuousMovement(1);
        }, { passive: false });
        
        this.upButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopContinuousMovement();
        }, { passive: false });
        
        this.downButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startContinuousMovement(-1);
        }, { passive: false });
        
        this.downButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopContinuousMovement();
        }, { passive: false });
        
        // Prevent context menu on buttons
        [this.upButton, this.downButton].forEach(button => {
            button.addEventListener('contextmenu', (e) => e.preventDefault());
        });
    }
    
    startContinuousMovement(direction) {
        // Single movement on press
        this.dragControls.moveObjectY(direction);
        
        // Start continuous movement after delay
        this.movementTimeout = setTimeout(() => {
            this.movementInterval = setInterval(() => {
                this.dragControls.moveObjectY(direction);
            }, 100); // Move every 100ms while held
        }, 300); // Start continuous movement after 300ms
    }
    
    stopContinuousMovement() {
        if (this.movementTimeout) {
            clearTimeout(this.movementTimeout);
            this.movementTimeout = null;
        }
        
        if (this.movementInterval) {
            clearInterval(this.movementInterval);
            this.movementInterval = null;
        }
    }
}

// Main application
let scene, camera, renderer, dragControls, yAxisControls, loader;
let gltfModels = [];

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(ARButton.createButton(renderer))
    renderer.xr.enabled = true
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera)
    })
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Initialize GLTF loader
    loader = new GLTFLoader();
    
    // Setup drag controls
    dragControls = new DragControls(scene, camera, renderer);
    
    // Setup Y-axis controls
    yAxisControls = new YAxisControls(dragControls);
    
    // Load GLTF models
    loadGLTFModels();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Add instructions
    addInstructions();
}

function loadGLTFModels() {
    // Example model URLs (replace with your own models)
    const modelPaths = [
        // You can use these free models or replace with your own:
        './Box/Box.glb'
        // Add more model paths here
    ];
    
    // If no external models, create some fallback objects
    if (modelPaths.length === 0 || !modelPaths[0]) {
        createFallbackObjects();
        return;
    }
    
    modelPaths.forEach((path, index) => {
        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                
                // Position models
                model.position.set(
                    (index - modelPaths.length / 2) * 3,
                    0,
                    0
                );
                
                // Scale if needed
                model.scale.setScalar(0.5);
                
                // Enable shadows
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                scene.add(model);
                gltfModels.push(model);
                
                // Add to drag controls
                dragControls.addGLTFSceneAsDraggable(model);
                
                console.log(`Loaded model ${index + 1}:`, model);
            },
            (progress) => {
                console.log(`Loading model ${index + 1}:`, (progress.loaded / progress.total * 100) + '% loaded');
            },
            (error) => {
                console.error(`Error loading model ${index + 1}:`, error);
                // Create fallback if model fails to load
                if (index === 0) {
                    createFallbackObjects();
                }
            }
        );
    });
}

function createFallbackObjects() {
    // Create some interesting shapes as fallbacks
    const shapes = [
        { geometry: new THREE.TorusGeometry(0.5, 0.2, 8, 16), color: 0xff6b6b },
        { geometry: new THREE.ConeGeometry(0.5, 1, 8), color: 0x4ecdc4 },
        { geometry: new THREE.OctahedronGeometry(0.6), color: 0x45b7d1 },
        { geometry: new THREE.DodecahedronGeometry(0.6), color: 0x96ceb4 },
        { geometry: new THREE.IcosahedronGeometry(0.6), color: 0xfeca57 }
    ];
    
    shapes.forEach((shape, index) => {
        const material = new THREE.MeshPhongMaterial({ color: shape.color });
        const mesh = new THREE.Mesh(shape.geometry, material);
        
        mesh.position.set(
            (index - shapes.length / 2) * 2,
            0,
            0
        );
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Create a group to mimic GLTF structure
        const group = new THREE.Group();
        group.add(mesh);
        group.userData.draggable = true;
        group.userData.isGLTFRoot = true;
        
        // Set up mesh reference
        mesh.userData.gltfRoot = group;
        
        scene.add(group);
        gltfModels.push(group);
        dragControls.addGLTFSceneAsDraggable(group);
    });
}

function addInstructions() {
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        color: white;
        background: rgba(0,0,0,0.8);
        padding: 15px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 100;
        max-width: 350px;
    `;
    
    instructions.innerHTML = `
        <h3 style="margin: 0 0 10px 0;">Enhanced AR Model Controls</h3>
        <p style="margin: 5px 0;"><strong>Drag:</strong> Move objects horizontally (X) and in depth (Z)</p>
        <p style="margin: 5px 0;"><strong>Up/Down Arrows:</strong> Move objects vertically (Y)</p>
        <p style="margin: 5px 0;"><strong>Mobile:</strong> Touch and drag, tap arrow buttons</p>
        <p style="margin: 5px 0;"><em>Models glow when selected</em></p>
        <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
            Hold arrow buttons for continuous movement
        </p>
    `;
    
    document.body.appendChild(instructions);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotate models when not being dragged
    gltfModels.forEach((model) => {
        if (!dragControls.isCurrentlyDragging && dragControls.currentDraggedObject !== model) {
            model.rotation.y += 0;
        }
    });
    
    renderer.render(scene, camera);
}

// Initialize and start
init();
animate();

// Export for potential use in other modules
export { DragControls, YAxisControls };