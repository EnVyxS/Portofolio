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
    const { text, voice_id = 'L9oqKdX7JyDJa0dK6AzN', voice_settings } = req.body;
    
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
    
    // Use API key from environment variables or hardcoded value
    // const apiKey = process.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
    
    // Force use of the correct API key
    const apiKey = 'sk_8c7df130995c63ed6e5c092119a04b8ab581c11f5ee2154c';
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not found' });
    }
    
    console.log('Using ElevenLabs API key (hardcoded)');
    
    // Generate hash for the original text (for lookup in existing files)
    const originalHash = generateSimpleHash(text);
    const originalFileName = `dialog_${originalHash}.mp3`;
    
    // Define directories for audio files
    const publicDir = path.resolve(process.cwd(), 'client/public');
    const audioDir = path.join(publicDir, 'audio/character');
    
    // Ensure directory exists
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    // Original audio paths (without emotion processing)
    const originalAudioFilePath = path.join(audioDir, originalFileName);
    const originalAudioPublicPath = `/audio/character/${originalFileName}`;
    
    // Check original file cache first
    if (fs.existsSync(originalAudioFilePath)) {
      console.log(`Audio file found for original text: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      return res.status(200).json({ 
        success: true, 
        audioPath: originalAudioPublicPath,
        cached: true,
        message: 'Using cached audio file (original)'
      });
    }
    
    // Check other folders for reuse (to save API credit)
    const geraltsVoiceFolder = path.join(publicDir, 'audio/geralt');
    if (fs.existsSync(geraltsVoiceFolder)) {
      const originalInGeraltsFolder = path.join(geraltsVoiceFolder, originalFileName);
      if (fs.existsSync(originalInGeraltsFolder)) {
        // Copy the file to character folder to make future lookups faster
        try {
          fs.copyFileSync(originalInGeraltsFolder, originalAudioFilePath);
          console.log(`Reused audio from geralt folder for: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
          return res.status(200).json({ 
            success: true, 
            audioPath: originalAudioPublicPath,
            cached: true,
            message: 'Reused audio from geralt folder'
          });
        } catch (copyErr) {
          console.error('Error copying file from geralt folder:', copyErr);
          // Continue to API if copy fails
        }
      }
    }
    
    // If file doesn't exist, generate with ElevenLabs API
    console.log(`Generating audio with ElevenLabs for: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
    
    // Petunjuk emosi untuk ElevenLabs
    let emotionPrompt = '';
    let cleanText = text;
    let processedText = '';
    let finalCleanedText = '';
    
    // Check if text has emotion marker
    const emotionMatch = text.match(/\[(.*?)\]/);
    if (emotionMatch) {
      emotionPrompt = emotionMatch[1].trim(); // Extract emotion from [emotion]
      cleanText = text.replace(/\[(.*?)\]/, '').trim(); // Remove [emotion] marker from text
      console.log(`Emotion detected: "${emotionPrompt}" for text: "${cleanText.substring(0, 30)}${cleanText.length > 30 ? '...' : ''}"`);
    }
    
    // Prepare emotion prompting based on text content
    if (!emotionMatch) {
      // Detect emotion from text content if not explicitly marked
      if (text.includes('fucking') || text.includes('shit') || text.includes('damn')) {
        emotionPrompt = 'angry, frustrated';
        console.log(`Auto-detected emotion: "angry" for text with strong language`);
      } else if (text.includes('Hmph') || text.includes('Tch') || text.includes('Pfftt')) {
        emotionPrompt = 'dismissive, irritated';
        console.log(`Auto-detected emotion: "dismissive" for text with scoffs`);
      } else if (text.includes('?')) {
        emotionPrompt = 'questioning, curious';
        console.log(`Auto-detected emotion: "questioning" for text with question mark`);
      }
    }
    
    // Add emotion prompt to text if any
    processedText = cleanText;
    if (emotionPrompt) {
      // Add emotion as tone instruction at beginning (ElevenLabs format)
      processedText = `[${emotionPrompt}] ${cleanText}`;
    }
    
    // Normalize text - remove excessive whitespace and asterisks
    finalCleanedText = processedText.replace(/\*/g, "").trim().replace(/\s+/g, ' ');
    
    // Generate hash for the processed text
    const processedHash = generateSimpleHash(finalCleanedText);
    const processedFileName = `dialog_${processedHash}.mp3`;
    const processedAudioFilePath = path.join(audioDir, processedFileName);
    const processedAudioPublicPath = `/audio/character/${processedFileName}`;
    
    // Check for processed text in cache
    if (finalCleanedText !== text && fs.existsSync(processedAudioFilePath)) {
      console.log(`Audio file found for processed text with emotions: "${finalCleanedText.substring(0, 30)}${finalCleanedText.length > 30 ? '...' : ''}"`);
      return res.status(200).json({ 
        success: true, 
        audioPath: processedAudioPublicPath,
        cached: true,
        message: 'Using cached audio file (with emotion)'
      });
    }
    
    // Final audio file paths
    const finalFilePath = processedAudioFilePath; // Use processed version to save
    const finalPublicPath = processedAudioPublicPath;
    
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
        text: finalCleanedText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voice_settings || {
          stability: 0.35, // Sedikit lebih rendah untuk ekspresi lebih natural
          similarity_boost: 0.75, // Lebih rendah untuk memberikan fleksibilitas emosi
          style: 0.65, // Dinaikkan untuk memberikan lebih banyak nuansa emosional
          use_speaker_boost: true,
          speaking_rate: 0.70, // Sedikit lebih lambat seperti Geralt berbicara
        }
      },
      responseType: 'arraybuffer'
    });
    
    // If successful, save the audio file
    if (response.status === 200) {
      fs.writeFileSync(finalFilePath, response.data);
      console.log(`Audio saved to: ${finalFilePath}`);
      
      // Also save as original text version for future lookups
      if (originalAudioFilePath !== finalFilePath) {
        try {
          fs.copyFileSync(finalFilePath, originalAudioFilePath);
          console.log(`Also saved as original text version: ${originalAudioFilePath}`);
        } catch (copyErr) {
          console.error('Error saving original version:', copyErr);
          // Continue even if this fails
        }
      }
      
      return res.status(200).json({ 
        success: true, 
        audioPath: finalPublicPath,
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