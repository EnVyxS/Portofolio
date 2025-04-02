import React, { useEffect } from 'react';
import DialogController from '../controllers/dialogController';

interface ElevenLabsSetupProps {
  onClose: () => void;
}

const ElevenLabsSetup: React.FC<ElevenLabsSetupProps> = ({ onClose }) => {
  const dialogController = DialogController.getInstance();
  
  // Auto-initialize with API key from server
  useEffect(() => {
    // Menggunakan API key dari environment variables
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || import.meta.env.ELEVENLABS_API_KEY;
    
    if (apiKey) {
      console.log("Using ElevenLabs API key from environment");
      dialogController.setElevenLabsApiKey(apiKey);
    } else {
      // Jika tidak ada API key, periksa secret yang tersedia
      console.log("Checking for ELEVENLABS_API_KEY secret...");
      
      // Gunakan fetch untuk memeriksa apakah ada secret ELEVENLABS_API_KEY
      fetch('/api/elevenlabs/check-api-key')
        .then(response => response.json())
        .then(data => {
          if (data.hasApiKey) {
            console.log("Found API key from server, using it");
            dialogController.setElevenLabsApiKey(data.apiKey || "server_api_key_available");
          } else {
            console.warn("No API key found, using local audio files only");
            dialogController.setElevenLabsApiKey("using_local_audio");
          }
        })
        .catch(err => {
          console.error("Error checking for API key:", err);
          console.warn("Falling back to local audio files");
          dialogController.setElevenLabsApiKey("using_local_audio");
        })
        .finally(() => {
          // Close setup screen regardless of API key status
          onClose();
        });
    }
    
    // Only close immediately if we already have an API key
    if (apiKey) {
      onClose();
    }
  }, []);

  // Return null instead of rendering anything
  return null;
};

export default ElevenLabsSetup;