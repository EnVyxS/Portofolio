import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/text-to-speech', async (req: Request, res: Response) => {
  try {
    // Ambil data dari body request
    const { text, voice_id, voice_settings } = req.body;
    
    // Validasi input
    if (!text || !voice_id) {
      return res.status(400).json({ error: 'Missing required parameters' });
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
      // Menggunakan model turbo dari dokumentasi ElevenLabs
      model_id: "eleven_turbo_v2",
      voice_settings: voice_settings || {
        stability: 0.45,
        similarity_boost: 0.8,
        style: 0.3,
        use_speaker_boost: true,
        speaking_rate: 0.75,
        // Tambahan parameter untuk karakter suara yang lebih berat
        timbre: 2.7,
        clarity: 0.35,
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
      return res.status(response.status).json({ 
        error: `ElevenLabs API error: ${response.statusText}`,
        details: await response.text()
      });
    }
    
    // Dapatkan audio data (binary)
    const audioBuffer = await response.arrayBuffer();
    
    // Set header untuk audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    
    // Kirim audio data
    res.send(Buffer.from(audioBuffer));
    
  } catch (error) {
    console.error('Error in text-to-speech endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;