import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DialogController from '../controllers/dialogController';

interface ElevenLabsSetupProps {
  onClose: () => void;
}

const ElevenLabsSetup: React.FC<ElevenLabsSetupProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const dialogController = DialogController.getInstance();
  
  // Check if we have an API key in .env
  useEffect(() => {
    // This would typically come from environment variables
    const envApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (envApiKey) {
      setApiKey(envApiKey);
      dialogController.setElevenLabsApiKey(envApiKey);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Set the API key in the DialogController
    try {
      dialogController.setElevenLabsApiKey(apiKey);
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
      setError('Invalid API key or an error occurred');
      console.error(err);
    }
  };

  return (
    <motion.div 
      className="elevenlabs-setup-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="setup-card">
        <h2>Voice Synthesis Setup</h2>
        <p>Enter your ElevenLabs API key to enable voice synthesis for character dialogue.</p>
        
        <a 
          href="https://elevenlabs.io/sign-up" 
          target="_blank" 
          rel="noopener noreferrer"
          className="signup-link"
        >
          Don't have an account? Sign up for free
        </a>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your ElevenLabs API key"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="action-buttons">
            <button 
              type="button" 
              className="skip-button"
              onClick={onClose}
            >
              Skip (Use Text Only)
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Enable Voice'}
            </button>
          </div>
        </form>
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
        
        .skip-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        
        @media (max-width: 640px) {
          .setup-card {
            padding: 1.5rem;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .submit-button, .skip-button {
            width: 100%;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ElevenLabsSetup;