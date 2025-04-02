import DialogController from './dialogController';
import HoverDialogController from './hoverDialogController';
import ElevenLabsService from '../services/elevenlabsService';

// Dialog yang akan ditampilkan pada timeout tertentu
export const IDLE_DIALOGS = {
  // Dialog setelah 2 menit tidak ada interaksi
  FIRST_WARNING: "What the hell are you staring at?.. Got something to say!?",
  
  // Dialog setelah 5 menit tidak ada interaksi
  SECOND_WARNING: "You really gonna keep ignoring me? I'm not in the mood for this.",
  
  // Dialog setelah 9 menit tidak ada interaksi
  FINAL_WARNING: "You think this is funny?.. Staring at me for nine damn minutes?.. Fuck you!!",
  
  // Dialog setelah user menekan APPROACH HIM lagi
  RETURN_DIALOG: "Now what, you little filth!?..",
  
  // Dialog setelah user melakukan hover
  HOVER_AFTER_RESET: "Hmph... Finally, you decide to move... Suit yourself. You want to check it or just get on with signing the damn contract?",
  
  // Dialog untuk hover berlebihan
  EXCESSIVE_HOVER_WARNING: "So this is how it is? You think you can play me for a fool?",
  
  // Dialog terakhir sebelum 'diusir'
  FINAL_HOVER_WARNING: "ENOUGH"
};

// Waktu timeout dalam milidetik
export const TIMEOUT_DURATIONS = {
  FIRST_WARNING: 2 * 60 * 1000, // 2 menit
  SECOND_WARNING: 5 * 60 * 1000, // 5 menit
  FINAL_WARNING: 9 * 60 * 1000, // 9 menit
  THROW_USER: 10 * 60 * 1000, // 10 menit
  EXCESSIVE_HOVER_WARNING: 1 * 60 * 1000, // 1 menit
  FINAL_HOVER_WARNING: 2 * 60 * 1000, // 2 menit
  PUNCH_USER: 3 * 60 * 1000 // 3 menit
};

// Untuk testing/development, gunakan timeout yang lebih singkat
const DEBUG_MODE = false; // Mode normal dengan durasi timeout standard
if (DEBUG_MODE) {
  Object.keys(TIMEOUT_DURATIONS).forEach(key => {
    // Gunakan waktu yang lebih singkat untuk testing
    // FIRST_WARNING: 5 detik
    // SECOND_WARNING: 10 detik
    // FINAL_WARNING: 15 detik
    // THROW_USER: 20 detik
    // EXCESSIVE_HOVER_WARNING: 5 detik
    // FINAL_HOVER_WARNING: 10 detik
    // PUNCH_USER: 15 detik
    
    const debugTimeouts: Record<string, number> = {
      FIRST_WARNING: 5000,
      SECOND_WARNING: 10000,
      FINAL_WARNING: 15000,
      THROW_USER: 20000,
      EXCESSIVE_HOVER_WARNING: 5000,
      FINAL_HOVER_WARNING: 10000,
      PUNCH_USER: 15000
    };
    
    if (key in debugTimeouts) {
      TIMEOUT_DURATIONS[key as keyof typeof TIMEOUT_DURATIONS] = debugTimeouts[key];
    } else {
      // Fallback ke metode lama (1/60 dari waktu normal)
      TIMEOUT_DURATIONS[key as keyof typeof TIMEOUT_DURATIONS] = 
        TIMEOUT_DURATIONS[key as keyof typeof TIMEOUT_DURATIONS] / 60;
    }
  });
  
  console.log("[IdleTimeoutController] DEBUG MODE AKTIF - Timeout yang digunakan lebih singkat");
}

class IdleTimeoutController {
  private static instance: IdleTimeoutController;
  private dialogController: DialogController;
  private hoverDialogController: HoverDialogController;
  private elevenlabsService: ElevenLabsService;
  
  // Timer untuk timeout
  private firstWarningTimer: NodeJS.Timeout | null = null;
  private secondWarningTimer: NodeJS.Timeout | null = null;
  private finalWarningTimer: NodeJS.Timeout | null = null;
  private throwUserTimer: NodeJS.Timeout | null = null;
  
  // Timer untuk hover berlebihan
  private excessiveHoverTimer: NodeJS.Timeout | null = null;
  private finalHoverWarningTimer: NodeJS.Timeout | null = null;
  private punchUserTimer: NodeJS.Timeout | null = null;
  
  // Status timeout
  private hasShownFirstWarning: boolean = false;
  private hasShownSecondWarning: boolean = false;
  private hasShownFinalWarning: boolean = false;
  private hasBeenThrown: boolean = false;
  
  // Status hover berlebihan
  private hasShownExcessiveHoverWarning: boolean = false;
  private hasShownFinalHoverWarning: boolean = false;
  private hasBeenPunched: boolean = false;
  
  // Status untuk setelah reset (user kembali ke APPROACH HIM)
  private hasBeenReset: boolean = false;
  private hasInteractedAfterReset: boolean = false;
  
  // Callback untuk aksi eksternal
  private throwUserCallback: (() => void) | null = null;
  private punchUserCallback: (() => void) | null = null;
  private resetSceneCallback: (() => void) | null = null;
  
  // Timestamp dari interaksi terakhir
  private lastInteractionTime: number = Date.now();
  
  private constructor() {
    this.dialogController = DialogController.getInstance();
    this.hoverDialogController = HoverDialogController.getInstance();
    this.elevenlabsService = ElevenLabsService.getInstance();
  }
  
  public static getInstance(): IdleTimeoutController {
    if (!IdleTimeoutController.instance) {
      IdleTimeoutController.instance = new IdleTimeoutController();
    }
    return IdleTimeoutController.instance;
  }
  
  // Mengatur callback untuk efek dramatik
  public setThrowUserCallback(callback: () => void): void {
    this.throwUserCallback = callback;
  }
  
  public setPunchUserCallback(callback: () => void): void {
    this.punchUserCallback = callback;
  }
  
  public setResetSceneCallback(callback: () => void): void {
    this.resetSceneCallback = callback;
  }
  
  // Cek apakah ada audio atau dialog yang sedang berjalan
  private isAudioOrDialogActive(): boolean {
    // Cek apakah ada audio yang sedang diputar
    const isAudioPlaying = this.elevenlabsService.isCurrentlyPlaying();
    
    // Cek apakah ada dialog yang sedang diketik
    let isDialogTyping = false;
    
    // Pastikan method isCurrentlyTyping ada di dialogController
    if (typeof this.dialogController.isCurrentlyTyping === 'function') {
      isDialogTyping = this.dialogController.isCurrentlyTyping();
    } else {
      console.log("[IdleTimeoutController] isCurrentlyTyping tidak ditemukan di dialogController");
    }
    
    // Cek juga apakah hover dialog sedang diketik
    let isHoverDialogTyping = false;
    // Gunakan try/catch untuk menghindari error jika method tidak ada
    try {
      if (typeof this.hoverDialogController.isTypingHoverDialog === 'function') {
        isHoverDialogTyping = this.hoverDialogController.isTypingHoverDialog();
      }
    } catch (error) {
      console.log("[IdleTimeoutController] Error saat cek isTypingHoverDialog:", error);
    }
    
    const isActive = isAudioPlaying || isDialogTyping || isHoverDialogTyping;
    
    // Log untuk debugging
    if (isActive) {
      console.log("[IdleTimeoutController] Aktivitas terdeteksi:", {
        audio: isAudioPlaying, 
        dialog: isDialogTyping,
        hoverDialog: isHoverDialogTyping
      });
    }
    
    // Jika salah satu aktif, return true
    return isActive;
  }
  
  // Memulai penghitungan timeout idle
  public startIdleTimer(): void {
    // Jika ada audio atau dialog yang aktif, jangan jalankan timer
    if (this.isAudioOrDialogActive()) {
      console.log("[IdleTimeoutController] Timer tidak dijadwalkan - audio/dialog sedang aktif");
      
      // Cek lagi nanti setelah beberapa detik
      setTimeout(() => {
        this.startIdleTimer();
      }, 5000); // cek setiap 5 detik
      
      return;
    }
    
    console.log("[IdleTimeoutController] Idle timers setup - First warning in " + 
                TIMEOUT_DURATIONS.FIRST_WARNING/1000 + "s, second in " + 
                TIMEOUT_DURATIONS.SECOND_WARNING/1000 + "s, final in " + 
                TIMEOUT_DURATIONS.FINAL_WARNING/1000 + "s");
    
    this.clearAllIdleTimers(); // Bersihkan timer yang ada
    this.setupIdleTimers(); // Setup timer baru
  }
  
  // Setup timer idle
  private setupIdleTimers(): void {
    const now = Date.now();
    
    // Jika belum menampilkan peringatan pertama
    if (!this.hasShownFirstWarning) {
      this.firstWarningTimer = setTimeout(() => {
        // Cek dulu apakah ada audio/dialog yang aktif sebelum menampilkan peringatan
        if (!this.isAudioOrDialogActive()) {
          this.showIdleWarning(IDLE_DIALOGS.FIRST_WARNING);
          this.hasShownFirstWarning = true;
        } else {
          // Jika ada audio/dialog aktif, jadwalkan ulang pengecekan
          this.startIdleTimer();
        }
      }, TIMEOUT_DURATIONS.FIRST_WARNING);
    }
    
    // Jika belum menampilkan peringatan kedua
    if (!this.hasShownSecondWarning) {
      this.secondWarningTimer = setTimeout(() => {
        // Cek dulu apakah ada audio/dialog yang aktif sebelum menampilkan peringatan
        if (!this.isAudioOrDialogActive()) {
          this.showIdleWarning(IDLE_DIALOGS.SECOND_WARNING);
          this.hasShownSecondWarning = true;
        } else {
          // Jika ada audio/dialog aktif, jadwalkan ulang pengecekan
          this.startIdleTimer();
        }
      }, TIMEOUT_DURATIONS.SECOND_WARNING);
    }
    
    // Jika belum menampilkan peringatan terakhir
    if (!this.hasShownFinalWarning) {
      this.finalWarningTimer = setTimeout(() => {
        // Cek dulu apakah ada audio/dialog yang aktif sebelum menampilkan peringatan
        if (!this.isAudioOrDialogActive()) {
          this.showIdleWarning(IDLE_DIALOGS.FINAL_WARNING);
          this.hasShownFinalWarning = true;
        } else {
          // Jika ada audio/dialog aktif, jadwalkan ulang pengecekan
          this.startIdleTimer();
        }
      }, TIMEOUT_DURATIONS.FINAL_WARNING);
    }
    
    // Jika belum dilempar
    if (!this.hasBeenThrown) {
      this.throwUserTimer = setTimeout(() => {
        // Cek dulu apakah ada audio/dialog yang aktif sebelum melempar user
        if (!this.isAudioOrDialogActive()) {
          this.throwUser();
          this.hasBeenThrown = true;
        } else {
          // Jika ada audio/dialog aktif, jadwalkan ulang pengecekan
          this.startIdleTimer();
        }
      }, TIMEOUT_DURATIONS.THROW_USER);
    }
  }
  
  // Bersihkan semua timer idle
  private clearAllIdleTimers(): void {
    if (this.firstWarningTimer) {
      clearTimeout(this.firstWarningTimer);
      this.firstWarningTimer = null;
    }
    
    if (this.secondWarningTimer) {
      clearTimeout(this.secondWarningTimer);
      this.secondWarningTimer = null;
    }
    
    if (this.finalWarningTimer) {
      clearTimeout(this.finalWarningTimer);
      this.finalWarningTimer = null;
    }
    
    if (this.throwUserTimer) {
      clearTimeout(this.throwUserTimer);
      this.throwUserTimer = null;
    }
  }
  
  // Setup timer untuk hover berlebihan
  public startExcessiveHoverTimers(): void {
    // Jika ada audio atau dialog yang aktif, jangan jalankan timer
    if (this.isAudioOrDialogActive()) {
      console.log("[IdleTimeoutController] Hover timer tidak dijadwalkan - audio/dialog sedang aktif");
      
      // Cek lagi nanti setelah beberapa detik
      setTimeout(() => {
        this.startExcessiveHoverTimers();
      }, 5000); // cek setiap 5 detik
      
      return;
    }
    
    console.log("[IdleTimeoutController] Excessive hover timers setup");
    this.clearAllHoverTimers(); // Bersihkan timer yang ada
    
    // Jika belum menampilkan peringatan hover berlebihan
    if (!this.hasShownExcessiveHoverWarning) {
      this.excessiveHoverTimer = setTimeout(() => {
        // Cek dulu apakah ada audio/dialog yang aktif sebelum menampilkan peringatan
        if (!this.isAudioOrDialogActive()) {
          this.showIdleWarning(IDLE_DIALOGS.EXCESSIVE_HOVER_WARNING);
          this.hasShownExcessiveHoverWarning = true;
        } else {
          // Jika ada audio/dialog aktif, jadwalkan ulang pengecekan
          this.startExcessiveHoverTimers();
        }
      }, TIMEOUT_DURATIONS.EXCESSIVE_HOVER_WARNING);
    }
    
    // Jika belum menampilkan peringatan hover final
    if (!this.hasShownFinalHoverWarning) {
      this.finalHoverWarningTimer = setTimeout(() => {
        // Cek dulu apakah ada audio/dialog yang aktif sebelum menampilkan peringatan
        if (!this.isAudioOrDialogActive()) {
          this.showIdleWarning(IDLE_DIALOGS.FINAL_HOVER_WARNING);
          this.hasShownFinalHoverWarning = true;
        } else {
          // Jika ada audio/dialog aktif, jadwalkan ulang pengecekan
          this.startExcessiveHoverTimers();
        }
      }, TIMEOUT_DURATIONS.FINAL_HOVER_WARNING);
    }
    
    // Jika belum dipukul
    if (!this.hasBeenPunched) {
      this.punchUserTimer = setTimeout(() => {
        // Cek dulu apakah ada audio/dialog yang aktif sebelum memukul user
        if (!this.isAudioOrDialogActive()) {
          this.punchUser();
          this.hasBeenPunched = true;
        } else {
          // Jika ada audio/dialog aktif, jadwalkan ulang pengecekan
          this.startExcessiveHoverTimers();
        }
      }, TIMEOUT_DURATIONS.PUNCH_USER);
    }
  }
  
  // Bersihkan semua timer hover
  private clearAllHoverTimers(): void {
    if (this.excessiveHoverTimer) {
      clearTimeout(this.excessiveHoverTimer);
      this.excessiveHoverTimer = null;
    }
    
    if (this.finalHoverWarningTimer) {
      clearTimeout(this.finalHoverWarningTimer);
      this.finalHoverWarningTimer = null;
    }
    
    if (this.punchUserTimer) {
      clearTimeout(this.punchUserTimer);
      this.punchUserTimer = null;
    }
  }
  
  // Handler untuk interaksi user
  public handleUserInteraction(): void {
    this.lastInteractionTime = Date.now();
    
    if (this.hasBeenReset && !this.hasInteractedAfterReset) {
      // Jika user baru saja di-reset dan ini adalah interaksi pertama setelah reset
      this.hasInteractedAfterReset = true;
      this.showIdleWarning(IDLE_DIALOGS.HOVER_AFTER_RESET);
      
      // Mulai timer hover berlebihan
      this.startExcessiveHoverTimers();
    } else if (!this.hasBeenReset) {
      // Reset timer idle jika belum di-reset
      this.clearAllIdleTimers();
      this.setupIdleTimers();
    }
  }
  
  // Method untuk menampilkan peringatan
  private showIdleWarning(text: string): void {
    // Hentikan dialog yang sedang berjalan
    this.dialogController.stopTyping();
    this.hoverDialogController.stopTyping();
    
    // Reset hover state agar tidak ada konflik
    this.hoverDialogController.resetHoverState();
    
    console.log(`[IdleTimeoutController] Menampilkan peringatan: "${text}"`);
    
    // Set up callback function for hover dialog
    const hoverCallback = this.hoverDialogController.setHoverTextCallback;
    
    // Check if the hover dialog controller has the setHoverTextCallback function
    if (typeof hoverCallback === 'function') {
      // Set up dummy functions to use in HoverDialogController
      const typeHoverText = this.hoverDialogController.handleHoverDialog;
    }
    
    // Tampilkan dialog peringatan dengan text custom
    // Gunakan hover dialog controller agar dialog muncul walau dialog utama sudah selesai
    // Baru jika itu gagal, gunakan dialog controller
    try {
      // Coba gunakan callback yang sudah ada di hoverDialogController
      if (typeof this.hoverDialogController.setHoverTextCallback === 'function') {
        // Cek apakah ada callback yang sudah terpasang
        // Jika tidak ada callback, ini akan gagal dan lanjut ke catch
        this.hoverDialogController.handleHoverDialog('none'); // Reset dialog
        
        // Kemudian secara manual kirim teks idle warning ke callback
        if (this.hoverDialogController['hoverTextCallback']) {
          this.hoverDialogController['hoverTextCallback'](text, true);
          console.log(`[IdleTimeoutController] Dialog peringatan ditampilkan via hover callback`);
        } else {
          throw new Error('No hover text callback found');
        }
      } else {
        throw new Error('No setHoverTextCallback method found');
      }
    } catch (error) {
      console.error("[IdleTimeoutController] Error using hover dialog:", error);
      // Fallback ke dialog controller jika hover controller gagal
      this.dialogController.showCustomDialog(text, (dialogText, isComplete) => {
        if (isComplete) {
          console.log(`[IdleTimeoutController] Dialog peringatan selesai ditampilkan via dialog controller`);
        }
      });
    }
    
    // Speak the warning text dengan tone yang sesuai - 'angry' untuk peringatan
    try {
      // Untuk peringatan, gunakan tone angry dari Geralt
      this.elevenlabsService.speakText(text, "geralt");
      console.log(`[IdleTimeoutController] Memutar suara peringatan dengan tone angry`);
    } catch (error) {
      console.error("[IdleTimeoutController] Gagal memutar suara peringatan:", error);
    }
  }
  
  // Method untuk 'melempar' user
  private throwUser(): void {
    console.log("[IdleTimeoutController] Geralt melempar user! Mengembalikan ke scene awal.");
    
    // Tambahkan dialog peringatan untuk 'melempar'
    const throwText = "That's it. GET OUT OF MY SIGHT!";
    this.showIdleWarning(throwText);
    
    // Tandai bahwa user telah dilempar
    this.hasBeenReset = true;
    this.hasInteractedAfterReset = false;
    
    // Jalankan callback jika ada setelah delay singkat agar dialog dapat dibaca
    setTimeout(() => {
      if (this.throwUserCallback) {
        this.throwUserCallback();
      }
      
      // Reset scene
      if (this.resetSceneCallback) {
        this.resetSceneCallback();
      }
    }, 2000); // Delay 2 detik agar dialog dapat dibaca sebelum dilempar
  }
  
  // Method untuk 'memukul' user
  private punchUser(): void {
    console.log("[IdleTimeoutController] Geralt memukul user! Mengeluarkan dari website.");
    
    // Tambahkan dialog peringatan untuk 'memukul'
    const punchText = "You're really asking for it...";
    this.showIdleWarning(punchText);
    
    // Jalankan callback jika ada setelah delay singkat
    setTimeout(() => {
      if (this.punchUserCallback) {
        this.punchUserCallback();
      }
    }, 1000); // Delay 1 detik untuk dialog dapat dibaca
    
    // Setelah beberapa detik, paksa reload website
    setTimeout(() => {
      window.location.href = "about:blank"; // Redirect ke halaman kosong
    }, 3000);
  }
  
  // Reset semua timer dan status
  public resetAll(): void {
    this.clearAllIdleTimers();
    this.clearAllHoverTimers();
    
    this.hasShownFirstWarning = false;
    this.hasShownSecondWarning = false;
    this.hasShownFinalWarning = false;
    this.hasBeenThrown = false;
    
    this.hasShownExcessiveHoverWarning = false;
    this.hasShownFinalHoverWarning = false;
    this.hasBeenPunched = false;
    
    this.hasBeenReset = false;
    this.hasInteractedAfterReset = false;
    
    this.lastInteractionTime = Date.now();
    
    // Setup timer baru
    this.setupIdleTimers();
  }
}

export default IdleTimeoutController;