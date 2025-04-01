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

  // Map of character voices to ElevenLabs voice IDs
  // These are example IDs - they should be replaced with actual ElevenLabs voice IDs
  private voiceMap: Record<string, string> = {
    'geralt': 'MjQrMrXhMQWKXOyF08aB', // Replace with actual voice ID for Geralt
    'default': 'pNInz6obpgDQGcFmaJgB' // Default voice ID
  };

  private constructor() {
    // Check if API key exists in localStorage
    const storedKey = localStorage.getItem('elevenlabs_api_key');
    if (storedKey) {
      this.apiKey = storedKey;
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
      console.warn('No ElevenLabs API key provided');
      return null;
    }

    try {
      // Get voice ID from the character name
      const voiceId = this.voiceMap[characterVoice] || this.voiceMap.default;
      
      // Prepare request body
      const requestBody: TTSRequestBody = {
        text: text,
        voice_id: voiceId,
        model_id: 'eleven_monolingual_v1', // Using their standard model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8
        }
      };

      // Make API request to ElevenLabs
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      return audioBlob;

    } catch (error) {
      console.error('Failed to generate speech:', error);
      return null;
    }
  }

  public async speakText(text: string, characterVoice: string = 'geralt'): Promise<boolean> {
    // Stop any currently playing audio
    this.stopSpeaking();
    
    try {
      // Generate speech
      const audioBlob = await this.generateSpeech(text, characterVoice);
      if (!audioBlob) return false;
      
      // Create a URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio element
      this.audioElement = new Audio(audioUrl);
      
      // Clean up when audio is done playing
      this.audioElement.onended = () => {
        this.isPlaying = false;
        if (this.audioElement) {
          URL.revokeObjectURL(this.audioElement.src);
          this.audioElement = null;
        }
      };
      
      // Start playing
      await this.audioElement.play();
      this.isPlaying = true;
      return true;
      
    } catch (error) {
      console.error('Failed to speak text:', error);
      this.isPlaying = false;
      return false;
    }
  }

  public stopSpeaking(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      URL.revokeObjectURL(this.audioElement.src);
      this.audioElement = null;
    }
    this.isPlaying = false;
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

export default ElevenLabsService;