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
    const { text, voice_id = 'L9oqKdX7JyDJa0dK6AzN', voice_settings, forceRefresh = false } = req.body;
    
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
    
    // Check if we should use cached files or force a refresh from API
    if (!forceRefresh) {
      // Check original file cache first (only if not forcing refresh)
      if (fs.existsSync(originalAudioFilePath)) {
        console.log(`Audio file found for original text: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
        return res.status(200).json({ 
          success: true, 
          audioPath: originalAudioPublicPath,
          cached: true,
          message: 'Using cached audio file (original)'
        });
      }
      
      // Check other folders for reuse (to save API credit) - only if not forcing refresh
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
    } else {
      console.log(`Force refresh requested, bypassing cache for: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      
      // If file exists and we're forcing refresh, delete it first
      if (fs.existsSync(originalAudioFilePath)) {
        try {
          fs.unlinkSync(originalAudioFilePath);
          console.log(`Deleted existing audio file for refresh: ${originalAudioFilePath}`);
        } catch (deleteErr) {
          console.error('Error deleting existing file:', deleteErr);
          // Continue even if delete fails
        }
      }
    }
    
    // If file doesn't exist, generate with ElevenLabs API
    console.log(`Generating audio with ElevenLabs for: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
    
    // Analisis tone emosi Geralt untuk text-to-speech
    let tone = '';
    let voiceSettings = null;
    
    // Hapus tag emosi dari teks asli untuk dikirim ke ElevenLabs
    let cleanText = text.replace(/\[(.*?)\]\s*/g, '').trim();
    
    console.log(`Analyzing tone for text: "${cleanText.substring(0, 50)}${cleanText.length > 50 ? '...' : ''}"`); // Added more verbose logging
    
    // Deteksi tone dari teks (simplifikasi, untuk sistem yang lebih lengkap gunakan getToneForDialog)
    if (text.includes('fucking') || text.includes('shit') || text.includes('damn')) {
      tone = 'ANGRY';
      console.log(`Auto-detected tone: ANGRY for text with strong language`);
      
      // Voice settings untuk Angry tone
      voiceSettings = {
        stability: 0.25,      // Less stable for anger
        similarity_boost: 0.75,
        style: 0.80,          // More stylistic expression
        use_speaker_boost: true,
        speaking_rate: 0.85   // Faster speech when angry
      };
    } 
    else if (text.includes('tired') || text.includes('exhausted') || text.includes('Haahhhh')) {
      tone = 'TIRED';
      console.log(`Auto-detected tone: TIRED for text with exhaustion markers`);
      
      // Voice settings untuk Tired tone
      voiceSettings = {
        stability: 0.45,      // More stable when tired
        similarity_boost: 0.75,
        style: 0.55,          // Less expression
        use_speaker_boost: true,
        speaking_rate: 0.60   // Much slower when tired
      };
    }
    else if (text.includes('Hmph') || text.includes('Tch') || text.includes('waste my time')) {
      tone = 'ANNOYED';
      console.log(`Auto-detected tone: ANNOYED for text with Geralt's typical annoyance markers`);
      
      // Voice settings untuk Annoyed tone
      voiceSettings = {
        stability: 0.30,      // Less stable for annoyance
        similarity_boost: 0.75,
        style: 0.70,          // More expressive
        use_speaker_boost: true,
        speaking_rate: 0.75   // Slightly faster for impatience
      };
    }
    else if (text.includes('Heh') || text.includes('hilarious') || text.includes('real')) {
      tone = 'SARCASTIC';
      console.log(`Auto-detected tone: SARCASTIC for text with Geralt's sarcasm`);
      
      // Voice settings untuk Sarcastic tone
      voiceSettings = {
        stability: 0.30,      // Less stable for varied tone
        similarity_boost: 0.75,
        style: 0.85,          // High stylistic variation
        use_speaker_boost: true,
        speaking_rate: 0.72   // Slightly faster for sharp delivery
      };
    }
    else if (text.includes('doesn\'t matter') || text.includes('breathing') || text.includes('Hm')) {
      tone = 'NUMB';
      console.log(`Auto-detected tone: NUMB for text with emotional flatness`);
      
      // Voice settings untuk Numb tone
      voiceSettings = {
        stability: 0.50,      // Very stable for monotone effect
        similarity_boost: 0.75,
        style: 0.30,          // Much less expression
        use_speaker_boost: true,
        speaking_rate: 0.75   // Normal pace but flat
      };
    }
    else if (text.includes('maybe') || text.includes('why am I') || text.includes('perhaps')) {
      tone = 'CONTEMPLATIVE';
      console.log(`Auto-detected tone: CONTEMPLATIVE for thoughtful text`);
      
      // Voice settings untuk Contemplative tone
      voiceSettings = {
        stability: 0.38,      // Moderate stability
        similarity_boost: 0.75,
        style: 0.55,          // Moderate expression
        use_speaker_boost: true,
        speaking_rate: 0.65   // Slower, thoughtful pace
      };
    }
    else if (text.includes('what else') || text.includes('that\'s how it is') || text.includes('hoping')) {
      tone = 'RESIGNED';
      console.log(`Auto-detected tone: RESIGNED for text showing acceptance`);
      
      // Voice settings untuk Resigned tone
      voiceSettings = {
        stability: 0.40,      // More stable for resignation
        similarity_boost: 0.75,
        style: 0.50,          // Less expressive
        use_speaker_boost: true,
        speaking_rate: 0.65   // Slower, resigned pace
      };
    }
    else if (text.includes('empty') || text.includes('nothing') || text.includes('hollow')) {
      tone = 'HOLLOW';
      console.log(`Auto-detected tone: HOLLOW for text with emptiness`);
      
      // Voice settings untuk Hollow tone
      voiceSettings = {
        stability: 0.45,      // More stable for emptiness
        similarity_boost: 0.75,
        style: 0.40,          // Less emotional expression
        use_speaker_boost: true,
        speaking_rate: 0.68   // Slightly slower, empty
      };
    }
    else {
      // Default tone is slightly resigned (Geralt's baseline)
      tone = 'RESIGNED';
      console.log(`Using default RESIGNED tone for text: "${cleanText.substring(0, 30)}${cleanText.length > 30 ? '...' : ''}"`);
      
      // Default voice settings
      voiceSettings = {
        stability: 0.35,      // Balance between consistency and variation
        similarity_boost: 0.75,
        style: 0.65,          // Moderate expression
        use_speaker_boost: true,
        speaking_rate: 0.70   // Slightly slower like Geralt speaks
      };
    }
    
    // Normalize text - remove excessive whitespace and asterisks
    const finalCleanedText = cleanText.replace(/\*/g, "").trim().replace(/\s+/g, ' ');
    
    // Generate hash for the processed text
    const processedHash = generateSimpleHash(finalCleanedText);
    const processedFileName = `dialog_${processedHash}.mp3`;
    const processedAudioFilePath = path.join(audioDir, processedFileName);
    const processedAudioPublicPath = `/audio/character/${processedFileName}`;
    
    // Check for processed text in cache - only if not forcing refresh
    if (!forceRefresh && finalCleanedText !== text && fs.existsSync(processedAudioFilePath)) {
      console.log(`Audio file found for processed text with emotions: "${finalCleanedText.substring(0, 30)}${finalCleanedText.length > 30 ? '...' : ''}"`);
      return res.status(200).json({ 
        success: true, 
        audioPath: processedAudioPublicPath,
        cached: true,
        message: 'Using cached audio file (with emotion)'
      });
    }
    
    // If we're forcing refresh and the processed file exists, delete it first
    if (forceRefresh && fs.existsSync(processedAudioFilePath)) {
      try {
        fs.unlinkSync(processedAudioFilePath);
        console.log(`Deleted processed audio file for refresh: ${processedAudioFilePath}`);
      } catch (deleteErr) {
        console.error('Error deleting processed file:', deleteErr);
        // Continue even if delete fails
      }
    }
    
    // Final audio file paths
    const finalFilePath = processedAudioFilePath; // Use processed version to save
    const finalPublicPath = processedAudioPublicPath;
    
    // ElevenLabs API endpoint
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;
    
    // Log voice settings yang digunakan
    const finalVoiceSettings = voiceSettings || voice_settings || {
      stability: 0.35, // Sedikit lebih rendah untuk ekspresi lebih natural
      similarity_boost: 0.75, // Lebih rendah untuk memberikan fleksibilitas emosi
      style: 0.65, // Dinaikkan untuk memberikan lebih banyak nuansa emosional
      use_speaker_boost: true,
      speaking_rate: 0.70, // Sedikit lebih lambat seperti Geralt berbicara
    };
    
    console.log(`Using voice settings for "${tone}" tone:`, {
      stability: finalVoiceSettings.stability,
      style: finalVoiceSettings.style,
      speaking_rate: finalVoiceSettings.speaking_rate
    });
    
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
        voice_settings: finalVoiceSettings
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