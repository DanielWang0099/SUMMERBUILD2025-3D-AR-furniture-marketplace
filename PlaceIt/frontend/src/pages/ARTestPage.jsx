import { useState } from 'react';
import ARStrategyRouter from '../components/AR/ARStrategyRouter';
import { detectARCapabilities, logARCapabilities } from '../utils/arCapabilities';

/**
 * AR Test Page - For debugging and validating AR implementations
 * Remove this component before production
 */
const ARTestPage = () => {
    const [isARActive, setIsARActive] = useState(false);
    const [capabilities, setCapabilities] = useState(null);
    
    // Test model URL (you can replace with any GLB model)
    const testModelUrl = 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';
    
    const handleDetectCapabilities = () => {
        const caps = detectARCapabilities();
        logARCapabilities(caps);
        setCapabilities(caps);
    };
    
    const handleStartAR = () => {
        setIsARActive(true);
    };
    
    const handleCloseAR = () => {
        setIsARActive(false);
    };
    
    return (
        <div className="min-h-screen bg-[#0c1825] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">AR Implementation Test</h1>
                
                {/* Capabilities Detection */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Device Capabilities</h2>
                    <button
                        onClick={handleDetectCapabilities}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors mb-4"
                    >
                        Detect AR Capabilities
                    </button>
                    
                    {capabilities && (
                        <div className="bg-gray-900 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Detection Results:</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <strong>Device:</strong> {capabilities.isIOS ? 'iOS' : capabilities.isAndroid ? 'Android' : 'Desktop'}
                                </div>
                                <div>
                                    <strong>Browser:</strong> {capabilities.browser.name}
                                </div>
                                <div>
                                    <strong>AR Strategy:</strong> {capabilities.arStrategy}
                                </div>
                                <div>
                                    <strong>WebXR:</strong> {capabilities.hasWebXR ? '✓' : '✗'}
                                </div>
                                <div>
                                    <strong>Quick Look:</strong> {capabilities.hasQuickLook ? '✓' : '✗'}
                                </div>
                                <div>
                                    <strong>WebGL:</strong> {capabilities.hasWebGL ? '✓' : '✗'}
                                </div>
                            </div>
                            
                            {capabilities.recommendations.length > 0 && (
                                <div className="mt-4">
                                    <strong>Recommendations:</strong>
                                    <ul className="list-disc list-inside mt-2">
                                        {capabilities.recommendations.map((rec, index) => (
                                            <li key={index} className="text-yellow-300">{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* AR Test */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">AR Test</h2>
                    <p className="text-gray-300 mb-4">
                        Test the AR implementation with a sample 3D model. The system will automatically 
                        choose the best AR method for your device.
                    </p>
                    
                    <div className="flex gap-4">
                        <button
                            onClick={handleStartAR}
                            disabled={isARActive}
                            className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isARActive ? 'AR Active...' : 'Test AR'}
                        </button>
                        
                        {isARActive && (
                            <button
                                onClick={handleCloseAR}
                                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-500 transition-colors"
                            >
                                Stop AR
                            </button>
                        )}
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-400">
                        <p><strong>Test Model:</strong> Damaged Helmet (GLB format)</p>
                        <p><strong>Source:</strong> Three.js Examples</p>
                    </div>
                </div>
                
                {/* Information */}
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6 mt-6">
                    <h3 className="font-semibold mb-3">Implementation Details</h3>
                    <ul className="space-y-2 text-sm">
                        <li>• <strong>Android Chrome:</strong> Uses WebXR for immersive AR experience</li>
                        <li>• <strong>iOS Safari/Chrome:</strong> Converts GLB to USDZ and uses Quick Look</li>
                        <li>• <strong>Unsupported devices:</strong> Falls back to 3D viewer or shows helpful message</li>
                        <li>• <strong>Automatic detection:</strong> No manual device selection required</li>
                    </ul>
                </div>
            </div>
            
            {/* AR Strategy Router */}
            <ARStrategyRouter
                isActive={isARActive}
                onClose={handleCloseAR}
                productName="Test Model - Damaged Helmet"
                modelUrl={testModelUrl}
            />
        </div>
    );
};

export default ARTestPage;
