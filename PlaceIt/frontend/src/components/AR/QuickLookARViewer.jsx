import { useState, useRef, useEffect, useCallback } from 'react';
import { XMarkIcon, ArrowPathIcon, ExclamationTriangleIcon, EyeIcon } from '@heroicons/react/24/outline';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter';

/**
 * Quick Look AR Viewer for iOS devices
 * Converts GLB models to USDZ and launches Apple's AR Quick Look
 */
const QuickLookARViewer = ({ isActive, onClose, productName, modelUrl }) => {
    const [loadingStatus, setLoadingStatus] = useState('');
    const [error, setError] = useState(null);
    const [usdzUrl, setUsdzUrl] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});
    const [isConverting, setIsConverting] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    
    const loaderRef = useRef(new GLTFLoader());
    const exporterRef = useRef(new USDZExporter());
    const linkRef = useRef(null);

    // Enhanced logging
    const log = useCallback((message, data = null) => {
        console.log(`[Quick Look AR] ${message}`, data || '');
        setDebugInfo(prev => ({
            ...prev,
            [`${Date.now()}`]: `${message}${data ? ': ' + JSON.stringify(data) : ''}`
        }));
    }, []);

    // Convert GLB to USDZ
    const convertToUSDZ = useCallback(async () => {
        if (!modelUrl) {
            setError('No model URL provided');
            return;
        }

        try {
            setIsConverting(true);
            setLoadingStatus('Loading 3D model...');
            log('Starting GLB to USDZ conversion', { modelUrl });

            // Load GLB model
            const gltf = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Model loading timeout (30s)'));
                }, 30000);

                loaderRef.current.load(
                    modelUrl,
                    (gltf) => {
                        clearTimeout(timeout);
                        resolve(gltf);
                    },
                    (progress) => {
                        const percentComplete = (progress.loaded / progress.total * 100).toFixed(0);
                        setLoadingStatus(`Loading model: ${percentComplete}%`);
                        log('Loading progress', `${percentComplete}%`);
                    },
                    (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    }
                );
            });

            log('GLB model loaded successfully');
            setLoadingStatus('Processing model for AR...');

            // Optimize model for Quick Look
            const scene = gltf.scene.clone();
            
            // Scale model appropriately for AR (Quick Look typically expects real-world scale)
            const box = new THREE.Box3().setFromObject(scene);
            const size = box.getSize(new THREE.Vector3());
            const maxDimension = Math.max(size.x, size.y, size.z);
            
            // Scale to reasonable furniture size (max 2 meters)
            if (maxDimension > 0) {
                const targetSize = Math.min(2.0, Math.max(0.5, maxDimension)); // Between 0.5m and 2m
                const scale = targetSize / maxDimension;
                scene.scale.multiplyScalar(scale);
                log('Model scaled for AR', { originalSize: maxDimension, scale, targetSize });
            }

            // Center the model
            const center = box.getCenter(new THREE.Vector3());
            scene.position.sub(center.multiplyScalar(scene.scale.x));

            // Optimize materials for Quick Look
            scene.traverse((child) => {
                if (child.isMesh) {
                    // Ensure materials are compatible with USDZ
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => optimizeMaterialForUSDZ(mat));
                        } else {
                            optimizeMaterialForUSDZ(child.material);
                        }
                    }
                }
            });

            setLoadingStatus('Converting to USDZ format...');
            log('Starting USDZ export');

            // Export to USDZ
            const usdzArrayBuffer = await exporterRef.current.parse(scene);
            
            // Create blob and URL
            const blob = new Blob([usdzArrayBuffer], { type: 'model/vnd.usdz+zip' });
            const url = URL.createObjectURL(blob);
            
            setUsdzUrl(url);
            setLoadingStatus('');
            setIsConverting(false);
            
            log('USDZ conversion completed', { 
                originalSize: modelUrl.length,
                usdzSize: usdzArrayBuffer.byteLength,
                compressionRatio: (usdzArrayBuffer.byteLength / modelUrl.length * 100).toFixed(1) + '%'
            });

        } catch (err) {
            log('Conversion failed', err.message);
            setError(`Failed to convert model: ${err.message}`);
            setLoadingStatus('');
            setIsConverting(false);
        }
    }, [modelUrl, log]);

    // Optimize material for USDZ compatibility
    const optimizeMaterialForUSDZ = (material) => {
        if (!material) return;

        // Ensure material properties are USDZ-compatible
        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
            // Keep existing properties but ensure they're in valid ranges
            material.roughness = Math.max(0.1, Math.min(1.0, material.roughness || 0.5));
            material.metalness = Math.max(0.0, Math.min(1.0, material.metalness || 0.0));
            
            // Ensure proper color space for textures
            if (material.map) {
                material.map.colorSpace = THREE.SRGBColorSpace;
            }
        }
        
        material.needsUpdate = true;
    };

    // Launch Quick Look AR
    const launchQuickLook = useCallback(() => {
        if (!usdzUrl) {
            setError('USDZ model not ready');
            return;
        }

        try {
            log('Launching Quick Look AR');
            
            // Create temporary anchor element for Quick Look
            const link = document.createElement('a');
            link.href = usdzUrl;
            link.rel = 'ar';
            link.download = `${productName || 'model'}.usdz`;
            
            // Add Quick Look specific attributes
            link.setAttribute('data-name', productName || 'AR Model');
            link.setAttribute('data-canonical', window.location.href);
            
            // Programmatically click the link to trigger Quick Look
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            log('Quick Look AR launched successfully');
            
        } catch (err) {
            log('Failed to launch Quick Look', err.message);
            setError(`Failed to launch AR: ${err.message}`);
        }
    }, [usdzUrl, productName, log]);

    // Cleanup USDZ URL when component unmounts
    useEffect(() => {
        return () => {
            if (usdzUrl) {
                URL.revokeObjectURL(usdzUrl);
            }
        };
    }, [usdzUrl]);

    // Start conversion when component becomes active
    useEffect(() => {
        if (isActive && modelUrl && !usdzUrl && !isConverting) {
            convertToUSDZ();
        }
    }, [isActive, modelUrl, usdzUrl, isConverting, convertToUSDZ]);

    // Handle close
    const handleClose = useCallback(() => {
        if (usdzUrl) {
            URL.revokeObjectURL(usdzUrl);
        }
        onClose();
    }, [usdzUrl, onClose]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-50 bg-[#0c1825] flex items-center justify-center text-white">
            <div className="max-w-md w-full mx-4 text-center">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold">Quick Look AR</h3>
                        <p className="text-sm text-[#b6cacb]">{productName}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6">
                        <ExclamationTriangleIcon className="h-16 w-16 mx-auto mb-4 text-red-400" />
                        <h4 className="text-lg font-semibold mb-2">Conversion Failed</h4>
                        <p className="text-[#b6cacb] text-sm mb-4">{error}</p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={convertToUSDZ}
                                className="bg-[#29d4c5] text-white px-4 py-2 rounded-lg hover:bg-[#209aaa] transition-colors text-sm"
                            >
                                <ArrowPathIcon className="h-4 w-4 inline mr-1" />
                                Retry
                            </button>
                            <button
                                onClick={handleClose}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {(isConverting || loadingStatus) && !error && (
                    <div className="mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#29d4c5] mx-auto mb-4"></div>
                        <h4 className="text-lg font-semibold mb-2">Preparing AR Model</h4>
                        <p className="text-[#b6cacb] text-sm mb-4">
                            {loadingStatus || 'Converting model for Quick Look...'}
                        </p>
                        <div className="bg-[#29d4c5]/20 border border-[#29d4c5]/30 rounded-lg p-3 text-left">
                            <p className="text-xs text-[#29d4c5]">
                                Converting GLB to USDZ format for optimal iOS AR performance...
                            </p>
                        </div>
                    </div>
                )}

                {/* Ready State */}
                {usdzUrl && !error && !isConverting && (
                    <div className="mb-6">
                        <EyeIcon className="h-16 w-16 mx-auto mb-4 text-[#29d4c5]" />
                        <h4 className="text-lg font-semibold mb-2">AR Model Ready</h4>
                        <p className="text-[#b6cacb] text-sm mb-6">
                            Your furniture is ready to view in augmented reality using Apple's Quick Look.
                        </p>
                        
                        <button
                            onClick={launchQuickLook}
                            className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 text-lg font-semibold mb-4 w-full"
                        >
                            <EyeIcon className="h-5 w-5 inline mr-2" />
                            View in AR
                        </button>

                        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 text-left">
                            <h5 className="font-semibold mb-2 text-sm">Quick Look AR Tips:</h5>
                            <ul className="space-y-1 text-xs text-blue-200">
                                <li>• Find a well-lit flat surface</li>
                                <li>• Move your device slowly to scan the area</li>
                                <li>• Tap to place the furniture</li>
                                <li>• Pinch to resize, drag to move</li>
                                <li>• Take photos to share with others</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Debug Panel */}
                <div className="flex gap-2 justify-center mb-4">
                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-500 transition-colors"
                    >
                        {showDebug ? 'Hide' : 'Show'} Debug
                    </button>
                </div>

                {showDebug && (
                    <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-left">
                        <h5 className="font-semibold mb-2 text-sm">Debug Information:</h5>
                        <div className="text-xs text-gray-300 space-y-1 max-h-40 overflow-y-auto">
                            <div>Model URL: {modelUrl}</div>
                            <div>USDZ Ready: {usdzUrl ? '✓' : '✗'}</div>
                            <div>Converting: {isConverting ? '✓' : '✗'}</div>
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
};

export default QuickLookARViewer;
