interface TTSRequestBody {
  text: string;
  voice_id: string;
  model_id: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
  };
}

class ElevenLabsService {
  private static instance: ElevenLabsService;
  private apiKey: string | null = null;
  private isPlaying: boolean = false;
  private audioElement: HTMLAudioElement | null = null;
  private audioCache: Map<string, Blob> = new Map(); // Cache untuk menyimpan audio yang sudah di-generate

  // Map character names to ElevenLabs voice IDs
  private voiceMap: Record<string, string> = {
    'geralt': 'TxGEqnHWrfWFTfGW9XjX', // Adam - deep gravelly voice for Geralt
    'ciri': 'EXAVITQu4vr4xnSDxMaL',   // Bella - young female voice for Ciri
    'yennefer': 'Yko7PKHZNXotIFUBG7I9', // Elli - mature female voice with accent for Yen
    'default': 'TxGEqnHWrfWFTfGW9XjX'  // Default to Geralt voice
  };

  private constructor() {
    // Check if API key is in env
    const envApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (envApiKey) {
      this.apiKey = envApiKey;
      console.log("API Key initialized:", envApiKey ? "Yes" : "No");
    }
  }

  public static getInstance(): ElevenLabsService {
    if (!ElevenLabsService.instance) {
      ElevenLabsService.instance = new ElevenLabsService();
    }
    return ElevenLabsService.instance;
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
  }

  public getApiKey(): string | null {
    return this.apiKey;
  }

  public async generateSpeech(text: string, characterVoice: string = 'geralt'): Promise<Blob | null> {
    try {
      // Map character to voice ID
      const voiceId = this.voiceMap[characterVoice.toLowerCase()] || this.voiceMap.default;
      
      // Buat cache key berdasarkan text dan voice ID
      const cacheKey = `${text}_${voiceId}`;
      
      // Cek apakah audio sudah ada di cache
      if (this.audioCache.has(cacheKey)) {
        console.log("Using cached audio for:", text.substring(0, 20) + "...");
        return this.audioCache.get(cacheKey)!;
      }
      
      console.log("Generating new audio for:", text.substring(0, 20) + "...");
      
      // Gunakan endpoint server lokal alih-alih memanggil ElevenLabs langsung
      // Ini mengatasi masalah CORS dan juga masalah API key
      const requestBody = {
        text: text,
        voice_id: voiceId,
        model_id: "b2FFMFMuLlPlyWk5NuQW", // Model ID yang diminta
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          speaking_rate: 0.75
        }
      };

      const response = await fetch('/api/elevenlabs/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error('Failed to generate speech:', await response.text());
        return null;
      }

      // Simpan hasil ke cache
      const audioBlob = await response.blob();
      this.audioCache.set(cacheKey, audioBlob);
      
      return audioBlob;
    } catch (error) {
      console.error('Error generating speech:', error);
      return null;
    }
  }

  public async speakText(text: string, characterVoice: string = 'geralt'): Promise<boolean> {
    // If already playing, stop first
    if (this.isPlaying) {
      this.stopSpeaking();
    }

    // Generate speech
    const audioBlob = await this.generateSpeech(text, characterVoice);
    if (!audioBlob) {
      return false;
    }

    // Create audio URL and element
    const audioUrl = URL.createObjectURL(audioBlob);
    this.audioElement = new Audio(audioUrl);
    
    // Play audio
    try {
      this.isPlaying = true;
      await this.audioElement.play();
      
      // Clean up when audio ends
      this.audioElement.onended = () => {
        this.isPlaying = false;
        if (this.audioElement) {
          URL.revokeObjectURL(audioUrl);
          this.audioElement = null;
        }
      };
      
      return true;
    } catch (error) {
      console.error('Failed to play audio:', error);
      this.isPlaying = false;
      return false;
    }
  }

  public stopSpeaking(): void {
    if (this.audioElement && this.isPlaying) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
    }
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

export default ElevenLabsService;