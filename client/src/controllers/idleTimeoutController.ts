import DialogController from "./dialogController";
import HoverDialogController from "./hoverDialogController";
import AchievementController from "./achievementController";
import ElevenLabsService from "../services/elevenlabsService";

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
  EXCESSIVE_HOVER_WARNING: 10 * 1000, // 10 detik - Sangat cepat karena triggered oleh HoverDialogController
  FINAL_HOVER_WARNING: 20 * 1000, // 20 detik
  PUNCH_USER: 30 * 1000, // 30 detik
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
  
  // Waktu saat timer terakhir dimulai untuk menghitung dan menampilkan timer
  private timerStartTime: number = Date.now();
  
  // Timer aktif saat ini (untuk menampilkan jenis timer yang sedang berjalan)
  private currentActiveTimer: "idle" | "hover" | null = null;

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
    // Pastikan method isCurrentlyTyping ada di dialogController
    if (typeof this.dialogController.isCurrentlyTyping === "function") {
      isDialogTyping = this.dialogController.isCurrentlyTyping();
    }

    // Cek juga apakah hover dialog sedang diketik
    let isHoverDialogTyping = false;
    // Gunakan try/catch untuk menghindari error jika method tidak ada
    try {
      if (
        typeof this.hoverDialogController.isTypingHoverDialog === "function"
      ) {
        isHoverDialogTyping = this.hoverDialogController.isTypingHoverDialog();
      }
    } catch (error) {
      // Error handling diselesaikan dengan diam
    }

    // PERUBAHAN: Hanya anggap aktif jika ada dialog yang sedang aktif
    // Audio yang sedang berjalan TIDAK menghentikan timer idle
    const isActive = isDialogTyping || isHoverDialogTyping;

    // Log untuk debugging
    console.log("[IdleTimeoutController] Aktivitas terdeteksi:", {
      audio: isAudioPlaying,
      audioProcessing: isDialogAudioProcessing,
      dialog: isDialogTyping,
      hoverDialog: isHoverDialogTyping,
      timerBlocked: isActive
    });

    // Jika hanya dialog yang aktif, return true 
    return isActive;
  }

  // Metode untuk mendapatkan waktu tersisa pada timer saat ini (untuk UI timer)
  public getRemainingTime(): { timeRemaining: number, totalDuration: number, type: string } {
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
    } else if (this.currentActiveTimer === "hover") {
      // Jika timer hover aktif, hitung waktu tersisa berdasarkan hover timer
      if (!this.hasShownExcessiveHoverWarning) {
        result = {
          timeRemaining: Math.max(0, TIMEOUT_DURATIONS.EXCESSIVE_HOVER_WARNING - timeSinceStart),
          totalDuration: TIMEOUT_DURATIONS.EXCESSIVE_HOVER_WARNING,
          type: "Excessive Hover"
        };
      } else if (!this.hasShownFinalHoverWarning) {
        result = {
          timeRemaining: Math.max(0, TIMEOUT_DURATIONS.FINAL_HOVER_WARNING - timeSinceStart),
          totalDuration: TIMEOUT_DURATIONS.FINAL_HOVER_WARNING,
          type: "Final Hover"
        };
      } else if (!this.hasBeenPunched) {
        result = {
          timeRemaining: Math.max(0, TIMEOUT_DURATIONS.PUNCH_USER - timeSinceStart),
          totalDuration: TIMEOUT_DURATIONS.PUNCH_USER,
          type: "Punch"
        };
      }
    }
    
    return result;
  }

  // Memulai penghitungan timeout idle
  public startIdleTimer(): void {
    // Periksa apakah ada audio atau dialog yang aktif
    if (this.isAudioOrDialogActive()) {
      console.log(
        "[IdleTimeoutController] Dialog model atau audio masih aktif, menunda timer IDLE_DIALOGS...",
      );

      // Cek lagi nanti setelah beberapa detik
      setTimeout(() => {
        this.startIdleTimer();
      }, 5000); // cek setiap 5 detik

      return;
    }

    // Periksa apakah properti window untuk dialog kontrak masih aktif
    try {
      // @ts-ignore - akses properti global dari window
      if (window.__contractDialogActive) {
        console.log(
          "[IdleTimeoutController] Contract dialog masih aktif, menunda timer IDLE_DIALOGS...",
        );

        // Cek lagi nanti setelah beberapa detik
        setTimeout(() => {
          this.startIdleTimer();
        }, 3000); // cek setiap 3 detik untuk contract dialog

        return;
      }
    } catch (e) {
      console.error(
        "[IdleTimeoutController] Error checking contract dialog status:",
        e,
      );
    }

    console.log(
      "[IdleTimeoutController] Dialog model dan contract dialog selesai. Memulai timer IDLE_DIALOGS - First warning in " +
        TIMEOUT_DURATIONS.FIRST_WARNING / 1000 +
        "s, second in " +
        TIMEOUT_DURATIONS.SECOND_WARNING / 1000 +
        "s, final in " +
        TIMEOUT_DURATIONS.FINAL_WARNING / 1000 +
        "s",
    );

    this.clearAllIdleTimers(); // Bersihkan timer yang ada
    
    // Set waktu mulai dan jenis timer aktif
    this.timerStartTime = Date.now();
    this.currentActiveTimer = "idle";
    
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
      // Log removed

      // Cek lagi nanti setelah beberapa detik
      setTimeout(() => {
        this.startExcessiveHoverTimers();
      }, 5000); // cek setiap 5 detik

      return;
    }

    // Log removed
    this.clearAllHoverTimers(); // Bersihkan timer yang ada
    
    // Reset timer start time dan set tipe timer ke hover
    this.timerStartTime = Date.now();
    this.currentActiveTimer = "hover";
    console.log("[IdleTimeoutController] Memulai timer hover, reset waktu mulai timer");

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
    
    // Reset semua timer dan mulai ulang
    this.clearAllIdleTimers();
    this.startIdleTimer();
    
    console.log("[IdleTimeoutController] All warning flags and timers have been reset");
  }

  // Handler untuk interaksi user
  public handleUserInteraction(): void {
    this.lastInteractionTime = Date.now();
    
    // TIDAK me-reset timer start time untuk gerakan mouse biasa
    
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

    if (this.hasBeenReset && !this.hasInteractedAfterReset) {
      // Jika user baru saja di-reset dan ini adalah interaksi pertama setelah reset
      this.hasInteractedAfterReset = true;
      
      console.log("[IdleTimeoutController] Menampilkan HOVER_AFTER_RESET karena ini interaksi pertama setelah reset");
      
      // Gunakan dialog controller langsung untuk menampilkan hover dialog
      try {
        const dialogController = DialogController.getInstance();
        if (dialogController) {
          console.log("[IdleTimeoutController] Directly showing HOVER_AFTER_RESET dialog via DialogController");
          
          // Force reset dialog box visibility sehingga dialog box muncul
          try {
            // @ts-ignore
            if (window.__dialogBoxIsFinishedSetter) {
              // @ts-ignore
              window.__dialogBoxIsFinishedSetter(false);
              console.log("[IdleTimeoutController] Force reset dialog box visibility for HOVER_AFTER_RESET");
            }
          } catch (e) {
            console.error("Failed to force reset dialog box visibility:", e);
          }
          
          // Gunakan showCustomDialog untuk memastikan text muncul
          dialogController.showCustomDialog(IDLE_DIALOGS.HOVER_AFTER_RESET, (text, isComplete) => {
            if (isComplete) {
              console.log("[IdleTimeoutController] HOVER_AFTER_RESET dialog completed");
              
              // Unlock achievement untuk hover setelah reset
              try {
                const achievementController = AchievementController.getInstance();
                achievementController.unlockAchievement('hover');
                console.log("[IdleTimeoutController] Unlocked 'hover' achievement for hovering after reset");
              } catch (error) {
                console.error("Failed to unlock hover achievement:", error);
              }
            }
          });
        }
      } catch (e) {
        console.error("Failed to show HOVER_AFTER_RESET dialog:", e);
        
        // Fallback ke metode lama
        this.showIdleWarning(IDLE_DIALOGS.HOVER_AFTER_RESET);
      }

      // Mulai timer hover berlebihan
      this.startExcessiveHoverTimers();
    } else if (!this.hasBeenReset) {
      // Reset timer idle jika belum di-reset
      this.clearAllIdleTimers();
      this.setupIdleTimers();
    }
  }

  // Set untuk melacak dialog marah yang sudah ditampilkan
  private displayedAngryDialogs: Set<string> = new Set();

  // Method untuk menampilkan peringatan
  private showIdleWarning(text: string): void {
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

      // Final warning setelah 9 menit
      if (text.includes("staring at me for nine damn minutes")) {
        // Force notification parameter = true untuk memastikan muncul notifikasi
        achievementController.unlockAchievement("patience", true);
        console.log(
          "[IdleTimeoutController] Unlocked 'patience' achievement for staring at screen with forced notification",
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

      // Menghapus referensi achievement untuk hover berlebihan sesuai permintaan
    } catch (error) {
      console.error("Failed to unlock achievement:", error);
    }

    // Hentikan semua aktivitas dialog terlebih dahulu
    this.dialogController.stopTyping();
    this.hoverDialogController.stopTyping();

    // Pastikan dialog box ditampilkan untuk idle warnings
    try {
      // Reset isDialogFinished untuk memastikan dialog box muncul kembali jika sudah di-hide
      // @ts-ignore - akses properti global dari window
      if (
        window.__dialogBoxIsFinishedSetter &&
        typeof window.__dialogBoxIsFinishedSetter === "function"
      ) {
        // @ts-ignore
        window.__dialogBoxIsFinishedSetter(false);
        console.log(
          "[IdleTimeoutController] Reset dialog finished state to show dialog box",
        );
      }

      // Set global flag untuk memaksa dialog box muncul
      // @ts-ignore - akses properti global dari window
      window.__forceShowIdleWarning = true;
      console.log(
        "[IdleTimeoutController] Setting global flag to force show idle warning dialog",
      );
    } catch (e) {
      console.error("Error preparing dialog box for idle warning:", e);
    }

    // Pastikan tidak ada audio yang sedang diputar dengan delay untuk memastikan
    // semua audio benar-benar berhenti
    setTimeout(() => {
      // Hentikan audio apapun yang masih berjalan
      this.elevenlabsService.stopSpeaking();

      console.log(`[IdleTimeoutController] Showing warning message: "${text}"`);

      // Set dialog source ke 'main' terlebih dahulu untuk memastikan teks muncul di dialog box utama
      if (this.hoverDialogController.setDialogSource) {
        console.log(
          "[IdleTimeoutController] Setting dialog source to 'main' before showing idle warning",
        );
        this.hoverDialogController.setDialogSource("main");
      }

      // Tambahkan delay kecil untuk memastikan semua suara berhenti sebelum memulai dialog baru
      setTimeout(() => {
        // Tambahkan pre-check apakah dialog box muncul dan reset jika tidak
        try {
          // @ts-ignore
          if (
            window.__dialogBoxTextSetter &&
            typeof window.__dialogBoxTextSetter === "function"
          ) {
            // Coba set text langsung via global function untuk memastikan
            // @ts-ignore
            window.__dialogBoxTextSetter(text);
            console.log(
              "[IdleTimeoutController] Directly set text to dialog box:",
              text,
            );
          }
        } catch (e) {
          console.error("Error directly setting dialog text:", e);
        }

        // Tampilkan dialog peringatan dengan text custom
        // Dialog Controller akan mengelola audio secara otomatis
        this.dialogController.showCustomDialog(
          text,
          (dialogText, isComplete) => {
            if (isComplete) {
              // Tandai bahwa user sudah berinteraksi dengan dialog
              this.hoverDialogController.setHasInteractedWithHover(true);

              // Setelah dialog selesai, jangan langsung hapus flag agar dialog tetap terlihat
              // Flag akan dihapus saat user berinteraksi dengan dialog
            }
          },
        );
      }, 200);
    }, 100);

    // Tidak perlu memanggil elevenlabsService.speakText disini
    // karena sudah dipanggil oleh dialogController.showCustomDialog
  }

  // Method untuk 'melempar' user
  private throwUser(): void {
    console.log("[IdleTimeoutController] Executing throw user action");

    // Set global flag untuk memaksa dialog box muncul
    // @ts-ignore - akses properti global dari window
    window.__forceShowIdleWarning = true;
    console.log(
      "[IdleTimeoutController] Setting global flag to force show throw warning dialog",
    );

    // Unlock achievement for making character angry
    try {
      const achievementController = AchievementController.getInstance();
      achievementController.unlockAchievement("anger");
    } catch (error) {
      console.error("Failed to unlock anger achievement:", error);
    }

    // Play the throw sound effect using the dynamically generated whoosh sound
    try {
      if (
        window.createWhooshSound &&
        typeof window.createWhooshSound === "function"
      ) {
        // Use our custom sound generator
        console.log("Playing dynamically generated whoosh sound");
        window.createWhooshSound();
      } else {
        console.warn("Whoosh sound generator not available");
      }
    } catch (error) {
      console.error("Error playing throw sound effect:", error);
    }

    // Tambahkan dialog peringatan untuk 'melempar' dengan nada kemarahan
    const throwText = "That's it. GET OUT OF MY SIGHT!";

    // Atur dialogSource ke 'main' sebelum menampilkan peringatan
    // untuk memastikan teks muncul di dialog box utama
    if (this.hoverDialogController.setDialogSource) {
      console.log(
        "[IdleTimeoutController] Setting dialog source to 'main' before showing throw dialog",
      );
      this.hoverDialogController.setDialogSource("main");
    }

    this.showIdleWarning(throwText);

    // Pastikan bahwa dialog controller tahu ini adalah post-reset dialog
    try {
      this.dialogController.resetPostResetDialogStatus();
    } catch (e) {
      console.error("Could not reset dialog controller post-reset status:", e);
    }

    // Tandai bahwa user telah dilempar
    this.hasBeenReset = true;
    this.hasInteractedAfterReset = false;

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

    // Jalankan callback untuk efek melempar SEGERA - respons lebih cepat
    setTimeout(() => {
      console.log("[IdleTimeoutController] Calling throw user callback");
      if (this.throwUserCallback) {
        this.throwUserCallback();
      }

      // Reset scene
      if (this.resetSceneCallback) {
        this.resetSceneCallback();
      }
    }, 800); // Reduced wait time for quicker response from 2000ms to 800ms
  }

  // Method untuk 'memukul' user
  private punchUser(): void {
    // Log removed

    // Set global flag untuk memaksa dialog box muncul
    // @ts-ignore - akses properti global dari window
    window.__forceShowIdleWarning = true;
    console.log(
      "[IdleTimeoutController] Setting global flag to force show punch warning dialog",
    );

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

      // Ejecutar el callback inmediatamente para una respuesta más rápida
      setTimeout(() => {
        if (this.punchUserCallback) {
          console.log("[IdleTimeoutController] Triggering punch animation");
          this.punchUserCallback();
        }
      }, 200); // Reducido de 500ms a 200ms para una respuesta más rápida

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
      }, 2500); // Mantenemos 2500ms para una transición clara del efecto blackout
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
    this.clearAllHoverTimers();

    // Reset semua status
    this.hasShownFirstWarning = false;
    this.hasShownSecondWarning = false;
    this.hasShownFinalWarning = false;
    this.hasBeenThrown = false;

    // Clear set dialog marah yang sudah ditampilkan
    this.displayedAngryDialogs.clear();

    this.hasShownExcessiveHoverWarning = false;
    this.hasShownFinalHoverWarning = false;
    this.hasBeenPunched = false;

    this.hasBeenReset = false;
    this.hasInteractedAfterReset = false;

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
}

export default IdleTimeoutController;
