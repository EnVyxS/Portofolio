import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const router = express.Router();

// Fungsi untuk membuat hash MD5 dari teks
function hashText(text: string, voiceId: string): string {
  return crypto.createHash('md5').update(`${text}_${voiceId}`).digest('hex');
}

router.post('/text-to-speech', async (req: Request, res: Response) => {
  try {
    // Ambil data dari body request
    const { text, voice_id, voice_settings } = req.body;
    
    // Validasi input
    if (!text || !voice_id) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Cek untuk teks seperti "....." atau text yang dimulai dengan "*"
    // Untuk teks pendek seperti ini, kita tidak perlu memanggil API
    if (text.trim() === '.....' || text.startsWith('*') || text.length < 3) {
      console.log('Teks pendek, menggunakan silent audio');
      
      // Kirim header untuk audio kosong
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('x-skipped', 'true');
      
      // Kirim file kosong atau sangat pendek
      return res.status(200).send(Buffer.alloc(1024)); // Empty buffer
    }
    
    // Periksa cache folder
    const cacheDir = path.join(process.cwd(), 'client/public/audio/geralt');
    
    // Pastikan direktori cache ada
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Buat hash dari teks dan voice ID untuk nama file
    const hash = hashText(text, voice_id);
    const cacheFilePath = path.join(cacheDir, `dialog_${hash}.mp3`);
    
    // Cek apakah file sudah ada di cache
    if (fs.existsSync(cacheFilePath)) {
      console.log('Cache hit! Menggunakan file audio yang sudah ada');
      const fileBuffer = fs.readFileSync(cacheFilePath);
      
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', fileBuffer.byteLength);
      res.setHeader('x-cached', 'true');
      return res.status(200).send(fileBuffer);
    }
    
    // Gunakan API key dari environment variables
    const apiKey = process.env.ELEVENLABS_API_KEY || 'sk_f64d77d3c40e5b4b292fc19b7f821f9ce03693c239c57647';
    
    if (!apiKey) {
      console.error('ElevenLabs API key not found in environment variables');
      return res.status(500).json({ error: 'API key not found' });
    }
    
    // ElevenLabs API endpoint untuk text-to-speech
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;
    
    // Request body default
    const requestBody = {
      text: text,
      // Menggunakan model turbo terbaru untuk suara berkualitas tinggi
      model_id: "eleven_turbo_v2",
      voice_settings: voice_settings || {
        stability: 0.45,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true,
        speaking_rate: 0.75,
      }
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });
    
    // Jika ada error dari API
    if (!response.ok) {
      console.error(`ElevenLabs API error: ${response.status} - ${response.statusText}`);
      
      // Jika API memberi error, kita tetap bisa mengirim file kosong sebagai fallback
      if (response.status === 401 || response.status === 403) {
        console.log('Authentication error, menggunakan silent audio sebagai fallback');
        
        // Kirim header untuk audio kosong
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('x-fallback', 'true');
        
        // Kirim file kosong atau sangat pendek
        return res.status(200).send(Buffer.alloc(1024)); // Empty buffer
      }
      
      return res.status(response.status).json({ 
        error: `ElevenLabs API error: ${response.statusText}`,
        details: await response.text()
      });
    }
    
    // Dapatkan audio data (binary)
    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    
    // Simpan ke cache
    fs.writeFileSync(cacheFilePath, buffer);
    console.log(`Audio saved to cache: ${cacheFilePath}`);
    
    // Set header untuk audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.byteLength);
    
    // Kirim audio data
    res.send(buffer);
    
  } catch (error) {
    console.error('Error in text-to-speech endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;