import DialogController from "./dialogController";
import HoverDialogController from "./hoverDialogController";
import AchievementController from "./achievementController";
import ElevenLabsService from "../services/elevenlabsService";
import { getReturnDialog, getExtendedReturnDialog } from "../models/dialogModel";

// Dialog yang akan ditampilkan pada timeout tertentu
export const IDLE_DIALOGS = {
  // Dialog setelah 2 menit tidak ada interaksi
  FIRST_WARNING: "What the hell are you staring at?.. Got something to say!?",

  // Dialog setelah 5 menit tidak ada interaksi
  SECOND_WARNING:
    "You really gonna keep ignoring me? I'm not in the mood for this.",

  // Dialog setelah 9 menit tidak ada interaksi
  FINAL_WARNING:
    "You think this is funny?.. Staring at me for nine damn minutes?.. Fuck you!!",

  // Dialog setelah user menekan APPROACH HIM lagi
  RETURN_DIALOG: "Now what, you little filth!?.. Back for more punishment?",

  // Dialog setelah user melakukan hover
  HOVER_AFTER_RESET:
    "Hmph... Finally, you decide to move... Suit yourself. You want to check it or just get on with signing the damn contract?",

  // Dialog untuk hover berlebihan
  EXCESSIVE_HOVER_WARNING: "KEEP PUSHING, AND YOU’LL REGRET IT.",

  // Dialog terakhir sebelum 'diusir'
  FINAL_HOVER_WARNING: "I'VE HAD ENOUGH OF YOUR GAMES!",
};

// Waktu timeout dalam milidetik
export const TIMEOUT_DURATIONS = {
  FIRST_WARNING: 2 * 60 * 1000, // 2 menit
  SECOND_WARNING: 5 * 60 * 1000, // 5 menit
  FINAL_WARNING: 9 * 60 * 1000, // 9 menit
  THROW_USER: 10 * 60 * 1000, // 10 menit
  EXTENDED_RETURN_ULTIMATUM: 2 * 60 * 1000, // 2 menit untuk ultimatum setelah return dialog
  // Timer hover dihapus karena sudah ada alternatif trigger via hover counting
};

// Untuk testing/development, gunakan timeout yang lebih singkat
const DEBUG_MODE = false; // Mode produksi dengan durasi timeout normal
if (DEBUG_MODE) {
  Object.keys(TIMEOUT_DURATIONS).forEach((key) => {
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
      PUNCH_USER: 15000,
    };

    if (key in debugTimeouts) {
      TIMEOUT_DURATIONS[key as keyof typeof TIMEOUT_DURATIONS] =
        debugTimeouts[key];
    } else {
      // Fallback ke metode lama (1/60 dari waktu normal)
      TIMEOUT_DURATIONS[key as keyof typeof TIMEOUT_DURATIONS] =
        TIMEOUT_DURATIONS[key as keyof typeof TIMEOUT_DURATIONS] / 60;
    }
  });

  // Log removed
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
  private extendedReturnTimer: NodeJS.Timeout | null = null;

  // Timer hover dihapus - menggunakan hover counting sebagai gantinya

  // Real-time monitoring interval
  private checkInterval: NodeJS.Timeout | null = null;

  // Status timeout
  private hasShownFirstWarning: boolean = false;
  private hasShownSecondWarning: boolean = false;
  private hasShownFinalWarning: boolean = false;

  // Flag untuk mencegah multiple timer restart
  private isTimerRunning: boolean = false;

  // Status hover berlebihan - dikelola oleh HoverDialogController melalui counting
  private hasShownExcessiveHoverWarning: boolean = false;
  private hasShownFinalHoverWarning: boolean = false;
  private hasBeenPunched: boolean = false;

  // Status untuk setelah reset (user kembali ke APPROACH HIM)
  private hasBeenReset: boolean = false;
  private hasInteractedAfterReset: boolean = false;
  
  // New tracking variables for the updated requirements
  private hasBeenThrown: boolean = false;
  private userHasBeenReturn: boolean = false;
  private hasShownExtendedReturnDialog: boolean = false;
  private lastDialogWasReturn: boolean = false;
  private isExtendedReturnSequenceActive: boolean = false;

  // Callback untuk aksi eksternal
  private throwUserCallback: (() => void) | null = null;
  private punchUserCallback: (() => void) | null = null;

  // Tracking untuk mencegah dialog berulang
  private processingWarnings: Set<string> = new Set();
  private resetSceneCallback: (() => void) | null = null;

  // Timestamp dari interaksi terakhir
  private lastInteractionTime: number = Date.now();
  
  // Waktu saat timer terakhir dimulai untuk menghitung dan menampilkan timer
  private timerStartTime: number = Date.now();
  
  // Timer aktif saat ini (untuk menampilkan jenis timer yang sedang berjalan)
  private currentActiveTimer: "idle" | "hover" | "ultimatum" | null = null;

  // Typing system properties (matching hoverDialogController and dialogController)
  private typingSpeed: number = 50; // ms per character
  private isTypingIdle: boolean = false;
  private idleTextCallback: ((text: string, isComplete: boolean) => void) | null = null;
  private currentText: string = '';
  private fullText: string = '';
  private charIndex: number = 0;
  private typingInterval: NodeJS.Timeout | null = null;

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

  // Method untuk memanggil startIdleTimer setelah dialog model selesai berbicara
  public startIdleTimerAfterDialogComplete(): void {
    console.log(
      "[IdleTimeoutController] Dialog model selesai berbicara. Memeriksa apakah dapat memulai timer IDLE_DIALOGS...",
    );

    // Periksa terlebih dahulu apakah mainDialog sedang aktif
    if (this.dialogController.isMainDialogActive()) {
      console.log(
        "[IdleTimeoutController] Main dialog masih aktif. Menunggu...",
      );

      // Cek lagi setelah beberapa saat
      setTimeout(() => {
        this.startIdleTimerAfterDialogComplete();
      }, 2000); // Cek setiap 2 detik

      return;
    }

    // Periksa terlebih dahulu apakah ada aktivitas audio atau dialog yang masih berjalan
    if (this.isAudioOrDialogActive()) {
      console.log(
        "[IdleTimeoutController] Masih ada audio atau dialog aktif. Menunggu...",
      );

      // Cek lagi setelah beberapa saat
      setTimeout(() => {
        this.startIdleTimerAfterDialogComplete();
      }, 2000); // Cek setiap 2 detik

      return;
    }

    // Periksa apakah ada dialog kontrak yang aktif
    try {
      // @ts-ignore - akses properti global dari window
      if (window.__contractDialogActive) {
        console.log(
          "[IdleTimeoutController] Dialog kontrak masih aktif. Menunggu...",
        );

        // Cek lagi setelah beberapa saat
        setTimeout(() => {
          this.startIdleTimerAfterDialogComplete();
        }, 2000); // Cek setiap 2 detik

        return;
      }
    } catch (e) {
      console.error(
        "[IdleTimeoutController] Error memeriksa status dialog kontrak:",
        e,
      );
    }

    // Jika tidak ada aktivitas yang mengganggu, mulai timer
    console.log(
      "[IdleTimeoutController] Tidak ada aktivitas yang mengganggu. Memulai timer IDLE_DIALOGS...",
    );
    this.startIdleTimer();
  }

  // Getter untuk status peringatan hover berlebihan
  public isExcessiveHoverWarningShown(): boolean {
    return this.hasShownExcessiveHoverWarning;
  }

  // Getter untuk status peringatan hover final
  public isFinalHoverWarningShown(): boolean {
    return this.hasShownFinalHoverWarning;
  }

  // Getter untuk status dipukul
  public isPunchExecuted(): boolean {
    return this.hasBeenPunched;
  }

  // Method untuk mengecek apakah ada idle warning dialog yang aktif
  public isAnyIdleWarningActive(): boolean {
    return (
      this.hasShownFirstWarning ||
      this.hasShownSecondWarning ||
      this.hasShownFinalWarning ||
      this.hasBeenThrown ||
      this.hasShownExcessiveHoverWarning ||
      this.hasShownFinalHoverWarning ||
      this.hasBeenPunched
    );
  }

  // Metode publik untuk menampilkan peringatan hover dari luar
  public handleExcessiveHover(): void {
    this.showIdleWarning(IDLE_DIALOGS.EXCESSIVE_HOVER_WARNING);
  }

  // Metode publik untuk menampilkan peringatan final hover dari luar
  public handleFinalHoverWarning(): void {
    this.showIdleWarning(IDLE_DIALOGS.FINAL_HOVER_WARNING);
  }

  // Metode publik untuk memicu efek lempar dari luar
  public handleThrowUser(): void {
    // Log this interaction for analytics
    console.log("User is being thrown out of the screen");
    this.throwUser();
  }

  // Metode publik untuk memicu efek pukul dari luar
  public handlePunchUser(): void {
    // Log this interaction for analytics
    console.log("User is being punched, preparing dream sequence");
    this.punchUser();
  }

  // Method untuk punishment langsung saat user hover berlebihan setelah kembali
  public triggerExcessiveHoverPunishment(): void {
    console.log("[IdleTimeoutController] Triggering immediate punishment for excessive hovering after return");
    
    // Mark that user has been punched for tracking
    this.hasBeenPunched = true;
    
    // Execute punishment immediately without dialog
    this.punchUser();
  }

  // Cek apakah ada audio atau dialog yang sedang berjalan
  private isAudioOrDialogActive(): boolean {
    // Cek apakah ada audio yang sedang diputar
    const isAudioPlaying = this.elevenlabsService.isCurrentlyPlaying();

    // Cek apakah ada dialog audio yang sedang diproses di DialogController
    let isDialogAudioProcessing = false;
    if (typeof this.dialogController.isAudioProcessing === "function") {
      isDialogAudioProcessing = this.dialogController.isAudioProcessing();
    }

    // Cek apakah ada dialog yang sedang diketik
    let isDialogTyping = false;
    if (typeof this.dialogController.isCurrentlyTyping === "function") {
      isDialogTyping = this.dialogController.isCurrentlyTyping();
    }

    // Cek apakah idle dialog sedang diketik (new check)
    const isIdleDialogTyping = this.isTypingIdle;

    // Only block if main dialog is typing OR audio is playing, don't block for finished dialogs
    const isActive = isDialogTyping || isIdleDialogTyping || isAudioPlaying;

    return isActive;
  }

  // Metode untuk mendapatkan waktu tersisa pada timer saat ini (untuk UI timer)
  public getRemainingTime(): { timeRemaining: number, totalDuration: number, type: string } {
    // Hide timer during Extended Return sequence
    if (this.isExtendedReturnSequenceActive) {
      return { 
        timeRemaining: 0, 
        totalDuration: 0,
        type: "Extended Return Dialog Active" 
      };
    }
    
    const now = Date.now();
    const timeSinceStart = now - this.timerStartTime;
    
    // Default response jika tidak ada timer aktif
    let result = { 
      timeRemaining: 0, 
      totalDuration: 0,
      type: "Tidak ada timer aktif" 
    };
    
    if (this.currentActiveTimer === "idle") {
      // Jika timer idle aktif, hitung waktu tersisa berdasarkan peringatan mana yang sedang aktif
      if (!this.hasShownFirstWarning) {
        result = {
          timeRemaining: Math.max(0, TIMEOUT_DURATIONS.FIRST_WARNING - timeSinceStart),
          totalDuration: TIMEOUT_DURATIONS.FIRST_WARNING,
          type: "First Warning"
        };
      } else if (!this.hasShownSecondWarning) {
        result = {
          timeRemaining: Math.max(0, TIMEOUT_DURATIONS.SECOND_WARNING - timeSinceStart),
          totalDuration: TIMEOUT_DURATIONS.SECOND_WARNING,
          type: "Second Warning"
        };
      } else if (!this.hasShownFinalWarning) {
        result = {
          timeRemaining: Math.max(0, TIMEOUT_DURATIONS.FINAL_WARNING - timeSinceStart),
          totalDuration: TIMEOUT_DURATIONS.FINAL_WARNING,
          type: "Final Warning"
        };
      } else if (!this.hasBeenThrown) {
        result = {
          timeRemaining: Math.max(0, TIMEOUT_DURATIONS.THROW_USER - timeSinceStart),
          totalDuration: TIMEOUT_DURATIONS.THROW_USER,
          type: "Throw"
        };
      }
    } else if (this.currentActiveTimer === "ultimatum") {
      // Jika timer ultimatum aktif, tampilkan waktu tersisa untuk ultimatum
      result = {
        timeRemaining: Math.max(0, TIMEOUT_DURATIONS.EXTENDED_RETURN_ULTIMATUM - timeSinceStart),
        totalDuration: TIMEOUT_DURATIONS.EXTENDED_RETURN_ULTIMATUM,
        type: "Ultimatum"
      };
    }
    // Timer hover sudah dihapus - menggunakan hover counting sebagai gantinya
    
    return result;
  }

  // Memulai penghitungan timeout idle
  public startIdleTimer(): void {
    // Cegah multiple restart dengan debouncing
    if (this.isTimerRunning) {
      console.log("[IdleTimeoutController] Timer sudah aktif, mengabaikan restart");
      return;
    }

    // Periksa apakah mainDialog sedang aktif
    if (this.dialogController.isMainDialogActive()) {
      console.log("[IdleTimeoutController] Main dialog sedang aktif. Menunggu...");
      setTimeout(() => {
        this.startIdleTimer();
      }, 2000);
      return;
    }

    // Periksa apakah ada audio atau dialog yang aktif
    if (this.isAudioOrDialogActive()) {
      console.log("[IdleTimeoutController] Masih ada audio atau dialog aktif. Menunggu...");
      setTimeout(() => {
        this.startIdleTimer();
      }, 2000);
      return;
    }

    // Periksa kontrak dialog
    try {
      // @ts-ignore - akses properti global dari window
      if (window.__contractDialogActive) {
        console.log("[IdleTimeoutController] Contract dialog masih aktif. Menunggu...");
        setTimeout(() => {
          this.startIdleTimer();
        }, 3000);
        return;
      }
    } catch (e) {
      console.error("[IdleTimeoutController] Error checking contract dialog:", e);
    }

    console.log("[IdleTimeoutController] ✅ Memulai timer IDLE baru");

    this.clearAllIdleTimers();
    
    // Reset semua status untuk siklus timer baru
    this.hasShownFirstWarning = false;
    this.hasShownSecondWarning = false;
    this.hasShownFinalWarning = false;
    this.hasBeenThrown = false;
    
    // Clear processing warnings set
    this.processingWarnings.clear();
    
    // Set waktu mulai dan aktivasi timer
    this.timerStartTime = Date.now();
    this.currentActiveTimer = "idle";
    this.isTimerRunning = true;
    
    this.setupIdleTimers();
  }

  // Setup timer idle dengan monitoring real-time
  private setupIdleTimers(): void {
    // Clear existing timers
    this.clearAllIdleTimers();

    const now = Date.now();
    this.timerStartTime = now;

    // Check if user should get ultimatum timer directly instead of gradual warnings
    if (this.shouldUseUltimatumTimer()) {
      console.log('[IdleTimeoutController] User qualifies for direct ultimatum timer - skipping gradual warnings');
      this.currentActiveTimer = "ultimatum";
      
      // Start ultimatum timer directly
      this.extendedReturnTimer = setTimeout(() => {
        this.executeUltimatum();
      }, TIMEOUT_DURATIONS.EXTENDED_RETURN_ULTIMATUM);
      
      console.log('[IdleTimeoutController] Direct ultimatum timer started - 2 minutes until punishment');
      return;
    }

    // Start monitoring interval untuk check timer state secara real-time
    this.checkInterval = setInterval(() => {
      this.checkTimerState();
    }, 50); // Check setiap 50ms untuk responsivitas maksimal

    console.log('[IdleTimeoutController] Real-time timer monitoring started');
  }

  // Method to check if user should get ultimatum timer directly
  private shouldUseUltimatumTimer(): boolean {
    try {
      const achievementController = AchievementController.getInstance();
      
      // Get achievements
      const hasDigitalOdyssey = achievementController.hasAchievement('nightmare'); // This is digital odyssey
      const hasEscapist = achievementController.hasAchievement('escape'); // This is dream escapist
      
      // Condition 1: User has been thrown or punched before
      const hasBeenThrownOrPunched = this.hasBeenThrown || this.hasBeenPunched;
      
      // Condition 2: User has digital odyssey achievement (nightmare)
      const hasDigitalOdysseyAchievement = hasDigitalOdyssey;
      
      // Condition 3: User has dream escapist achievement (escape)
      const hasDreamEscapistAchievement = hasEscapist;
      
      const shouldUse = hasBeenThrownOrPunched || hasDigitalOdysseyAchievement || hasDreamEscapistAchievement;
      
      console.log("[IdleTimeoutController] Ultimatum timer check:", {
        hasBeenThrown: this.hasBeenThrown,
        hasBeenPunched: this.hasBeenPunched,
        hasBeenThrownOrPunched,
        hasDigitalOdyssey: hasDigitalOdysseyAchievement,
        hasEscapist: hasDreamEscapistAchievement,
        shouldUseUltimatum: shouldUse
      });
      
      return shouldUse;
    } catch (error) {
      console.error("[IdleTimeoutController] Error checking ultimatum timer conditions:", error);
      return false;
    }
  }

  // Method untuk mengecek state timer dan trigger warnings secara real-time
  private checkTimerState(): void {
    try {
      if (!this.timerStartTime || (this.currentActiveTimer !== "idle" && this.currentActiveTimer !== "ultimatum")) {
        return;
      }

      const elapsed = Date.now() - this.timerStartTime;
      
      // Debug logging setiap 10 detik
      if (elapsed % 10000 < 100) {
        console.log('[IdleTimeoutController] Timer check - elapsed:', elapsed, 'ms, flags:', {
          first: this.hasShownFirstWarning,
          second: this.hasShownSecondWarning,
          final: this.hasShownFinalWarning,
          thrown: this.hasBeenThrown,
          timerType: this.currentActiveTimer
        });
      }

      // Skip normal warnings if in ultimatum mode
      if (this.currentActiveTimer === "ultimatum") {
        return;
      }

      // First warning check - trigger tepat saat elapsed >= 120000ms
      if (!this.hasShownFirstWarning && elapsed >= TIMEOUT_DURATIONS.FIRST_WARNING) {
        const warningKey = 'first_warning';
        
        // Check if already being processed
        if (this.processingWarnings.has(warningKey)) {
          return;
        }
        
        // Set flags immediately to prevent race condition
        this.hasShownFirstWarning = true;
        this.processingWarnings.add(warningKey);
        console.log('[IdleTimeoutController] ⚡ Triggering first warning - elapsed:', elapsed, 'ms');
        
        // Schedule the dialog to run after current execution
        setTimeout(() => {
          if (!this.isAudioOrDialogActive()) {
            this.showIdleWarning(IDLE_DIALOGS.FIRST_WARNING);
          } else {
            console.log('[IdleTimeoutController] First warning delayed due to active audio/dialog');
            // Retry after delay
            setTimeout(() => {
              if (!this.isAudioOrDialogActive()) {
                this.showIdleWarning(IDLE_DIALOGS.FIRST_WARNING);
              }
            }, 2000);
          }
          // Remove from processing set after execution
          this.processingWarnings.delete(warningKey);
        }, 0);
      }

      // Second warning check - trigger tepat saat elapsed >= 300000ms
      if (!this.hasShownSecondWarning && elapsed >= TIMEOUT_DURATIONS.SECOND_WARNING) {
        const warningKey = 'second_warning';
        
        // Check if already being processed
        if (this.processingWarnings.has(warningKey)) {
          return;
        }
        
        // Set flags immediately to prevent race condition
        this.hasShownSecondWarning = true;
        this.processingWarnings.add(warningKey);
        console.log('[IdleTimeoutController] ⚡ Triggering second warning - elapsed:', elapsed, 'ms');
        
        // Schedule the dialog to run after current execution
        setTimeout(() => {
          if (!this.isAudioOrDialogActive()) {
            this.showIdleWarning(IDLE_DIALOGS.SECOND_WARNING);
          } else {
            console.log('[IdleTimeoutController] Second warning delayed due to active audio/dialog');
            // Retry after delay
            setTimeout(() => {
              if (!this.isAudioOrDialogActive()) {
                this.showIdleWarning(IDLE_DIALOGS.SECOND_WARNING);
              }
            }, 2000);
          }
          // Remove from processing set after execution
          this.processingWarnings.delete(warningKey);
        }, 0);
      }

      // Final warning check - trigger tepat saat elapsed >= 540000ms
      if (!this.hasShownFinalWarning && elapsed >= TIMEOUT_DURATIONS.FINAL_WARNING) {
        const warningKey = 'final_warning';
        
        // Check if already being processed
        if (this.processingWarnings.has(warningKey)) {
          return;
        }
        
        // Set flags immediately to prevent race condition
        this.hasShownFinalWarning = true;
        this.processingWarnings.add(warningKey);
        console.log('[IdleTimeoutController] ⚡ Triggering final warning - elapsed:', elapsed, 'ms');
        
        // Schedule the dialog to run after current execution
        setTimeout(() => {
          if (!this.isAudioOrDialogActive()) {
            this.showIdleWarning(IDLE_DIALOGS.FINAL_WARNING);
          } else {
            console.log('[IdleTimeoutController] Final warning delayed due to active audio/dialog');
            // Retry after delay
            setTimeout(() => {
              if (!this.isAudioOrDialogActive()) {
                this.showIdleWarning(IDLE_DIALOGS.FINAL_WARNING);
              }
            }, 2000);
          }
          // Remove from processing set after execution
          this.processingWarnings.delete(warningKey);
        }, 0);
      }

      // Throw user check - trigger tepat saat elapsed >= 600000ms
      if (!this.hasBeenThrown && elapsed >= TIMEOUT_DURATIONS.THROW_USER) {
        const warningKey = 'throw_user';
        
        // Check if already being processed
        if (this.processingWarnings.has(warningKey)) {
          return;
        }
        
        // Set flags immediately to prevent race condition
        this.hasBeenThrown = true;
        this.processingWarnings.add(warningKey);
        console.log('[IdleTimeoutController] ⚡ Throwing user - elapsed:', elapsed, 'ms');
        
        // Schedule the action to run after current execution
        setTimeout(() => {
          if (!this.isAudioOrDialogActive()) {
            this.throwUser();
          } else {
            console.log('[IdleTimeoutController] Throw user delayed due to active audio/dialog');
            // Retry after delay
            setTimeout(() => {
              if (!this.isAudioOrDialogActive()) {
                this.throwUser();
              }
            }, 2000);
          }
          // Remove from processing set after execution
          this.processingWarnings.delete(warningKey);
        }, 0);
      }
    } catch (error) {
      console.error('[IdleTimeoutController] Error in checkTimerState:', error);
      // Clear interval on error to prevent repeated failures
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
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

    if (this.extendedReturnTimer) {
      clearTimeout(this.extendedReturnTimer);
      this.extendedReturnTimer = null;
    }

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Timer hover methods dihapus - menggunakan hover counting sebagai gantinya

  // Handler untuk reset timer secara manual (dari link hover atau kontrak)
  public resetIdleTimer(): void {
    this.lastInteractionTime = Date.now();
    
    // Reset timer start time
    this.timerStartTime = Date.now();
    console.log("[IdleTimeoutController] Manual reset requested, resetting timer start time");
    
    // Reset semua flag peringatan
    this.hasShownFirstWarning = false;
    this.hasShownSecondWarning = false;
    this.hasShownFinalWarning = false;
    this.hasBeenThrown = false;
    
    // Clear processing warnings set
    this.processingWarnings.clear();
    
    // Reset semua timer dan mulai ulang
    this.clearAllIdleTimers();
    this.startIdleTimer();
    
    console.log("[IdleTimeoutController] All warning flags and timers have been reset");
  }

  // Method untuk force trigger first warning (untuk testing)
  public forceFirstWarning(): void {
    console.log("[IdleTimeoutController] Force triggering first warning");
    this.hasShownFirstWarning = false;
    this.processingWarnings.delete('first_warning');
    this.showIdleWarning(IDLE_DIALOGS.FIRST_WARNING);
  }

  // Handler untuk interaksi user
  public handleUserInteraction(): void {
    this.lastInteractionTime = Date.now();
    
    // Cancel Extended Return Timer (ultimatum timer) if user interacts
    if (this.extendedReturnTimer) {
      console.log("[IdleTimeoutController] User interacted - canceling ultimatum timer and resetting Extended Return sequence");
      clearTimeout(this.extendedReturnTimer);
      this.extendedReturnTimer = null;
      this.isExtendedReturnSequenceActive = false;
      // Reset timer type if it was ultimatum
      if (this.currentActiveTimer === "ultimatum") {
        this.currentActiveTimer = null;
      }
      // Don't reset lastDialogWasReturn here as it might be needed elsewhere
    }
    
    // TIDAK me-reset timer start time untuk gerakan mouse biasa
    
    // Jika mainDialog masih aktif, jangan mulai timer baru
    if (this.dialogController.isMainDialogActive()) {
      console.log(
        "[IdleTimeoutController] Main dialog masih aktif, menunda handleUserInteraction...",
      );
      return;
    }
    
    // Jika dialog model atau audio masih aktif, jangan mulai timer baru
    if (this.isAudioOrDialogActive()) {
      console.log(
        "[IdleTimeoutController] Dialog model atau audio masih aktif, menunda handleUserInteraction...",
      );
      return;
    }

    // Periksa apakah properti window untuk dialog kontrak masih aktif
    try {
      // @ts-ignore - akses properti global dari window
      if (window.__contractDialogActive) {
        console.log(
          "[IdleTimeoutController] Contract dialog masih aktif, menunda handleUserInteraction...",
        );
        return;
      }
    } catch (e) {
      console.error(
        "[IdleTimeoutController] Error checking contract dialog status:",
        e,
      );
    }

    // Check if HOVER_AFTER_RESET conditions are met
    const shouldTriggerHoverAfterReset = this.shouldTriggerHoverAfterReset();
    
    if (shouldTriggerHoverAfterReset && !this.hasInteractedAfterReset) {
      // First interaction after meeting hover after reset conditions
      this.hasInteractedAfterReset = true;
      
      console.log("[IdleTimeoutController] Triggering HOVER_AFTER_RESET - conditions met and first interaction detected");
      
      // Set dialog source to main for proper handling
      if (this.hoverDialogController.setDialogSource) {
        this.hoverDialogController.setDialogSource("main");
      }
      
      // Show HOVER_AFTER_RESET dialog first
      this.showIdleWarning(IDLE_DIALOGS.HOVER_AFTER_RESET);

      // Timer hover sudah dihapus - dialog akan dipicu melalui hover counting
    } else if (!this.hasBeenThrown) {
      // Normal timer reset if user hasn't been thrown yet
      this.clearAllIdleTimers();
      this.setupIdleTimers();
    }
  }

  // Set untuk melacak dialog marah yang sudah ditampilkan
  private displayedAngryDialogs: Set<string> = new Set();

  // Method to check if HOVER_AFTER_RESET should be triggered based on new conditions
  private shouldTriggerHoverAfterReset(): boolean {
    try {
      const achievementController = AchievementController.getInstance();
      
      // Check if user has digital odyssey (nightmare) and dream escapist (escape) achievements
      const hasDigitalOdyssey = achievementController.hasAchievement('nightmare');
      const hasEscapist = achievementController.hasAchievement('escape');
      
      // Condition 1: User has both digital odyssey and dream escapist achievements
      const hasRequiredAchievements = hasDigitalOdyssey && hasEscapist;
      
      // Condition 2: User has been thrown or punched AND has returned
      const hasBeenThrownOrPunched = this.hasBeenThrown || this.hasBeenPunched;
      const hasReturnedAfterAction = hasBeenThrownOrPunched && this.userHasBeenReturn;
      
      console.log("[IdleTimeoutController] HOVER_AFTER_RESET conditions check:", {
        hasDigitalOdyssey,
        hasEscapist,
        hasRequiredAchievements,
        hasBeenThrown: this.hasBeenThrown,
        hasBeenPunched: this.hasBeenPunched,
        hasBeenThrownOrPunched,
        userHasBeenReturn: this.userHasBeenReturn,
        hasReturnedAfterAction
      });
      
      return hasRequiredAchievements || hasReturnedAfterAction;
    } catch (error) {
      console.error("[IdleTimeoutController] Error checking HOVER_AFTER_RESET conditions:", error);
      return false;
    }
  }

  // Public methods for typing status (matching hoverDialogController interface)
  public isTypingIdleDialog(): boolean {
    return this.isTypingIdle;
  }

  public setIdleTextCallback(callback: (text: string, isComplete: boolean) => void): void {
    this.idleTextCallback = callback;
  }

  // Stop typing method (matching hoverDialogController)
  public stopTyping(): void {
    this.isTypingIdle = false;
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    
    // Reset text callback
    if (this.idleTextCallback) {
      this.idleTextCallback("", true);
    }
    this.currentText = "";
    this.fullText = "";
  }

  // Start typing animation (matching dialogController logic)
  private async startTypingAnimation(text: string): Promise<void> {
    this.fullText = text;
    this.currentText = '';
    this.charIndex = 0;
    this.isTypingIdle = true;
    
    // Estimate duration based on text length (matching dialogController logic)
    const estimatedDuration = Math.max(3000, (text.length / 10) * 1000);
    
    // Try to speak the text if voice is enabled and not muted
    let audioStarted = false;
    if (this.elevenlabsService.getApiKey() && !this.elevenlabsService.isMuted()) {
      console.log("[IdleTimeoutController] Generating speech for text:", text);
      audioStarted = await this.elevenlabsService.speakText(text);
    } else if (this.elevenlabsService.isMuted()) {
      console.log("[IdleTimeoutController] Audio is muted, skipping voice synthesis for idle dialog");
    }
    
    // Adjust typing speed based on audio
    const typingDuration = audioStarted ? estimatedDuration : (text.length * this.typingSpeed);
    const typingSpeed = audioStarted 
      ? Math.max(20, Math.min(50, typingDuration / text.length)) 
      : this.typingSpeed;
    
    console.log(`[IdleTimeoutController] Starting typing animation for idle dialog in ${Math.round(typingDuration)}ms`);
    
    // Set up audio completion timer if audio is playing
    let audioCompletionTimer: NodeJS.Timeout | null = null;
    if (audioStarted) {
      audioCompletionTimer = setTimeout(() => {
        if (this.isTypingIdle) {
          console.log("[IdleTimeoutController] Audio completion timer triggered - finishing idle dialog typing");
          this.skipToFullIdleText();
        }
      }, estimatedDuration + 1000);
    }
    
    // Start typewriter effect
    this.typingInterval = setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.currentText += this.fullText[this.charIndex];
        this.charIndex++;
        if (this.idleTextCallback) {
          this.idleTextCallback(this.currentText, false);
        }
      } else {
        // Typing complete
        this.isTypingIdle = false;
        if (this.typingInterval) {
          clearInterval(this.typingInterval);
          this.typingInterval = null;
        }
        
        // Clear audio completion timer if still active
        if (audioCompletionTimer) {
          clearTimeout(audioCompletionTimer);
          audioCompletionTimer = null;
        }
        
        if (this.idleTextCallback) {
          this.idleTextCallback(this.currentText, true);
        }
      }
    }, typingSpeed);
  }

  // Skip to full text method (matching dialogController)
  public skipToFullIdleText(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    
    this.elevenlabsService.stopSpeaking();
    this.currentText = this.fullText;
    this.isTypingIdle = false;
    
    if (this.idleTextCallback) {
      this.idleTextCallback(this.fullText, true);
    }
  }

  // Method untuk menampilkan peringatan
  public async showIdleWarning(text: string): Promise<void> {
    // Cek apakah ini dialog marah dan sudah pernah ditampilkan
    const isAngryDialog =
      text.includes("KEEP PUSHING") ||
      text.includes("GET OUT") ||
      text.includes("ENOUGH") ||
      text.includes("ASKED FOR THIS");

    if (isAngryDialog && this.displayedAngryDialogs.has(text)) {
      console.log(
        "[IdleTimeoutController] Preventing duplicate angry dialog:",
        text,
      );
      return;
    }

    // Tambahkan ke set jika ini dialog marah
    if (isAngryDialog) {
      this.displayedAngryDialogs.add(text);
    }

    // Unlock achievements berdasarkan dialog yang ditampilkan
    try {
      const achievementController = AchievementController.getInstance();

      // Final warning setelah 9 menit - achievement TIME GAZER hanya didapat saat FINAL_WARNING tercapai dari idle timeout
      if (text === IDLE_DIALOGS.FINAL_WARNING && this.hasShownFinalWarning && this.currentActiveTimer === "idle") {
        achievementController.unlockAchievement("patience", true);
        console.log(
          "[IdleTimeoutController] Unlocked 'patience' achievement for reaching FINAL_WARNING dialog from idle timeout with forced notification",
        );
      }

      // Dialog setelah reset
      else if (text.includes("Now what, you little filth")) {
        achievementController.unlockAchievement("return", true);
        console.log(
          "[IdleTimeoutController] Unlocked 'return' achievement for returning after reset with forced notification",
        );
      }

      // Dialog setelah hover
      else if (text.includes("Hmph... Finally, you decide to move")) {
        achievementController.unlockAchievement("hover", true);
        console.log(
          "[IdleTimeoutController] Unlocked 'hover' achievement for hovering after reset with forced notification",
        );
      }
    } catch (error) {
      console.error("Failed to unlock achievement:", error);
    }

    // Hentikan semua aktivitas dialog terlebih dahulu
    this.dialogController.stopTyping();
    this.hoverDialogController.stopTyping();
    this.stopTyping(); // Stop our own typing if any

    console.log(`[IdleTimeoutController] Showing warning message: "${text}"`);

    // Set dialog source ke 'main' untuk memastikan teks muncul di dialog box utama
    if (this.hoverDialogController.setDialogSource) {
      console.log(
        "[IdleTimeoutController] Setting dialog source to 'main' before showing idle warning",
      );
      this.hoverDialogController.setDialogSource("main");
    }

    // Ensure the dialog box is visible and ready
    try {
      // Use type assertion to avoid TypeScript errors
      const windowAny = window as any;
      
      if (windowAny.__dialogBoxIsFinishedSetter && typeof windowAny.__dialogBoxIsFinishedSetter === "function") {
        windowAny.__dialogBoxIsFinishedSetter(false);
        console.log("[IdleTimeoutController] Reset dialog finished state to show dialog box");
      }

      // Set global flag to force show idle warning
      windowAny.__forceShowIdleWarning = (text && text.trim() !== "" && text !== "...") ? true : false;
      console.log(`[IdleTimeoutController] Setting global flag to force show idle warning dialog: ${windowAny.__forceShowIdleWarning}`);
    } catch (e) {
      console.error("Error preparing dialog box for idle warning:", e);
    }

    // Wait a moment to ensure previous audio stops
    setTimeout(async () => {
      this.elevenlabsService.stopSpeaking();
      
      // Start our own typing animation (matching hoverDialogController logic)
      await this.startTypingAnimation(text);
      
      // Mark that user has interacted with idle dialog
      this.hoverDialogController.setHasInteractedWithHover(true);
    }, 100);
  }

  // Method untuk 'melempar' user
  private throwUser(): void {
    console.log("[IdleTimeoutController] Executing throw user action");

    // Unlock achievement for making character angry
    try {
      const achievementController = AchievementController.getInstance();
      achievementController.unlockAchievement("anger");
    } catch (error) {
      console.error("Failed to unlock anger achievement:", error);
    }



    // Tambahkan dialog peringatan untuk 'melempar' dengan nada kemarahan
    const throwText = "That's it. GET OUT OF MY SIGHT!";

    // Set dialog source to main for proper handling
    if (this.hoverDialogController.setDialogSource) {
      console.log("[IdleTimeoutController] Setting dialog source to 'main' before showing throw dialog");
      this.hoverDialogController.setDialogSource("main");
    }

    // Use the new typing system instead of old showCustomDialog
    this.showIdleWarning(throwText);

    // Pastikan bahwa dialog controller tahu ini adalah post-reset dialog
    try {
      this.dialogController.resetPostResetDialogStatus();
    } catch (e) {
      console.error("Could not reset dialog controller post-reset status:", e);
    }

    // Tandai bahwa user telah dilempar dengan flag baru
    this.hasBeenThrown = true;
    this.hasInteractedAfterReset = false;
    
    // Keep old flags for backwards compatibility
    this.hasBeenReset = true;

    // Notifikasi HoverDialogController bahwa idle timeout telah terjadi
    try {
      // Ini akan mencegah hover dialog muncul lagi setelah idle timeout
      if (
        this.hoverDialogController &&
        typeof this.hoverDialogController.setIdleTimeoutOccurred === "function"
      ) {
        this.hoverDialogController.setIdleTimeoutOccurred(true);
        console.log(
          "Notified HoverDialogController that idle timeout has occurred",
        );
      }
    } catch (e) {
      console.error(
        "Could not notify HoverDialogController about idle timeout:",
        e,
      );
    }

    // Membuat efek rumble pada layar sebelum efek throw
    try {
      // Add screen rumble effect
      document.body.style.transition = "transform 0.1s ease-in-out";
      const rumble = () => {
        const intensity = 5;
        const x = intensity * (Math.random() - 0.5);
        const y = intensity * (Math.random() - 0.5);
        document.body.style.transform = `translate(${x}px, ${y}px)`;
      };

      // Run rumble effect several times before throw
      const rumbleCount = 8;
      const rumbleInterval = setInterval(rumble, 50);

      // Stop rumble after some time
      setTimeout(
        () => {
          clearInterval(rumbleInterval);
          document.body.style.transform = "";
          document.body.style.transition = "";
        },
        rumbleCount * 50 + 50,
      );
    } catch (error) {
      console.error("Error applying rumble effect:", error);
    }

    // Jalankan callback untuk efek melempar dengan jeda yang cukup untuk membaca dialog
    setTimeout(() => {
      console.log("[IdleTimeoutController] Calling throw user callback");
      
      // Play the throw sound effect bersamaan dengan efek visual
      try {
        const windowAny = window as any;
        if (windowAny.createWhooshSound && typeof windowAny.createWhooshSound === "function") {
          console.log("Playing dynamically generated whoosh sound with throw effect");
          windowAny.createWhooshSound();
        } else {
          console.warn("Whoosh sound generator not available");
        }
      } catch (error) {
        console.error("Error playing throw sound effect:", error);
      }
      
      if (this.throwUserCallback) {
        this.throwUserCallback();
      }

      // Reset scene
      if (this.resetSceneCallback) {
        this.resetSceneCallback();
      }
    }, 2300); // Memberikan waktu 2.3 detik untuk membaca dialog "That's it. GET OUT OF MY SIGHT!" sebelum dilempar
  }

  // Method untuk 'memukul' user
  private punchUser(): void {
    // Log removed

    // Set global flag untuk memaksa dialog box muncul
    const windowAny = window as any;
    // Note: PUNCH_WARNING doesn't exist in IDLE_DIALOGS, using punchText instead
    windowAny.__forceShowIdleWarning = true;
    console.log("[IdleTimeoutController] Setting global flag to force show punch warning dialog: true");

    // Tambahkan dialog peringatan untuk 'memukul'
    const punchText = "YOU ASKED FOR THIS.";

    // Atur dialogSource ke 'main' sebelum menampilkan peringatan
    // untuk memastikan teks muncul di dialog box utama
    if (this.hoverDialogController.setDialogSource) {
      console.log(
        "[IdleTimeoutController] Setting dialog source to 'main' before showing punch dialog",
      );
      this.hoverDialogController.setDialogSource("main");
    }

    // Fungsi untuk menjalankan proses pukulan
    const executePunch = () => {
      console.log("[IdleTimeoutController] Executing punch effect");

      // Notifikasi HoverDialogController bahwa idle timeout telah terjadi
      try {
        // Ini akan mencegah hover dialog muncul lagi setelah idle timeout
        if (
          this.hoverDialogController &&
          typeof this.hoverDialogController.setIdleTimeoutOccurred ===
            "function"
        ) {
          this.hoverDialogController.setIdleTimeoutOccurred(true);
          console.log(
            "Notified HoverDialogController that excessive hover punishment has occurred",
          );
        }
      } catch (e) {
        console.error(
          "Could not notify HoverDialogController about excessive hover punishment:",
          e,
        );
      }

      // Precarga y reproducción del sonido de golpe
      try {
        const punchSound = new Audio("/assets/sounds/punch_sfx.m4a");
        punchSound.volume = 0.8; // Volumen alto para asegurar que se escuche
        punchSound.load();

        // Reproducir el sonido directamente para asegurar que se escuche
        // Incluso antes de llamar al callback
        const playSoundPromise = punchSound.play();

        if (playSoundPromise !== undefined) {
          playSoundPromise
            .then(() =>
              console.log(
                "[IdleTimeoutController] Punch sound playing successfully",
              ),
            )
            .catch((err) =>
              console.error(
                "[IdleTimeoutController] Error playing punch sound:",
                err,
              ),
            );
        }
      } catch (soundError) {
        console.error(
          "[IdleTimeoutController] Failed to initialize punch sound:",
          soundError,
        );
      }

      // Set the hasBeenThrown flag since punch also results in being thrown to dream page
      this.hasBeenThrown = true;
      this.hasInteractedAfterReset = false;
      
      // Ejecutar el callback inmediatamente para una respuesta más rápida
      setTimeout(() => {
        if (this.punchUserCallback) {
          console.log("[IdleTimeoutController] Triggering punch animation");
          this.punchUserCallback();
        }
      }, 50); // Reducido de 200ms a 50ms para una respuesta más rápida

      // Redirección a la página de sueño (dream) después del efecto blackout
      // Mantenemos el tiempo para permitir que se vea claramente el efecto de "pingsan" (desmayo)
      setTimeout(() => {
        console.log(
          "[IdleTimeoutController] Redirecting to dream page after blackout effect",
        );

        // Unlock nightmare achievement before redirecting
        try {
          const achievementController = AchievementController.getInstance();
          achievementController.unlockAchievement("nightmare");
        } catch (error) {
          console.error("Failed to unlock nightmare achievement:", error);
        }

        window.location.href = "/dream.html"; // Redirigir a la página de sueño con video de música
      }, 2200); // Reducido de 2500ms a 2200ms para una transición más rápida
    };

    // Tampilkan peringatan, tetapi tunggu dialog selesai sebelum melanjutkan
    this.showIdleWarning(punchText);

    // Cek apakah ada dialog atau audio aktif
    const checkDialogAndPunch = () => {
      if (this.isAudioOrDialogActive()) {
        console.log(
          "[IdleTimeoutController] Dialog/Audio still active, will check again in 500ms",
        );
        // Jika masih ada aktivitas dialog atau audio, cek lagi nanti
        setTimeout(checkDialogAndPunch, 500);
      } else {
        console.log(
          "[IdleTimeoutController] Dialog/Audio completed, proceeding with punch effect",
        );
        // Jika tidak ada aktivitas dialog/audio, jalankan efek pukulan
        executePunch();
      }
    };

    // Setelah menampilkan dialog, berikan waktu untuk menunggu dialog muncul
    // dan tunggu hingga dialog selesai
    setTimeout(checkDialogAndPunch, 500);
  }

  // Reset semua timer dan status
  public resetAll(): void {
    this.clearAllIdleTimers();
    // Timer hover sudah dihapus

    // Reset semua status
    this.hasShownFirstWarning = false;
    this.hasShownSecondWarning = false;
    this.hasShownFinalWarning = false;
    this.hasBeenThrown = false;

    // Clear set dialog marah yang sudah ditampilkan
    this.displayedAngryDialogs.clear();

    // Clear processing warnings set
    this.processingWarnings.clear();

    this.hasShownExcessiveHoverWarning = false;
    this.hasShownFinalHoverWarning = false;
    this.hasBeenPunched = false;

    this.hasBeenReset = false;
    this.hasInteractedAfterReset = false;
    
    // Reset new tracking variables
    this.hasBeenThrown = false;
    this.userHasBeenReturn = false;

    this.lastInteractionTime = Date.now();

    // Reset global flag untuk force show idle warning
    try {
      // @ts-ignore - akses properti global dari window
      window.__forceShowIdleWarning = false;
      console.log(
        "[IdleTimeoutController] Reset global flag for force show idle warning",
      );
    } catch (e) {
      console.error(
        "Could not reset global flag for force show idle warning:",
        e,
      );
    }

    // Reset juga status idle timeout di HoverDialogController
    try {
      if (
        this.hoverDialogController &&
        typeof this.hoverDialogController.setIdleTimeoutOccurred === "function"
      ) {
        this.hoverDialogController.setIdleTimeoutOccurred(false);
        console.log("Reset HoverDialogController idle timeout status");
      }
    } catch (e) {
      console.error(
        "Could not reset HoverDialogController idle timeout status:",
        e,
      );
    }

    // Setup timer baru
    this.setupIdleTimers();
  }

  // Public methods for accessing and modifying new tracking variables
  public getHasBeenThrown(): boolean {
    return this.hasBeenThrown;
  }

  public setHasBeenThrown(value: boolean): void {
    this.hasBeenThrown = value;
    console.log(`[IdleTimeoutController] hasBeenThrown set to: ${value}`);
  }

  public getUserHasBeenReturn(): boolean {
    return this.userHasBeenReturn;
  }

  public setUserHasBeenReturn(value: boolean): void {
    this.userHasBeenReturn = value;
    console.log(`[IdleTimeoutController] userHasBeenReturn set to: ${value}`);
  }

  public getHasBeenPunched(): boolean {
    return this.hasBeenPunched;
  }

  public setHasInteractedAfterReset(value: boolean): void {
    this.hasInteractedAfterReset = value;
  }

  public getHasInteractedAfterReset(): boolean {
    return this.hasInteractedAfterReset;
  }

  // Method to check if RETURN_DIALOG conditions are met
  private shouldTriggerReturnDialog(): boolean {
    try {
      const achievementController = AchievementController.getInstance();
      
      // Check if user has digital odyssey (nightmare) and dream escapist (escape) achievements
      const hasDigitalOdyssey = achievementController.hasAchievement('nightmare');
      const hasEscapist = achievementController.hasAchievement('escape');
      
      // Condition 1: User has both digital odyssey and dream escapist achievements
      const hasRequiredAchievements = hasDigitalOdyssey && hasEscapist;
      
      // Condition 2: User has been thrown or punched (should trigger RETURN_DIALOG regardless of achievements)
      const hasBeenThrownOrPunched = this.hasBeenThrown || this.hasBeenPunched;
      
      console.log("[IdleTimeoutController] RETURN_DIALOG conditions check:", {
        hasDigitalOdyssey,
        hasEscapist,
        hasRequiredAchievements,
        hasBeenThrown: this.hasBeenThrown,
        hasBeenPunched: this.hasBeenPunched,
        hasBeenThrownOrPunched,
        userHasBeenReturn: this.userHasBeenReturn
      });
      
      // Return true if user has required achievements OR has been thrown/punched
      return hasRequiredAchievements || hasBeenThrownOrPunched;
    } catch (error) {
      console.error("[IdleTimeoutController] Error checking RETURN_DIALOG conditions:", error);
      return false;
    }
  }

  // Method to disable controllers when RETURN_DIALOG conditions are met
  private disableControllers(): void {
    try {
      // Disable HoverDialogController
      if (this.hoverDialogController) {
        console.log("[IdleTimeoutController] Disabling HoverDialogController");
        // Add a flag to disable hover dialog processing
        this.hoverDialogController.setDisabled(true);
      }
      
      // Disable DialogController
      if (this.dialogController) {
        console.log("[IdleTimeoutController] Disabling DialogController");
        // Add a flag to disable main dialog processing
        this.dialogController.setDisabled(true);
      }
    } catch (error) {
      console.error("[IdleTimeoutController] Error disabling controllers:", error);
    }
  }

  // Method to start Extended Return Dialog timer (2 minutes)
  private startExtendedReturnTimer(): void {
    // Clear any existing extended return timer
    if (this.extendedReturnTimer) {
      clearTimeout(this.extendedReturnTimer);
      this.extendedReturnTimer = null;
    }

    console.log("[IdleTimeoutController] Starting Extended Return Dialog timer (2 minutes)");
    
    this.extendedReturnTimer = setTimeout(() => {
      this.showExtendedReturnDialog();
    }, TIMEOUT_DURATIONS.EXTENDED_RETURN_ULTIMATUM);
  }

  // Method to show Extended Return Dialog with ultimatum
  private async showExtendedReturnDialog(): Promise<void> {
    if (this.hasShownExtendedReturnDialog) {
      console.log("[IdleTimeoutController] Extended Return Dialog already shown, skipping");
      return;
    }

    // Check if last dialog was return dialog
    if (!this.lastDialogWasReturn) {
      console.log("[IdleTimeoutController] Last dialog was not RETURN_DIALOG, skipping Extended Return Dialog");
      return;
    }

    console.log("[IdleTimeoutController] Showing Extended Return Dialog immediately after RETURN_DIALOG");
    
    // Mark as shown
    this.hasShownExtendedReturnDialog = true;
    
    // Get achievement status
    const achievementController = AchievementController.getInstance();
    const hasNightmare = achievementController.hasAchievement('nightmare');
    const hasEscape = achievementController.hasAchievement('escape');
    
    // Get appropriate extended return dialog
    const extendedDialog = getExtendedReturnDialog(hasNightmare, hasEscape);
    
    console.log("[IdleTimeoutController] Showing Extended Return Dialog:", extendedDialog.text);
    console.log("[IdleTimeoutController] User achievement status - Nightmare:", hasNightmare, "Escape:", hasEscape);
    
    // Show the extended dialog
    this.showIdleWarning(extendedDialog.text);
    
    // Wait for the extended dialog to finish speaking before starting ultimatum timer
    // Estimate dialog duration based on text length
    const dialogDuration = Math.max(3000, (extendedDialog.text.length / 10) * 1000);
    
    setTimeout(() => {
      console.log("[IdleTimeoutController] Extended Return Dialog finished - starting 2-minute ultimatum timer");
      this.startUltimatumTimer();
    }, dialogDuration);
    
    // Reset the last dialog flag
    this.lastDialogWasReturn = false;
  }

  // Method to start ultimatum timer (2 minutes after Extended Return Dialog)
  private startUltimatumTimer(): void {
    console.log("[IdleTimeoutController] Starting ultimatum timer - user has 2 minutes or gets punched");
    
    // Start the 2-minute ultimatum timer
    this.extendedReturnTimer = setTimeout(() => {
      this.executeUltimatum();
    }, TIMEOUT_DURATIONS.EXTENDED_RETURN_ULTIMATUM);
  }

  // Method to execute ultimatum - punch the user
  private executeUltimatum(): void {
    console.log("[IdleTimeoutController] Ultimatum timer expired - executing punishment");
    
    // Reset Extended Return sequence flag
    this.isExtendedReturnSequenceActive = false;
    
    // Reset timer type
    this.currentActiveTimer = null;
    
    // Execute the full punch sequence including redirect
    this.hasBeenPunched = true;
    this.punchUser();
  }

  // Method to handle RETURN_DIALOG logic when user clicks APPROACH HIM after meeting conditions
  public handleApproachAfterThrown(): boolean {
    // Check if RETURN_DIALOG conditions are met
    const shouldTrigger = this.shouldTriggerReturnDialog();
    
    if (shouldTrigger && !this.userHasBeenReturn) {
      // Set the return flag
      this.userHasBeenReturn = true;
      this.lastDialogWasReturn = true;
      
      console.log("[IdleTimeoutController] Triggering RETURN_DIALOG - conditions met and user returned");
      
      // Clear all existing timers first
      this.clearAllIdleTimers();
      
      // Activate Extended Return sequence flag
      this.isExtendedReturnSequenceActive = true;
      
      // Disable both controllers before showing RETURN_DIALOG
      this.disableControllers();
      
      // Show RETURN_DIALOG
      if (this.hoverDialogController.setDialogSource) {
        this.hoverDialogController.setDialogSource("main");
      }
      
      // Use the random return dialog variation instead of static text
      const returnDialog = getReturnDialog();
      this.showIdleWarning(returnDialog.text);
      console.log("[IdleTimeoutController] Using random RETURN_DIALOG variation:", returnDialog.text);
      
      // Show Extended Return Dialog after RETURN_DIALOG with proper delay
      setTimeout(() => {
        this.showExtendedReturnDialog();
      }, 5000); // 5 second delay to let RETURN_DIALOG fully complete
      
      // Unlock the return achievement
      try {
        const achievementController = AchievementController.getInstance();
        achievementController.unlockAchievement('return', true); // Force notification
        console.log("[IdleTimeoutController] Unlocked 'return' achievement for returning after meeting conditions");
      } catch (error) {
        console.error("Failed to unlock return achievement:", error);
      }
      
      return true; // Indicates RETURN_DIALOG was triggered
    }
    
    return false; // Normal approach, no special dialog needed
  }


}

export default IdleTimeoutController;
