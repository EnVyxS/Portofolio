// Vercel serverless function for ElevenLabs API

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.query;

  try {
    if (action === 'text-to-speech') {
      const { text, voice_id, model_id, voice_settings } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
      if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ 
          error: 'ElevenLabs API key not configured',
          success: false 
        });
      }

      // Process text for special cases (ellipsis handling)
      let processedText = text;
      if (starts_with_ellipsis && trimmedText.startsWith('...') && trimmedText.length > 3) {
        processedText = `<speak><break time="0.3s"/>${trimmedText.substring(3)}</speak>`;
      }

      const defaultVoiceId = 'dBynzNhvSFj0l1D7I9yV';
      const finalVoiceId = voice_id || defaultVoiceId;
      
      // Default voice settings matching the original server configuration
      const defaultVoiceSettings = {
        stability: 0.90,
        similarity_boost: 1.0,
        style: 0.25,
        use_speaker_boost: true,
        speaking_rate: 0.95
      };

      const elevenlabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`;
      
      const response = await fetch(elevenlabsUrl, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: processedText,
          model_id: model_id || 'eleven_multilingual_v2',
          voice_settings: voice_settings || defaultVoiceSettings
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', errorText);
        return res.status(response.status).json({ 
          error: `ElevenLabs API error: ${response.status}`,
          details: errorText
        });
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      
      return res.status(200).json({
        success: true,
        audioPath: `data:audio/mpeg;base64,${audioBase64}`,
        cached: false,
        message: 'Generated new audio via serverless function'
      });

    } else if (action === 'voices') {
      const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
      if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ 
          error: 'ElevenLabs API key not configured',
          success: false 
        });
      }

      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `ElevenLabs API error: ${response.status}` 
        });
      }

      const voices = await response.json();
      return res.status(200).json(voices);

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}