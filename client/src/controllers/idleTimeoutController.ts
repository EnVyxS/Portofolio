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
const DEBUG_MODE = false;
if (DEBUG_MODE) {
  Object.keys(TIMEOUT_DURATIONS).forEach(key => {
    TIMEOUT_DURATIONS[key as keyof typeof TIMEOUT_DURATIONS] = 
      TIMEOUT_DURATIONS[key as keyof typeof TIMEOUT_DURATIONS] / 60; // 1/60 dari waktu normal (detik, bukan menit)
  });
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
  
  // Memulai penghitungan timeout idle
  public startIdleTimer(): void {
    this.clearAllIdleTimers(); // Bersihkan timer yang ada
    this.setupIdleTimers(); // Setup timer baru
  }
  
  // Setup timer idle
  private setupIdleTimers(): void {
    const now = Date.now();
    
    // Jika belum menampilkan peringatan pertama
    if (!this.hasShownFirstWarning) {
      this.firstWarningTimer = setTimeout(() => {
        this.showIdleWarning(IDLE_DIALOGS.FIRST_WARNING);
        this.hasShownFirstWarning = true;
      }, TIMEOUT_DURATIONS.FIRST_WARNING);
    }
    
    // Jika belum menampilkan peringatan kedua
    if (!this.hasShownSecondWarning) {
      this.secondWarningTimer = setTimeout(() => {
        this.showIdleWarning(IDLE_DIALOGS.SECOND_WARNING);
        this.hasShownSecondWarning = true;
      }, TIMEOUT_DURATIONS.SECOND_WARNING);
    }
    
    // Jika belum menampilkan peringatan terakhir
    if (!this.hasShownFinalWarning) {
      this.finalWarningTimer = setTimeout(() => {
        this.showIdleWarning(IDLE_DIALOGS.FINAL_WARNING);
        this.hasShownFinalWarning = true;
      }, TIMEOUT_DURATIONS.FINAL_WARNING);
    }
    
    // Jika belum dilempar
    if (!this.hasBeenThrown) {
      this.throwUserTimer = setTimeout(() => {
        this.throwUser();
        this.hasBeenThrown = true;
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
    this.clearAllHoverTimers(); // Bersihkan timer yang ada
    
    // Jika belum menampilkan peringatan hover berlebihan
    if (!this.hasShownExcessiveHoverWarning) {
      this.excessiveHoverTimer = setTimeout(() => {
        this.showIdleWarning(IDLE_DIALOGS.EXCESSIVE_HOVER_WARNING);
        this.hasShownExcessiveHoverWarning = true;
      }, TIMEOUT_DURATIONS.EXCESSIVE_HOVER_WARNING);
    }
    
    // Jika belum menampilkan peringatan hover final
    if (!this.hasShownFinalHoverWarning) {
      this.finalHoverWarningTimer = setTimeout(() => {
        this.showIdleWarning(IDLE_DIALOGS.FINAL_HOVER_WARNING);
        this.hasShownFinalHoverWarning = true;
      }, TIMEOUT_DURATIONS.FINAL_HOVER_WARNING);
    }
    
    // Jika belum dipukul
    if (!this.hasBeenPunched) {
      this.punchUserTimer = setTimeout(() => {
        this.punchUser();
        this.hasBeenPunched = true;
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
    // Menggunakan dialog controller untuk menampilkan peringatan
    this.dialogController.stopTyping();
    this.hoverDialogController.stopTyping();
    
    // Untuk membuat efek interupsi selalu berhasil, kita reset status lain
    this.hoverDialogController.resetHoverState();
    
    // Tampilkan dialog peringatan dengan text custom
    this.dialogController.showCustomDialog(text, (dialogText, isComplete) => {
      if (isComplete) {
        console.log(`Dialog peringatan selesai: ${text}`);
      }
    });
    
    // Speak the warning text with angry tone
    this.elevenlabsService.speakText(text, "geralt");
  }
  
  // Method untuk 'melempar' user
  private throwUser(): void {
    console.log("Geralt melempar user! Mengembalikan ke scene awal.");
    
    // Tandai bahwa user telah dilempar
    this.hasBeenReset = true;
    this.hasInteractedAfterReset = false;
    
    // Jalankan callback jika ada
    if (this.throwUserCallback) {
      this.throwUserCallback();
    }
    
    // Reset scene
    if (this.resetSceneCallback) {
      this.resetSceneCallback();
    }
  }
  
  // Method untuk 'memukul' user
  private punchUser(): void {
    console.log("Geralt memukul user! Mengeluarkan dari website.");
    
    // Jalankan callback jika ada
    if (this.punchUserCallback) {
      this.punchUserCallback();
    }
    
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