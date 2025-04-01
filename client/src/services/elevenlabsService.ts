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
    'geralt': 'pNInz6obpgDQGcFmaJgB', // ElevenLabs' Antoni voice for Geralt
    'default': 'pNInz6obpgDQGcFmaJgB'
  };
  
  private constructor() {
    // Initialize API key from environment variable
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string;
    console.log("API Key initialized:", this.apiKey ? "Yes" : "No");
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
    if (!this.apiKey) {
      console.error('ElevenLabs API key is not set.');
      return null;
    }
    
    try {
      // Map character voice to actual voice ID
      const voiceId = this.voiceMap[characterVoice] || this.voiceMap.default;
      
      const requestBody: TTSRequestBody = {
        text: text,
        voice_id: voiceId,
        model_id: 'eleven_monolingual_v1'
      };
      
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Xi-Api-Key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error generating speech:', error);
      return null;
    }
  }
  
  public async speakText(text: string, characterVoice: string = 'geralt'): Promise<boolean> {
    const audioBlob = await this.generateSpeech(text, characterVoice);
    if (!audioBlob) return false;
    
    try {
      // Stop any currently playing audio
      this.stopSpeaking();
      
      // Create audio URL and play it
      const audioUrl = URL.createObjectURL(audioBlob);
      this.audioElement = new Audio(audioUrl);
      
      // Set event listeners
      this.audioElement.onplay = () => { this.isPlaying = true; };
      this.audioElement.onended = () => { 
        this.isPlaying = false;
        if (this.audioElement) {
          URL.revokeObjectURL(this.audioElement.src);
          this.audioElement = null;
        }
      };
      this.audioElement.onerror = (e) => { 
        console.error('Audio playback error:', e);
        this.isPlaying = false;
        this.audioElement = null;
      };
      
      // Play the audio
      await this.audioElement.play();
      return true;
    } catch (error) {
      console.error('Error playing speech:', error);
      return false;
    }
  }
  
  public stopSpeaking(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      URL.revokeObjectURL(this.audioElement.src);
      this.audioElement = null;
      this.isPlaying = false;
    }
  }
  
  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}

export default ElevenLabsService;