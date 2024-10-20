''
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const startCapture = useCallback(async () => {
    setError(null);
    setDebugInfo('Attempting to start camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      setDebugInfo('Camera stream obtained. Attaching to video element...');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setDebugInfo('Video element loaded metadata. Playing...');
          videoRef.current?.play().catch(e => {
            setDebugInfo(`Error playing video: ${e}`);
          });
        };
        setIsCapturing(true);
      } else {
        setDebugInfo('Video ref is null! Retrying in 1 second...');
        setTimeout(startCapture, 1000);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(`Unable to access the camera: ${err}`);
      setIsCapturing(false);
    }
  }, []);

  const stopCapture = useCallback(() => {
    setDebugInfo('Stopping capture...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(() => {
    setDebugInfo('Capturing photo...');
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
          onCapture(file);
          stopCapture();
        }
      }, 'image/jpeg');
    } else {
      setDebugInfo('Video ref is null during capture!');
    }
  }, [onCapture, stopCapture]);

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return (
    <div className="relative">
      {!isCapturing ? (
        <button
          onClick={startCapture}
          className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 text-lg font-semibold shadow-md"
        >
          Open Camera
        </button>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover rounded-md"
            style={{border: '2px solid red'}}
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={capturePhoto}
              className="mx-2 py-2 px-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-300"
            >
              Capture
            </button>
            <button
              onClick={stopCapture}
              className="mx-2 py-2 px-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
     {process.env.isDev && <p className="mt-2 text-blue-500 text-sm">Debug: {debugInfo}</p>}
    </div>
  );
};

export default CameraCapture;