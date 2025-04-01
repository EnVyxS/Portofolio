import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ElevenLabsService from '../services/elevenlabsService';

interface ElevenLabsSetupProps {
  onClose: () => void;
}

const ElevenLabsSetup: React.FC<ElevenLabsSetupProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const elevenlabsService = ElevenLabsService.getInstance();

  // Check if API key exists in localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('elevenlabs_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      elevenlabsService.setApiKey(storedKey);
      setSuccess(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate key format (basic validation)
      if (!apiKey || apiKey.length < 30) {
        throw new Error('API key appears to be invalid. It should be at least 30 characters long.');
      }

      // Test the API with a simple request
      // Using the ElevenLabs service to generate a short test speech
      const testText = "This is a test of the ElevenLabs API.";
      
      // Set the API key in the service
      elevenlabsService.setApiKey(apiKey);
      
      // Try to generate speech
      const result = await elevenlabsService.generateSpeech(testText, 'geralt');
      
      if (!result) {
        throw new Error('Failed to validate API key. Please check it and try again.');
      }

      // If successful, store key in localStorage
      localStorage.setItem('elevenlabs_api_key', apiKey);
      setSuccess(true);
      
      // Play the test audio
      await elevenlabsService.speakText("API key works! Geralt's voice is now available.", 'geralt');
      
      // Auto-close after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('ElevenLabs API key validation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate API key. Please check it and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="elevenlabs-setup-modal"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 100,
        backdropFilter: 'blur(5px)',
      }}
    >
      <div 
        className="modal-content"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '8px',
          padding: '2rem',
          width: '90%',
          maxWidth: '500px',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          boxShadow: '0 0 25px rgba(249, 115, 22, 0.2)',
        }}
      >
        <h2 style={{ 
          color: '#f1f5f9', 
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem' 
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem', color: '#f97316' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
          Enable Geralt's Voice
        </h2>
        
        {!success ? (
          <form onSubmit={handleSubmit}>
            <p style={{ 
              color: '#cbd5e1', 
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
              lineHeight: 1.6
            }}>
              To enable Geralt's voice narration, enter your ElevenLabs API key below.
              You can get a free API key by signing up at{' '}
              <a 
                href="https://elevenlabs.io" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#f97316', textDecoration: 'underline' }}
              >
                elevenlabs.io
              </a>
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                htmlFor="apiKey"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#f1f5f9',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                ElevenLabs API Key
              </label>
              <input
                type="password"
                id="apiKey"
                placeholder="Enter your ElevenLabs API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  color: '#f1f5f9',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                className="apikey-input"
              />
            </div>
            
            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  color: '#fca5a5',
                  borderRadius: '4px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                }}
              >
                {error}
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '4px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                className="cancel-button"
              >
                Skip Voice
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: isLoading ? 'rgba(249, 115, 22, 0.5)' : 'rgba(249, 115, 22, 0.9)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#ffffff',
                  cursor: isLoading ? 'wait' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                className="submit-button"
              >
                {isLoading ? (
                  <span className="loading-text">Validating...</span>
                ) : (
                  <span>Enable Voice</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-message">
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                color: '#86efac',
                borderRadius: '4px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Geralt's voice is enabled! Enjoy the experience.</span>
            </div>
            
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'rgba(249, 115, 22, 0.9)',
                border: 'none',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              className="continue-button"
            >
              Continue to Experience
            </button>
          </div>
        )}

        <div style={{ 
          marginTop: '1.5rem', 
          fontSize: '0.8rem', 
          color: '#64748b',
          textAlign: 'center' 
        }}>
          Voice powered by{' '}
          <a 
            href="https://elevenlabs.io" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#94a3b8' }}
          >
            ElevenLabs API
          </a>
          . Your API key is stored only in your browser.
        </div>
      </div>
    </motion.div>
  );
};

export default ElevenLabsSetup;