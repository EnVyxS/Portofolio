import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Pengaturan default untuk voice model sesuai permintaan user
function getDefaultVoiceSettings(): any {
  return {
    // Sesuai permintaan user:
    // speed: 0.95, stability: 90, similarity: 100
    stability: 0.90, // 90%
    similarity_boost: 1.0, // 100% - menjaga nada suara konsisten
    style: 0.25, // Kurangi dramatisasi
    use_speaker_boost: true,
    speaking_rate: 0.95 // Sesuai permintaan (sedikit lebih lambat)
  };
}

const router = Router();

// Define common paths
const publicDir = path.resolve(process.cwd(), 'client/public');
const characterAudioDir = path.join(publicDir, 'audio/character');

// Pastikan folder audio ada
function initializeAudioFolders() {
  if (!fs.existsSync(characterAudioDir)) {
    fs.mkdirSync(characterAudioDir, { recursive: true });
    console.log("Created character audio directory");
  }
  
  // Pastikan ada silent.mp3
  const silentPath = path.join(characterAudioDir, 'silent.mp3');
  if (!fs.existsSync(silentPath)) {
    try {
      // Ini hanya membuat file kosong
      fs.writeFileSync(silentPath, '');
      console.log("Creating empty silent.mp3 file");
    } catch (err) {
      console.error("Error creating silent.mp3:", err);
    }
  }
}

// Panggil fungsi initialize
initializeAudioFolders();

// Menggunakan model multilingual yang mendukung segala bahasa
const VALID_MODEL = 'eleven_multilingual_v2';

// Hash function untuk generate nama file
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
    // Ambil data dari request body
    const { text, voice_id, model_id = VALID_MODEL, voice_settings, starts_with_ellipsis } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Gunakan voice_id dari body atau default dari env
    const defaultVoiceId = process.env.VITE_ELEVENLABS_DEFAULT_VOICE_ID || '';
    const finalVoiceId = voice_id || defaultVoiceId;
    
    if (!finalVoiceId) {
      return res.status(400).json({ error: 'Voice ID is required' });
    }
    
    // Ambil API key dari environment variable
    const envApiKey = process.env.VITE_ELEVENLABS_API_KEY;
    const apiKey = envApiKey;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    console.log("Using ElevenLabs API key from environment variable");
    console.log(`Generating audio with ElevenLabs for: "${text}"`);
    console.log(`Using voice_id: ${finalVoiceId}`);
    
    // Cek apakah ini adalah text kosong seperti "..." atau "....."
    const trimmedText = text.trim();
    if (trimmedText === '...' || trimmedText === '.....' || trimmedText === '') {
      console.log("Text is only ellipsis or empty, returning silent audio");
      return res.status(200).json({
        success: true,
        audioPath: '/audio/character/silent.mp3',
        cached: true,
        message: 'Using silent audio for ellipsis or empty text'
      });
    }
    
    // Log untuk debugging
    console.log(`EXACT TEXT FOR VOICE: "${text}" - MUST BE IDENTICAL TO DISPLAYED TEXT!`);
    
    // Pra-proses teks untuk kasus khusus
    let processedText = text;
    let hasProcessed = false;
    
    // Deteksi kasus khusus: teks yang dimulai dengan "..." tetapi memiliki konten bermakna
    if (starts_with_ellipsis && trimmedText.startsWith('...') && trimmedText.length > 3) {
      console.log("Detected text starting with ellipsis:", text);
      
      // Tambahkan SSML untuk membuat pause yang lebih pendek untuk kasus "...You got a name?"
      // SSML memungkinkan kita mengontrol jeda dan timing dengan lebih baik
      processedText = `<speak><break time="0.3s"/>${trimmedText.substring(3)}</speak>`;
      console.log("Processed text with SSML:", processedText);
      hasProcessed = true;
    }
    
    // Gunakan pengaturan voice default dari fungsi
    const voiceSettings = getDefaultVoiceSettings();
    
    // Jika menggunakan SSML, gunakan pengaturan yang sesuai
    if (hasProcessed) {
      console.log("Using specialized settings for ellipsis text");
    } else {
      console.log(`Applied default voice settings:`, voiceSettings);
    }
    
    // Generate hash untuk nama file berdasarkan teks asli
    const hash = generateSimpleHash(text);
    const fileName = `dialog_${hash}.mp3`;
    const audioFilePath = path.join(characterAudioDir, fileName);
    const audioPublicPath = `/audio/character/${fileName}`;
    
    // Cek apakah file sudah ada (cache)
    if (fs.existsSync(audioFilePath)) {
      console.log(`Found cached audio file: ${fileName}`);
      return res.status(200).json({
        success: true,
        audioPath: audioPublicPath,
        cached: true,
        message: 'Using cached audio file'
      });
    }
    
    // Jika file tidak ada, generate menggunakan API
    console.log(`Using voice settings:`, {
      stability: voiceSettings.stability,
      similarity_boost: voiceSettings.similarity_boost,
      style: voiceSettings.style,
      speaking_rate: voiceSettings.speaking_rate
    });
    
    console.log(`Sending request to ElevenLabs with voice_id: ${finalVoiceId}`);
    console.log(`Using model_id: ${VALID_MODEL}`);
    
    // Build request body dengan teks yang sesuai (asli atau yang diproses)
    const requestBody = JSON.stringify({
      text: hasProcessed ? processedText : text,
      model_id: VALID_MODEL,
      voice_settings: voiceSettings
    });
    
    console.log(`Request body: ${requestBody.substring(0, 100)}...`);
    
    // Kirim request ke ElevenLabs API
    const fetchResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: requestBody
    });
    
    if (!fetchResponse.ok) {
      // Handle error
      const errorText = await fetchResponse.text();
      console.error(`ElevenLabs API error: ${errorText}`);
      return res.status(fetchResponse.status).json({
        error: 'Failed to generate audio',
        details: errorText
      });
    }
    
    // Get audio data
    const audioBuffer = await fetchResponse.arrayBuffer();
    const audioData = Buffer.from(audioBuffer);
    
    // Save to file
    fs.writeFileSync(audioFilePath, audioData);
    console.log(`Audio saved to: ${audioFilePath}`);
    
    // Return success
    return res.status(200).json({
      success: true,
      audioPath: audioPublicPath,
      cached: false,
      message: 'Generated new audio file'
    });
  } catch (error: any) {
    console.error('Error generating audio:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;