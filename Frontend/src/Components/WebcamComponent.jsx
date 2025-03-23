import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";

const WebcamComponent = ({ isRecording, onTabChange, onVisibilityChange }) => {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Initialize webcam when component mounts
  useEffect(() => {
    let stream = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 160, height: 120 }, 
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Could not access camera. Please check permissions.");
      }
    };

    startCamera();

    // Cleanup: stop camera stream when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Monitor tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isDocVisible = !document.hidden;
      setIsVisible(isDocVisible);
      
      if (!isDocVisible && onVisibilityChange) {
        onVisibilityChange('hidden');
      } else if (isDocVisible && onVisibilityChange) {
        onVisibilityChange('visible');
      }
    };

    // Monitor tab focus/blur
    const handleFocus = () => {
      setIsTabActive(true);
      if (onTabChange) onTabChange('focused');
    };
    
    const handleBlur = () => {
      setIsTabActive(false);
      if (onTabChange) onTabChange('blurred');
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onTabChange, onVisibilityChange]);

  return (
    <div className="flex justify-center items-center w-full h-full">
      {cameraError ? (
        <div className="bg-red-900/50 p-4 rounded text-center w-full">
          <p className="text-red-300">{cameraError}</p>
        </div>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="rounded-md"
            style={{
              width: "120px",
              height: "160px",
              transform: "scaleX(-1)", // Mirror effect
            }}
          />
          
          

          {(!isTabActive || !isVisible) && (
            <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center">
              <p className="text-white font-bold text-sm">
                {!isTabActive ? "Tab Switched!" : "Window Hidden!"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebcamComponent;