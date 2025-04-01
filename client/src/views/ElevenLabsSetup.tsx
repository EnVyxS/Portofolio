import React, { useEffect } from 'react';
import DialogController from '../controllers/dialogController';

interface ElevenLabsSetupProps {
  onClose: () => void;
}

const ElevenLabsSetup: React.FC<ElevenLabsSetupProps> = ({ onClose }) => {
  const dialogController = DialogController.getInstance();
  
  // Auto-initialize with API key from server
  useEffect(() => {
    // Menggunakan API key dari .env jika tersedia, atau gunakan audio lokal
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (apiKey) {
      console.log("Using ElevenLabs API key from environment");
      dialogController.setElevenLabsApiKey(apiKey);
    } else {
      console.log("No API key found, using local audio files");
      dialogController.setElevenLabsApiKey("using_local_audio");
    }
    
    // Immediately close - hide the "initializing voice" screen
    onClose();
  }, []);

  // Return null instead of rendering anything
  return null;
};

export default ElevenLabsSetup;