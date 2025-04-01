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
  
  // Map character names to ElevenLabs voice IDs
  private voiceMap: Record<string, string> = {
    geralt: "rUXJSKoZJOd4a5TZpkXj", // Doug Cockle (Geralt from The Witcher)
    female: "EXAVITQu4vr4xnSDxMaL", // Rachel (female voice)
    narrator: "ODq5zmih8GrVes37Dizd", // George (deep narrator voice)
    friendly: "MF3mGyEYCl7XYWbV9V6O", // Adam (friendlier male voice)
    default: "rUXJSKoZJOd4a5TZpkXj"  // Default to Geralt
  };
  
  private constructor() {
    // Try to retrieve API key from localStorage if available
    const savedKey = localStorage.getItem('elevenlabs_api_key');
    if (savedKey) {
      this.apiKey = savedKey;
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
    localStorage.setItem('elevenlabs_api_key', key);
  }
  
  public getApiKey(): string | null {
    return this.apiKey;
  }
  
  public async generateSpeech(text: string, characterVoice: string = 'geralt'): Promise<Blob | null> {
    if (!this.apiKey) {
      console.error('ElevenLabs API key not set');
      return null;
    }
    
    try {
      const voiceId = this.voiceMap[characterVoice] || this.voiceMap.default;
      
      const requestBody: TTSRequestBody = {
        text: text,
        voice_id: voiceId,
        model_id: 'eleven_monolingual_v1', // Use their standard TTS model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      };
      
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('ElevenLabs API error:', errorData);
        return null;
      }
      
      // Get the audio data as a blob
      return await response.blob();
      
    } catch (error) {
      console.error('Error generating speech with ElevenLabs:', error);
      return null;
    }
  }
  
  public async speakText(text: string, characterVoice: string = 'geralt'): Promise<boolean> {
    // Stop any currently playing audio
    this.stopSpeaking();
    
    // Generate new speech
    const audioBlob = await this.generateSpeech(text, characterVoice);
    if (!audioBlob) {
      return false;
    }
    
    // Create an object URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Create and play audio
    this.audioElement = new Audio(audioUrl);
    
    // Set up event listeners
    this.audioElement.onplay = () => {
      this.isPlaying = true;
    };
    
    this.audioElement.onended = () => {
      this.isPlaying = false;
      // Clean up the object URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
    
    try {
      await this.audioElement.play();
      return true;
    } catch (error) {
      console.error('Error playing audio:', error);
      return false;
    }
  }
  
  public stopSpeaking(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
      this.isPlaying = false;
    }
  }
  
  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

export default ElevenLabsService;