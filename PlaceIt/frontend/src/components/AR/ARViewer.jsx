import { useEffect, useRef, useState } from 'react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ARViewer = ({ isActive, onClose, productName }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isActive) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Try to use back camera
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
        }
      } catch (err) {
        console.error('Camera access denied:', err);
        setError('Camera access is required for AR functionality. Please allow camera access and try again.');
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isActive]);

  const handleClose = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setHasCamera(false);
    setError(null);
    onClose();
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-lg font-semibold">AR View</h3>
            <p className="text-sm opacity-80">{productName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* AR Content */}
      <div className="relative w-full h-full">
        {error ? (
          <div className="flex items-center justify-center h-full bg-[#0c1825] text-white">
            <div className="text-center max-w-md px-4">
              <CameraIcon className="h-16 w-16 mx-auto mb-4 text-[#29d4c5]" />
              <h3 className="text-xl font-semibold mb-2">Camera Access Required</h3>
              <p className="text-[#b6cacb] mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="bg-gradient-to-r from-[#29d4c5] to-[#209aaa] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Close AR View
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Camera Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* AR Overlay */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            
            {/* AR Controls */}
            {hasCamera && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center justify-center space-x-4 text-white">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-sm text-center">
                      <span className="block font-semibold">Tap to place furniture</span>
                      <span className="block text-xs opacity-80">Pinch to resize • Drag to move</span>
                    </p>
                  </div>
                </div>
                
                {/* Demo placement indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-[#29d4c5] rounded-full animate-pulse"></div>
                  <div className="w-8 h-8 border-2 border-[#29d4c5] rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Instructions */}
      {hasCamera && !error && (
        <div className="absolute top-20 left-4 right-4">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-3 text-white text-center">
            <p className="text-sm">
              Point your camera at a flat surface to place the {productName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARViewer;
