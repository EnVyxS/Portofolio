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
  
  // Inisialisasi hash dialog untuk semua dialog yang mungkin
  private initializeDialogHashes(): void {
    // Dialog dari Geralt yang mungkin muncul (dari dialogModel.ts dan history ElevenLabs)
    const possibleDialogs = [
      // Main Dialog dari dialogModel.ts
      "...Didn't ask for company.",
      "Fire's warm... Always brings strays....",
      "Haahhhh... You need something or are you just here to waste my time?",
      ".....",
      "Curiosity?... Hmph... Doesn't pay the bills...",
      "Pfftt... Waiting... Drinking... What else is there?",
      "A job?.., A way out?.., Some miracle?..",
      "Heh... Yeah, real fucking hilarious, isn't it?",
      "...You got a name?",
      "Hm. Not that it matters,",
      "Diva Juan Nur Taqarrub , , Call me what you want. Doesn't do shit,",
      "Hmm... Why.. am I even here?..",
      "Anything that keeps me breathing,",
      "Hunting work's like hunting a ghost. No signs, no tracks, just hope and a headache,",
      "Graduated. Computer Science. 2024,",
      "Yeah... Cum laude. Thought it'd mean something.. Turns out it's worth less than a stiff drink,",
      "Backend. Java. Databases. Know my way around. Not that anyone cares,",
      "Made a game for my thesis. Thought it'd mean something. It didn't,",
      "Editing too. Years of it. Doesn't put food on the table,",
      "Vegas Pro. After Effects. Cut, stitch, fix. Life's not that simple,",
      "SQL... PostgreSQL... MySQL... Data's just numbers. Like debts. Like failures,",
      "Used to like puzzles. Now? Just another thing that doesn't pay,",
      "...Leaving this place?",
      "Huhhhh... Like that's so easy,",
      "Go where? With what? Got coin to spare?,",
      "Nothing's free... Not even dreams,",
      "But if the pay's right… maybe,",
      "For now? I drink. Sit. Hope the fire lasts longer than the night,",
      "Hmph... You fight... you bleed... you try...,",
      "And in the end, still nothing,",
      "...Enough about me",
      "What do you want?..",
      "Talk... You got a job, or just wasting my time?..",
      
      // HoverDialogController dialog options
      "Hmph... In a rush, are we? Fine. Tell me what you need done.",
      "Can't wait till I'm done talking? Fine. What do you want?",
      "Interrupting me? Rude. But I'm listening.",
      "Not even letting me finish? Fine, what's the contract?",
      "Hmm. Impatient, aren't you? What is it?",
      "Not listening, huh? Fine. Decide after you've checked.",
      "My story's boring you? Go on then, look elsewhere.",
      "Hmm. Distracted already? Go ahead, check it out.",
      "Prefer looking around than listening? Your choice.",
      "Lost interest so quickly? Whatever. Go look.",
      "Straight to the point—I like that. Fine. Give me the contract.",
      "Business it is then. What's the job?",
      "Contract details? Let's hear it.",
      "Talk business. I'm listening.",
      "Hmm. Cutting to the chase. Good.",
      "Need to check first before deciding? Fine. Not like I'm in a hurry.",
      "Want to know more about me first? Suit yourself.",
      "Curious about my past work? Take a look.",
      "Checking my credentials? Smart. Not that I care.",
      "Due diligence, huh? Look all you want.",
      "Took your time, didn't you? Fine. Hand me the damn contract.",
      "Done looking? Ready for business now?",
      "Satisfied with what you found? Let's talk work.",
      "Seen enough? What's the job then?",
      "Research complete? Let's hear about the contract.",
      "Fine. Go ahead, check it first.",
      "Having second thoughts? Look around then.",
      "Changed your mind? Go on, look me up.",
      "Not convinced yet? See for yourself.",
      "Hmm. Still uncertain? Check my background.",
      "Make up your mind. I don't have all day.",
      "Hmm. This back and forth is getting irritating.",
      "Decide already. Contract or not?",
      "Getting annoyed with the indecision here.",
      "Arghh... whatever you want. I'm done.",
      "That's it. I'm done with this nonsense.",
      "Enough of this. Make a choice or leave me be.",
      "*sighs deeply* I've lost my patience. We're done here.",
      "I'm through with this game. Decide or go away.",
      
      // IdleTimeoutController dialog options
      "What the hell are you staring at?.. Got something to say!?",
      "You really gonna keep ignoring me? I'm not in the mood for this.",
      "You think this is funny?.. Staring at me for nine damn minutes?.. Fuck you!!",
      "Now what, you little filth!?..",
      "Hmph... Finally, you decide to move... Suit yourself. You want to check it or just get on with signing the damn contract?",
      "So this is how it is? You think you can play me for a fool?",
      "ENOUGH",
      "That's it. GET OUT OF MY SIGHT!",
      "You're really asking for it..."
    ];
    
    // Dialog dari history ElevenLabs yang sudah terlihat ada di gambar
    // (history terlihat di screenshot yang dikirimkan)
    const elevenlabsHistoryDialogs = [
      "Vegas Pro. After Effects. Cut, stitch, fix. Life's not that simple,",
      "Used to like puzzles. Now? Just another thing that doesn't pay,",
      "Graduated. Computer Science. 2024,",
      "Heh... Yeah, real fucking hilarious, isn't it?",
      "Nothing's free... Not even dreams,",
      "Go where? With what? Got coin to spare?,"
    ];
    
    // Gabungkan semua dialog yang mungkin (hapus duplikat dengan cara manual)
    const allPossibleDialogs: string[] = [];
    
    // Tambahkan dialog dari possibleDialogs
    possibleDialogs.forEach(dialog => {
      if (!allPossibleDialogs.includes(dialog)) {
        allPossibleDialogs.push(dialog);
      }
    });
    
    // Tambahkan dialog dari elevenlabsHistoryDialogs
    elevenlabsHistoryDialogs.forEach(dialog => {
      if (!allPossibleDialogs.includes(dialog)) {
        allPossibleDialogs.push(dialog);
      }
    });
    
    // Generate hash for each dialog
    allPossibleDialogs.forEach(text => {
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

  public async generateSpeech(text: string, characterVoice: string = 'character'): Promise<Blob | null> {
    try {
      // Buat cache key berdasarkan text
      const cacheKey = text;
      
      // Cek apakah audio sudah ada di cache memory
      if (cacheKey in this.audioCache) {
        console.log("Using in-memory cached audio for:", text.substring(0, 20) + "...");
        const cachedBlob = this.audioCache[cacheKey];
        return cachedBlob;
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
            return null;
          }
        }
        
        const audioBlob = await response.blob();
        this.audioCache[cacheKey] = audioBlob;
        return audioBlob;
      }
      
      // Untuk teks normal, gunakan endpoint server yang akan melakukan:
      // 1. Memeriksa jika file ada di sistem file lokal
      // 2. Jika tidak, generate menggunakan ElevenLabs API dan simpan
      try {
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
              return null;
            }
          }
          
          const silentBlob = await silentResponse.blob();
          this.audioCache[cacheKey] = silentBlob;
          return silentBlob;
        }
        
        // Dapatkan response JSON yang berisi path ke file audio
        const result = await response.json();
        
        if (result.success) {
          // Jika berhasil, ambil file audio dari path yang diberikan
          const audioResponse = await fetch(result.audioPath);
          if (audioResponse.ok) {
            const audioBlob = await audioResponse.blob();
            this.audioCache[cacheKey] = audioBlob;
            return audioBlob;
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
            return null;
          }
        }
        
        const fallbackBlob = await fallbackResponse.blob();
        this.audioCache[cacheKey] = fallbackBlob;
        return fallbackBlob;
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
            return localBlob;
          }
          
          // Coba cari di folder geralt jika tidak ada di character
          localResponse = await fetch(geraltAudioFile);
          if (localResponse.ok) {
            console.log('Found local audio file in geralt folder:', geraltAudioFile);
            const localBlob = await localResponse.blob();
            this.audioCache[cacheKey] = localBlob;
            return localBlob;
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
            return null;
          }
        }
        
        const silentBlob = await silentResponse.blob();
        this.audioCache[cacheKey] = silentBlob;
        return silentBlob;
      }
    } catch (error) {
      console.error('Error loading speech audio:', error);
      // Return null in case of error
      this.audioCache[text] = null;
      return null;
    }
  }

  public async speakText(text: string, characterVoice: string = 'character'): Promise<boolean> {
    // If already playing, stop first
    if (this.isPlaying) {
      this.stopSpeaking();
    }

    // Cek apakah teks terlalu pendek atau hanya ellipsis
    if (text.trim() === '.....' || text.trim() === '...') {
      console.log("Text is only ellipsis, using silent audio with short duration");
      // Untuk ellipsis, kita bisa menggunakan durasi tetap yang pendek
      return false; // Indikasi bahwa tidak ada audio sebenarnya yang dimainkan
    }

    // Generate speech
    const audioBlob = await this.generateSpeech(text, characterVoice);
    if (!audioBlob) {
      console.log("Failed to generate speech, no audio will be played");
      return false;
    }

    // Create audio URL and element
    const audioUrl = URL.createObjectURL(audioBlob);
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
  public playAmbientSound(volume: number = 0.2): void {
    if (!this.ambientAudio) {
      this.ambientAudio = new Audio('/audio/ambient_fire.m4a');
      this.ambientAudio.loop = true;
      this.ambientAudio.volume = volume;
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