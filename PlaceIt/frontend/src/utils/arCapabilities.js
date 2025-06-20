/**
 * Enhanced AR capabilities detection for cross-platform support
 * Supports WebXR (Android Chrome) and Quick Look (iOS Safari/Chrome)
 */

// Enhanced device detection with browser specifics
export const detectARCapabilities = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // Device detection
    const isIOS = /iphone|ipad|ipod/.test(userAgent) || platform.includes('iphone') || platform.includes('ipad');
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
    
    // Browser detection
    const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);
    const isEdge = /edg/.test(userAgent);
    
    // iOS specific browser detection (Chrome on iOS uses Safari engine)
    const isIOSChrome = isIOS && /crios/.test(userAgent);
    const isIOSSafari = isIOS && !isIOSChrome && isSafari;
    const isIOSWebView = isIOS && !isIOSChrome && !isIOSSafari;
    
    // WebXR support detection
    const hasWebXR = 'xr' in navigator;
    const hasWebGL = (() => {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    })();
    
    // Quick Look support detection (iOS 12+ with Safari)
    const hasQuickLook = isIOS && (isIOSSafari || isIOSChrome);
    
    // Determine AR strategy
    let arStrategy = 'none';
    let arCapabilities = {
        webxr: false,
        quicklook: false,
        inline3d: hasWebGL
    };
    
    if (isAndroid && isChrome && hasWebXR) {
        arStrategy = 'webxr';
        arCapabilities.webxr = true;
    } else if (hasQuickLook) {
        arStrategy = 'quicklook';
        arCapabilities.quicklook = true;
    } else if (hasWebGL) {
        arStrategy = 'inline3d';
    }
    
    return {
        // Device info
        isIOS,
        isAndroid,
        isMobile,
        isDesktop: !isMobile,
        
        // Browser info
        browser: {
            isChrome,
            isSafari,
            isFirefox,
            isEdge,
            isIOSChrome,
            isIOSSafari,
            isIOSWebView,
            name: isChrome ? 'Chrome' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : isEdge ? 'Edge' : 'Unknown'
        },
        
        // Technical capabilities
        hasWebXR,
        hasWebGL,
        hasQuickLook,
        
        // AR strategy and capabilities
        arStrategy,
        arCapabilities,
        
        // Recommended user actions
        recommendations: getRecommendations(arStrategy, isIOS, isAndroid, isChrome, isSafari)
    };
};

// Get user recommendations based on device/browser combo
const getRecommendations = (strategy, isIOS, isAndroid, isChrome, isSafari) => {
    const recommendations = [];
    
    if (strategy === 'none') {
        if (isIOS && !isSafari && !isChrome) {
            recommendations.push('Use Safari or Chrome for AR support');
        } else if (isAndroid && !isChrome) {
            recommendations.push('Use Chrome browser for WebXR AR support');
            recommendations.push('Install Google Play Services for AR');
        } else if (!isIOS && !isAndroid) {
            recommendations.push('AR requires a mobile device with camera');
        }
    } else if (strategy === 'webxr') {
        recommendations.push('Ensure camera permissions are granted');
        recommendations.push('Make sure Google Play Services for AR is installed');
    } else if (strategy === 'quicklook') {
        recommendations.push('Tap "View in AR" to launch Quick Look');
        recommendations.push('Find a flat surface with good lighting');
    }
    
    return recommendations;
};

// Check if WebXR is actually supported (async)
export const checkWebXRSupport = async () => {
    if (!('xr' in navigator)) {
        return { supported: false, reason: 'WebXR not available' };
    }
    
    try {
        const immersiveARSupported = await navigator.xr.isSessionSupported('immersive-ar');
        const inlineSupported = await navigator.xr.isSessionSupported('inline');
        
        return {
            supported: immersiveARSupported,
            immersiveAR: immersiveARSupported,
            inline: inlineSupported,
            reason: immersiveARSupported ? 'WebXR AR supported' : 'WebXR AR not supported'
        };
    } catch (error) {
        return {
            supported: false,
            reason: `WebXR check failed: ${error.message}`
        };
    }
};

// Utility to log device capabilities for debugging
export const logARCapabilities = (capabilities) => {
    console.group('[AR Capabilities]');
    console.log('Device:', {
        iOS: capabilities.isIOS,
        Android: capabilities.isAndroid,
        Mobile: capabilities.isMobile
    });
    console.log('Browser:', capabilities.browser);
    console.log('AR Strategy:', capabilities.arStrategy);
    console.log('AR Capabilities:', capabilities.arCapabilities);
    console.log('Recommendations:', capabilities.recommendations);
    console.groupEnd();
    
    return capabilities;
};
