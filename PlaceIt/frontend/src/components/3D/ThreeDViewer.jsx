import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* -------- TEXTURE CONSTANTS (válidas) -------- */
const TEXTURES = {
  // gris – hormigón
  soho_concrete:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNoaGgAAAMEAYFL09IQAAAAAElFTkSuQmCC',
  // marrón – madera
  parisian_wood:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGOYlmIEAALAAS35X7yQAAAAAElFTkSuQmCC',
  // beige – madera clara
  scandi_wood:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGM4saUHAARQAgmuMNamAAAAAElFTkSuQmCC',
  // rojo – ladrillo
  soho_brick:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGNYYGMDAAKYARmA9RKkAAAAAElFTkSuQmCC'
};

// --- ROOM STYLE CONFIGURATION ---
const ROOM_STYLES = {
  soho: {
    name: 'Soho Loft',
    backgroundColor: 0x333333,
    lighting: {
      hemisphere: { skyColor: 0xB1E1FF, groundColor: 0x494949, intensity: 0.8 },
      main: { color: 0xFFFAD7, intensity: 1.0, position: [-15, 15, -5] } // Simulating window light
    },
    floor: {
      textureUrl: TEXTURES.soho_concrete,
      repeat: [8, 8],
      material: { color: 0xffffff, roughness: 0.7, metalness: 0.1 }
    },
    walls: {
      main: { // Back and Right Walls
        color: 0xEAEAEA,
        material: { roughness: 0.8, metalness: 0 }
      },
      accent: { // Left Wall (Brick)
        textureUrl: TEXTURES.soho_brick,
        repeat: [4, 3],
        material: { color: 0xffffff, roughness: 0.9, metalness: 0 }
      }
    }
  },
  parisian: {
    name: 'Parisian Apartment',
    backgroundColor: 0xD8CFC1,
    lighting: {
      hemisphere: { skyColor: 0xFFEBCD, groundColor: 0x665D52, intensity: 0.7 },
      main: { color: 0xFFF5E1, intensity: 0.9, position: [10, 15, 10] },
      accent: { color: 0xFFDAB9, intensity: 0.5, position: [-5, 8, -5] }
    },
    floor: {
      textureUrl: TEXTURES.parisian_wood,
      repeat: [1, 1], // Herringbone textures are often not tiled simply
      material: { color: 0xffffff, roughness: 0.5, metalness: 0 }
    },
    walls: {
      main: {
        color: 0xF5F2ED,
        material: { roughness: 1.0, metalness: 0 }
      },
      accentColor: 0x634E3F
    }
  },
  scandinavian: {
    name: 'Scandinavian Retreat',
    backgroundColor: 0xE8F0F2,
    lighting: {
      hemisphere: { skyColor: 0xFFFFFF, groundColor: 0xBABFAB, intensity: 1.0 },
      main: { color: 0xFFFFFF, intensity: 0.8, position: [15, 20, 10] }
    },
    floor: {
      textureUrl: TEXTURES.scandi_wood,
      repeat: [10, 10],
      material: { color: 0xffffff, roughness: 0.8, metalness: 0 }
    },
    walls: {
      main: {
        color: 0xF7F7F7,
        material: { roughness: 0.9, metalness: 0 }
      },
      accentColor: 0xC3B091 // Wood slat color
    }
  }
};

const textureLoader = new THREE.TextureLoader();

// Helper function to dispose of Three.js objects
const disposeObject = (obj) => {
    if (!obj) return;
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
        if (Array.isArray(obj.material)) {
            obj.material.forEach(material => {
                if (material.map) material.map.dispose();
                material.dispose();
            });
        } else {
            if (obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
        }
    }
    while(obj.children.length > 0){
        disposeObject(obj.children[0]);
        obj.remove(obj.children[0]);
    }
};

// Helper function to fit the camera to an object
const fitCameraToObject = (camera, controls, object, fitOffset = 1.8, stateRef = null) => {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  controls.target.copy(center);
  controls.target.y = Math.max(center.y, size.y * 0.2);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

  cameraZ *= fitOffset;

  camera.position.set(
    center.x + cameraZ * 0.7,
    center.y + cameraZ * 0.5,
    center.z + cameraZ * 0.7
  );

  const cameraToFarEdge = box.max.z - box.min.z + cameraZ;
  camera.far = cameraToFarEdge * 10; // Ensure far plane is far enough
  camera.near = cameraZ / 100; // Ensure near plane is close enough
  camera.elasticity = 0.1; // Prevent jittering
  camera.updateProjectionMatrix();

  controls.update();

  // NEW: Store the calculated ideal state in the provided ref
  if (stateRef) {
    stateRef.current = {
        position: camera.position.clone(),
        target: controls.target.clone()
    };
  }
};


// Main function to create the room with new designs
const createRoom = (style, scene) => {
    const roomGroup = new THREE.Group();
    const config = ROOM_STYLES[style];
  
    const roomWidth = 25;
    const roomHeight = 15;
    const roomDepth = 25;
  
    // --- Floor ---
    const floorTexture = new THREE.TextureLoader().load(config.floor.textureUrl);
    if(floorTexture){
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(...config.floor.repeat);
        floorTexture.anisotropy = 16;
    }
    const floorMaterial = new THREE.MeshStandardMaterial({
      ...config.floor.material,
      map: floorTexture,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);
  
    // --- Walls ---
    const mainWallMaterial = new THREE.MeshStandardMaterial({
      color: config.walls.main.color,
      ...config.walls.main.material,
    });
  
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), mainWallMaterial.clone());
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);
  
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), mainWallMaterial.clone());
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);
  
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), mainWallMaterial.clone());
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    rightWall.receiveShadow = true;
    roomGroup.add(rightWall);
  
    // --- Style-Specific Architectural Details ---
  
    if (style === 'soho') {
        // Exposed brick on left wall
        const accentTexture = new THREE.TextureLoader().load(config.walls.accent.textureUrl);
        if(accentTexture){
            accentTexture.wrapS = accentTexture.wrapT = THREE.RepeatWrapping;
            accentTexture.repeat.set(...config.walls.accent.repeat);
            accentTexture.anisotropy = 16;
        }
        const accentWallMaterial = new THREE.MeshStandardMaterial({
            ...config.walls.accent.material,
            map: accentTexture,
        });
        leftWall.material = accentWallMaterial;

        // Large industrial window on back wall
        const windowShape = new THREE.Shape();
        const outerWidth = 10, outerHeight = 8;
        windowShape.moveTo(-outerWidth / 2, -outerHeight/2);
        windowShape.lineTo(outerWidth / 2, -outerHeight/2);
        windowShape.lineTo(outerWidth / 2, outerHeight/2);
        windowShape.lineTo(-outerWidth / 2, outerHeight/2);
        windowShape.lineTo(-outerWidth / 2, -outerHeight/2);

        const holePath = new THREE.Path(); // The actual opening
        const innerWidth = 9.5, innerHeight = 7.5;
        holePath.moveTo(-innerWidth / 2, -innerHeight/2);
        holePath.lineTo(innerWidth / 2, -innerHeight/2);
        holePath.lineTo(innerWidth / 2, innerHeight/2);
        holePath.lineTo(-innerWidth / 2, innerHeight/2);
        holePath.lineTo(-innerWidth / 2, -innerHeight/2);
        windowShape.holes.push(holePath);

        const windowFrameGeo = new THREE.ExtrudeGeometry(windowShape, { depth: 0.3, bevelEnabled: false });
        const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, metalness: 0.8 });
        const windowFrame = new THREE.Mesh(windowFrameGeo, windowFrameMat);
        windowFrame.position.set(0, roomHeight / 2, -roomDepth / 2 + 0.2);
        roomGroup.add(windowFrame);
        backWall.visible = false; // Hide the plane behind the window frame
    }
  
    if (style === 'parisian') {
      // Create wainscoting and crown molding
      const moldingMat = new THREE.MeshStandardMaterial({ color: config.walls.main.color, roughness: 0.9 });
      const panelHeight = 3.5;
  
      // Baseboard
      const baseboardGeo = new THREE.BoxGeometry(roomWidth, 0.5, 0.1);
      const baseboard = new THREE.Mesh(baseboardGeo, moldingMat);
      baseboard.position.set(0, 0.25, -roomDepth / 2 + 0.1);
      roomGroup.add(baseboard);
  
      const baseboardLeft = baseboard.clone();
      baseboardLeft.geometry = new THREE.BoxGeometry(roomDepth, 0.5, 0.1);
      baseboardLeft.rotation.y = Math.PI / 2;
      baseboardLeft.position.set(-roomWidth / 2 + 0.1, 0.25, 0);
      roomGroup.add(baseboardLeft);
  
      // Chair rail
      const chairRail = baseboard.clone();
      chairRail.geometry = new THREE.BoxGeometry(roomWidth, 0.3, 0.1);
      chairRail.position.set(0, panelHeight, -roomDepth / 2 + 0.1);
      roomGroup.add(chairRail);
  
      const chairRailLeft = chairRail.clone();
      chairRailLeft.geometry = new THREE.BoxGeometry(roomDepth, 0.3, 0.1);
      chairRailLeft.rotation.y = Math.PI/2;
      chairRailLeft.position.set(-roomWidth / 2 + 0.1, panelHeight, 0);
      roomGroup.add(chairRailLeft);
  
      // Create inset panels
      const panelGeo = new THREE.BoxGeometry(4, panelHeight - 1, 0.05);
      const panelMat = new THREE.MeshStandardMaterial({ color: config.walls.main.color, roughness: 0.95 });
      for(let i = - (roomWidth / 2) + 3; i < roomWidth / 2 - 3; i += 5){
          const panel = new THREE.Mesh(panelGeo, panelMat);
          panel.position.set(i, panelHeight / 2, -roomDepth / 2 + 0.05);
          roomGroup.add(panel);
      }
    }
  
    if (style === 'scandinavian') {
        // Vertical wood slat accent wall
        const slatWall = new THREE.Group();
        const slatGeo = new THREE.BoxGeometry(0.15, roomHeight, 0.1);
        const slatMat = new THREE.MeshStandardMaterial({ color: config.walls.accentColor, roughness: 0.7 });
        const numSlats = 50;
        for (let i = 0; i < numSlats; i++) {
            const slat = new THREE.Mesh(slatGeo, slatMat);
            slat.position.set(-roomWidth / 2 + 0.1, roomHeight/2, (-roomDepth/2) + 0.2 + i * (roomDepth / numSlats) );
            slatWall.add(slat);
        }
        roomGroup.add(slatWall);
    }
  
    return roomGroup;
  };
  
const setupLighting = (scene, style) => {
    const lightsToRemove = [];
    scene.traverse(child => child.isLight && lightsToRemove.push(child));
    lightsToRemove.forEach(light => {
        if (light.shadow && light.shadow.map) light.shadow.map.dispose();
        if (light.dispose) light.dispose();
        scene.remove(light);
    });

    const config = ROOM_STYLES[style].lighting;

    const hemisphereLight = new THREE.HemisphereLight(
        config.hemisphere.skyColor,
        config.hemisphere.groundColor,
        config.hemisphere.intensity
    );
    scene.add(hemisphereLight);

    const mainLight = new THREE.DirectionalLight(
        config.main.color,
        config.main.intensity
    );
    mainLight.position.set(...config.main.position);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.bias = -0.0005;
    
    const shadowCamSize = 25;
    mainLight.shadow.camera.left = -shadowCamSize;
    mainLight.shadow.camera.right = shadowCamSize;
    mainLight.shadow.camera.top = shadowCamSize;
    mainLight.shadow.camera.bottom = -shadowCamSize;
    scene.add(mainLight);

    if (config.accent) {
        const accentLight = new THREE.DirectionalLight(config.accent.color, config.accent.intensity);
        accentLight.position.set(...config.accent.position);
        scene.add(accentLight);
    }
};

const ThreeDViewer = ({ modelUrl, className = "", onLoad, onClose }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const furnitureGroupRef = useRef(null);
  const roomGroupRef = useRef(null);
  const requestRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('soho');
  const [error, setError] = useState(null);
  const isInitialized = useRef(false);

  // NEW: Refs for camera reset and auto-rotation logic
  const initialCameraStateRef = useRef(null);
  const isAutoRotatingRef = useRef(false);
  const tweenStateRef = useRef(null);
  const pointerDownRef = useRef({ x: 0, y: 0, time: 0 });

  const switchRoom = useCallback((direction) => {
    if (loading || error) return;
    
    const roomKeys = Object.keys(ROOM_STYLES);
    const currentIndex = roomKeys.indexOf(currentRoom);
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % roomKeys.length;
    } else {
      newIndex = currentIndex === 0 ? roomKeys.length - 1 : currentIndex - 1;
    }
    setCurrentRoom(roomKeys[newIndex]);
  }, [currentRoom, loading, error]);

  // Effect 1: Main setup (once)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isInitialized.current) return;

    try {
      isInitialized.current = true;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
      cameraRef.current = camera;
      
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      rendererRef.current = renderer;
      
      container.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.minDistance = 2;
      controls.maxDistance = 35;
      controls.maxPolarAngle = Math.PI / 2 - 0.05;
      controls.minPolarAngle = Math.PI * 0.1;
      controls.target.set(0, 1, 0);
      // NEW: Disable auto-rotate by default
      controls.autoRotate = false;
      controls.autoRotateSpeed = 3; // Set a slow, graceful rotation speed
      controlsRef.current = controls;

      furnitureGroupRef.current = new THREE.Group();
      scene.add(furnitureGroupRef.current);
      
      roomGroupRef.current = new THREE.Group();
      scene.add(roomGroupRef.current);

      const clock = new THREE.Clock();

      // NEW: Easing function for smooth animation
      const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

      const animate = () => {
        requestRef.current = requestAnimationFrame(animate);
        const delta = clock.getDelta();

        // NEW: Camera tweening logic for reset
        if (tweenStateRef.current) {
            const tween = tweenStateRef.current;
            tween.elapsed += delta;
            const progress = Math.min(tween.elapsed / tween.duration, 1);
            const easedProgress = easeInOutCubic(progress);

            camera.position.lerpVectors(tween.startPos, tween.endPos, easedProgress);
            controls.target.lerpVectors(tween.startTarget, tween.endTarget, easedProgress);
            
            if (progress >= 1) {
                tweenStateRef.current = null;
                controls.enabled = true; // Re-enable controls
            }
        }
        
        controls.update(delta);
        renderer.render(scene, camera);
      };
      animate();

      // --- NEW: Event handlers for interactions ---
      const handleDoubleClick = () => {
          if (isAutoRotatingRef.current) {
              controls.autoRotate = false;
              isAutoRotatingRef.current = false;
          }
          if (initialCameraStateRef.current && !tweenStateRef.current) {
              controls.enabled = false; // Disable controls during animation
              tweenStateRef.current = {
                  startPos: camera.position.clone(),
                  endPos: initialCameraStateRef.current.position,
                  startTarget: controls.target.clone(),
                  endTarget: initialCameraStateRef.current.target,
                  duration: 1.0, // 1 second animation
                  elapsed: 0,
              };
          }
      };
      
      const handlePointerDown = (e) => {
          if (e.button !== 0) return; // Only for left click

          // If currently auto-rotating, any click stops it.
          if (isAutoRotatingRef.current) {
              controls.autoRotate = false;
              isAutoRotatingRef.current = false;
          }

          pointerDownRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      };

      const handlePointerUp = (e) => {
          if (e.button !== 0 || !pointerDownRef.current.time) return;

          const down = pointerDownRef.current;
          const up = { x: e.clientX, y: e.clientY, time: Date.now() };

          const deltaX = up.x - down.x;
          const deltaY = up.y - down.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const deltaTime = (up.time - down.time) / 1000; // in seconds

          // Check for a "flick" gesture (fast drag over a short time)
          const speed = distance / deltaTime;
          const FLICK_THRESHOLD = 700; // pixels per second

          if (deltaTime < 0.5 && speed > FLICK_THRESHOLD) {
              if (initialCameraStateRef.current) {
                // Instantly center the target on the furniture
                controls.target.copy(initialCameraStateRef.current.target);
              }
              controls.autoRotate = true;
              isAutoRotatingRef.current = true;
          }

          pointerDownRef.current = { x: 0, y: 0, time: 0 };
      };

      // Stop auto-rotation when user manually interacts
      const handleControlStart = () => {
        if (isAutoRotatingRef.current) {
            controls.autoRotate = false;
            isAutoRotatingRef.current = false;
        }
        // Also cancel any ongoing reset animation
        if (tweenStateRef.current) {
            tweenStateRef.current = null;
            controls.enabled = true;
        }
      };

      const handleResize = () => {
        if (!container || !cameraRef.current || !rendererRef.current) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      };
      
      window.addEventListener('resize', handleResize);
      container.addEventListener('dblclick', handleDoubleClick);
      container.addEventListener('pointerdown', handlePointerDown);
      container.addEventListener('pointerup', handlePointerUp);
      controls.addEventListener('start', handleControlStart);

      return () => { // Cleanup
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('dblclick', handleDoubleClick);
        container.removeEventListener('pointerdown', handlePointerDown);
        container.removeEventListener('pointerup', handlePointerUp);
        
        if (controlsRef.current) {
            controlsRef.current.removeEventListener('start', handleControlStart);
            controlsRef.current.dispose();
        }
        
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        
        if (sceneRef.current) {
          sceneRef.current.remove(furnitureGroupRef.current);
          sceneRef.current.remove(roomGroupRef.current);
          disposeObject(furnitureGroupRef.current);
          disposeObject(roomGroupRef.current);
          sceneRef.current = null;
        }
        
        if (rendererRef.current) {
            rendererRef.current.dispose();
            if (rendererRef.current.domElement.parentElement === container) {
                container.removeChild(rendererRef.current.domElement);
            }
        }

        isInitialized.current = false;
      };
    } catch (err) {
      console.error('Error initializing ThreeDViewer:', err);
      setError('Failed to initialize 3D viewer');
      isInitialized.current = false;
    }
  }, []); // Empty dependency array ensures this runs only once

  // Effect 2: Update room when `currentRoom` changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !isInitialized.current) return;

    try {
      setLoading(true);
      if (roomGroupRef.current) {
        scene.remove(roomGroupRef.current);
        disposeObject(roomGroupRef.current);
      }
      const newRoom = createRoom(currentRoom, scene);
      roomGroupRef.current = newRoom;
      scene.add(newRoom);
      setupLighting(scene, currentRoom);
      scene.background = new THREE.Color(ROOM_STYLES[currentRoom].backgroundColor);
      setLoading(false);
    } catch (err) {
      console.error('Error updating room:', err);
      setError('Failed to update room style');
      setLoading(false);
    }
  }, [currentRoom]);

  // Effect 3: Load model when `modelUrl` changes
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const furnitureGroup = furnitureGroupRef.current;

    if (!scene || !camera || !controls || !furnitureGroup || !isInitialized.current) return;

    // NEW: Reset interaction states on new model load
    controls.autoRotate = false;
    isAutoRotatingRef.current = false;
    tweenStateRef.current = null;
    initialCameraStateRef.current = null;

    const addCubeFallback = () => {
        const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const mat = new THREE.MeshStandardMaterial({ color: 0x29d4c5, roughness: 0.5 });
        const cube = new THREE.Mesh(geo, mat);
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.position.y = 0.75;
        furnitureGroup.add(cube);
        fitCameraToObject(camera, controls, cube, 1.8, initialCameraStateRef);
    };

    try {
      while (furnitureGroup.children.length > 0) {
        disposeObject(furnitureGroup.children[0]);
        furnitureGroup.remove(furnitureGroup.children[0]);
      }
      
      if (!modelUrl) {
        addCubeFallback();
        return;
      }

      setLoading(true);
      setError(null);
      
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          try {
            const model = gltf.scene;
            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.x -= center.x;
            model.position.y -= box.min.y;
            model.position.z -= center.z;

            furnitureGroup.add(model);
            // NEW: Pass the ref to store the initial camera state
            fitCameraToObject(camera, controls, model, 1.8, initialCameraStateRef);

            setLoading(false);
            if (onLoad) onLoad();
          } catch (err) {
            console.error('Error processing 3D model:', err);
            addCubeFallback();
            setError('Failed to process 3D model');
            setLoading(false);
          }
        },
        undefined,
        (err) => {
          console.error('Error loading 3D model:', err);
          addCubeFallback();
          setError('Failed to load 3D model');
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error in model loading effect:', err);
      setError('Failed to initialize model loading');
      setLoading(false);
    }
  }, [modelUrl, onLoad]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-gray-800 ${className}`}
      style={{ minHeight: '400px', cursor: 'grab' }}
      onMouseDownCapture={(e) => { if(e.target.tagName === 'CANVAS') e.target.style.cursor = 'grabbing'; }}
      onMouseUpCapture={(e) => { if(e.target.tagName === 'CANVAS') e.target.style.cursor = 'grab'; }}
    >
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-red-900 bg-opacity-50">
          <div className="text-white px-4 py-2 bg-red-700 rounded-lg shadow-lg">
            {error}
          </div>
        </div>
      )}
      
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
          <div className="text-white text-lg font-semibold animate-pulse">
            Loading Scene...
          </div>
        </div>
      )}
      
      {!error && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white/80 backdrop-blur-md rounded-full px-4 py-2 shadow-xl flex items-center gap-4">
              <button 
                onClick={() => switchRoom('prev')}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                title="Previous room style"
                disabled={loading}
              >
                <ChevronLeft className="h-5 w-5 text-gray-800" />
              </button>
              <div className="text-center w-40">
                  <div className="text-sm font-bold text-gray-900">
                    {ROOM_STYLES[currentRoom].name}
                  </div>
                  <div className="text-xs text-gray-600">
                    Style {Object.keys(ROOM_STYLES).indexOf(currentRoom) + 1} of {Object.keys(ROOM_STYLES).length}
                  </div>
              </div>
              <button 
                onClick={() => switchRoom('next')}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                title="Next room style"
                disabled={loading}
              >
                <ChevronRight className="h-5 w-5 text-gray-800" />
              </button>
            </div>
          </div>
      )}
    </div>
  );
};

export default ThreeDViewer;