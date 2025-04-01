import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const router = Router();

// Hash function for generating filenames from text
function generateSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}

/**
 * Endpoint for elevenlabs text-to-speech service
 * Integrates caching mechanism to save API credits
 */
router.post('/text-to-speech', async (req: Request, res: Response) => {
  try {
    // Get text and voice_id from the request body
    const { text, voice_id = 'TxGEqnHWrfWFTfGW9XjX', voice_settings } = req.body;
    
    // Validate input
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Skip processing for text with only ellipsis (character is listening)
    if (text.trim() === '...' || text.trim() === '.....') {
      // Return path to silent.mp3
      return res.status(200).json({ 
        success: true, 
        audioPath: '/audio/character/silent.mp3',
        message: 'Using silent audio for ellipsis'
      });
    }
    
    // Use API key from environment variables
    const apiKey = process.env.VITE_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not found' });
    }
    
    // Generate hash for the text
    const hash = generateSimpleHash(text);
    const fileName = `dialog_${hash}.mp3`;
    
    // Define directories for audio files
    const publicDir = path.resolve(process.cwd(), 'client/public');
    const audioDir = path.join(publicDir, 'audio/character');
    const audioFilePath = path.join(audioDir, fileName);
    const audioPublicPath = `/audio/character/${fileName}`;
    
    // Create directories if they don't exist
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    // Check if the file already exists (cached)
    if (fs.existsSync(audioFilePath)) {
      console.log(`Audio file found for: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      return res.status(200).json({ 
        success: true, 
        audioPath: audioPublicPath,
        cached: true,
        message: 'Using cached audio file'
      });
    }
    
    // If file doesn't exist, generate with ElevenLabs API
    console.log(`Generating audio with ElevenLabs for: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
    
    // Normalize text - remove excessive whitespace
    const cleanedText = text.replace(/\*/g, "").trim().replace(/\s+/g, ' ');
    
    // ElevenLabs API endpoint
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;
    
    const response = await axios({
      method: 'post',
      url: apiUrl,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      data: {
        text: cleanedText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voice_settings || {
          stability: 0.45,
          similarity_boost: 0.80,
          style: 0.30,
          use_speaker_boost: true,
          speaking_rate: 0.75,
        }
      },
      responseType: 'arraybuffer'
    });
    
    // If successful, save the audio file
    if (response.status === 200) {
      fs.writeFileSync(audioFilePath, response.data);
      console.log(`Audio saved to: ${audioFilePath}`);
      
      return res.status(200).json({ 
        success: true, 
        audioPath: audioPublicPath,
        cached: false,
        message: 'Generated new audio file'
      });
    } else {
      // If API request failed, return error
      return res.status(response.status).json({ 
        error: 'Failed to generate audio',
        details: response.statusText,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error generating audio:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    });
  }
});

export default router;