import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DialogController from '../controllers/dialogController';
import ElevenLabsService from '../services/elevenlabsService';

interface ElevenLabsSetupProps {
  onClose: () => void;
}

const ElevenLabsSetup: React.FC<ElevenLabsSetupProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // When component mounts, check if we already have an API key from env
  useEffect(() => {
    const elevenlabsService = ElevenLabsService.getInstance();
    const existingApiKey = elevenlabsService.getApiKey();
    
    if (existingApiKey) {
      setApiKey(existingApiKey);
      setIsSuccess(true);
    } else if (import.meta.env.VITE_ELEVENLABS_API_KEY) {
      setApiKey(import.meta.env.VITE_ELEVENLABS_API_KEY as string);
      setIsSuccess(true);
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Set the API key in the DialogController
      const dialogController = DialogController.getInstance();
      dialogController.setElevenLabsApiKey(apiKey);
      
      // Test the API key by generating a tiny bit of speech
      const elevenlabsService = ElevenLabsService.getInstance();
      const testResult = await elevenlabsService.speakText('Test', 'geralt');
      
      if (testResult) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error('Failed to validate API key');
      }
    } catch (err) {
      setError('Invalid API key or API request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-amber-900/50 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl text-amber-500 font-semibold mb-4">ElevenLabs Voice Setup</h2>
        
        <p className="text-gray-400 mb-4">
          Enter your ElevenLabs API key to enable Geralt's voice. You can get an API key from{' '}
          <a 
            href="https://elevenlabs.io/app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-amber-500 underline hover:text-amber-400"
          >
            elevenlabs.io
          </a>
        </p>
        
        <div className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter your ElevenLabs API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-200"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 border-gray-700"
            >
              Skip
            </Button>
            
            <Button 
              onClick={handleSaveApiKey}
              disabled={isLoading || isSuccess}
              className={`${isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'} text-white`}
            >
              {isLoading ? 'Validating...' : isSuccess ? 'Success!' : 'Save API Key'}
            </Button>
          </div>
        </div>
        
        <p className="text-gray-500 text-xs mt-4">
          Note: The ElevenLabs free tier includes 10,000 characters per month.
        </p>
      </div>
    </div>
  );
};

export default ElevenLabsSetup;