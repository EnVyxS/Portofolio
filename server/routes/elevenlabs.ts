import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const router = Router();

// Define common paths that will be used throughout the file
const publicDir = path.resolve(process.cwd(), 'client/public');
const characterAudioDir = path.join(publicDir, 'audio/character');
const geraltAudioDir = path.join(publicDir, 'audio/geralt');

// Cache untuk menyimpan hash teks ke nama file
const textHashCache = new Map<string, string>();

// Inisialisasi cache dari file yang sudah ada untuk percepatan lookup
function initializeAudioCache() {
  try {
    // Pastikan kedua folder audio ada
    if (!fs.existsSync(characterAudioDir)) {
      fs.mkdirSync(characterAudioDir, { recursive: true });
    }
    
    if (!fs.existsSync(geraltAudioDir)) {
      fs.mkdirSync(geraltAudioDir, { recursive: true });
    }
    
    // Scan folder character
    if (fs.existsSync(characterAudioDir)) {
      const files = fs.readdirSync(characterAudioDir);
      
      // Ambil semua file dialog_*.mp3
      const dialogFiles = files.filter(file => 
        file.startsWith('dialog_') && file.endsWith('.mp3')
      );
      
      console.log(`Found ${dialogFiles.length} cached dialog files in character folder`);
      
      // Tambahkan ke cache
      dialogFiles.forEach(file => {
        const hash = file.replace('dialog_', '').replace('.mp3', '');
        textHashCache.set(hash, file);
      });
    }
    
    // Scan folder geralt
    if (fs.existsSync(geraltAudioDir)) {
      const files = fs.readdirSync(geraltAudioDir);
      
      // Ambil semua file dialog_*.mp3
      const dialogFiles = files.filter(file => 
        file.startsWith('dialog_') && file.endsWith('.mp3')
      );
      
      console.log(`Found ${dialogFiles.length} cached dialog files in geralt folder`);
      
      // Tambahkan ke cache
      dialogFiles.forEach(file => {
        const hash = file.replace('dialog_', '').replace('.mp3', '');
        if (!textHashCache.has(hash)) {
          textHashCache.set(hash, file);
        }
      });
    }
    
    console.log(`Total unique audio hashes in cache: ${textHashCache.size}`);
  } catch (error) {
    console.error('Error initializing audio cache:', error);
  }
}

// Fungsi untuk menyalin audio files dari folder geralt ke folder character saat server pertama kali dijalankan
function copyExistingAudioFiles() {
  try {
    console.log('Checking for existing audio files to copy from geralt to character folder...');
    
    // Pastikan folder character ada
    if (!fs.existsSync(characterAudioDir)) {
      fs.mkdirSync(characterAudioDir, { recursive: true });
      console.log('Created character audio directory');
    }
    
    // Pastikan silent.mp3 ada di folder character
    const silentDestFile = path.join(characterAudioDir, 'silent.mp3');
    if (!fs.existsSync(silentDestFile)) {
      try {
        // Cek apakah ada di folder geralt
        const silentSourceFile = path.join(geraltAudioDir, 'silent.mp3');
        if (fs.existsSync(silentSourceFile)) {
          fs.copyFileSync(silentSourceFile, silentDestFile);
          console.log('Copied silent.mp3 from geralt to character folder');
        } else {
          // Jika tidak ada, buat silent.mp3 kosong
          // Ini hanya placeholder, idealnya ada file audio kosong berdurasi 1-2 detik
          console.log('Creating empty silent.mp3 file');
          // Buat file kosong sebagai fallback
          fs.writeFileSync(silentDestFile, Buffer.alloc(0));
        }
      } catch (error) {
        console.error('Error creating silent.mp3:', error);
      }
    }
    
    // Cek apakah folder geralt ada
    if (!fs.existsSync(geraltAudioDir)) {
      console.log('No geralt audio directory found. Skipping copy operation.');
      return;
    }
    
    // Baca semua file di folder geralt
    const geraltFiles = fs.readdirSync(geraltAudioDir);
    let copiedCount = 0;
    
    // Salin file yang belum ada di folder character
    for (const file of geraltFiles) {
      if (file.endsWith('.mp3')) {
        const sourceFile = path.join(geraltAudioDir, file);
        const destFile = path.join(characterAudioDir, file);
        
        if (!fs.existsSync(destFile)) {
          fs.copyFileSync(sourceFile, destFile);
          copiedCount++;
        }
      }
    }
    
    console.log(`Copied ${copiedCount} audio files from geralt to character folder`);
  } catch (error) {
    console.error('Error copying audio files:', error);
  }
}

// Jalankan fungsi saat server pertama kali dijalankan
copyExistingAudioFiles();

// Inisialisasi cache audio
initializeAudioCache();

// Definisi model valid yang tersedia di ElevenLabs
const VALID_MODEL = 'eleven_multilingual_v2';

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
    const { text, voice_id = '3Cka3TLKjahfz6KX4ckZ', voice_settings, model_id: clientModelId } = req.body;
    console.log("Using ElevenLabs API key from environment variable");
    console.log(`Generating audio with ElevenLabs for: "${text.substring(0, 40)}..."`);
    console.log(`Using voice_id: ${voice_id}`);
    
    // Make sure to use the model for ElevenLabs premium tier that works with voice ID 3Cka3TLKjahfz6KX4ckZ
    const model_id = 'eleven_multilingual_v2'; // Using premium model for better quality
    
    
    // Validate input
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Ensure character directory exists
    if (!fs.existsSync(characterAudioDir)) {
      fs.mkdirSync(characterAudioDir, { recursive: true });
    }
    
    // Skip processing for text with only ellipsis (character is listening)
    if (text.trim() === '...' || text.trim() === '.....') {
      // Check if silent.mp3 exists in character folder
      const characterSilentPath = path.join(characterAudioDir, 'silent.mp3');
      const geraltSilentPath = path.join(geraltAudioDir, 'silent.mp3');
      
      // Default path to return
      let silentAudioPath = '/audio/character/silent.mp3';
      
      // If not in character folder but exists in geralt folder, use that
      if (!fs.existsSync(characterSilentPath) && fs.existsSync(geraltSilentPath)) {
        silentAudioPath = '/audio/geralt/silent.mp3';
        console.log('Using silent.mp3 from geralt folder');
      }
      
      // Return path to silent.mp3
      return res.status(200).json({ 
        success: true, 
        audioPath: silentAudioPath,
        message: 'Using silent audio for ellipsis'
      });
    }
    
    // Use API key from environment variables
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    console.log("Using ElevenLabs API key from environment variable");
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not found' });
    }
    
    // Generate hash for the original text (for lookup in existing files)
    const originalHash = generateSimpleHash(text);
    const originalFileName = `dialog_${originalHash}.mp3`;
    
    // Define audio character directory with constant from above
    const audioDir = characterAudioDir;
    
    // Original audio paths (without emotion processing)
    const originalAudioFilePath = path.join(audioDir, originalFileName);
    const originalAudioPublicPath = `/audio/character/${originalFileName}`;
    
    // Check if hash exists in memory cache first
    if (textHashCache.has(originalHash)) {
      console.log(`Found ${originalHash} in memory cache`);
      // Return cached path
      return res.status(200).json({
        success: true,
        audioPath: `/audio/character/${textHashCache.get(originalHash)}`,
        cached: true,
        message: 'Using cached audio file from memory cache'
      });
    }
    
    // Check original file cache first
    if (fs.existsSync(originalAudioFilePath)) {
      console.log(`Audio file found for original text: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      // Add to memory cache for faster future lookups
      textHashCache.set(originalHash, originalFileName);
      return res.status(200).json({ 
        success: true, 
        audioPath: originalAudioPublicPath,
        cached: true,
        message: 'Using cached audio file (original)'
      });
    }
    
    // Check other folders for reuse (to save API credit)
    if (fs.existsSync(geraltAudioDir)) {
      const originalInGeraltsFolder = path.join(geraltAudioDir, originalFileName);
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
    
    // Analisis tone emosi Geralt untuk text-to-speech
    let tone = '';
    let voiceSettings = null;
    
    // Hapus tag emosi dari teks asli untuk dikirim ke ElevenLabs
    let cleanText = text.replace(/\[(.*?)\]\s*/g, '').trim();
    
    console.log(`Analyzing tone for text: "${cleanText.substring(0, 50)}${cleanText.length > 50 ? '...' : ''}"`); // Added more verbose logging
    
    // Deteksi tone dari teks (versi yang lebih konsisten untuk mengurangi rancau audio)
    // Nilai basis untuk semua tone
    const baseSettings = {
      stability: 0.80,          // 80% stability konsisten untuk semua tone
      similarity_boost: 1.0,    // 100% similarity boost konsisten untuk semua tone
      use_speaker_boost: true,  // Selalu aktif
      speaking_rate: 0.95       // Default speaking rate
    };

    // Pre-proses teks untuk menangani kata kasar yang bisa menyebabkan suara rancau
    let processedText = text;
    
    // Mengganti kata-kata yang mungkin bermasalah (menghindari rancau untuk kata kasar)
    if (text.includes('fucking') && !text.includes('fucking hilarious') && !text.includes('real fucking')) {
      console.log("Mengganti kata kasar 'fucking' untuk menghindari suara rancau");
      processedText = text.replace('fucking', 'damn');
    }
    
    // Analisis tone berdasarkan konten teks yang sudah diproses
    if (processedText.includes('damn') || processedText.includes('shit')) {
      tone = 'ANGRY';
      console.log(`Auto-detected tone: ANGRY for text with strong language`);
      
      // Voice settings untuk Angry tone Geralt - dengan penyesuaian minimal
      voiceSettings = {
        ...baseSettings,
        style: 0.65,              // Medium-high style untuk karakter Geralt yang marah
        speaking_rate: 0.97       // Sedikit lebih cepat untuk tone marah
      };
    } 
    else if (text.includes('tired') || text.includes('exhausted') || text.includes('Haahhhh')) {
      tone = 'TIRED';
      console.log(`Auto-detected tone: TIRED for text with exhaustion markers`);
      
      // Voice settings untuk Tired tone Geralt - lebih konsisten dengan base
      voiceSettings = {
        ...baseSettings,
        style: 0.55,              // Medium style untuk tired, tidak terlalu ekstrem
        speaking_rate: 0.92       // Hanya sedikit lebih lambat
      };
    }
    else if (text.includes('Hmph') || text.includes('Tch') || text.includes('waste my time')) {
      tone = 'ANNOYED';
      console.log(`Auto-detected tone: ANNOYED for text with Geralt's typical annoyance markers`);
      
      // Voice settings untuk Annoyed tone Geralt - lebih konsisten
      voiceSettings = {
        ...baseSettings,
        style: 0.62,              // Medium-high style, tidak terlalu ekstrem
        speaking_rate: 0.95       // Standard speaking rate
      };
    }
    else if (text.includes('Heh') || text.includes('hilarious') || text.includes('real')) {
      tone = 'SARCASTIC';
      console.log(`Auto-detected tone: SARCASTIC for text with Geralt's sarcasm`);
      
      // Voice settings untuk Sarcastic tone Geralt - lebih konsisten
      voiceSettings = {
        ...baseSettings,
        style: 0.64,              // Medium-high style, tidak terlalu ekstrem
        speaking_rate: 0.96       // Sedikit lebih cepat untuk sarkasme
      };
    }
    else if (text.includes('doesn\'t matter') || text.includes('breathing') || text.includes('Hm')) {
      tone = 'NUMB';
      console.log(`Auto-detected tone: NUMB for text with emotional flatness`);
      
      // Voice settings untuk Numb tone Geralt - lebih konsisten
      voiceSettings = {
        ...baseSettings,
        style: 0.55,              // Medium style, tidak terlalu rendah
        speaking_rate: 0.93       // Sedikit lebih lambat
      };
    }
    else if (text.includes('maybe') || text.includes('why am I') || text.includes('perhaps')) {
      tone = 'CONTEMPLATIVE';
      console.log(`Auto-detected tone: CONTEMPLATIVE for thoughtful text`);
      
      // Voice settings untuk Contemplative tone Geralt - lebih konsisten
      voiceSettings = {
        ...baseSettings,
        style: 0.58,              // Medium style
        speaking_rate: 0.93       // Sedikit lebih lambat untuk refleksi
      };
    }
    else if (text.includes('what else') || text.includes('that\'s how it is') || text.includes('hoping')) {
      tone = 'RESIGNED';
      console.log(`Auto-detected tone: RESIGNED for text showing acceptance`);
      
      // Voice settings untuk Resigned tone Geralt - lebih konsisten
      voiceSettings = {
        ...baseSettings,
        style: 0.57,              // Medium style
        speaking_rate: 0.94       // Hampir standard
      };
    }
    else if (text.includes('empty') || text.includes('nothing') || text.includes('hollow')) {
      tone = 'HOLLOW';
      console.log(`Auto-detected tone: HOLLOW for text with emptiness`);
      
      // Voice settings untuk Hollow tone Geralt - lebih konsisten
      voiceSettings = {
        ...baseSettings,
        style: 0.54,              // Medium style, tidak terlalu rendah
        speaking_rate: 0.92       // Sedikit lebih lambat
      };
    }
    else {
      // Default tone is slightly resigned (Geralt of Rivia baseline)
      tone = 'NEUTRAL';
      console.log(`Using default NEUTRAL tone for text: "${cleanText.substring(0, 30)}${cleanText.length > 30 ? '...' : ''}"`);
      
      // Default voice settings untuk Geralt of Rivia - konsisten
      voiceSettings = {
        ...baseSettings,
        style: 0.60,              // Medium style untuk Geralt normal
        speaking_rate: 0.95       // Standard speaking rate
      };
    }
    
    // Normalize text - remove excessive whitespace and asterisks
    let finalCleanedText = cleanText.replace(/\*/g, "").trim().replace(/\s+/g, ' ');
    
    // Penanganan khusus untuk dialog bermasalah yang mengandung kata kasar
    if (finalCleanedText.includes("fucking hilarious") || finalCleanedText.includes("real fucking")) {
      console.log("Mendeteksi dialog bermasalah dengan kata kasar, membuat penyesuaian khusus");
      // Ganti kata kasar dengan "damn" untuk menghindari masalah pemrosesan
      finalCleanedText = finalCleanedText.replace("fucking", "damn");
      console.log(`Text telah disesuaikan menjadi: "${finalCleanedText}"`);
      // Force tone untuk konsistensi
      tone = 'SARCASTIC';
      
      // Penyesuaian voice settings khusus untuk dialog bermasalah ini
      voiceSettings = {
        ...baseSettings,
        style: 0.62,              // Sedikit lebih rendah dari default sarcastic
        speaking_rate: 0.93       // Sedikit melambat
      };
    }
    
    // Generate hash for the processed text
    const processedHash = generateSimpleHash(finalCleanedText);
    const processedFileName = `dialog_${processedHash}.mp3`;
    const processedAudioFilePath = path.join(audioDir, processedFileName);
    const processedAudioPublicPath = `/audio/character/${processedFileName}`;
    
    // Check if processed hash exists in memory cache first
    if (textHashCache.has(processedHash)) {
      console.log(`Found processed ${processedHash} in memory cache`);
      // Return cached path
      return res.status(200).json({
        success: true,
        audioPath: `/audio/character/${textHashCache.get(processedHash)}`,
        cached: true,
        message: 'Using cached processed audio file from memory cache'
      });
    }
    
    // Check for processed text in cache
    if (finalCleanedText !== text && fs.existsSync(processedAudioFilePath)) {
      console.log(`Audio file found for processed text with emotions: "${finalCleanedText.substring(0, 30)}${finalCleanedText.length > 30 ? '...' : ''}"`);
      // Add to memory cache for faster future lookups
      textHashCache.set(processedHash, processedFileName);
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
    
    // ElevenLabs API endpoint - voice_id ditambahkan di URL
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;
    
    // Log voice settings yang digunakan
    const finalVoiceSettings = voiceSettings || voice_settings || {
      stability: 0.80,        // Konsisten dengan nilai base
      similarity_boost: 1.0,  // Konsisten dengan nilai base
      style: 0.60,            // Medium style (default Geralt)
      use_speaker_boost: true,
      speaking_rate: 0.95,    // Konsisten dengan nilai base
    };
    
    console.log(`Using voice settings for "${tone}" tone:`, {
      stability: finalVoiceSettings.stability,
      style: finalVoiceSettings.style,
      speaking_rate: finalVoiceSettings.speaking_rate
    });
    
    console.log(`Sending request to ElevenLabs with voice_id: ${voice_id}`);
    
    // Try a completely different approach by using fetch instead of axios
    console.log("Using model_id:", VALID_MODEL);
    console.log("Creating new fetch request completely from scratch");
    
    // Build the request body as a string to ensure no unexpected transformations
    const requestBodyString = JSON.stringify({
      text: finalCleanedText,
      model_id: VALID_MODEL,
      voice_settings: finalVoiceSettings
    });
    
    console.log("Request body:", requestBodyString.substring(0, 100) + "...");
    
    // Use node-fetch instead of axios
    const fetchResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: requestBodyString
    });
    
    if (!fetchResponse.ok) {
      // Handle error case
      const errorText = await fetchResponse.text();
      console.error("ElevenLabs API error:", errorText);
      throw new Error(`API request failed with status ${fetchResponse.status}: ${errorText}`);
    }
    
    // Convert the fetch response to an axios-like object for compatibility with the rest of the code
    const responseData = await fetchResponse.arrayBuffer();
    const response = {
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      data: Buffer.from(responseData)
    };
    
    // If successful, save the audio file
    if (response.status === 200) {
      fs.writeFileSync(finalFilePath, response.data);
      console.log(`Audio saved to: ${finalFilePath}`);
      
      // Add to memory cache for future lookups
      textHashCache.set(processedHash, processedFileName);
      
      // Also save as original text version for future lookups
      if (originalAudioFilePath !== finalFilePath) {
        try {
          fs.copyFileSync(finalFilePath, originalAudioFilePath);
          console.log(`Also saved as original text version: ${originalAudioFilePath}`);
          // Also add original hash to cache
          textHashCache.set(originalHash, originalFileName);
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
  } catch (error: any) {
    console.error('Error generating audio:', error);
    
    // If it's an Axios error with response data, try to extract the error details
    if (error.response && error.response.data) {
      try {
        // For arraybuffer responses, convert to string to see the error message
        let errorData;
        
        if (error.response.data instanceof Buffer) {
          const bufferString = error.response.data.toString('utf8');
          console.error('Raw error buffer:', bufferString);
          try {
            errorData = JSON.parse(bufferString);
            console.error('Detailed API error (parsed):', errorData);
          } catch (jsonError) {
            console.error('Failed to parse error as JSON:', jsonError);
            errorData = { message: bufferString };
          }
        } else {
          console.error('Detailed API error (object):', error.response.data);
          errorData = error.response.data;
        }
        
        return res.status(500).json({ 
          error: 'Elevenlabs API error',
          details: errorData.detail || errorData.message || JSON.stringify(errorData),
          fallback: true
        });
      } catch (parseError) {
        console.error('Error parsing API error response:', parseError);
      }
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    });
  }
});

export default router;