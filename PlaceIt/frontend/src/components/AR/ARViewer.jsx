import { useEffect, useRef, useState, useCallback } from 'react';
import { CameraIcon, XMarkIcon, ArrowPathIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, CubeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { detectARCapabilities } from '../../utils/arCapabilities';

// Helper to dispose of Three.js objects
const disposeObject = (obj) => {
    if (!obj) return;
    try {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(material => {
                    if (material.map) material.map.dispose();
                    if (material.dispose) material.dispose();
                });
            } else {
                if (obj.material.map) obj.material.map.dispose();
                if (obj.material.dispose) obj.material.dispose();
            }
        }
        while(obj.children.length > 0){
            disposeObject(obj.children[0]);
            obj.remove(obj.children[0]);
        }
    } catch (error) {
        console.warn('Error disposing object:', error);
    }
};

// Enhanced device detection using shared utility
const getDeviceInfo = () => {
    const capabilities = detectARCapabilities();
    return {
        isIOS: capabilities.isIOS,
        isAndroid: capabilities.isAndroid,
        isMobile: capabilities.isMobile,
        browser: capabilities.browser,
        hasWebXR: capabilities.hasWebXR
    };
};


// --- MODIFICATION: In-Scene UI for iOS ---
// Creates a simple UI within the 3D scene for devices that don't support DOM overlay.
const createInSceneUI = (camera, scene, onEndSession) => {
    const uiGroup = new THREE.Group();

    // Create a "Close" button
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, 128, 128);
    context.strokeStyle = 'white';
    context.lineWidth = 8;
    context.moveTo(32, 32);
    context.lineTo(96, 96);
    context.moveTo(96, 32);
    context.lineTo(32, 96);
    context.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREE.PlaneGeometry(0.1, 0.1); // Small plane in 3D space
    const closeButton = new THREE.Mesh(geometry, material);

    closeButton.position.set(0.4, -0.3, -1); // Positioned to the right, bottom of view
    closeButton.name = 'close_button'; // Name for raycasting
    closeButton.userData.onClick = onEndSession; // Attach the action

    uiGroup.add(closeButton);
    camera.add(uiGroup); // Attach UI to the camera

    return uiGroup;
};


const ARViewer = ({ isActive, onClose, productName, modelUrl }) => {
    const containerRef = useRef();
    const [session, setSession] = useState(null);
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [debugInfo, setDebugInfo] = useState({});
    
    // AR State
    const [isModelPlaced, setIsModelPlaced] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [modelLoaded, setModelLoaded] = useState(false);
    // --- MODIFICATION: Track if DOM overlay is active ---
    const [domOverlaySupported, setDomOverlaySupported] = useState(false);


    // Three.js refs
    const rendererRef = useRef();
    const sceneRef = useRef();
    const cameraRef = useRef();
    const modelRef = useRef();
    const reticleRef = useRef();
    const hitTestSourceRef = useRef(null);
    const xrRefSpaceRef = useRef(null);
    // --- MODIFICATION: Refs for in-scene UI ---
    const uiSceneGroupRef = useRef(null);
    const raycasterRef = useRef(new THREE.Raycaster());
  // Device info
  const deviceInfo = getDeviceInfo();

  // Enhanced logging
  const log = useCallback((message, data = null) => {
    console.log(`[AR Viewer] ${message}`, data || '');
    setDebugInfo(prev => ({
      ...prev,
      [`${Date.now()}`]: `${message}${data ? ': ' + JSON.stringify(data) : ''}`
    }));
  }, []);

  // Gracefully end the AR session
  const endSession = useCallback(() => {
    log('Ending AR session');
    
    try {
      if (hitTestSourceRef.current) {
        hitTestSourceRef.current.cancel();
        hitTestSourceRef.current = null;
      }
      
      if (session) {
        session.end();
      }
    } catch (error) {
      log('Error ending session', error.message);
    }
    
    setSession(null);
    setIsModelPlaced(false);
    setIsSearching(false);
    setModelLoaded(false);
    
    // Full cleanup
    try {
      if(rendererRef.current) {
          rendererRef.current.setAnimationLoop(null);
          if (sceneRef.current) {
            disposeObject(sceneRef.current);
          }
          rendererRef.current.dispose();
          rendererRef.current = null;
      }
    } catch (error) {
      log('Error during cleanup', error.message);
    }
    
    sceneRef.current = null;
    cameraRef.current = null;
    modelRef.current = null;
    reticleRef.current = null;
    xrRefSpaceRef.current = null;

    onClose();
  }, [session, onClose, log]);

  // Check WebXR support with detailed diagnostics
  const checkWebXRSupport = useCallback(async () => {
    log('Checking WebXR support', { device: deviceInfo });
    
    if (!('xr' in navigator)) {
      setError('WebXR is not supported in this browser. Try Chrome on Android or Safari on iOS with WebXR enabled.');
      setIsSupported(false);
      return false;
    }

    try {
      // Check different session types
      const immersiveARSupported = await navigator.xr.isSessionSupported('immersive-ar');
      const inlineSupported = await navigator.xr.isSessionSupported('inline');
      
      log('WebXR support check', {
        immersiveAR: immersiveARSupported,
        inline: inlineSupported
      });

      if (!immersiveARSupported) {
        if (deviceInfo.isIOS) {
          setError('AR not supported. On iOS, you need Mozilla WebXR Viewer or iOS 14.3+ with Safari.');
        } else if (deviceInfo.isAndroid) {
          setError('AR not supported. On Android, you need Chrome 81+ with ARCore support.');
        } else {
          setError('AR is not supported on this device. AR requires a mobile device with camera access.');
        }
        setIsSupported(false);
        return false;
      }

      return true;
    } catch (error) {
      log('WebXR support check failed', error.message);
      setError(`WebXR check failed: ${error.message}`);
      setIsSupported(false);
      return false;
    }
  }, [deviceInfo, log]);

  useEffect(() => {
    if (isActive) {
      checkWebXRSupport().then(supported => {
        if (supported) {
          startARSession();
        }
      });
    } else if (session) {
      endSession();
    }

    return () => {
      if(session) endSession();
    };
  }, [isActive]);


  // --- MODIFICATION: Raycaster to interact with the in-scene UI ---
  const uiRaycaster = (camera) => {
      if (!uiSceneGroupRef.current) return null;

      const raycaster = raycasterRef.current;
      raycaster.setFromCamera({ x: 0, y: 0 }, camera); // Ray from center of the screen

      const intersects = raycaster.intersectObjects(uiSceneGroupRef.current.children);

      if (intersects.length > 0) {
          const firstIntersect = intersects[0].object;
          if (firstIntersect.userData.onClick) {
              return firstIntersect.userData.onClick;
          }
      }
      return null;
  };

  const startARSession = async () => {
    try {
      setLoadingStatus('Initializing AR session...');
      log('Starting AR session');

      // --- Core Three.js Scene Setup ---
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
      cameraRef.current = camera;
      
      // Enhanced lighting for better model visibility
      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      // Additional point light for iOS
      if (deviceInfo.isIOS) {
        const pointLight = new THREE.PointLight(0xffffff, 2, 10);
        pointLight.position.set(0, 2, 0);
        scene.add(pointLight);
      }

      // Setup renderer with enhanced settings
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;
      containerRef.current.appendChild(renderer.domElement);

      setLoadingStatus('Requesting AR permissions...');

      // --- MODIFICATION: Check for dom-overlay support and update state ---
      const isDomOverlaySupported = !deviceInfo.isIOS && ('domOverlay' in navigator.xr);

      // --- Device-specific session configuration ---
      let sessionConfig = {
        requiredFeatures: ['hit-test'],
        optionalFeatures: []
      };

      // Add dom-overlay only for supported devices
      if (!deviceInfo.isIOS) {
        sessionConfig.optionalFeatures.push('dom-overlay');
        sessionConfig.domOverlay = { root: containerRef.current };
      }

      // Add additional features for Android
      if (deviceInfo.isAndroid) {
        sessionConfig.optionalFeatures.push('light-estimation', 'anchors');
      }

      log('Session config', sessionConfig);

      // --- Start WebXR Session ---
      const arSession = await navigator.xr.requestSession('immersive-ar', sessionConfig);
      setSession(arSession);
      // --- MODIFICATION: Set the state for conditional UI rendering ---
      setDomOverlaySupported(isDomOverlaySupported);

      // --- MODIFICATION: If DOM overlay is not supported, create the fallback UI ---
      if (!isDomOverlaySupported) {
          uiSceneGroupRef.current = createInSceneUI(camera, scene, endSession);
      }

      log('AR session started successfully');
      
      arSession.addEventListener('end', () => {
        log('AR session ended by system');
        endSession();
      });

      // Handle session errors
      arSession.addEventListener('error', (event) => {
        log('AR session error', event);
        setError(`AR session error: ${event.message || 'Unknown error'}`);
      });

      renderer.xr.setSession(arSession);
      
      setLoadingStatus('Loading 3D model...');

      // --- Load 3D Model with comprehensive error handling ---
      const loader = new GLTFLoader();
      
      // Add timeout for model loading
      const loadingTimeout = setTimeout(() => {
        setError('Model loading timed out. Please check your internet connection and model URL.');
      }, 30000);

      loader.load(
        modelUrl,
        (gltf) => {
          clearTimeout(loadingTimeout);
          log('Model loaded successfully');
          
          const loadedModel = gltf.scene;
          
          // Comprehensive model setup
          const box = new THREE.Box3().setFromObject(loadedModel);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          
          log('Model dimensions', {
            size: { x: size.x, y: size.y, z: size.z },
            center: { x: center.x, y: center.y, z: center.z }
          });
          
          // Smart scaling based on model size
          let scale = 1.0;
          if (size.y > 0) {
            scale = Math.min(1.0 / size.y, 2.0); // Max 2m, min based on height
          }
          
          // Ensure minimum visible size
          if (scale < 0.1) scale = 0.1;
          if (scale > 3.0) scale = 3.0;
          
          loadedModel.scale.set(scale, scale, scale);
          
          // Center the model properly
          loadedModel.position.set(
            -center.x * scale, 
            -box.min.y * scale, 
            -center.z * scale
          );

          // Ensure model materials are visible
          loadedModel.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Fix material issues
              if (child.material) {
                child.material.needsUpdate = true;
                // Ensure materials are not too dark
                if (child.material.color) {
                  child.material.color.multiplyScalar(1.2);
                }
              }
            }
          });

          loadedModel.visible = false; // Hide until placed
          modelRef.current = loadedModel;
          scene.add(loadedModel);
          setModelLoaded(true);
          setLoadingStatus('');
          
          log('Model setup complete', { finalScale: scale });
        },
        (progress) => {
          const percentComplete = (progress.loaded / progress.total * 100).toFixed(0);
          setLoadingStatus(`Loading model: ${percentComplete}%`);
          log('Loading progress', `${percentComplete}%`);
        },
        (error) => {
          clearTimeout(loadingTimeout);
          log('Model loading failed', error);
          setError(`Failed to load 3D model: ${error.message || 'Unknown error'}. Please check the model URL and format.`);
        }
      );

      // --- Create Enhanced Placement Reticle ---
      const reticleGeometry = new THREE.RingGeometry(0.05, 0.08, 32).rotateX(-Math.PI / 2);
      const reticleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x29d4c5,
        transparent: true,
        opacity: 0.8
      });
      const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
      reticle.matrixAutoUpdate = false;
      reticle.visible = false;
      
      // Add pulsing animation to reticle
      const reticleAnimation = () => {
        if (reticle.visible) {
          const time = Date.now() * 0.005;
          reticle.material.opacity = 0.5 + 0.3 * Math.sin(time);
        }
      };
      
      reticleRef.current = reticle;
      scene.add(reticle);

      // --- Handle Tapping / Placement ---
      const onSelect = () => {
          log('Select event triggered');
          
          // 1. Check for in-scene UI interaction first (for iOS)
          const uiAction = uiRaycaster(cameraRef.current);
          if (uiAction) {
              log('In-scene UI clicked');
              uiAction(); // e.g., call endSession()
              return;
          }

          // 2. If no UI was clicked, proceed with model placement
          if (reticleRef.current.visible && modelRef.current && !isModelPlaced && modelLoaded) {
              log('Placing model');
              modelRef.current.position.setFromMatrixPosition(reticleRef.current.matrix);
              modelRef.current.visible = true;
              setIsModelPlaced(true);
              reticleRef.current.visible = false;
          } else {
              log('Cannot place model', { reticleVisible: reticleRef.current?.visible, modelExists: !!modelRef.current, modelPlaced: isModelPlaced, modelLoaded: modelLoaded });
          }
      };
      arSession.addEventListener('select', onSelect);

      // --- Setup Hit-Testing with fallbacks ---
      try {
        setLoadingStatus('Setting up surface detection...');
        
        // Try different reference spaces for compatibility
        let refSpace;
        try {
          refSpace = await arSession.requestReferenceSpace('viewer');
          log('Using viewer reference space');
        } catch (e) {
          log('Viewer reference space failed, trying local', e.message);
          refSpace = await arSession.requestReferenceSpace('local');
          log('Using local reference space');
        }
        
        const hitTestSource = await arSession.requestHitTestSource({ space: refSpace });
        xrRefSpaceRef.current = await arSession.requestReferenceSpace('local');
        hitTestSourceRef.current = hitTestSource;
        setIsSearching(true);
        setLoadingStatus('');
        
        log('Hit testing setup complete');
      } catch (hitTestError) {
        log('Hit testing setup failed', hitTestError.message);
        setError('Surface detection failed. AR functionality may be limited.');
      }

      // --- Enhanced Render Loop ---
      let frameCount = 0;
      renderer.setAnimationLoop((timestamp, frame) => {
        frameCount++;
        
        if (!frame) return;

        // Reticle animation
        reticleAnimation();

        // Handle hit-testing to position the reticle
        if (hitTestSourceRef.current && !isModelPlaced && modelLoaded) {
          try {
            const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
            if (hitTestResults.length > 0) {
              const hit = hitTestResults[0];
              const pose = hit.getPose(xrRefSpaceRef.current);
              if (pose) {
                reticleRef.current.visible = true;
                reticleRef.current.matrix.fromArray(pose.transform.matrix);
              }
            } else {
              reticleRef.current.visible = false;
            }
          } catch (hitTestError) {
            if (frameCount % 60 === 0) { // Log every 60 frames to avoid spam
              log('Hit test error', hitTestError.message);
            }
          }
        }
        
        renderer.render(scene, camera);
      });

      log('AR session initialization complete');

    } catch (err) {
      log('AR Session Error', err);
      
      let errorMessage = 'Failed to start AR session. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera permission was denied. Please enable camera access and try again.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'AR is not supported on this device or browser.';
      } else if (err.name === 'InvalidStateError') {
        errorMessage += 'AR session is already active or device is busy.';
      } else if (err.name === 'SecurityError') {
        errorMessage += 'AR access blocked by security policy. Try using HTTPS.';
      } else {
        errorMessage += `${err.message || 'Unknown error occurred.'}`;
      }
      
      if (deviceInfo.isIOS) {
        errorMessage += ' On iOS, ensure you\'re using Mozilla WebXR Viewer or Safari 14.3+.';
      } else if (deviceInfo.isAndroid) {
        errorMessage += ' On Android, ensure you\'re using Chrome 81+ with ARCore installed.';
      }
      
      setError(errorMessage);
      setIsSupported(false);
      setLoadingStatus('');
    }
  };
  
  // --- Interaction Handlers ---
  const handleReposition = () => {
    log('Repositioning model');
    if (modelRef.current) {
      modelRef.current.visible = false;
    }
    if (reticleRef.current) {
      reticleRef.current.visible = false;
    }
    setIsModelPlaced(false);
  };
  
  const handleRotate = (direction) => {
    if (modelRef.current && isModelPlaced) {
      log('Rotating model', direction);
      modelRef.current.rotateY(direction * Math.PI / 8);
    }
  };

  const handleScale = (factor) => {
    if (modelRef.current && isModelPlaced) {
      log('Scaling model', factor);
      const newScale = modelRef.current.scale.x * factor;
      // Limit scaling to reasonable bounds
      if (newScale >= 0.1 && newScale <= 5.0) {
        modelRef.current.scale.multiplyScalar(factor);
      }
    }
  };

  // Debug panel toggle
  const [showDebug, setShowDebug] = useState(false);

  // --- UI Rendering Logic ---
  const renderContent = () => {
    if (!isSupported || error) {
      return (
        <div className="flex items-center justify-center h-full bg-[#0c1825] text-white p-4">
          <div className="text-center max-w-md">
            <ExclamationTriangleIcon className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold mb-2">
              {!isSupported ? "AR Not Supported" : "AR Error"}
            </h3>
            <p className="text-[#b6cacb] mb-4 text-sm leading-relaxed">{error}</p>
            
            {/* Device-specific help */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-4 text-xs text-left">
              <h4 className="font-semibold mb-2">Troubleshooting:</h4>
              <ul className="space-y-1 text-blue-200">
                {deviceInfo.isIOS && (
                  <>
                    <li>• Use Mozilla WebXR Viewer app from App Store</li>
                    <li>• Or Safari 14.3+ on iOS 14.3+</li>
                    <li>• Ensure camera permissions are granted</li>
                  </>
                )}
                {deviceInfo.isAndroid && (
                  <>
                    <li>• Use Chrome 81+ browser</li>
                    <li>• Install Google Play Services for AR</li>
                    <li>• Enable camera and motion sensors</li>
                  </>
                )}
                {!deviceInfo.isMobile && (
                  <li>• AR requires a mobile device with camera</li>
                )}
                <li>• Ensure you're using HTTPS</li>
                <li>• Try reloading the page</li>
              </ul>
            </div>
            
            <div className="flex gap-2 justify-center">
              <button
                onClick={endSession}
                className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
              >
                Close AR View
              </button>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-200 text-sm"
              >
                Debug Info
              </button>
            </div>
            
            {/* Debug information */}
            {showDebug && (
              <div className="mt-4 bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-left">
                <h4 className="font-semibold mb-2 text-sm">Debug Information:</h4>
                <div className="text-xs text-gray-300 space-y-1 max-h-40 overflow-y-auto">
                  <div>Device: {deviceInfo.isIOS ? 'iOS' : deviceInfo.isAndroid ? 'Android' : 'Desktop'}</div>
                  <div>User Agent: {navigator.userAgent}</div>
                  <div>WebXR: {'xr' in navigator ? 'Available' : 'Not Available'}</div>
                  <div>Recent logs:</div>
                  {Object.entries(debugInfo).slice(-5).map(([time, message]) => (
                    <div key={time} className="ml-2">• {message}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Render AR content if supported and no errors
    if (domOverlaySupported) {
      return (
        <>
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-lg font-semibold">AR View</h3>
                <p className="text-sm opacity-80">{productName}</p>
                {loadingStatus && (
                  <p className="text-xs text-[#29d4c5] animate-pulse">{loadingStatus}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="p-1 bg-white/10 backdrop-blur-sm rounded text-xs hover:bg-white/20 transition-colors"
                >
                  Debug
                </button>
                <button
                  onClick={endSession}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Debug Panel */}
          {showDebug && (
            <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-sm border border-white/30 rounded-lg p-2 text-white text-xs max-w-xs">
              <div>Model Loaded: {modelLoaded ? '✓' : '✗'}</div>
              <div>Model Placed: {isModelPlaced ? '✓' : '✗'}</div>
              <div>Searching: {isSearching ? '✓' : '✗'}</div>
              <div>Session: {session ? '✓' : '✗'}</div>
            </div>
          )}
          
          {/* Instructions */}
          {isSearching && !isModelPlaced && modelLoaded && (
            <div className="absolute top-20 left-4 right-4">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-white text-center">
                <p className="text-sm font-medium">Move your device slowly to find a flat surface</p>
                <p className="text-xs opacity-80 mt-1">Look for the blue circle, then tap to place</p>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {loadingStatus && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">{loadingStatus}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-center space-x-2 text-white">
              {isModelPlaced ? (
                <>
                  <button 
                    onClick={() => handleRotate(-1)} 
                    className="bg-white/20 rounded-full p-3 flex items-center justify-center transition-colors hover:bg-white/30"
                  >
                    <ArrowUturnLeftIcon className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={() => handleScale(0.9)} 
                    className="bg-white/20 rounded-full p-3 flex items-center justify-center transition-colors hover:bg-white/30"
                  >
                    <ArrowsPointingInIcon className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={handleReposition} 
                    className="bg-white/30 rounded-full p-3 flex items-center justify-center transition-colors hover:bg-white/40"
                  >
                    <ArrowPathIcon className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={() => handleScale(1.1)} 
                    className="bg-white/20 rounded-full p-3 flex items-center justify-center transition-colors hover:bg-white/30"
                  >
                    <ArrowsPointingOutIcon className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={() => handleRotate(1)} 
                    className="bg-white/20 rounded-full p-3 flex items-center justify-center transition-colors hover:bg-white/30"
                  >
                    <ArrowUturnRightIcon className="h-6 w-6" />
                  </button>
                </>
              ) : (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-sm text-center">
                    {!modelLoaded ? (
                      <span className="block">Loading 3D model...</span>
                    ) : (
                      <>
                        <span className="block font-semibold">Tap to place furniture</span>
                        <span className="block text-xs opacity-80">Find a surface to begin</span>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  if (!isActive) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black">
      {renderContent()}
    </div>
  );
};

export default ARViewer;