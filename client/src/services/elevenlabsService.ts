class ElevenLabsService {
  private static instance: ElevenLabsService;
  private apiKey: string | null = null;
  private isPlaying: boolean = false;
  private audioElement: HTMLAudioElement | null = null;
  
  // Voice ID dari environment variable
  private voiceId: string = import.meta.env.VITE_ELEVENLABS_DEFAULT_VOICE_ID || 'dBynzNhvSFj0l1D7I9yV';
  
  // Cache untuk menyimpan audio yang sudah di-generate
  private audioCache: Record<string, Blob | null> = {};
  
  // Ambient audio untuk latar belakang
  private ambientAudio: HTMLAudioElement | null = null;

  private constructor() {
    // Ambil API key dari environment variable
    const envApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (envApiKey) {
      this.apiKey = envApiKey;
      console.log("Using ElevenLabs API key from environment");
    }
    
    // Log Voice ID yang digunakan
    console.log("Using voice ID:", this.voiceId);
    
    // Pastikan file silent.mp3 tersedia
    this.createSilentAudioIfNeeded();
  }
  
  // Membuat file silent.mp3 jika belum ada
  private async createSilentAudioIfNeeded(): Promise<void> {
    const silentAudioPath = '/audio/character/silent.mp3';
    
    try {
      const response = await fetch(silentAudioPath, { method: 'HEAD' });
      if (!response.ok) {
        console.log("Silent audio file not found, will create on demand");
      }
    } catch (error) {
      // Error log removed
    }
  }
  
  // Buat hash sederhana dari teks untuk digunakan sebagai id file audio
  private generateSimpleHash(text: string): string {
    // Hash generator yang sama dengan yang digunakan di server
    // Tidak memodifikasi text input apapun - pastikan 100% sama
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
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

  public async generateSpeech(text: string): Promise<Blob | null> {
    try {
      // Jika ini adalah teks kosong atau HANYA ellipsis, gunakan silent.mp3
      const trimmedText = text.trim();
      if (trimmedText === '.....' || trimmedText === '...' || trimmedText === '') {
        console.log("Using silent audio for:", text);
        
        // Coba ambil dari folder character
        let response = await fetch('/audio/character/silent.mp3');
        
        if (!response.ok) {
          // Error log removed
          return null;
        }
        
        const audioBlob = await response.blob();
        this.audioCache[text] = audioBlob;
        return audioBlob;
      }
      
      // Buat cache key berdasarkan text original
      const cacheKey = text;
      
      // Cek apakah audio sudah ada di cache memory
      if (this.audioCache[cacheKey]) {
        console.log("Using in-memory cached audio for:", text.substring(0, 20) + "...");
        return this.audioCache[cacheKey];
      }
      
      // Cek apakah file audio sudah ada di cache file system dengan mencoba mengakses file langsung
      // menggunakan hash yang sama seperti di server
      const hash = this.generateSimpleHash(text);
      const cachedFilePath = `/audio/character/dialog_${hash}.mp3`;
      
      try {
        // Coba akses file terlebih dahulu sebelum mengirim request ke server
        const cachedResponse = await fetch(cachedFilePath, { method: 'HEAD' });
        if (cachedResponse.ok) {
          console.log("Directly accessing cached file from file system:", cachedFilePath);
          const audioResponse = await fetch(cachedFilePath);
          if (audioResponse.ok) {
            const audioBlob = await audioResponse.blob();
            this.audioCache[cacheKey] = audioBlob;
            return audioBlob;
          }
        }
      } catch (error) {
        // Ignore error and continue with server request
        console.log("Cached file not found in file system, continuing with server request");
      }
      
      // Untuk teks seperti "...You got a name?", kita perlu perlakuan khusus
      // untuk mengurangi delay/jeda yang tidak diinginkan di awal
      let isStartingWithEllipsis = false;
      
      // Deteksi pola khusus '...' di awal teks yang diikuti konten bermakna
      if (trimmedText.startsWith('...') && trimmedText.length > 3 && !trimmedText.startsWith('.....')) {
        // Tambahkan indikasi ke server bahwa ini adalah kasus spesial
        isStartingWithEllipsis = true;
        console.log("Detected text starting with ellipsis:", text);
      }
      
      console.log("Generating speech for exact text:", text);
      
      // Gunakan endpoint server untuk generate speech
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/elevenlabs?action=text-to-speech' 
        : '/api/elevenlabs/text-to-speech';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          voice_id: this.voiceId,
          model_id: 'eleven_multilingual_v2',
          starts_with_ellipsis: isStartingWithEllipsis // Kirim penanda ke server
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error generating speech:", errorData);
        return null;
      }
      
      // Dapatkan response JSON yang berisi path ke file audio
      const result = await response.json();
      
      if (result.success) {
        // Handle both file path and base64 data URL
        if (result.audioPath.startsWith('data:audio/')) {
          // Base64 data URL from serverless function
          const response = await fetch(result.audioPath);
          const audioBlob = await response.blob();
          this.audioCache[cacheKey] = audioBlob;
          return audioBlob;
        } else {
          // File path from cached audio
          const audioResponse = await fetch(result.audioPath);
          if (audioResponse.ok) {
            const audioBlob = await audioResponse.blob();
            this.audioCache[cacheKey] = audioBlob;
            return audioBlob;
          }
        }
      }
      
      // Silently handle audio blob failure
      return null;
    } catch (error) {
      console.error("Error in generateSpeech:", error);
      return null;
    }
  }

  public async speakText(text: string): Promise<boolean> {
    // If already playing, stop first
    if (this.isPlaying) {
      this.stopSpeaking();
    }

    // Cek apakah teks terlalu pendek atau hanya ellipsis tanpa kata-kata lain
    const trimmedText = text.trim();
    if (trimmedText === '.....' || trimmedText === '...' || trimmedText === '') {
      console.log("Text is only ellipsis, using silent audio");
      return false; // Indikasi bahwa tidak ada audio sebenarnya yang dimainkan
    }

    // Generate speech
    const audioBlob = await this.generateSpeech(text);
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
      
      // Tambahkan event listener untuk metadata dan durasi
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
        // Error log removed
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
      // Error log removed
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
        // Error log removed
      }
      
      // Reset status isPlaying
      this.isPlaying = false;
    }
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  // Method untuk mengecek apakah audio sedang di-mute
  public isMuted(): boolean {
    return !this.apiKey || this.apiKey === "";
  }
  
  // Metode untuk memainkan suara ambient api dengan volume lebih rendah
  public playAmbientSound(volume: number = 0.1): void {
    if (!this.ambientAudio) {
      this.ambientAudio = new Audio('/assets/fireplace-ambient.m4a');
      this.ambientAudio.loop = true;
      this.ambientAudio.volume = volume; // Default lebih rendah
    } else {
      // Update volume if it was already created
      this.ambientAudio.volume = volume;
    }
    
    this.ambientAudio.play().catch(error => {
      // Error log removed
    });
  }
  
  // Metode untuk menghentikan suara ambient
  public stopAmbientSound(): void {
    if (this.ambientAudio) {
      this.ambientAudio.pause();
    }
  }
  
  // Menyetel volume suara ambient dengan transisi yang halus untuk proximity
  public setAmbientVolume(volume: number): void {
    if (this.ambientAudio) {
      // Membatasi volume maksimum lebih rendah dari sebelumnya
      const targetVolume = Math.max(0, Math.min(0.3, volume));
      
      // Menggunakan transisi volume yang halus dengan setTimeout
      const currentVolume = this.ambientAudio.volume;
      const volumeDiff = targetVolume - currentVolume;
      const steps = 10;
      const stepSize = volumeDiff / steps;
      
      // Buat transisi volume dalam 10 langkah selama 300ms
      for (let i = 0; i <= steps; i++) {
        setTimeout(() => {
          if (this.ambientAudio) {
            this.ambientAudio.volume = currentVolume + (stepSize * i);
          }
        }, 30 * i);
      }
    }
  }
}

export default ElevenLabsService;