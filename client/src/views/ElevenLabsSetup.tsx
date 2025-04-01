import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import DialogController from '../controllers/dialogController';

interface ElevenLabsSetupProps {
  onClose: () => void;
}

const ElevenLabsSetup: React.FC<ElevenLabsSetupProps> = ({ onClose }) => {
  const dialogController = DialogController.getInstance();
  
  // Auto-initialize with API key from .env
  useEffect(() => {
    // Get API key from environment variables
    const envApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (envApiKey) {
      dialogController.setElevenLabsApiKey(envApiKey);
      // Automatically close after setting API key
      setTimeout(() => {
        onClose();
      }, 1000); // Add a slight delay to show loading animation
    } else {
      console.error("ElevenLabs API key not found in environment variables");
      // Still close even if no API key found
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, []);

  return (
    <motion.div 
      className="elevenlabs-setup-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="setup-card">
        <h2>Initializing Voice</h2>
        <p>Setting up voice synthesis for character dialogue...</p>
        
        <div className="loading-animation">
          <div className="loading-circle"></div>
        </div>
      </div>
      
      <style>{`
        .elevenlabs-setup-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1000;
          backdrop-filter: blur(5px);
        }
        
        .setup-card {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(249, 115, 22, 0.6);
          border-radius: 10px;
          padding: 2rem;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
        }
        
        h2 {
          color: #f1f5f9;
          font-size: 1.5rem;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        p {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1.5rem;
          text-align: center;
          line-height: 1.5;
        }
        
        .signup-link {
          display: block;
          color: #f97316;
          text-align: center;
          margin-bottom: 1.5rem;
          text-decoration: underline;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #f1f5f9;
        }
        
        input {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 5px;
          background: rgba(0, 0, 0, 0.2);
          color: #fff;
          font-size: 1rem;
        }
        
        .error-message {
          color: #ef4444;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        
        .action-buttons {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }
        
        .submit-button, .skip-button {
          padding: 0.8rem 1.5rem;
          border-radius: 5px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .submit-button {
          background: #f97316;
          color: #fff;
          border: none;
          flex: 1;
        }
        
        .submit-button:hover {
          background: #ea580c;
        }
        
        .submit-button:disabled {
          background: #c2410c;
          cursor: not-allowed;
        }
        
        .skip-button {
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .loading-animation {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 1rem;
        }
        
        .loading-circle {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(249, 115, 22, 0.2);
          border-top: 3px solid #f97316;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 640px) {
          .setup-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ElevenLabsSetup;