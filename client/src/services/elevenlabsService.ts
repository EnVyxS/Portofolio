class ElevenLabsService {
  private static instance: ElevenLabsService;
  private apiKey: string | null = null;
  private isPlaying: boolean = false;
  private audioElement: HTMLAudioElement | null = null;
  private audioCache: Record<string, Blob | null> = {}; // Cache untuk menyimpan audio yang sudah di-generate
  private preloadedAudios: Map<string, HTMLAudioElement> = new Map(); // Map untuk audio yang sudah diload

  // Map character names to ElevenLabs voice IDs (tidak digunakan lagi, tapi disimpan sebagai referensi)
  private voiceMap: Record<string, string> = {
    'geralt': 'TxGEqnHWrfWFTfGW9XjX', // Adam - deep gravelly voice for Geralt
    'ciri': 'EXAVITQu4vr4xnSDxMaL',   // Bella - young female voice for Ciri
    'yennefer': 'Yko7PKHZNXotIFUBG7I9', // Elli - mature female voice with accent for Yen
    'default': 'TxGEqnHWrfWFTfGW9XjX'  // Default to Geralt voice
  };

  // Simpan file audio lokal berdasarkan hash sederhana dari teks
  private audioFilesMap: Record<string, string> = {};

  private constructor() {
    // Check if API key is in env
    const envApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (envApiKey) {
      this.apiKey = envApiKey;
      console.log("API Key initialized:", envApiKey ? "Yes" : "No");
    }
    
    // Inisialisasi silent audio untuk teks yang hanya berisi "....."
    this.preloadSilentAudio();
    
    // Pre-generate dialog hashes for all dialogs untuk mapping audio files
    this.initializeDialogHashes();
  }
  
  // Buat hash sederhana dari teks untuk digunakan sebagai id file audio
  private generateSimpleHash(text: string): string {
    // Sangat sederhana, hanya untuk demo
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }
  
  // Inisialisasi hash dialog untuk semua dialog yang mungkin
  private initializeDialogHashes(): void {
    // Dialog dari Geralt yang mungkin muncul
    const possibleDialogs = [
      "...Didn't ask for company.",
      "Tch... Fire's warm. Always brings strays.",
      "Haahhhh... You need something or are you just here to waste my time?",
      ".....",
      "Curiosity?... Hmph... Doesn't pay the bills...",
      "Pfftt... Waiting... Drinking... What else is there?",
      "Hmm... Got a handful of coins and a longsword. That's all a man like me needs...",
      "There's a contract I'll have to deal with come sunrise. Some beast's been picking off villagers near the old mill...",
      "You want to know more about me? Hmmm... Why would you care?",
      "Witcher by trade. Monster hunter. I follow the Path.",
      "I see by your eyes you've heard the tales. Yes, they're all true. The mutations. The training.",
      "Not many of us left. Most don't make it through the Trial of Grasses. I was... lucky. Or cursed. Depends who you ask.",
      "I don't talk much about my past. No point dwelling on what's done.",
      "What's that look for? Expected something more? *grunts* Don't we all...",
      "The Path is a lonely one. That's just how it is.",
      "If you're looking to hire me, I'm not cheap. But I'm good at what I do.",
      "Hmm... I notice you're still here. You're either brave or stupid. Most people keep their distance.",
      "You can find me on the Path. Or through Kaer Morhen, when winter comes.",
      "I've left my mark in several places. Some remember me. Others... prefer to forget.",
      "There are ways to reach me if you truly need a witcher's services. Just follow the rumors of monsters slain.",
      "Or perhaps you'd prefer more direct methods...",
      "There's a code among witchers. We don't kill humans. Not without reason.",
      "Sometimes, though, the monsters look just like you and me.",
      "The fire's dying. And I've said more than I usually do in a month.",
      "Take what you need from our conversation. I'll be here until dawn.",
      "After that, the Path calls again.",
      "Do what you will with my words. Just remember, a witcher never forgets a face.",
      "Now leave me be. I've had enough talk for one night.",
      "Hmm.",
      "*stares into the fire*",
      "*sighs* One last word of advice: in this world, it's rarely about the monsters. It's about the men. Remember that.",
      "Farewell, stranger.",
      "*turns back to the fire*",
      "*end of conversation*"
    ];
    
    // Generate hash for each dialog
    possibleDialogs.forEach(text => {
      const hash = this.generateSimpleHash(text);
      this.audioFilesMap[text] = `dialog_${hash}`;
      
      // Preload audio jika tersedia
      this.preloadAudio(text);
    });
  }
  
  // Preload dialog audio jika file ada
  private preloadAudio(text: string): void {
    // Jika teks hanyalah ellipsis, gunakan silent audio
    if (text.trim() === '.....' || text.trim() === '...') {
      return; // Sudah ditangani oleh preloadSilentAudio
    }
    
    const hash = this.generateSimpleHash(text);
    const audioPath = `/audio/geralt/dialog_${hash}.mp3`;
    
    // Check if file exists before loading
    fetch(audioPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          console.log("Loading audio for:", text.substring(0, 20) + "...");
          console.log("Found existing audio file:", audioPath);
          const audio = new Audio(audioPath);
          this.preloadedAudios.set(text, audio);
        } else {
          // File tidak ditemukan, tidak perlu melakukan apa-apa
          console.log("Audio file not found:", audioPath);
        }
      })
      .catch(error => {
        console.error("Error checking audio file:", error);
      });
  }
  
  // Preload silent audio untuk dialog kosong
  private preloadSilentAudio(): void {
    // Gunakan audio kosong berdurasi pendek untuk teks yang hanya berisi ellipsis
    const silentAudio = new Audio('/audio/geralt/silent.mp3');
    this.preloadedAudios.set('.....', silentAudio);
    this.preloadedAudios.set('...', silentAudio);
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
      // Buat cache key berdasarkan text
      const cacheKey = text;
      
      // Cek apakah audio sudah ada di cache
      if (cacheKey in this.audioCache) {
        console.log("Using cached audio for:", text.substring(0, 20) + "...");
        const cachedBlob = this.audioCache[cacheKey];
        return cachedBlob;
      }
      
      console.log("Loading audio for:", text.substring(0, 20) + "...");
      
      // Gunakan file lokal alih-alih memanggil API
      
      // Cek apakah ini adalah text kosong
      if (text.trim() === '.....' || text.trim() === '...') {
        console.log("Using silent audio for:", text.trim());
        // Gunakan "silent.mp3" untuk teks kosong
        const response = await fetch('/audio/geralt/silent.mp3');
        
        if (!response.ok) {
          console.error('Silent audio file not found');
          return null;
        }
        
        const audioBlob = await response.blob();
        this.audioCache[cacheKey] = audioBlob;
        return audioBlob;
      }
      
      // Jika bukan ellipsis, coba cari file audio yang sesuai
      const hash = this.generateSimpleHash(text);
      const audioFile = `/audio/geralt/dialog_${hash}.mp3`;
      
      // Coba cari file audio
      const response = await fetch(audioFile);
      
      // Jika file tidak ditemukan
      if (!response.ok) {
        console.log('Audio file not found, using silent audio instead');
        const silentResponse = await fetch('/audio/geralt/silent.mp3');
        
        if (!silentResponse.ok) {
          console.error('Silent audio file not found');
          return null;
        }
        
        const silentBlob = await silentResponse.blob();
        this.audioCache[cacheKey] = silentBlob;
        return silentBlob;
      }
      
      // Jika file ditemukan
      const audioBlob = await response.blob();
      this.audioCache[cacheKey] = audioBlob;
      return audioBlob;
      
    } catch (error) {
      console.error('Error loading speech audio:', error);
      // Return null in case of error
      this.audioCache[text] = null;
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