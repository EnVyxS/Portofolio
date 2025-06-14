import DialogModel, { Dialog, RETURN_DIALOG } from '../models/dialogModel';
import ElevenLabsService from '../services/elevenlabsService';
import HoverDialogController from './hoverDialogController';
import { CONTRACT_RESPONSES } from '../components/ContractCard';
import AchievementController from './achievementController';

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
  private dialogInterrupted: boolean = false; // Melacak apakah dialog diinterupsi oleh user
  private dialogsVisited: Set<number> = new Set(); // Melacak dialog yang telah dikunjungi
  private totalDialogCount: number = 0; // Total jumlah dialog yang harus dikunjungi

  private constructor() {
    this.dialogModel = DialogModel.getInstance();
    this.elevenlabsService = ElevenLabsService.getInstance();
    
    // Hitung total jumlah dialog yang tersedia
    this.calculateTotalDialogs();
  }
  
  // Hitung total jumlah dialog yang tersedia di DialogModel
  private calculateTotalDialogs(): void {
    const allDialogs = this.dialogModel.getAllDialogs();
    if (allDialogs && allDialogs.length > 0) {
      this.totalDialogCount = allDialogs.length;
      console.log(`[DialogController] Total dialog count: ${this.totalDialogCount}`);
    }
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
    
    // Reset dialog interrupt status and visited dialogs for new session
    this.resetDialogInterruption();
    this.dialogsVisited.clear();
    console.log(`[DialogController] Starting new dialog session. Achievement tracking reset.`);
    
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
    
    // Deteksi apakah dialog harus persistent berdasarkan konten dialog
    if (dialog.persistent === undefined) {
      // Deteksi berdasarkan dialog content (pertanyaan atau tidak)
      dialog.persistent = dialog.text.includes('?');
    }
    
    // Perkiraan durasi dialog berdasarkan panjang teks
    // Rata-rata pembacaan 12 karakter per detik (standar untuk bahasa Inggris - lebih lambat untuk DIVA JUAN)
    const estimatedDuration = Math.max(3000, (dialog.text.length / 10) * 1000); 
    
    // Try to speak the text if voice is enabled - menggunakan text asli tanpa modifikasi
    let audioStarted = false;
    if (this.elevenlabsService.getApiKey()) {
      // Pastikan teks yang dikirim ke speech generator 100% sama dengan yang ditampilkan
      const exactDialogText = dialog.text;
      console.log("Generating speech for exact text:", exactDialogText);
      audioStarted = await this.elevenlabsService.speakText(exactDialogText);
    }
    
    // Sesuaikan kecepatan typing dengan durasi audio
    // Jika audio berhasil diputar, kita akan menyelesaikan typing sedikit lebih lambat dari durasi audio
    const typingDuration = audioStarted ? estimatedDuration : (dialog.text.length * this.typingSpeed);
    
    // Untuk dialog panjang, gunakan kecepatan typing lebih cepat
    // Untuk dialog pendek, gunakan kecepatan typing lebih lambat
    const typingSpeed = audioStarted 
      ? Math.max(20, Math.min(50, typingDuration / dialog.text.length)) 
      : this.typingSpeed;
    
    console.log(`Autoplay untuk dialog ${dialog.id} dalam ${Math.round(typingDuration)}ms (${dialog.persistent ? 'persistent' : 'non-persistent'})`);
    
    // Tambahkan variabel timeout untuk memastikan dialog tidak terhenti
    let audioCompletionTimer: NodeJS.Timeout | null = null;
    
    // Jika audio berhasil diputar, gunakan timer untuk memastikan dialog selesai
    if (audioStarted) {
      // Tambahkan buffer 500ms untuk memastikan audio benar-benar selesai
      audioCompletionTimer = setTimeout(() => {
        if (this.isTyping) {
          console.log("Audio completion timer triggered - finishing dialog typing");
          this.skipToFullText();
        }
      }, estimatedDuration + 1000); // Tambahkan buffer 1 detik
    }
    
    // Start typewriter effect
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
        if (this.typingInterval) {
          clearInterval(this.typingInterval);
          this.typingInterval = null;
        }
        
        // Clear audio completion timer jika masih ada
        if (audioCompletionTimer) {
          clearTimeout(audioCompletionTimer);
          audioCompletionTimer = null;
        }
        
        // Tandai dialog ini sudah selesai dikunjungi (untuk fitur achievement 'listener')
        if (dialog.id && dialog.id < 1000) {  // Hanya dialog normal yang dihitung, bukan dialog khusus (id >= 1000)
          this.markDialogVisited(dialog.id);
        }
        
        if (this.typewriterCallback) {
          this.typewriterCallback(this.currentText, true);
        }
      }
    }, typingSpeed);
  }

  public stopTyping(): void {
    // Ketika user menghentikan dialog sebelum selesai, tandai bahwa ada interupsi
    // Harus dicek sebelum mengubah isTyping
    const wasTyping = this.isTyping;
    const currentDialog = this.dialogModel.getCurrentDialog();
    if (currentDialog && wasTyping) {
      console.log(`[DialogController] Dialog ${currentDialog.id} interrupted by user`);
      this.dialogInterrupted = true;
    }
    
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
    
    // Tandai dialog ini sebagai telah dikunjungi (untuk achievement 'listener')
    const currentDialog = this.dialogModel.getCurrentDialog();
    if (currentDialog && currentDialog.id && currentDialog.id < 1000) {  // Hanya dialog normal yang dihitung
      this.markDialogVisited(currentDialog.id);
    }
    
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
  public showCustomDialog(text: string, callback: (text: string, isComplete: boolean) => void): void {
    // Hentikan dialog yang sedang berjalan
    this.stopTyping();
    
    // Log untuk debugging
    console.log(`[DialogController] Memulai dialog custom: "${text}"`);
    
    // Tunggu sebentar untuk memastikan audio sebelumnya sudah selesai
    setTimeout(() => {
      // Pastikan audio benar-benar berhenti
      this.elevenlabsService.stopSpeaking();
      
      // Tambahkan delay lagi untuk memastikan benar-benar bersih
      setTimeout(() => {
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
          
          // Identifikasi jenis dialog berdasarkan konten teks
          const isFromContract = text.includes("Didn't lie") || 
                               text.includes("Not a liar") || 
                               text.includes("Told you the truth") || 
                               text.includes("Believe me now");
                               
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
        
        // Gunakan callback sementara untuk memastikan dialog source tetap correct
        const wrappedCallback = (text: string, isComplete: boolean) => {
          // Log tambahan untuk debugging
          console.log(`[DialogController] Custom dialog callback - Text: "${text.substring(0, 20)}..." isComplete: ${isComplete}`);
          
          // Panggil callback asli
          callback(text, isComplete);
        };
        
        // Tampilkan dialog custom
        this.typeDialog(customDialog, wrappedCallback);
      }, 200);
    }, 300); // Delay 300ms untuk menghindari tumpang tindih audio
  }
  
  // Method khusus untuk menampilkan dialog setelah user dilempar dan kemudian kembali
  public async showReturnDialog(callback: (text: string, isComplete: boolean) => void): Promise<void> {
    // Hentikan dialog yang sedang berjalan
    this.stopTyping();
    
    console.log("[DialogController] Preparing to show RETURN_DIALOG after user was thrown and returned");
    
    // Tunggu sebentar untuk memastikan audio sebelumnya sudah selesai
    setTimeout(() => {
      // Pastikan audio benar-benar berhenti
      this.elevenlabsService.stopSpeaking();
      
      // Reset dialog model ke awal agar sequence selanjutnya normal
      this.dialogModel.resetDialog();
      
      // Tandai bahwa ini adalah dialog khusus setelah reset
      this.isPostResetDialog = true;
      
      // Pastikan dialog box visible dan HoverDialogController tahu dialog utama sedang berjalan
      try {
        const hoverDialogController = HoverDialogController.getInstance();
        if (hoverDialogController) {
          // Reset SEMUA state di HoverDialogController yang bisa mengganggu dialog
          if (typeof hoverDialogController.setDialogSource === 'function') {
            hoverDialogController.setDialogSource('main');
            console.log("[DialogController] Set dialog source to 'main' for return dialog");
          }
          
          // Reset flag hover interaction agar hover bekerja normal lagi setelah reset
          if (typeof hoverDialogController.setHasInteractedWithHover === 'function') {
            hoverDialogController.setHasInteractedWithHover(false);
            console.log("[DialogController] Reset hover interaction flag to false");
          }

          // Reset idle timeout status yang mungkin masih aktif
          if (typeof hoverDialogController.setIdleTimeoutOccurred === 'function') {
            hoverDialogController.setIdleTimeoutOccurred(false);
            console.log("[DialogController] Reset idle timeout status to false");
          }

          // Reset semua annoyance flags
          if (typeof hoverDialogController.resetAllState === 'function') {
            hoverDialogController.resetAllState();
            console.log("[DialogController] Reset all HoverDialogController state");
          }

          // Stop any ongoing typing in hover dialog
          if (typeof hoverDialogController.stopTyping === 'function') {
            hoverDialogController.stopTyping();
            console.log("[DialogController] Stopped any ongoing hover dialog typing");
          }
        }
      } catch (e) {
        console.error("[DialogController] Failed to reset hover controller state:", e);
      }
      
      // Force reset SEMUA global properties yang bisa mengganggu dialog
      try {
        // Reset global flag untuk force show idle warning
        // @ts-ignore
        window.__forceShowIdleWarning = false;
        console.log("[DialogController] Reset global __forceShowIdleWarning flag");

        // Reset contract dialog status
        // @ts-ignore
        window.__contractDialogActive = false;
        console.log("[DialogController] Reset global __contractDialogActive flag");

        // Force reset dialog box visibility
        // @ts-ignore
        if (window.__dialogBoxIsFinishedSetter) {
          // @ts-ignore
          window.__dialogBoxIsFinishedSetter(false);
          console.log("[DialogController] Force reset dialog box visibility to visible");
        }
        
        // Force set dialogBox text secara langsung melalui setter global
        // @ts-ignore
        if (window.__dialogBoxTextSetter) {
          // @ts-ignore
          window.__dialogBoxTextSetter(""); // Reset text dulu agar kosong
          
          // Panggil callback dengan string kosong untuk memastikan dialog box terlihat
          if (callback) callback("", false);
        }
      } catch (e) {
        console.error("[DialogController] Failed to force reset dialog box text/visibility:", e);
      }
      
      // Log detail RETURN_DIALOG for debugging
      console.log("[DialogController] RETURN_DIALOG content:", JSON.stringify(RETURN_DIALOG));
      
      // MENGGUNAKAN PENDEKATAN YANG BERBEDA:
      // 1. Alih-alih menggunakan typeDialog atau showCustomDialog, kita akan langsung memanipulasi UI
      //    dengan mengirim text karakter per karakter melalui callback, seperti simulasi typewriter
      
      // Simpan referensi ke RETURN_DIALOG untuk penggunaan dalam closure
      const dialogText = RETURN_DIALOG.text;
      const characterName = RETURN_DIALOG.character;
      const textLength = dialogText.length;
      
      // Pastikan nama karakter terlihat
      try {
        // @ts-ignore
        if (window.__setCharacterName && typeof window.__setCharacterName === 'function') {
          // @ts-ignore
          window.__setCharacterName(characterName);
          console.log("[DialogController] Set character name to:", characterName);
        }
      } catch (e) {
        console.error("[DialogController] Failed to set character name:", e);
      }
      
      // Gunakan setTimeout alih-alih setInterval agar lebih reliable
      let currentIndex = 0;
      let currentText = "";
      
      // Coba gunakan elevenlabs untuk mengucapkan dialog
      console.log("[DialogController] Attempting to play audio for return dialog");
      this.elevenlabsService.speakText(dialogText)
        .then(audioStarted => {
          if (!audioStarted) {
            console.log("[DialogController] First attempt to play audio failed, retrying...");
            // Retry setelah delay kecil
            setTimeout(() => {
              this.elevenlabsService.speakText(dialogText)
                .then(retrySuccess => {
                  if (retrySuccess) {
                    console.log("[DialogController] Retry audio playback successful");
                  } else {
                    console.log("[DialogController] Retry audio playback failed");
                  }
                })
                .catch(e => {
                  console.error("[DialogController] Retry audio playback failed with error:", e);
                });
            }, 500);
          } else {
            console.log("[DialogController] Audio playback started successfully");
          }
        })
        .catch(e => {
          console.error("[DialogController] Error starting audio playback:", e);
        });
      
      // Fungsi rekursif untuk simulasi typing dengan error handling
      const typeNextChar = () => {
        try {
          if (currentIndex < textLength) {
            currentText += dialogText[currentIndex];
            currentIndex++;
            
            // Kirim callback dengan text saat ini
            if (callback) {
              callback(currentText, false);
            }
            
            // Jadwalkan karakter selanjutnya dalam 50ms
            setTimeout(typeNextChar, 50); // 50ms per karakter
          } else {
            // Typing selesai, kirim callback dengan completed=true
            if (callback) {
              callback(currentText, true);
            }
            console.log("[DialogController] RETURN_DIALOG typing completed successfully");
            
            // Mark that post-reset dialog is complete
            this.isPostResetDialog = false;
          }
        } catch (error) {
          console.error("[DialogController] Error during return dialog typing:", error);
          // Fallback - complete the dialog
          if (callback) {
            callback(dialogText, true);
          }
        }
      };
      
      // Mulai proses typing setelah 200ms untuk memastikan audio/UI siap
      setTimeout(typeNextChar, 200);
      
      console.log("[DialogController] Started manual typing for RETURN_DIALOG:", dialogText);
    }, 500); // Delay 500ms untuk menghindari tumpang tindih audio
  }
  
  // Getter untuk memeriksa apakah ini adalah dialog setelah reset
  public isShowingPostResetDialog(): boolean {
    return this.isPostResetDialog;
  }
  
  // Method untuk mereset status dialog setelah reset
  public resetPostResetDialogStatus(): void {
    this.isPostResetDialog = false;
  }
  
  // Method tambahan untuk mereset status dialog sebelum return dialog
  public resetDialogState(): void {
    // Hentikan typewriter dan audio
    this.stopTyping();
    this.elevenlabsService.stopSpeaking();
    
    // Reset status post-reset
    this.isPostResetDialog = false;
    
    // Reset interupsi
    this.dialogInterrupted = false;
    
    // Log aksi
    console.log("[DialogController] Reset dialog state completed");
  }
  
  // Method untuk mengakses dialog model
  public getDialogModel(): DialogModel {
    return this.dialogModel;
  }
  
  // Metode untuk melacak dialog yang selesai
  private markDialogVisited(dialogId: number): void {
    this.dialogsVisited.add(dialogId);
    console.log(`[DialogController] Dialog ${dialogId} marked as visited. Total visited: ${this.dialogsVisited.size}/${this.totalDialogCount}`);
    
    // Setelah setiap dialog ditandai, periksa apakah semua dialog telah dikunjungi
    this.checkAllDialogsVisited();
  }
  
  // Periksa apakah user telah mendengarkan semua dialog tanpa interupsi
  private checkAllDialogsVisited(): void {
    // Periksa jika semua dialog telah dikunjungi dan tidak ada interupsi
    if (this.dialogsVisited.size >= this.totalDialogCount && !this.dialogInterrupted) {
      console.log(`[DialogController] All dialogs visited without interruption! Triggering 'listener' achievement.`);
      
      // Tampilkan achievement untuk mendengarkan semua dialog
      try {
        const achievementController = AchievementController.getInstance();
        if (achievementController) {
          achievementController.unlockAchievement('listener');
        }
      } catch (e) {
        console.error('[DialogController] Error triggering listener achievement:', e);
      }
    }
  }
  
  // Reset status interupsi dialog
  public resetDialogInterruption(): void {
    this.dialogInterrupted = false;
    console.log(`[DialogController] Dialog interruption status reset`);
  }
  
  // Dapatkan status interupsi dialog
  public getDialogInterruptionStatus(): boolean {
    return this.dialogInterrupted;
  }
}

export default DialogController;