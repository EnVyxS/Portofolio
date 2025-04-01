import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ElevenLabsService from '../services/elevenlabsService';

interface ElevenLabsSetupProps {
  onClose: () => void;
}

const ElevenLabsSetup: React.FC<ElevenLabsSetupProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const elevenlabsService = ElevenLabsService.getInstance();
  
  useEffect(() => {
    // Check if API key is already set
    const savedKey = elevenlabsService.getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setIsSuccess(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setErrorMessage('Please enter a valid API key');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Save the API key to the service
      elevenlabsService.setApiKey(apiKey);
      
      // Test the API key with a simple request (minimal text to not waste credits)
      const testResult = await elevenlabsService.generateSpeech('Test', 'geralt');
      
      if (testResult) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error('Could not generate speech. Please check your API key.');
      }
    } catch (error) {
      console.error('Error testing ElevenLabs API:', error);
      setErrorMessage('Invalid API key or API request failed. Please try again.');
      elevenlabsService.setApiKey(''); // Clear invalid key
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="elevenlabs-setup"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="elevenlabs-modal">
        <div className="elevenlabs-header">
          <h2>Voice Setup</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="elevenlabs-content">
          <p className="elevenlabs-description">
            To enable the Geralt voice feature, please enter your ElevenLabs API key.
            You can get your API key from <a href="https://elevenlabs.io/app" target="_blank" rel="noopener noreferrer">ElevenLabs website</a>.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="apiKey">ElevenLabs API Key</label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your ElevenLabs API key"
                disabled={isSubmitting || isSuccess}
              />
            </div>
            
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            
            {isSuccess ? (
              <div className="success-message">
                API key validated successfully! Voice feature is now enabled.
              </div>
            ) : (
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Validating...' : 'Enable Voice'}
              </button>
            )}
          </form>
          
          <div className="note">
            <strong>Note:</strong> Your API key is stored locally in your browser session only.
            ElevenLabs offers free credits for voice synthesis when you sign up.
          </div>
        </div>
      </div>
      
      <style>{`
        .elevenlabs-setup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(3px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .elevenlabs-modal {
          background-color: rgba(20, 20, 25, 0.95);
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          border: 1px solid rgba(249, 115, 22, 0.4);
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.2);
          overflow: hidden;
        }
        
        .elevenlabs-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background-color: rgba(15, 15, 20, 0.9);
          border-bottom: 1px solid rgba(249, 115, 22, 0.3);
        }
        
        .elevenlabs-header h2 {
          color: #f97316;
          margin: 0;
          font-size: 1.25rem;
          font-family: 'VT323', monospace;
          text-shadow: 0 0 5px rgba(249, 115, 22, 0.4);
        }
        
        .close-button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }
        
        .close-button:hover {
          color: #f97316;
        }
        
        .elevenlabs-content {
          padding: 1.5rem;
        }
        
        .elevenlabs-description {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        .elevenlabs-description a {
          color: #f97316;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .elevenlabs-description a:hover {
          text-decoration: underline;
          color: #fb923c;
        }
        
        .input-group {
          margin-bottom: 1.25rem;
        }
        
        .input-group label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .input-group input {
          width: 100%;
          padding: 0.75rem;
          background-color: rgba(10, 10, 15, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: white;
          font-family: inherit;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: rgba(249, 115, 22, 0.5);
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
        }
        
        .input-group input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .input-group input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #f43f5e;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          padding: 0.5rem;
          background-color: rgba(244, 63, 94, 0.1);
          border-radius: 4px;
          border-left: 3px solid #f43f5e;
        }
        
        .success-message {
          color: #10b981;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          padding: 0.75rem;
          background-color: rgba(16, 185, 129, 0.1);
          border-radius: 4px;
          border-left: 3px solid #10b981;
        }
        
        .submit-button {
          width: 100%;
          padding: 0.75rem;
          background-color: rgba(249, 115, 22, 0.2);
          color: #f97316;
          border: 1px solid rgba(249, 115, 22, 0.4);
          border-radius: 4px;
          font-family: inherit;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 1.5rem;
        }
        
        .submit-button:hover {
          background-color: rgba(249, 115, 22, 0.3);
          border-color: rgba(249, 115, 22, 0.6);
        }
        
        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .note {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          padding: 0.75rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          line-height: 1.4;
        }
        
        .note strong {
          color: rgba(255, 255, 255, 0.8);
        }
        
        @media (max-width: 640px) {
          .elevenlabs-modal {
            width: 95%;
          }
          
          .elevenlabs-content {
            padding: 1.25rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ElevenLabsSetup;