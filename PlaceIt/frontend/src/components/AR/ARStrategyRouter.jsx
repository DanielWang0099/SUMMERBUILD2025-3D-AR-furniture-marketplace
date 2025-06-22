import { useState, useEffect, useCallback } from 'react';
import { detectARCapabilities, checkWebXRSupport, logARCapabilities } from '../../utils/arCapabilities';
import ARViewer from './ARViewer';
import QuickLookARViewer from './QuickLookARViewer';
import { ExclamationTriangleIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

/**
 * AR Strategy Router - Determines and manages the appropriate AR implementation
 * Routes between WebXR (Android Chrome) and Quick Look (iOS Safari/Chrome)
 */
const ARStrategyRouter = ({ isActive, onClose, productName, modelUrl }) => {
    const [arCapabilities, setArCapabilities] = useState(null);
    const [webxrSupport, setWebxrSupport] = useState(null);
    const [currentStrategy, setCurrentStrategy] = useState('detecting');
    const [error, setError] = useState(null);
    const [showDebug, setShowDebug] = useState(false);

    // Detect AR capabilities and determine strategy
    const detectCapabilities = useCallback(async () => {
        try {
            // Get device and browser capabilities
            const capabilities = detectARCapabilities();
            logARCapabilities(capabilities);
            setArCapabilities(capabilities);            // If WebXR is the preferred strategy, verify it's actually working
            if (capabilities.arStrategy === 'webxr') {
                console.log('[AR Strategy] Verifying WebXR support for Android Chrome...');
                const webxrCheck = await checkWebXRSupport();
                setWebxrSupport(webxrCheck);
                
                console.log('[AR Strategy] WebXR check result:', webxrCheck);
                
                if (!webxrCheck.supported) {
                    // Fallback to inline 3D if WebXR fails
                    console.warn('[AR Strategy] WebXR not supported, falling back to inline 3D');
                    capabilities.arStrategy = 'inline3d';
                    capabilities.arCapabilities.webxr = false;
                }
            }

            setCurrentStrategy(capabilities.arStrategy);

        } catch (err) {
            console.error('[AR Strategy] Detection failed:', err);
            setError(`AR detection failed: ${err.message}`);
            setCurrentStrategy('none');
        }
    }, []);

    // Initialize detection when component becomes active
    useEffect(() => {
        if (isActive) {
            detectCapabilities();
        } else {
            // Reset state when inactive
            setCurrentStrategy('detecting');
            setError(null);
        }
    }, [isActive, detectCapabilities]);

    // Render appropriate AR implementation based on strategy
    const renderARImplementation = () => {
        if (!arCapabilities || currentStrategy === 'detecting') {
            return (
                <div className="fixed inset-0 z-50 bg-[#0c1825] flex items-center justify-center text-white">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#29d4c5] mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold mb-2">Detecting AR Capabilities</h3>
                        <p className="text-[#b6cacb] text-sm">Checking device and browser support...</p>
                    </div>
                </div>
            );
        }

        switch (currentStrategy) {
            case 'webxr':
                return (
                    <ARViewer
                        isActive={isActive}
                        onClose={onClose}
                        productName={productName}
                        modelUrl={modelUrl}
                    />
                );

            case 'quicklook':
                return (
                    <QuickLookARViewer
                        isActive={isActive}
                        onClose={onClose}
                        productName={productName}
                        modelUrl={modelUrl}
                    />
                );            case 'inline3d':
                return renderFallbackMessage(
                    'AR Not Available',
                    'AR is not supported on this device, but you can still view the 3D model.',
                    'View 3D Model',
                    () => {
                        // This would trigger the 3D viewer instead
                        onClose();
                        // You could emit an event here to trigger 3D viewer
                        window.dispatchEvent(new CustomEvent('openThreeDViewer', { detail: { modelUrl, productName } }));
                    }
                );

            case 'none':
            default:
                const debugMessage = error || 'AR is not supported on this device or browser.';
                const extendedMessage = arCapabilities ? 
                    `${debugMessage} (Device: ${arCapabilities.isIOS ? 'iOS' : arCapabilities.isAndroid ? 'Android' : 'Desktop'}, Browser: ${arCapabilities.browser.name}, WebXR: ${arCapabilities.hasWebXR ? 'Available' : 'Not Available'})` : 
                    debugMessage;
                
                return renderFallbackMessage(
                    'AR Not Supported',
                    extendedMessage,
                    'Close',
                    onClose
                );
        }
    };

    // Render fallback message for unsupported scenarios
    const renderFallbackMessage = (title, message, buttonText, buttonAction) => (
        <div className="fixed inset-0 z-50 bg-[#0c1825] flex items-center justify-center text-white p-4">
            <div className="max-w-md w-full text-center">
                <ExclamationTriangleIcon className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-[#b6cacb] mb-6 text-sm leading-relaxed">{message}</p>
                
                {/* Device-specific recommendations */}
                {arCapabilities && arCapabilities.recommendations.length > 0 && (
                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6 text-left">
                        <h4 className="font-semibold mb-2 flex items-center">
                            <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                            Recommendations:
                        </h4>
                        <ul className="space-y-1 text-sm text-blue-200">
                            {arCapabilities.recommendations.map((rec, index) => (
                                <li key={index}>• {rec}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={buttonAction}
                        className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                        {buttonText}
                    </button>
                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-200"
                    >
                        Debug
                    </button>
                </div>

                {/* Debug information */}
                {showDebug && arCapabilities && (
                    <div className="mt-6 bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-left">
                        <h4 className="font-semibold mb-3 text-sm">Debug Information:</h4>
                        <div className="text-xs text-gray-300 space-y-2">
                            <div>
                                <strong>Device:</strong> {arCapabilities.isIOS ? 'iOS' : arCapabilities.isAndroid ? 'Android' : 'Desktop'}
                            </div>
                            <div>
                                <strong>Browser:</strong> {arCapabilities.browser.name}
                            </div>
                            <div>
                                <strong>AR Strategy:</strong> {currentStrategy}
                            </div>
                            <div>
                                <strong>WebXR:</strong> {arCapabilities.hasWebXR ? '✓' : '✗'}
                            </div>
                            <div>
                                <strong>Quick Look:</strong> {arCapabilities.hasQuickLook ? '✓' : '✗'}
                            </div>
                            <div>
                                <strong>WebGL:</strong> {arCapabilities.hasWebGL ? '✓' : '✗'}
                            </div>
                            {webxrSupport && (
                                <div>
                                    <strong>WebXR Test:</strong> {webxrSupport.supported ? 'Passed' : 'Failed'} 
                                    {!webxrSupport.supported && ` (${webxrSupport.reason})`}
                                </div>
                            )}
                            <div>
                                <strong>User Agent:</strong> 
                                <div className="mt-1 p-2 bg-gray-800 rounded text-xs break-all">
                                    {navigator.userAgent}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (!isActive) return null;

    return renderARImplementation();
};

export default ARStrategyRouter;
