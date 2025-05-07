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
        clearInterval(this.typingInterval as NodeJS.Timeout);
        this.typingInterval = null;
        
        // Clear audio completion timer jika masih ada
        if (audioCompletionTimer) {
          clearTimeout(audioCompletionTimer);
          audioCompletionTimer = null;
        }
        
        if (this.typewriterCallback) {
          this.typewriterCallback(this.currentText, true);
        }
      }
    }, typingSpeed);
  }

  public stopTyping(): void {
    this.isTyping = false;
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    
    // Ketika user menghentikan dialog sebelum selesai, tandai bahwa ada interupsi
    const currentDialog = this.dialogModel.getCurrentDialog();
    if (currentDialog && this.isTyping) {
      console.log(`[DialogController] Dialog ${currentDialog.id} interrupted by user`);
      this.dialogInterrupted = true;
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
    if (this.dialogsVisited.size >= this.totalDialogCount && !this.wasDialogInterrupted) {
      console.log(`[DialogController] All dialogs visited without interruption! Triggering 'listener' achievement.`);
      
      // Tampilkan achievement untuk mendengarkan semua dialog
      try {
        const achievementController = AchievementController.getInstance();
        if (achievementController) {
          achievementController.triggerAchievement('listener');
        }
      } catch (e) {
        console.error('[DialogController] Error triggering listener achievement:', e);
      }
    }
  }
  
  // Reset status interupsi dialog
  public resetDialogInterruption(): void {
    this.wasDialogInterrupted = false;
    console.log(`[DialogController] Dialog interruption status reset`);
  }
  
  // Dapatkan status interupsi dialog
  public getDialogInterruptionStatus(): boolean {
    return this.wasDialogInterrupted;
  }
}

export default DialogController;