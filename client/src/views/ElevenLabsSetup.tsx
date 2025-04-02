import React, { useEffect, useState } from 'react';
import DialogController from '../controllers/dialogController';

interface ElevenLabsSetupProps {
  onClose: () => void;
}

const ElevenLabsSetup: React.FC<ElevenLabsSetupProps> = ({ onClose }) => {
  const dialogController = DialogController.getInstance();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Auto-initialize with API key from environment variables or predefined key
  useEffect(() => {
    const initializeWithAPIKey = () => {
      // Mencoba beberapa sumber API key dengan prioritas:
      // 1. Environment variable
      // 2. Hardcoded key provided by user (as fallback)
      // 3. Default to using local audio
      const envApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      const userProvidedKey = 'sk_40f10d60860ef775cb850a893fa825e534a7563a45fe1603'; // Key yang diberikan pengguna
      
      if (envApiKey) {
        console.log("Using ElevenLabs API key from environment");
        dialogController.setElevenLabsApiKey(envApiKey);
      } else if (userProvidedKey) {
        console.log("Using user-provided ElevenLabs API key");
        dialogController.setElevenLabsApiKey(userProvidedKey);
      } else {
        console.log("No API key found, using local audio files");
        dialogController.setElevenLabsApiKey("using_local_audio");
      }
      
      // Set default voice ID jika diperlukan
      const defaultVoiceId = import.meta.env.VITE_ELEVENLABS_DEFAULT_VOICE_ID || 'B716PSrQrzRiI4pc6wxc';
      console.log("Using voice ID:", defaultVoiceId);
      
      // Set loading complete dan close dialog
      setIsLoading(false);
      onClose();
    };
    
    // Jalankan inisialisasi dengan delay kecil untuk pastikan sistem siap
    setTimeout(initializeWithAPIKey, 300);
  }, []);

  if (isLoading) {
    return (
      <div className="elevenlabs-setup flex items-center justify-center min-h-[100px] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500 border-r-2 mx-auto mb-2"></div>
          <p className="text-amber-400">Initializing voice system...</p>
        </div>
      </div>
    );
  }
  
  // Return null when loading complete
  return null;
};

export default ElevenLabsSetup;