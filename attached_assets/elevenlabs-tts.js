// API Endpoint untuk ElevenLabs Text-to-Speech
// Handles requests to ElevenLabs API untuk voice synthesis
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ambil data dari body request
    const { text, voice_id, voice_settings, tone } = req.body;
    
    // Validasi input
    if (!text || !voice_id) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Skip processing untuk text yang hanya berisi ellipsis (Geralt sedang mendengarkan)
    // Ini membuat pengalaman lebih natural saat karakter "mendengarkan"
    if (text.trim() === '...' || text.trim() === '....') {
      return res.status(200).json({ skipped: true, reason: 'Ellipsis only, skipped TTS' });
    }
    
    // Gunakan API key dari environment variables (ELEVENLABS_API_KEY)
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not found' });
    }
    
    // Implementasi sistem caching untuk menghemat kredit ElevenLabs
    // Normalisasi teks sebelum hashing untuk memastikan konsistensi cache
    // 1. Hapus whitespace berlebih
    // 2. Buat lowercase
    // 3. Hapus tanda baca tertentu di akhir seperti koma atau titik
    // 4. Tapi jaga pola khusus seperti ellipsis (...) atau ?... di akhir kalimat
    const trimmedText = text.trim();
    const hasDots = trimmedText.endsWith('...');
    const hasQuestionDots = trimmedText.endsWith('?...');
    
    let normalizedText = text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
      
    // Simpan tanda tanya dan titik-titik
    if (hasQuestionDots) {
      // Hapus tanda baca terlebih dahulu (untuk konsistensi)
      normalizedText = normalizedText.replace(/[.,?!:;]+$/, '');
      // Tambahkan kembali pola ?...
      normalizedText += '?...';
    } else if (hasDots) {
      // Hapus tanda baca terlebih dahulu (untuk konsistensi)
      normalizedText = normalizedText.replace(/[.,?!:;]+$/, '');
      // Tambahkan kembali ...
      normalizedText += '...';
    } else {
      // Hapus tanda baca di akhir seperti biasa
      normalizedText = normalizedText.replace(/[.,?!:;]+$/, '');
    }
    
    // Buat hash dari kombinasi teks dan tone untuk caching
    const hash = crypto.createHash('md5').update(`${normalizedText}_${tone || 'default'}_${voice_id}`).digest('hex');
    const cacheDir = path.join(process.cwd(), 'public/audio-cache');
    const cacheFilePath = path.join(cacheDir, `${hash}.mp3`);
    const cachePublicPath = `/audio-cache/${hash}.mp3`;
    
    // Periksa apakah file sudah ada di cache
    if (fs.existsSync(cacheFilePath)) {
      console.log('Cache hit! Menggunakan file audio yang sudah ada');
      // Ubah content-type menjadi audio/mpeg untuk file yang sudah di-cache
      // agar klien bisa langsung memutar file audio yang sudah ada
      const fileBuffer = fs.readFileSync(cacheFilePath);
      
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', fileBuffer.byteLength);
      res.setHeader('x-cached', 'true');
      return res.status(200).send(fileBuffer);
    }
    
    // Pastikan direktori cache ada
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // ElevenLabs API endpoint untuk text-to-speech
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;
    
    // Konfigurasi request
    // Parameter dasar untuk suara berat Geralt yang konsisten di semua tone
    // Nilai-nilai ini akan menjadi default jika tidak dimodifikasi
    let stability = voice_settings?.stability || 0.45; // Sedikit tidak stabil untuk karakter Geralt
    let similarity_boost = voice_settings?.similarity_boost || 0.80; // Tinggi untuk mempertahankan karakter Geralt
    let style = voice_settings?.style || 0.30; // Cukup ekspresif untuk karakter Geralt
    let timbre = 2.70; // Nilai yang sangat tinggi untuk suara berat/bass Geralt
    let clarity = 0.35; // Clarity rendah untuk efek suara serak khas Geralt
    let spectral_contrast = 1.9; // Nilai tinggi untuk kedalaman suara
    
    // Modifikasi suara berdasarkan tone untuk karakter Geralt
    // Semua tone tetap mempertahankan suara berat (timbre, clarity, spectral_contrast)
    if (tone) {
      switch(tone) {
        case 'drunk':
          // Lebih tidak stabil, lebih slurred untuk efek mabuk Geralt
          stability = 0.25; // Lebih tidak stabil untuk efek mabuk yang lebih autentik
          similarity_boost = 0.65; // Tetap cukup untuk mempertahankan karakter Geralt
          style = 0.45; // Lebih tinggi untuk lebih ekspresif/tidak konsisten saat mabuk
          timbre = 2.80; // Bahkan lebih berat saat mabuk
          clarity = 0.30; // Lebih tidak jelas saat mabuk
          break;
        case 'angry':
          // Stabilitas rendah untuk growling sound Geralt saat marah
          stability = 0.30; // Lebih rendah untuk growling sound yang lebih intens
          similarity_boost = 0.75; // Tetap tinggi untuk mempertahankan karakter Geralt
          style = 0.40; // Lebih tinggi untuk ekspresi kemarahan yang lebih jelas
          timbre = 2.75; // Sangat berat saat marah
          spectral_contrast = 2.0; // Lebih tinggi untuk suara yang lebih dalam saat marah
          break;
        case 'tired':
          // Lelah tapi tetap dengan suara berat khas Geralt
          stability = 0.50; // Stabil tapi memungkinkan variasi untuk efek lelah
          similarity_boost = 0.72; // Tetap tinggi untuk mempertahankan karakter Geralt 
          style = 0.25; // Cukup ekspresif untuk menunjukkan kelelahan
          timbre = 2.65; // Tetap berat meski lelah
          clarity = 0.30; // Sedikit lebih tidak jelas karena lelah
          break;
        case 'bitter':
          // Tone getir, pahit tapi tetap dengan suara berat
          stability = 0.40; // Cukup stabil tapi dengan sedikit getaran emosi
          similarity_boost = 0.75; // Tetap tinggi untuk mempertahankan karakter Geralt
          style = 0.35; // Cukup ekspresif untuk menunjukkan kepahitan
          timbre = 2.70; // Tetap berat
          break;
        case 'numb':
          // Mati rasa, hampa, tapi tetap dengan suara berat
          stability = 0.60; // Sangat stabil untuk efek monoton
          similarity_boost = 0.78; // Tetap sangat tinggi untuk mempertahankan karakter Geralt
          style = 0.15; // Sedikit ekspresivitas untuk suara yang datar
          timbre = 2.65; // Tetap berat
          break;
        case 'hollow':
          // Kosong, hampa, tapi tetap dengan suara berat
          stability = 0.55; // Cukup stabil untuk suara yang kosong
          similarity_boost = 0.75; // Tetap tinggi untuk mempertahankan karakter Geralt
          style = 0.20; // Sedikit ekspresivitas untuk suara yang hampa
          timbre = 2.65; // Tetap berat
          clarity = 0.38; // Kejelasan yang cukup
          break;
        case 'resigned':
          // Pasrah, menyerah pada nasib tapi tetap dengan suara berat
          stability = 0.50; // Cukup stabil untuk suara pasrah
          similarity_boost = 0.73; // Tetap tinggi untuk mempertahankan karakter Geralt
          style = 0.25; // Cukup ekspresif untuk menunjukkan kepasrahan
          timbre = 2.60; // Tetap berat
          spectral_contrast = 1.8; // Tetap dalam
          break;
        case 'sarcastic':
          // Sarkastik, tapi tetap dengan suara berat
          stability = 0.40; // Tidak terlalu stabil untuk variasi nada sarkastik
          similarity_boost = 0.70; // Tetap tinggi untuk mempertahankan karakter Geralt
          style = 0.35; // Lebih ekspresif untuk menunjukkan sarkasme
          timbre = 2.62; // Tetap berat
          spectral_contrast = 1.85; // Tetap dalam
          break;
        case 'annoyed':
          // Terganggu, kesal tapi tetap dengan suara berat
          stability = 0.35; // Tidak terlalu stabil untuk menunjukkan kekesalan
          similarity_boost = 0.72; // Tetap tinggi untuk mempertahankan karakter Geralt
          style = 0.32; // Cukup ekspresif untuk menunjukkan kekesalan
          timbre = 2.68; // Tetap berat
          spectral_contrast = 1.9; // Lebih dalam untuk kekesalan
          break;
        case 'contemplative':
          // Merenung tapi tetap dengan suara berat
          stability = 0.48; // Cukup stabil untuk efek merenung
          similarity_boost = 0.76; // Tetap tinggi untuk mempertahankan karakter Geralt
          style = 0.25; // Cukup ekspresif untuk menunjukkan perenungan
          timbre = 2.62; // Tetap berat
          clarity = 0.37; // Sedikit lebih jelas untuk perenungan
          break;
      }
    }
    
    // Tambahkan processing untuk membuat suara lebih serak (bassier, deeper)
    // Gunakan model terbaru untuk suara yang lebih natural
    const modelId = "eleven_turbo_v2"; // Model terbaru untuk lebih natural
    
    // Bersihkan teks dari karakter yang tidak perlu dibaca
    // Hanya hapus asterisk dari teks dan minimalisir modifikasi
    // Karena kita menggunakan suara kustom Geralt yang sudah ada
    let cleanedText = text.replace(/\*/g, "");
    
    // Perbaiki cara onomatopoeia dibaca dengan pendekatan khusus
    // Format khusus untuk onomatopoeia agar lebih manusiawi
    
    // Perbaiki efek suara "Sigh"
    cleanedText = cleanedText.replace(/\b(Sigh)(\.?)(\s)/gi, "*exhales deeply*$3");
    
    // Perbaiki efek suara "Hmm/Hmph"
    cleanedText = cleanedText.replace(/\b(Hmm|Hmph)(\.?)(\s)/gi, "*low grunt*$3");
    
    // Perbaiki efek suara "Pfftt" 
    cleanedText = cleanedText.replace(/\b(Pfftt)(\.?)(\s)/gi, "*scoffs*$3");
    
    // Perbaiki efek suara "Tch"
    cleanedText = cleanedText.replace(/\b(Tch)(\.?)(\s)/gi, "*clicks tongue*$3");
    
    // Tambahkan sedikit jeda untuk membuat suara lebih lambat dan karakter Geralt
    if (cleanedText.length > 20) {
      // Tambahkan beberapa jeda alami di kalimat untuk memperlambat suara
      const words = cleanedText.split(' ');
      if (words.length > 5) {
        // Tambahkan jeda setelah sepertiga kalimat
        const pausePoint = Math.floor(words.length / 3);
        words.splice(pausePoint, 0, ',');
        cleanedText = words.join(' ');
      }
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: cleanedText,
        model_id: modelId,
        voice_settings: {
          stability: stability,
          similarity_boost: similarity_boost,
          style: style,
          use_speaker_boost: true,
          // Parameter khusus untuk sound seperti Geralt of Rivia - lebih dalam, berat dan bass
          // Optimalisasi untuk suara Geralt dari Rivia berdasarkan preview voice baru
          // Gunakan nilai timbre, clarity, dan spectral_contrast yang telah ditetapkan berdasarkan tone
          // Parameter ini akan memastikan suara tetap berat di semua tone
          timbre: timbre, // Nilai tinggi untuk suara berat/bass seperti Geralt asli (antara 2.60-2.80)
          clarity: clarity, // Clarity rendah untuk efek suara serak dan kasar seperti Geralt (antara 0.30-0.40)
          // Parameter tambahan untuk kedalaman suara
          spectral_contrast: spectral_contrast, // Meningkatkan kedalaman & karakter suara Geralt (antara 1.8-2.0)
          // Parameter untuk memperlambat suara dan membuat lebih seperti Geralt
          speaking_rate: 0.75, // Lebih lambat untuk suara berat dan lambat khas Geralt (0-2, default 1)
          pause_frequency: 1.2, // Menambah jeda natural agar Geralt tidak terdengar terlalu cepat (0-2, default 1)
        },
      }),
    });
    
    // Jika ada error dari API
    if (!response.ok) {
      console.error(`ElevenLabs API error: ${response.status} - ${response.statusText}`);
      // Kirim status error dengan informasi detail dan fallback tag
      return res.status(response.status).json({ 
        error: `ElevenLabs API error: ${response.statusText}`,
        details: await response.text(),
        fallback: true // Tandai bahwa client harus menggunakan fallback
      });
    }
    
    // Dapatkan audio data (binary)
    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    
    // Simpan file audio ke cache
    fs.writeFileSync(cacheFilePath, buffer);
    console.log(`Audio disimpan ke cache: ${cacheFilePath}`);
    
    // Set response headers untuk audio file
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.byteLength);
    
    // Kirim audio data sebagai response
    res.status(200).send(buffer);
    
  } catch (error) {
    console.error('Error processing TTS request:', error);
    res.status(500).json({ 
      error: 'Failed to process text-to-speech request', 
      details: error.message,
      fallback: true // Tandai bahwa client harus menggunakan fallback
    });
  }
}