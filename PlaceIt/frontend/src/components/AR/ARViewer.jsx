import { useEffect, useRef, useState, useCallback } from 'react';
import { CameraIcon, XMarkIcon, ArrowPathIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, CubeIcon } from '@heroicons/react/24/outline';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Helper to dispose of Three.js objects
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

const ARViewer = ({ isActive, onClose, productName, modelUrl }) => {
  const containerRef = useRef();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  
  // AR State
  const [isModelPlaced, setIsModelPlaced] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Three.js refs
  const rendererRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const modelRef = useRef();
  const reticleRef = useRef();
  const hitTestSourceRef = useRef(null);
  const xrRefSpaceRef = useRef(null);

  // Gracefully end the AR session
  const endSession = useCallback(() => {
    if (session) {
      session.end();
    }
    setSession(null);
    setIsModelPlaced(false);
    setIsSearching(false);
    
    // Full cleanup
    if(rendererRef.current) {
        rendererRef.current.setAnimationLoop(null);
        disposeObject(sceneRef.current);
        rendererRef.current.dispose();
        rendererRef.current = null;
    }
    sceneRef.current = null;
    cameraRef.current = null;
    modelRef.current = null;
    reticleRef.current = null;
    hitTestSourceRef.current = null;
    xrRefSpaceRef.current = null;

    onClose();
  }, [session, onClose]);

  useEffect(() => {
    if (isActive) {
        // Check for WebXR support
        if ('xr' in navigator) {
            navigator.xr.isSessionSupported('immersive-ar')
                .then((supported) => {
                    if (supported) {
                        startARSession();
                    } else {
                        setIsSupported(false);
                        setError('AR is not supported on this device or browser.');
                    }
                });
        } else {
            setIsSupported(false);
            setError('Your browser does not support WebXR for AR functionality.');
        }
    } else if (session) {
        endSession();
    }

    // This return is for when the parent component deactivates this one
    return () => {
        if(session) endSession();
    };
  }, [isActive]);


  const startARSession = async () => {
    try {
        // --- Core Three.js Scene Setup ---
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        cameraRef.current = camera;
        
        // Basic lighting for the model
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
        light.position.set(0.5, 1, 0.25);
        scene.add(light);

        // Setup renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.xr.enabled = true;
        rendererRef.current = renderer;
        containerRef.current.appendChild(renderer.domElement);

        // --- Start WebXR Session ---
        const arSession = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['hit-test', 'dom-overlay'],
            domOverlay: { root: containerRef.current }
        });
        setSession(arSession);
        
        arSession.addEventListener('end', () => {
            endSession();
            onClose();
        });

        renderer.xr.setSession(arSession);
        
        // --- Load 3D Model ---
        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => {
            const loadedModel = gltf.scene;
            // Center and scale the model appropriately
            const box = new THREE.Box3().setFromObject(loadedModel);
            const size = box.getSize(new THREE.Vector3());
            const scale = 1.0 / size.y; // Scale model to be approx 1m tall
            loadedModel.scale.set(scale, scale, scale);
            
            // Adjust position so the model's bottom is at its origin
            const center = box.getCenter(new THREE.Vector3());
            loadedModel.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

            loadedModel.visible = false; // Hide until placed
            modelRef.current = loadedModel;
            scene.add(loadedModel);
        });

        // --- Create Placement Reticle ---
        const reticleGeometry = new THREE.RingGeometry(0.08, 0.1, 32).rotateX(-Math.PI / 2);
        const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0x29d4c5 });
        const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
        reticle.matrixAutoUpdate = false;
        reticle.visible = false;
        reticleRef.current = reticle;
        scene.add(reticle);

        // --- Handle Tapping / Placement ---
        const onSelect = () => {
            if (reticleRef.current.visible && modelRef.current && !isModelPlaced) {
                modelRef.current.position.setFromMatrixPosition(reticleRef.current.matrix);
                modelRef.current.visible = true;
                setIsModelPlaced(true);
                reticleRef.current.visible = false; // Hide reticle after placement
            }
        };
        arSession.addEventListener('select', onSelect);

        // --- Setup Hit-Testing ---
        const refSpace = await arSession.requestReferenceSpace('viewer');
        const hitTestSource = await arSession.requestHitTestSource({ space: refSpace });
        xrRefSpaceRef.current = await arSession.requestReferenceSpace('local');
        hitTestSourceRef.current = hitTestSource;
        setIsSearching(true);

        // --- Render Loop ---
        renderer.setAnimationLoop((timestamp, frame) => {
            if (!frame) return;

            // Handle hit-testing to position the reticle
            if (hitTestSourceRef.current && !isModelPlaced) {
                const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    const pose = hit.getPose(xrRefSpaceRef.current);
                    reticleRef.current.visible = true;
                    reticleRef.current.matrix.fromArray(pose.transform.matrix);
                } else {
                    reticleRef.current.visible = false;
                }
            }
            renderer.render(scene, camera);
        });

    } catch (err) {
        console.error("AR Session Error:", err);
        setError(`Failed to start AR session. Please ensure your device supports AR and you've granted necessary permissions. (${err.name})`);
        setIsSupported(false);
    }
  };
  
  // --- Interaction Handlers ---
  const handleReposition = () => {
      if (modelRef.current) {
          modelRef.current.visible = false;
      }
      setIsModelPlaced(false);
  };
  
  const handleRotate = (direction) => {
      if (modelRef.current && isModelPlaced) {
          modelRef.current.rotateY(direction * Math.PI / 8); // Rotate by 22.5 degrees
      }
  };

  const handleScale = (factor) => {
      if (modelRef.current && isModelPlaced) {
          modelRef.current.scale.multiplyScalar(factor);
      }
  };

  // --- UI Rendering Logic ---
  const renderContent = () => {
      if (!isSupported || error) {
          return (
            <div className="flex items-center justify-center h-full bg-[#0c1825] text-white">
                <div className="text-center max-w-md px-4">
                    <CubeIcon className="h-16 w-16 mx-auto mb-4 text-[#29d4c5]" />
                    <h3 className="text-xl font-semibold mb-2">{!isSupported ? "AR Not Supported" : "Error"}</h3>
                    <p className="text-[#b6cacb] mb-4">{error}</p>
                    <button
                        onClick={endSession}
                        className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                        Close AR View
                    </button>
                </div>
            </div>
          );
      }

      return (
        <>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-lg font-semibold">AR View</h3>
                  <p className="text-sm opacity-80">{productName}</p>
                </div>
                <button
                  onClick={endSession}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Instructions */}
            {isSearching && !isModelPlaced && (
                <div className="absolute top-20 left-4 right-4">
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-white text-center animate-pulse">
                    <p className="text-sm">Move your device slowly to find a flat surface</p>
                  </div>
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center justify-center space-x-2 text-white">                    {isModelPlaced ? (
                        <>
                           <button onClick={() => handleRotate(-1)} className="bg-white/20 rounded-full p-3 flex items-center justify-center transition-colors hover:bg-white/30"><ArrowUturnLeftIcon className="h-6 w-6" /></button>
                           <button onClick={handleReposition} className="bg-white/30 rounded-full p-3 flex items-center justify-center transition-colors hover:bg-white/40"><ArrowPathIcon className="h-6 w-6" /> <span className="text-xs ml-1">Reposition</span></button>
                           <button onClick={() => handleRotate(1)} className="bg-white/20 rounded-full p-3 flex items-center justify-center transition-colors hover:bg-white/30"><ArrowUturnRightIcon className="h-6 w-6" /></button>
                           <button onClick={() => handleScale(0.9)} className="bg-white/20 rounded-full p-3 flex items-center justify-center transition-colors hover:bg-white/30"><ArrowsPointingInIcon className="h-6 w-6" /></button>
                           <button onClick={() => handleScale(1.1)} className="bg-white/20 rounded-full p-3 flex items-center justify-center transition-colors hover:bg-white/30"><ArrowsPointingOutIcon className="h-6 w-6" /></button>
                        </>
                    ) : (
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-sm text-center">
                                <span className="block font-semibold">Tap to place furniture</span>
                                <span className="block text-xs opacity-80">Find a surface to begin</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
      );
  };  if (!isActive) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black">
        {renderContent()}
    </div>
  );
};

export default ARViewer;