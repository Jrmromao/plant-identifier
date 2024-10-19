// src/app/components/CameraCapture.tsx
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const startCapture = useCallback(async () => {
    setError(null);
    setDebugInfo('Attempting to start camera...');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setIsCapturing(true);
      setDebugInfo('Camera stream obtained successfully.');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(`Unable to access the camera: ${err}`);
      setDebugInfo(`Error: ${err}`);
    }
  }, []);

  useEffect(() => {
    if (isCapturing && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => {
        setDebugInfo(`Error playing video: ${e}`);
      });
    }
  }, [isCapturing, stream]);

  const stopCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCapturing(false);
    setDebugInfo('Camera stopped');
  }, [stream]);

  const capturePhoto = useCallback(() => {
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
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
      <p className="mt-2 text-blue-500 text-sm">Debug: {debugInfo}</p>
    </div>
  );
};

export default CameraCapture;