import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import 'dotenv/config';

const router = Router();

// API key check route - hanya mengembalikan status ketersediaan, bukan API key
router.get('/check-api-key', (req: Request, res: Response) => {
  try {
    // Check if API key exists in environment
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const hasApiKey = !!apiKey;
    
    console.log(`API key availability check: ${hasApiKey ? 'Available' : 'Not available'}`);
    
    // Return status only, not the actual key for security
    return res.status(200).json({ 
      hasApiKey,
      message: hasApiKey ? 'API key is available' : 'No API key found in environment'
    });
  } catch (error) {
    console.error('Error checking API key:', error);
    return res.status(500).json({ error: 'Failed to check API key' });
  }
});

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

// Fungsi untuk mencadangkan file audio yang telah dihasilkan ke folder backup
// Ini untuk mencegah penggunaan API yang berlebihan jika folder character terhapus
function backupAudioFiles() {
  try {
    console.log('Checking for audio files to backup...');
    
    // Pastikan folder backup ada
    const backupDir = path.join(publicDir, 'audio/backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('Created backup audio directory');
    }
    
    // Jika folder character ada, cadangkan semua file ke backup
    if (fs.existsSync(characterAudioDir)) {
      const characterFiles = fs.readdirSync(characterAudioDir);
      let backedUpCount = 0;
      
      // Salin file yang belum ada di folder backup
      for (const file of characterFiles) {
        if (file.endsWith('.mp3')) {
          const sourceFile = path.join(characterAudioDir, file);
          const destFile = path.join(backupDir, file);
          
          // Hanya backup file yang belum dicadangkan atau lebih baru dari cadangan
          if (!fs.existsSync(destFile) || 
              fs.statSync(sourceFile).mtime > fs.statSync(destFile).mtime) {
            fs.copyFileSync(sourceFile, destFile);
            backedUpCount++;
          }
        }
      }
      
      console.log(`Backed up ${backedUpCount} audio files to backup folder`);
    }
  } catch (error) {
    console.error('Error backing up audio files:', error);
  }
}

// Fungsi untuk memeriksa dan memulihkan file audio dari backup jika folder character kosong atau terhapus
function restoreFromBackupIfNeeded() {
  try {
    console.log('Checking if audio files need to be restored from backup...');
    
    // Cek apakah folder character ada
    if (!fs.existsSync(characterAudioDir)) {
      fs.mkdirSync(characterAudioDir, { recursive: true });
      console.log('Created character audio directory');
    }
    
    // Hitung file yang ada di folder character
    const characterFilesCount = fs.existsSync(characterAudioDir) ? 
      fs.readdirSync(characterAudioDir).filter(f => f.endsWith('.mp3')).length : 0;
    
    // Jika sedikit file atau folder kosong, coba pulihkan dari backup
    if (characterFilesCount < 5) {
      const backupDir = path.join(publicDir, 'audio/backup');
      if (fs.existsSync(backupDir)) {
        const backupFiles = fs.readdirSync(backupDir);
        let restoredCount = 0;
        
        // Salin file dari backup ke character
        for (const file of backupFiles) {
          if (file.endsWith('.mp3')) {
            const sourceFile = path.join(backupDir, file);
            const destFile = path.join(characterAudioDir, file);
            
            if (!fs.existsSync(destFile)) {
              fs.copyFileSync(sourceFile, destFile);
              restoredCount++;
            }
          }
        }
        
        console.log(`Restored ${restoredCount} audio files from backup folder`);
      } else {
        console.log('No backup folder found. Cannot restore audio files.');
      }
    } else {
      console.log(`Character folder has ${characterFilesCount} files. No restoration needed.`);
    }
  } catch (error) {
    console.error('Error restoring audio files from backup:', error);
  }
}

// Jalankan fungsi saat server pertama kali dijalankan
copyExistingAudioFiles();

// Cek dan pulihkan dari backup jika perlu
restoreFromBackupIfNeeded();

// Cadangkan file yang ada saat ini
backupAudioFiles();

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
 * Endpoint untuk memeriksa database file yang sudah ada
 * Ini akan membantu klien memastikan file telah ada untuk semua dialog
 */
router.get('/audio-exists/:hash', (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    if (!hash) {
      return res.status(400).json({ exists: false, error: 'Hash parameter is required' });
    }

    const filePattern = `dialog_${hash}.mp3`;
    const characterPath = path.join(characterAudioDir, filePattern);
    const geraltPath = path.join(geraltAudioDir, filePattern);
    const backupPath = path.join(path.join(publicDir, 'audio/backup'), filePattern);
    
    // Periksa di semua lokasi
    const existsInCharacter = fs.existsSync(characterPath);
    const existsInGeralt = fs.existsSync(geraltPath);
    const existsInBackup = fs.existsSync(backupPath);
    
    if (existsInCharacter || existsInGeralt || existsInBackup) {
      let audioPath = '';
      
      // Prioritaskan character folder, kemudian geralt, terakhir backup
      if (existsInCharacter) {
        audioPath = `/audio/character/${filePattern}`;
      } else if (existsInGeralt) {
        audioPath = `/audio/geralt/${filePattern}`;
        
        // Copy to character folder untuk mempercepat akses mendatang
        try {
          fs.copyFileSync(geraltPath, characterPath);
          audioPath = `/audio/character/${filePattern}`;
          console.log(`Copied audio file from geralt to character: ${filePattern}`);
        } catch (err) {
          console.error(`Failed to copy file from geralt to character: ${err}`);
        }
      } else if (existsInBackup) {
        // Restore dari backup
        try {
          fs.copyFileSync(backupPath, characterPath);
          audioPath = `/audio/character/${filePattern}`;
          console.log(`Restored audio file from backup: ${filePattern}`);
        } catch (err) {
          console.error(`Failed to restore file from backup: ${err}`);
          audioPath = `/audio/backup/${filePattern}`;
        }
      }
      
      return res.status(200).json({ 
        exists: true, 
        audioPath,
        message: 'Audio file exists'
      });
    }
    
    // File tidak ditemukan di mana pun
    return res.status(200).json({ 
      exists: false,
      message: 'Audio file not found in any location'
    });
  } catch (error) {
    console.error('Error checking audio file existence:', error);
    return res.status(500).json({ exists: false, error: 'Internal server error' });
  }
});

/**
 * Endpoint for elevenlabs text-to-speech service
 * Integrates caching mechanism to save API credits
 * Dengan peningkatan pada deteksi file yang ada
 */
router.post('/text-to-speech', async (req: Request, res: Response) => {
  try {
    // Get text and voice_id from the request body
    const { text, voice_id = '3Cka3TLKjahfz6KX4ckZ', voice_settings, model_id: clientModelId, forceGeneration = false } = req.body;
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
    
    // Bersihkan text untuk hashing (hilangkan tag emosi, dll)
    const cleanText = text.replace(/\[(.*?)\]\s*/g, '').trim();
    
    // Gunakan hash dari teks bersih untuk konsistensi
    const originalHash = generateSimpleHash(cleanText);
    const originalFileName = `dialog_${originalHash}.mp3`;
    
    // Define audio character directory with constant from above
    const audioDir = characterAudioDir;
    
    // Original audio paths (without emotion processing)
    const originalAudioFilePath = path.join(audioDir, originalFileName);
    const originalAudioPublicPath = `/audio/character/${originalFileName}`;
    
    // Lewati pengecekan cache jika forcing generation
    if (!forceGeneration) {
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
        console.log(`Audio file found for original text: "${cleanText.substring(0, 30)}${cleanText.length > 30 ? '...' : ''}"`);
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
            console.log(`Reused audio from geralt folder for: "${cleanText.substring(0, 30)}${cleanText.length > 30 ? '...' : ''}"`);
            // Update cache
            textHashCache.set(originalHash, originalFileName);
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
      
      // Check backup folder before generating with API
      const backupDir = path.join(publicDir, 'audio/backup');
      const backupFilePath = path.join(backupDir, originalFileName);
      
      if (fs.existsSync(backupFilePath)) {
        try {
          // Copy from backup to character folder
          fs.copyFileSync(backupFilePath, originalAudioFilePath);
          console.log(`Restored audio from backup for: "${cleanText.substring(0, 30)}${cleanText.length > 30 ? '...' : ''}"`);
          
          // Update cache
          textHashCache.set(originalHash, originalFileName);
          
          return res.status(200).json({ 
            success: true, 
            audioPath: originalAudioPublicPath,
            cached: true,
            message: 'Restored from backup audio file'
          });
        } catch (backupErr) {
          console.error('Error restoring from backup:', backupErr);
          // Continue to API if restore fails
        }
      }
    } else {
      console.log("Force generation flag set, bypassing cache checks");
    }
    
    // If file doesn't exist anywhere, generate with ElevenLabs API
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
    
    // Penanganan lebih umum untuk dialog bermasalah yang mengandung kata kasar
    const profanityDetected = finalCleanedText.includes("fucking") || 
                             finalCleanedText.includes("shit") || 
                             finalCleanedText.includes("ass") ||
                             finalCleanedText.includes("damn") ||
                             finalCleanedText.includes("hell") ||
                             finalCleanedText.includes("bastard");
    
    if (profanityDetected) {
      console.log("Mendeteksi kata kasar dalam dialog, membuat penyesuaian");
      
      // Proses teks untuk mengganti kata kasar
      const processedText = finalCleanedText
        .replace(/fucking/gi, "freaking")
        .replace(/shit/gi, "stuff")
        .replace(/ass/gi, "butt")
        .replace(/damn/gi, "darn")
        .replace(/hell/gi, "heck")
        .replace(/bastard/gi, "jerk");
      
      console.log(`Text telah disesuaikan menjadi: "${processedText}"`);
      finalCleanedText = processedText;
      
      // Jika dialog berisi "hilarious" atau "real" dengan kata kasar, gunakan tone SARCASTIC
      if (finalCleanedText.includes("hilarious") || finalCleanedText.includes("real")) {
        // Force tone untuk konsistensi
        tone = 'SARCASTIC';
        
        // Penyesuaian voice settings khusus untuk dialog sarkastik
        voiceSettings = {
          ...baseSettings,
          style: 0.62,              // Sedikit lebih rendah dari default sarcastic
          speaking_rate: 0.94       // Hampir normal untuk memudahkan pemrosesan
        };
      } else {
        // Dialog dengan kata kasar lain, gunakan tone ANGRY
        tone = 'ANGRY';
        
        // Penyesuaian voice settings untuk dialog dengan kata kasar
        voiceSettings = {
          ...baseSettings,
          style: 0.62,              // Medium-high style, tidak terlalu ekstrem
          speaking_rate: 0.93       // Sedikit lebih lambat untuk memudahkan pemrosesan
        };
      }
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
      
      // Jika error terkait rate limit atau unusual activity, gunakan fallback
      if (fetchResponse.status === 401 || errorText.includes("unusual_activity") || errorText.includes("Free Tier usage disabled")) {
        console.log("ElevenLabs API error menunjukkan rate limit atau unusual activity, menggunakan fallback audio");
        
        // Coba gunakan silent audio sebagai fallback
        const silentAudioPath = path.join(characterAudioDir, 'silent.mp3');
        if (fs.existsSync(silentAudioPath)) {
          return res.status(200).json({
            success: true,
            audioPath: '/audio/character/silent.mp3',
            fallback: true,
            error: `API rate limited: ${errorText}`
          });
        }
      }
      
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
      
      // Backup the new audio file to avoid future API calls
      try {
        // Create backup directory if it doesn't exist
        const backupDir = path.join(publicDir, 'audio/backup');
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Save to backup with both the processed and original names
        const backupProcessedPath = path.join(backupDir, processedFileName);
        fs.writeFileSync(backupProcessedPath, response.data);
        console.log(`Backed up audio to: ${backupProcessedPath}`);
        
        // If using different filenames, backup the original version too
        if (originalFileName !== processedFileName) {
          const backupOriginalPath = path.join(backupDir, originalFileName);
          fs.copyFileSync(backupProcessedPath, backupOriginalPath);
          console.log(`Also backed up as original version: ${backupOriginalPath}`);
        }
      } catch (backupErr) {
        console.error('Error backing up new audio file:', backupErr);
        // Continue even if backup fails
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