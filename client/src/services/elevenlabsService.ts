class ElevenLabsService {
  private static instance: ElevenLabsService;
  private apiKey: string | null = null;
  private isPlaying: boolean = false;
  private audioElement: HTMLAudioElement | null = null;
  private audioCache: Record<string, Blob | null> = {}; // Cache untuk menyimpan audio yang sudah di-generate
  private preloadedAudios: Map<string, HTMLAudioElement> = new Map(); // Map untuk audio yang sudah diload

  // Map character names to ElevenLabs voice IDs (diperbarui sesuai permintaan)
  private voiceMap: Record<string, string> = {
    'geralt': '3Cka3TLKjahfz6KX4ckZ', // Voice ID untuk Geralt dengan ID premium
    'ciri': 'jsCqWAovK2LkecY7zXl4',   // Nicole voice for Ciri dengan API key baru 
    'yennefer': '21m00Tcm4TlvDq8ikWAM', // Rachel voice with accent for Yen dengan API key baru
    'character': '3Cka3TLKjahfz6KX4ckZ', // Voice ID untuk karakter default dengan ID premium
    'default': '3Cka3TLKjahfz6KX4ckZ'  // Default ke voice ID premium
  };

  // Simpan file audio lokal berdasarkan hash sederhana dari teks
  private audioFilesMap: Record<string, string> = {};
  
  // Ambient audio untuk latar belakang
  private ambientAudio: HTMLAudioElement | null = null;

  private constructor() {
    // Check if API key is in env
    const envApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || import.meta.env.ELEVENLABS_API_KEY;
    if (envApiKey) {
      this.apiKey = envApiKey;
      console.log("API Key initialized from environment variable");
    } else {
      // Jika tidak ada di env, periksa secara asinkron apakah ada di server
      console.log("No API key found in client environment, checking server...");
      this.checkServerForApiKey();
    }
    
    // Inisialisasi silent audio untuk teks yang hanya berisi "....."
    this.preloadSilentAudio();
    
    // Pre-generate dialog hashes for all dialogs untuk mapping audio files
    this.initializeDialogHashes();
  }
  
  // Fungsi untuk memeriksa API key dari server secara asinkron
  private async checkServerForApiKey() {
    try {
      const response = await fetch('/api/elevenlabs/check-api-key');
      const data = await response.json();
      
      if (data.hasApiKey) {
        console.log("Server has ElevenLabs API key available");
        // Gunakan penanda untuk menandakan bahwa API key tersedia dari server
        this.apiKey = "server_api_key_available";
      } else {
        console.warn("No ElevenLabs API key found on server either");
        console.log("Audio generation will use cached files or fallback to local audio");
      }
    } catch (error) {
      console.error("Error checking API key on server:", error);
      console.log("Will try to use cached audio files as fallback");
    }
  }
  
  // Buat hash sederhana dari teks untuk digunakan sebagai id file audio
  private generateSimpleHash(text: string): string {
    // Remove emotion tags for hashing to maintain compatibility
    const cleanText = text.replace(/\[(.*?)\]/g, '').trim();
    
    // Sangat sederhana, hanya untuk demo
    let hash = 0;
    for (let i = 0; i < cleanText.length; i++) {
      hash = ((hash << 5) - hash) + cleanText.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }
  
  // Method baru untuk memeriksa apakah audio sudah ada di sistem file server
  // Ini akan memeriksa file di folder character, geralt, dan backup
  // Jika ada, akan mengembalikan path ke file tersebut
  private async checkIfAudioExists(text: string): Promise<{exists: boolean, audioPath?: string}> {
    try {
      // Generate hash untuk text yang diberikan
      const hash = this.generateSimpleHash(text);
      
      // Cek ketersediaan file di server
      const response = await fetch(`/api/elevenlabs/audio-exists/${hash}`);
      
      if (!response.ok) {
        console.error(`Error checking audio existence: ${response.status} ${response.statusText}`);
        return { exists: false };
      }
      
      const data = await response.json();
      
      if (data.exists && data.audioPath) {
        console.log(`Audio for "${text.substring(0, 20)}..." exists at ${data.audioPath}`);
        return { exists: true, audioPath: data.audioPath };
      }
      
      console.log(`Audio for "${text.substring(0, 20)}..." does not exist`);
      return { exists: false };
    } catch (error) {
      console.error("Error checking audio existence:", error);
      return { exists: false };
    }
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
    
    // Check for the file in both geralt and character directories
    // Try character first since it's the primary directory now
    const characterAudioPath = `/audio/character/dialog_${hash}.mp3`;
    const geraltAudioPath = `/audio/geralt/dialog_${hash}.mp3`;
    
    // Check character directory first
    fetch(characterAudioPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          console.log("Loading audio for:", text.substring(0, 20) + "...");
          console.log("Found existing audio file in character folder:", characterAudioPath);
          const audio = new Audio(characterAudioPath);
          this.preloadedAudios.set(text, audio);
        } else {
          // If not found in character, check geralt
          fetch(geraltAudioPath, { method: 'HEAD' })
            .then(geraltResponse => {
              if (geraltResponse.ok) {
                console.log("Loading audio for:", text.substring(0, 20) + "...");
                console.log("Found existing audio file in geralt folder:", geraltAudioPath);
                const audio = new Audio(geraltAudioPath);
                this.preloadedAudios.set(text, audio);
              } else {
                // Not found in either directory
                console.log("Audio file not found in character or geralt folders");
              }
            })
            .catch(error => {
              console.error("Error checking geralt audio file:", error);
            });
        }
      })
      .catch(error => {
        console.error("Error checking character audio file:", error);
      });
  }
  
  // Preload silent audio untuk dialog kosong
  private preloadSilentAudio(): void {
    // Gunakan audio kosong berdurasi pendek untuk teks yang hanya berisi ellipsis
    const characterSilentPath = '/audio/character/silent.mp3';
    const geraltSilentPath = '/audio/geralt/silent.mp3';
    
    // Check character directory first
    fetch(characterSilentPath, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          console.log("Silent audio file found in character folder, preloading");
          const silentAudio = new Audio(characterSilentPath);
          this.preloadedAudios.set('.....', silentAudio);
          this.preloadedAudios.set('...', silentAudio);
        } else {
          // If not found in character, check geralt
          fetch(geraltSilentPath, { method: 'HEAD' })
            .then(geraltResponse => {
              if (geraltResponse.ok) {
                console.log("Silent audio file found in geralt folder, preloading");
                const silentAudio = new Audio(geraltSilentPath);
                this.preloadedAudios.set('.....', silentAudio);
                this.preloadedAudios.set('...', silentAudio);
              } else {
                console.log("Silent audio file not found in either folder, will use on-demand");
              }
            })
            .catch(error => {
              console.error("Error checking geralt silent audio file:", error);
              console.log("Will use on-demand silent audio");
            });
        }
      })
      .catch(error => {
        console.error("Error checking character silent audio file:", error);
        console.log("Will use on-demand silent audio");
      });
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

  public async generateSpeech(text: string, characterVoice: string = 'character'): Promise<{blob: Blob | null, source?: string}> {
    try {
      // Buat cache key berdasarkan text
      const cacheKey = text;
      
      // Cek apakah audio sudah ada di cache memory
      if (cacheKey in this.audioCache) {
        console.log("Using in-memory cached audio for:", text.substring(0, 20) + "...");
        const cachedBlob = this.audioCache[cacheKey];
        return { blob: cachedBlob, source: "memory-cache" };
      }
      
      console.log("Requesting audio for:", text.substring(0, 20) + "...");
      
      // Jika ini adalah teks kosong atau ellipsis, gunakan silent.mp3
      if (text.trim() === '.....' || text.trim() === '...') {
        console.log("Using silent audio for:", text.trim());
        
        // Coba ambil dari folder character dulu
        let response = await fetch('/audio/character/silent.mp3');
        
        // Jika tidak ada di character, coba ambil dari geralt
        if (!response.ok) {
          console.log('Silent audio file not found in character folder, trying geralt folder');
          response = await fetch('/audio/geralt/silent.mp3');
          
          if (!response.ok) {
            console.error('Silent audio file not found in either folder');
            return { blob: null, source: "error-no-silent-file" };
          }
        }
        
        const audioBlob = await response.blob();
        this.audioCache[cacheKey] = audioBlob;
        return { blob: audioBlob, source: "silent-audio" };
      }
      
      // Untuk teks normal, gunakan endpoint server yang akan melakukan:
      // 1. Memeriksa jika file ada di sistem file lokal
      // 2. Jika tidak, generate menggunakan ElevenLabs API dan simpan
      try {
        // Log API key status (tanpa mengungkapkan nilai API key)
        if (this.apiKey === "server_api_key_available") {
          console.log("Using server-side API key for text-to-speech generation");
        } else if (this.apiKey) {
          console.log("Using client-side API key for text-to-speech generation");
        } else {
          console.log("No API key available, will rely on server to handle fallback to cached audio");
        }
        
        const response = await fetch('/api/elevenlabs/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text,
            voice_id: this.voiceMap[characterVoice] || this.voiceMap['default'],
            model_id: 'eleven_multilingual_v2' // Updated model untuk premium tier
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Text-to-speech API error:', errorData);
          
          // Kembali ke silent.mp3 jika tidak bisa generate
          console.log('Falling back to silent audio');
          
          // Coba ambil dari folder character dulu
          let silentResponse = await fetch('/audio/character/silent.mp3');
          
          // Jika tidak ada di character, coba ambil dari geralt
          if (!silentResponse.ok) {
            console.log('Silent audio file not found in character folder, trying geralt folder');
            silentResponse = await fetch('/audio/geralt/silent.mp3');
            
            if (!silentResponse.ok) {
              console.error('Silent audio file not found in either folder');
              return { blob: null, source: "error-no-audio" };
            }
          }
          
          const silentBlob = await silentResponse.blob();
          this.audioCache[cacheKey] = silentBlob;
          return { blob: silentBlob, source: "fallback-silent" };
        }
        
        // Dapatkan response JSON yang berisi path ke file audio
        const result = await response.json();
        
        if (result.success) {
          // Jika berhasil, ambil file audio dari path yang diberikan
          const audioResponse = await fetch(result.audioPath);
          if (audioResponse.ok) {
            const audioBlob = await audioResponse.blob();
            this.audioCache[cacheKey] = audioBlob;
            
            // Menentukan sumber audio berdasarkan response
            let source = "api-new";
            if (result.cached) {
              source = "file-cache";
            }
            if (result.message && result.message.includes("backup")) {
              source = "file-backup";
            }
            
            return { blob: audioBlob, source };
          }
        }
        
        // Jika gagal, gunakan silent.mp3
        console.log('Audio request failed, using silent audio instead');
          
        // Coba ambil dari folder character dulu
        let fallbackResponse = await fetch('/audio/character/silent.mp3');
        
        // Jika tidak ada di character, coba ambil dari geralt
        if (!fallbackResponse.ok) {
          console.log('Silent audio file not found in character folder, trying geralt folder');
          fallbackResponse = await fetch('/audio/geralt/silent.mp3');
          
          if (!fallbackResponse.ok) {
            console.error('Silent audio file not found in either folder');
            return { blob: null, source: "error-no-audio" };
          }
        }
        
        const fallbackBlob = await fallbackResponse.blob();
        this.audioCache[cacheKey] = fallbackBlob;
        return { blob: fallbackBlob, source: "fallback-silent" };
      } catch (apiError) {
        console.error('Error calling text-to-speech API:', apiError);
        
        // Coba gunakan file audio lokal jika API gagal
        // Mendukung degradasi agar aplikasi tetap berfungsi
        const hash = this.generateSimpleHash(text);
        const characterAudioFile = `/audio/character/dialog_${hash}.mp3`;
        const geraltAudioFile = `/audio/geralt/dialog_${hash}.mp3`;
        
        try {
          // Coba cari file audio lokal di folder character terlebih dahulu
          let localResponse = await fetch(characterAudioFile);
          if (localResponse.ok) {
            console.log('Found local audio file in character folder:', characterAudioFile);
            const localBlob = await localResponse.blob();
            this.audioCache[cacheKey] = localBlob;
            return { blob: localBlob, source: "local-character-file" };
          }
          
          // Coba cari di folder geralt jika tidak ada di character
          localResponse = await fetch(geraltAudioFile);
          if (localResponse.ok) {
            console.log('Found local audio file in geralt folder:', geraltAudioFile);
            const localBlob = await localResponse.blob();
            this.audioCache[cacheKey] = localBlob;
            return { blob: localBlob, source: "local-geralt-file" };
          }
          
          console.log('Audio file not found in either character or geralt folders');
        } catch (localError) {
          console.error('Error loading local audio:', localError);
        }
        
        // Jika semua gagal, gunakan silent.mp3
        // Coba ambil dari folder character dulu
        let silentResponse = await fetch('/audio/character/silent.mp3');
        
        // Jika tidak ada di character, coba ambil dari geralt
        if (!silentResponse.ok) {
          console.log('Silent audio file not found in character folder, trying geralt folder');
          silentResponse = await fetch('/audio/geralt/silent.mp3');
          
          if (!silentResponse.ok) {
            console.error('Silent audio file not found in either folder');
            return { blob: null, source: "error-no-audio" };
          }
        }
        
        const silentBlob = await silentResponse.blob();
        this.audioCache[cacheKey] = silentBlob;
        return { blob: silentBlob, source: "fallback-silent" };
      }
    } catch (error) {
      console.error('Error loading speech audio:', error);
      // Return null in case of error
      this.audioCache[text] = null;
      return { blob: null, source: "error-exception" };
    }
  }

  public async speakText(text: string, characterVoice: string = 'character'): Promise<boolean> {
    // If already playing, stop first
    if (this.isPlaying) {
      this.stopSpeaking();
    }
    
    // Check for API key - allow both direct API key or server-side marker
    if (!this.apiKey) {
      console.warn("No ElevenLabs API key set. Checking options before proceeding.");
      
      // Check if we have the client-side secret available 
      const secretKey = import.meta.env.VITE_ELEVENLABS_API_KEY || import.meta.env.ELEVENLABS_API_KEY;
      if (secretKey) {
        console.log("API key found in environment, setting now");
        this.setApiKey(secretKey);
      } else {
        // Jika tidak ada client-side, cek server-side
        console.log("No client-side API key found, checking server availability");
        
        try {
          // Cek ketersediaan API key dari server secara sinkron
          const xhr = new XMLHttpRequest();
          xhr.open('GET', '/api/elevenlabs/check-api-key', false); // sinkron request
          xhr.send();
          
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.hasApiKey) {
              console.log("Server has ElevenLabs API key available, using server-side API");
              this.setApiKey("server_api_key_available");
            } else {
              console.error("No API key found on client or server");
              console.log("Will attempt to use cached audio files only");
            }
          }
        } catch (error) {
          console.error("Error checking server API key:", error);
          console.log("Will attempt to use cached audio files as fallback");
        }
      }
    }
    
    // Jika masih tidak ada API key setelah pemeriksaan, kita masih bisa coba menggunakan file cache
    // System akan selalu mencoba menggunakan file yang telah ada terlebih dahulu

    // Cek apakah teks terlalu pendek atau hanya ellipsis
    if (text.trim() === '.....' || text.trim() === '...') {
      console.log("Text is only ellipsis, using silent audio with short duration");
      // Untuk ellipsis, kita bisa menggunakan durasi tetap yang pendek
      
      try {
        // Coba ambil dari folder character dulu
        let silentResponse = await fetch('/audio/character/silent.mp3');
        
        // Jika tidak ada di character, coba ambil dari geralt
        if (!silentResponse.ok) {
          console.log('Silent audio file not found in character folder, trying geralt folder');
          silentResponse = await fetch('/audio/geralt/silent.mp3');
          
          if (!silentResponse.ok) {
            console.error('Silent audio file not found in either folder');
            return false;
          }
        }
        
        const silentBlob = await silentResponse.blob();
        const audioUrl = URL.createObjectURL(silentBlob);
        this.audioElement = new Audio(audioUrl);
        this.audioElement.preload = "auto";
        
        // Set playing status
        this.isPlaying = true;
        
        // Play silent audio
        await this.audioElement.play();
        
        // Wait 1 second then stop for ellipsis
        setTimeout(() => {
          if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
            this.isPlaying = false;
            URL.revokeObjectURL(audioUrl);
          }
        }, 1000);
        
        return true;
      } catch (error) {
        console.error('Failed to play silent audio:', error);
        this.isPlaying = false;
        return false;
      }
    }

    // Add retries for failures
    let retryCount = 0;
    const maxRetries = 2;
    let success = false;
    let lastError = null;
    let audioResult = null;
    
    while (retryCount <= maxRetries && !success) {
      try {
        // Generate speech
        const result = await this.generateSpeech(text, characterVoice);
        audioResult = result;
        
        if (!result || !result.blob) {
          console.warn(`Failed to generate speech (attempt ${retryCount+1}/${maxRetries+1}) for: ${text.substring(0, 30)}...`);
          retryCount++;
          // Short delay before retry
          await new Promise(resolve => setTimeout(resolve, 250));
          continue;
        }
        
        // Log source of audio (cached, backup, or API generated)
        if (result.source) {
          console.log(`Audio source: ${result.source}`);
        }
        
        // Break out of loop if we got a valid audio blob
        break;
      } catch (error) {
        console.error(`Error generating speech (attempt ${retryCount+1}/${maxRetries+1}):`, error);
        lastError = error;
        retryCount++;
        // Short delay before retry
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }
    
    // Check if we successfully got an audio blob after retries
    if (!audioResult || !audioResult.blob) {
      console.error(`Failed to generate speech after ${maxRetries+1} attempts:`, lastError);
      this.isPlaying = false;
      return false;
    }

    // Create audio URL and element
    const audioUrl = URL.createObjectURL(audioResult.blob);
    this.audioElement = new Audio(audioUrl);
    
    // Set audio properties untuk pengalaman yang lebih baik
    this.audioElement.preload = "auto";
    
    // Play audio
    try {
      // Percobaan pemutaran audio
      this.isPlaying = true;
      
      // Tambahkan event listener untuk metadat dan durasi
      this.audioElement.onloadedmetadata = () => {
        if (this.audioElement) {
          const duration = this.audioElement.duration;
          console.log(`Audio duration: ${duration.toFixed(2)} seconds for text: "${text.substring(0, 20)}..."`);
        }
      };
      
      // Gunakan Promise untuk memastikan audio berhasil diputar
      await this.audioElement.play();
      
      // Tambahkan handler untuk audio yang error di tengah pemutaran
      this.audioElement.onerror = (e) => {
        console.error(`Audio playback error:`, e);
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl);
      };
      
      // Clean up when audio ends
      this.audioElement.onended = () => {
        console.log("Audio playback completed successfully");
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
      if (this.audioElement) {
        URL.revokeObjectURL(audioUrl);
        this.audioElement = null;
      }
      return false;
    }
  }

  public stopSpeaking(): void {
    if (this.audioElement) {
      try {
        // Pastikan audio benar-benar berhenti
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        
        // Hapus event handlers untuk mencegah callback terlambat
        this.audioElement.onended = null;
        this.audioElement.onerror = null;
        
        // Revoke object URL jika masih ada
        if (this.audioElement.src.startsWith('blob:')) {
          URL.revokeObjectURL(this.audioElement.src);
        }
        
        // Null-kan audio element untuk memastikan tidak ada referensi yang tertinggal
        this.audioElement = null;
      } catch (error) {
        console.error("Error stopping audio playback:", error);
      }
      
      // Reset status isPlaying
      this.isPlaying = false;
    }
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
  
  // Metode untuk memainkan suara ambient api
  public playAmbientSound(volume: number = 0.08): void {
    if (!this.ambientAudio) {
      this.ambientAudio = new Audio('/audio/ambient_fire.m4a');
      this.ambientAudio.loop = true;
      this.ambientAudio.volume = volume;
      console.log(`Setting ambient audio volume to ${volume}`);
    } else {
      // Update volume if instance already exists
      this.ambientAudio.volume = volume;
      console.log(`Updated ambient audio volume to ${volume}`);
    }
    
    this.ambientAudio.play().catch(error => {
      console.error('Failed to play ambient sound:', error);
    });
  }
  
  // Metode untuk menghentikan suara ambient
  public stopAmbientSound(): void {
    if (this.ambientAudio) {
      this.ambientAudio.pause();
    }
  }
  
  // Menyetel volume suara ambient
  public setAmbientVolume(volume: number): void {
    if (this.ambientAudio) {
      this.ambientAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

export default ElevenLabsService;