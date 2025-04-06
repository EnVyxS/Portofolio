import DialogModel, { Dialog, RETURN_DIALOG } from '../models/dialogModel';
import ElevenLabsService from '../services/elevenlabsService';
import HoverDialogController from './hoverDialogController';
import { CONTRACT_RESPONSES } from '../components/ContractCard';

class DialogController {
  private static instance: DialogController;
  private dialogModel: DialogModel;
  private elevenlabsService: ElevenLabsService;
  private typingSpeed: number = 50; // ms per character
  private isTyping: boolean = false;
  private typewriterCallback: ((text: string, isComplete: boolean) => void) | null = null;
  private currentText: string = '';
  private fullText: string = '';
  private charIndex: number = 0;
  private typingInterval: NodeJS.Timeout | null = null;
  private isPostResetDialog: boolean = false; // Melacak apakah dialog khusus setelah reset sedang aktif

  private constructor() {
    this.dialogModel = DialogModel.getInstance();
    this.elevenlabsService = ElevenLabsService.getInstance();
  }

  public static getInstance(): DialogController {
    if (!DialogController.instance) {
      DialogController.instance = new DialogController();
    }
    return DialogController.instance;
  }

  public setElevenLabsApiKey(key: string): void {
    this.elevenlabsService.setApiKey(key);
  }

  public getCurrentDialog(): Dialog | undefined {
    return this.dialogModel.getCurrentDialog();
  }

  public nextDialog(callback: (text: string, isComplete: boolean) => void): void {
    // Stop previous typing
    this.stopTyping();
    
    // Get next dialog
    const nextDialog = this.dialogModel.nextDialog();
    if (nextDialog) {
      this.typeDialog(nextDialog, callback);
    } else {
      // No more dialogs - daripada mengirim teks kosong, kita gunakan dialog terakhir
      // Ini akan membuat teks dan tombol tetap terlihat
      const currentDialog = this.dialogModel.getCurrentDialog();
      if (currentDialog) {
        // Tandai sebagai complete agar tombol NEXT tetap terlihat
        callback(currentDialog.text, true);
      } else {
        // Jika tak ada dialog sama sekali, kembalikan teks placeholder
        callback('Journey concluded.', true);
      }
    }
  }

  public previousDialog(callback: (text: string, isComplete: boolean) => void): void {
    // Stop previous typing
    this.stopTyping();
    
    // Get previous dialog
    const prevDialog = this.dialogModel.previousDialog();
    if (prevDialog) {
      this.typeDialog(prevDialog, callback);
    } else {
      // Already at the first dialog - restart current dialog
      const currentDialog = this.dialogModel.getCurrentDialog();
      if (currentDialog) {
        this.typeDialog(currentDialog, callback);
      }
    }
  }

  public startDialog(callback: (text: string, isComplete: boolean) => void): void {
    // Reset dialog to beginning
    this.dialogModel.resetDialog();
    
    // Get first dialog
    const dialog = this.dialogModel.getCurrentDialog();
    if (dialog) {
      this.typeDialog(dialog, callback);
    }
  }

  private async typeDialog(dialog: Dialog, callback: (text: string, isComplete: boolean) => void): Promise<void> {
    this.fullText = dialog.text;
    this.currentText = '';
    this.charIndex = 0;
    this.typewriterCallback = callback;
    this.isTyping = true;
    
    // Catat waktu mulai untuk melacak kinerja
    const startTime = Date.now();
    
    // Deteksi apakah dialog harus persistent berdasarkan konten dialog
    if (dialog.persistent === undefined) {
      // Deteksi berdasarkan dialog content (pertanyaan atau tidak)
      dialog.persistent = dialog.text.includes('?');
    }
    
    // Cek apakah dialog ini adalah respons kontrak dari teks pengecekan
    const isContractResponse = dialog.text.includes("real qualifications") || 
                            dialog.text.includes("I'm the real deal") ||
                            dialog.text.includes("answer your questions about my background") ||
                            dialog.text.includes("Now you've seen the proof") ||
                            dialog.text.includes("I've never lied to you");
    
    // Cek juga dari flag global untuk dialog kontrak yang diatur oleh ContractCard.tsx
    // @ts-ignore - akses properti global dari window
    const isContractDialogActive = window.__contractDialogActive === true;
    
    // Variable gabungan untuk pengecekan kontrak
    const isContractRelated = isContractResponse || isContractDialogActive;
    
    // Perkiraan durasi dialog berdasarkan panjang teks
    // Rata-rata pembacaan 12 karakter per detik (standar untuk bahasa Inggris - lebih lambat untuk DIVA JUAN)
    const estimatedDuration = Math.max(3000, (dialog.text.length / 10) * 1000); 
    
    // Try to speak the text if voice is enabled - menggunakan text asli tanpa modifikasi
    let audioStarted = false;
    let audioDuration = 0;
    
    if (this.elevenlabsService.getApiKey()) {
      // Pastikan teks yang dikirim ke speech generator 100% sama dengan yang ditampilkan
      const exactDialogText = dialog.text;
      console.log("Generating speech for exact text:", exactDialogText);
      
      // Untuk respons kontrak, tambahkan event listener ke audioElement untuk mendapatkan durasi sebenarnya
      const audioElement = document.getElementById('audio-element') as HTMLAudioElement;
      if (audioElement && isContractResponse) {
        // Tambahkan event listener untuk metadata dan ambil durasi audio yang benar
        const originalOnLoadedMetadata = audioElement.onloadedmetadata;
        audioElement.onloadedmetadata = (e) => {
          audioDuration = audioElement.duration * 1000; // konversi ke ms
          console.log(`[DialogController] Audio actual duration for contract response: ${audioDuration}ms`);
          
          // Panggil handler asli jika ada
          if (originalOnLoadedMetadata) {
            // @ts-ignore
            originalOnLoadedMetadata(e);
          }
        };
      }
      
      audioStarted = await this.elevenlabsService.speakText(exactDialogText);
    }
    
    // Tunggu sedikit untuk memastikan audioDuration sudah terisi jika ada
    if (isContractRelated && audioStarted) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Untuk respons kontrak, gunakan durasi audio yang lebih akurat
    // Jika kontrak, kita kurangi typing speed untuk membuatnya lebih lambat supaya tampilan teks 
    // selesai bersamaan dengan audio (tidak selesai duluan)
    let actualTypingSpeed = this.typingSpeed;
    
    // Sesuaikan kecepatan typing dengan durasi audio
    if (audioStarted) {
      // Jika audio berhasil diputar, kita perlu kecepatan ketik yang sesuai dengan durasi audio
      // Coba dapatkan durasi dari elevenlabsService langsung
      audioDuration = this.elevenlabsService.getAudioDuration();
      
      if (audioDuration === 0) {
        // Fallback ke audio element yang ada di DOM jika perlu
        const audioElement = document.getElementById('audio-element') as HTMLAudioElement;
        if (audioElement && audioElement.duration) {
          audioDuration = audioElement.duration * 1000; // Dalam milidetik
        }
      }
      
      console.log(`[DialogController] Audio duration detected: ${audioDuration}ms for contract response`);

      // Gunakan durasi audio sebenarnya jika tersedia, jika tidak gunakan estimasi
      const typingDuration = audioDuration > 0 ? audioDuration : estimatedDuration;
      
      // Hitung jumlah karakter efektif untuk perhitungan kecepatan ketik
      // Berikan bobot lebih pada karakter seperti ellipsis yang membutuhkan delay visual lebih lama
      let effectiveLength = this.fullText.length;
      
      // Berikan bobot tambahan untuk teks yang mengandung banyak ellipsis atau simbol khusus
      if (this.fullText.includes('...')) {
        // Setiap ellipsis menambah 5 karakter "virtual" untuk perhitungan kecepatan
        const ellipsisCount = (this.fullText.match(/\.\.\./g) || []).length;
        effectiveLength += ellipsisCount * 5;
      }
      
      // Perlihatkan dialog lebih perlahan jika sangat pendek untuk mencegah dialog sangat cepat berakhir
      if (effectiveLength < 20) {
        effectiveLength = effectiveLength * 1.5;
      }
      
      // Hitung kecepatan ketik optimal untuk selesai tepat saat audio selesai
      // Untuk semua dialog audio, kita ingin menampilkan teks sedikit lebih lambat untuk selesai bersamaan audio
      if (isContractRelated) {
        // Jika ini respon kontrak atau flag kontrak aktif, kita ingin typing selesai tepat saat audio selesai
        actualTypingSpeed = Math.max(25, typingDuration / effectiveLength);
        console.log(`[DialogController] CONTRACT RESPONSE - typingSpeed diatur ke ${Math.round(actualTypingSpeed)}ms per karakter`);
      } else {
        // Untuk dialog normal dengan audio, tetap sinkronkan dengan durasi audio
        // tetapi gunakan batas minimum dan maksimum untuk kecepatan yang wajar
        const calculatedSpeed = typingDuration / effectiveLength;
        actualTypingSpeed = Math.max(20, Math.min(60, calculatedSpeed));
        
        console.log(`[DialogController] Durasi audio: ${Math.round(typingDuration)}ms, karakter: ${effectiveLength}, kecepatan: ${Math.round(actualTypingSpeed)}ms`);
      }
    }
    
    console.log(`Autoplay untuk dialog ${dialog.id} dalam ${Math.round(audioDuration || estimatedDuration)}ms (${dialog.persistent ? 'persistent' : 'non-persistent'})`);
    
    // Tambahkan variabel timeout untuk memastikan dialog tidak terhenti
    let audioCompletionTimer: NodeJS.Timeout | null = null;
    
    // Jika audio berhasil diputar, gunakan timer untuk memastikan dialog selesai
    if (audioStarted) {
      // Gunakan durasi audio sebenarnya ditambah buffer untuk memastikan typing selesai dengan benar
      const bufferTime = isContractRelated ? 500 : 1000; // Buffer lebih pendek untuk respons kontrak
      const completionTimeout = (audioDuration > 0 ? audioDuration : estimatedDuration) + bufferTime;
      
      audioCompletionTimer = setTimeout(() => {
        if (this.isTyping) {
          console.log("Audio completion timer triggered - finishing dialog typing");
          this.skipToFullText();
        }
      }, completionTimeout);
    }
    
    // Start typewriter effect with adjusted typing speed
    this.typingInterval = setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.currentText += this.fullText[this.charIndex];
        this.charIndex++;
        if (this.typewriterCallback) {
          this.typewriterCallback(this.currentText, false);
        }
      } else {
        // Typing complete
        this.isTyping = false;
        clearInterval(this.typingInterval as NodeJS.Timeout);
        this.typingInterval = null;
        
        // Clear audio completion timer jika masih ada
        if (audioCompletionTimer) {
          clearTimeout(audioCompletionTimer);
          audioCompletionTimer = null;
        }
        
        if (this.typewriterCallback) {
          this.typewriterCallback(this.currentText, true);
          
          // Hitung dan tampilkan waktu yang diperlukan untuk typewriting
          const endTime = Date.now();
          const typingDuration = endTime - startTime;
          console.log(`[Performa] Dialog typing selesai dalam ${typingDuration}ms (${this.fullText.length} karakter)`);
          
          // Jika audio diputar, bandingkan dengan durasi audio
          if (audioStarted && audioDuration > 0) {
            const diff = Math.abs(typingDuration - audioDuration);
            const syncQuality = diff < 500 ? "Bagus" : diff < 1000 ? "Cukup" : "Perlu Perbaikan";
            console.log(`[Sinkronisasi] Audio: ${Math.round(audioDuration)}ms, Typing: ${Math.round(typingDuration)}ms, Selisih: ${Math.round(diff)}ms - ${syncQuality}`);
          }
        }
      }
    }, actualTypingSpeed);
  }

  public stopTyping(): void {
    this.isTyping = false;
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    this.elevenlabsService.stopSpeaking();
  }

  public skipToFullText(): void {
    // Hentikan typewriter effect
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    
    // Hentikan audio yang sedang berjalan
    this.elevenlabsService.stopSpeaking();
    
    // Set fullText untuk ditampilkan langsung
    this.currentText = this.fullText;
    this.isTyping = false;
    
    // Memberitahu callback bahwa dialog sekarang complete
    if (this.typewriterCallback) {
      this.typewriterCallback(this.fullText, true);
    }
  }

  public isCurrentlyTyping(): boolean {
    return this.isTyping;
  }
  
  // Cek apakah audio sedang diproses
  public isAudioProcessing(): boolean {
    try {
      return this.elevenlabsService.isCurrentlyPlaying();
    } catch (e) {
      console.error("Error checking if audio is processing:", e);
      return false;
    }
  }
  
  // Method khusus untuk menampilkan dialog timeout/idle
  // Tambahkan parameter customTypingSpeed untuk mendukung pengetikan yang lebih cepat
  public showCustomDialog(
    text: string, 
    callback: (text: string, isComplete: boolean) => void,
    customTypingSpeed?: number // Parameter opsional untuk kecepatan ketik kustom
  ): void {
    // Hentikan dialog yang sedang berjalan
    this.stopTyping();
    
    // Log untuk debugging
    console.log(`[DialogController] Memulai dialog custom: "${text}"`);
    
    // Kurangi delay untuk respons yang lebih cepat
    setTimeout(() => {
      // Pastikan audio benar-benar berhenti
      this.elevenlabsService.stopSpeaking();
      
      // Buat dialog custom
      const customDialog: Dialog = {
        id: 9999, // ID khusus untuk dialog timeout
        text: text,
        character: "DIVA JUAN NUR TAQARRUB", // Karakter untuk dialog timeout/idle
        persistent: false // Set persistent ke false untuk memastikan dialog ditampilkan dengan benar
      };
      
      // Periksa tipe dialog berdasarkan teksnya
      try {
        // Import HoverDialogController jika belum diimport
        const hoverDialogController = HoverDialogController.getInstance();
        
        // Update identifikasi kontrak dialog berdasarkan teks baru
        const isFromContract = text.includes("I've never lied to you") || 
                             text.includes("Now you've seen the proof") || 
                             text.includes("real qualifications") || 
                             text.includes("answer your questions about my background") ||
                             text.includes("I'm the real deal");
                             
        const isIdleWarning = text.includes("distracted") || 
                             text.includes("paying attention") || 
                             text.includes("Staring at me") || 
                             text.includes("fuck you") ||
                             text.includes("throw") ||
                             text.includes("punch");
        
        // Khusus untuk CONTRACT_RESPONSES, log tambahan
        if (isFromContract) {
          console.log("[DialogController] Showing CONTRACT_RESPONSE dialog:", text);
          // Tandai ini sebagai dialog kontrak dengan persistent false
          customDialog.persistent = false;
        }
        
        // Semua dialog khusus (CONTRACT_RESPONSES, IDLE_DIALOGS, punchText, throwText)
        // harus selalu ditampilkan di dialogBox utama sebagai 'main'
        if (hoverDialogController.setDialogSource) {
          // Semua dialog khusus ditampilkan sebagai 'main' untuk memastikan muncul di dialog box utama
          console.log("[DialogController] Setting dialog source to 'main' for custom dialog");
          hoverDialogController.setDialogSource('main');
          
          // Reset status dialog interaksi untuk hover controller
          hoverDialogController.setHasInteractedWithHover(false);
        }
      } catch (e) {
        console.error("[DialogController] Error checking/setting dialog source:", e);
      }
      
      // Simpan kecepatan ketik asli
      const originalTypingSpeed = this.typingSpeed;
      
      // Setel kecepatan pengetikan khusus jika disediakan
      if (customTypingSpeed !== undefined) {
        this.typingSpeed = customTypingSpeed;
      }
      
      // Gunakan callback sementara untuk memastikan dialog source tetap correct
      // dan untuk menerapkan pemantauan performa serta penyesuaian kecepatan typing
      const wrappedCallback = (text: string, isComplete: boolean) => {
        // Log tambahan untuk debugging
        console.log(`[DialogController] Custom dialog callback - Text: "${text.substring(0, 20)}..." isComplete: ${isComplete}`);
        
        // Pantau apakah ini adalah respons kontrak berdasarkan isi teks
        const isContractResponse = text.includes("I've never lied to you") || 
                                  text.includes("seen the proof") ||
                                  text.includes("real qualifications") ||
                                  text.includes("answer your questions about my background") ||
                                  text.includes("I'm the real deal");
                                
        // Panggil callback asli
        callback(text, isComplete);
        
        // Kembalikan kecepatan ketik ke nilai asli jika pengetikan sudah selesai
        if (isComplete && customTypingSpeed !== undefined) {
          this.typingSpeed = originalTypingSpeed;
        }
      };
      
      // Untuk dialog kustom (terutama CONTRACT_RESPONSES), kita ingin memastikan bahwa
      // kecepatan ketik disesuaikan dengan audio yang akan dihasilkan
      // sehingga teks selesai tepat saat audio selesai.
      // Meskipun parameter customTypingSpeed disediakan, kita akan override jika perlu
      // berdasarkan durasi audio sebenarnya.
      
      // Tampilkan dialog custom dengan kecepatan ketik yang akan otomatis disesuaikan
      // oleh typeDialog berdasarkan durasi audio sebenarnya
      this.typeDialog(customDialog, wrappedCallback);
    }, 50); // Kurangi delay dari 300ms menjadi 50ms untuk respons yang lebih cepat
  }
  
  // Method khusus untuk menampilkan dialog setelah user dilempar dan kemudian kembali
  public showReturnDialog(callback: (text: string, isComplete: boolean) => void): void {
    // Hentikan dialog yang sedang berjalan
    this.stopTyping();
    
    // Tunggu sebentar untuk memastikan audio sebelumnya sudah selesai
    setTimeout(() => {
      // Pastikan audio benar-benar berhenti
      this.elevenlabsService.stopSpeaking();
      
      // Reset dialog model ke awal agar sequence selanjutnya normal
      this.dialogModel.resetDialog();
      
      // Tandai bahwa ini adalah dialog khusus setelah reset
      this.isPostResetDialog = true;
      
      // Tampilkan dialog return yang sudah didefinisikan
      this.typeDialog(RETURN_DIALOG, callback);
      
      console.log("Showing return dialog after reset:", RETURN_DIALOG.text);
    }, 300); // Delay 300ms untuk menghindari tumpang tindih audio
  }
  
  // Getter untuk memeriksa apakah ini adalah dialog setelah reset
  public isShowingPostResetDialog(): boolean {
    return this.isPostResetDialog;
  }
  
  // Method untuk mereset status dialog setelah reset
  public resetPostResetDialogStatus(): void {
    this.isPostResetDialog = false;
  }
  
  // Method untuk mengakses dialog model
  public getDialogModel(): DialogModel {
    return this.dialogModel;
  }
}

export default DialogController;