import ElevenLabsService from "../services/elevenlabsService";
import DialogController from "./dialogController";
import IdleTimeoutController, { IDLE_DIALOGS } from "./idleTimeoutController";
import { debounce } from "../lib/utils";
import AchievementController from "./achievementController";

// Jenis link yang mungkin di-hover
export type HoverLinkType =
  | "whatsapp"
  | "email"
  | "linkedin"
  | "github"
  | "tiktok"
  | "youtube"
  | "none";

// Dialog khusus berdasarkan status dan jenis link
// Menyediakan beberapa variasi untuk setiap kategori agar DIVA JUAN tidak mengulang kalimat yang sama
export const HOVER_DIALOGS = {
  // Saat DIVA JUAN sedang berbicara (interupsi)
  interruption: {
    contact: [
      "Hmph... In a rush, are we? Fine. Tell me what you need done.",
      "Can't wait till I'm done talking? Fine. What do you want?",
      "Interrupting me? Rude. But I'm listening.",
      "Not even letting me finish? Fine, what's the contract?",
      "Hmm. Impatient, aren't you? What is it?",
    ],
    social: [
      "Not listening, huh? Fine. Decide after you've checked.",
      "My story's boring you? Go on then, look elsewhere.",
      "Hmm. Distracted already? Go ahead, check it out.",
      "Prefer looking around than listening? Your choice.",
      "Lost interest so quickly? Whatever. Go look.",
    ],
  },
  // Saat DIVA JUAN sudah selesai berbicara
  completed: {
    contact: [
      "Straight to the point—I like that. Fine. Give me the contract.",
      "Business it is then. What's the job?",
      "Contract details? Let's hear it.",
      "Talk business. I'm listening.",
      "Hmm. Cutting to the chase. Good.",
    ],
    social: [
      "Need to check first before deciding? Fine. Not like I'm in a hurry.",
      "Want to know more about me first? Suit yourself.",
      "Curious about my past work? Take a look.",
      "Checking my credentials? Smart. Not that I care.",
      "Due diligence, huh? Look all you want.",
    ],
  },
  // Transisi antar kategori
  transition: {
    socialToContact: [
      "Took your time, didn't you? Fine. Hand me the damn contract.",
      "Done looking? Ready for business now?",
      "Satisfied with what you found? Let's talk work.",
      "Seen enough? What's the job then?",
      "Research complete? Let's hear about the contract.",
    ],
    contactToSocial: [
      "Fine. Go ahead, check it first.",
      "Having second thoughts? Look around then.",
      "Changed your mind? Go on, look me up.",
      "Not convinced yet? See for yourself.",
      "Hmm. Still uncertain? Check my background.",
    ],
  },
  // Saat user bermain-main (bolak-balik hover)
  annoyance: {
    firstLevel: [
      "Talk... You got a job, or just wasting my time?",
      "Make up your mind. I don't have all day.",
      "Hmm. This back and forth is getting irritating.",
      "Decide already. Contract or not?",
      "Getting annoyed with the indecision here.",
    ],
    secondLevel: [
      "ENOUGH",
      "I SAID STOP! This is your FINAL warning!",
      "THAT'S IT! You're getting on my LAST nerve!",
      "I'M DONE with this ridiculous game. LAST WARNING!",
    ],
  },
};

class HoverDialogController {
  private static instance: HoverDialogController;
  private elevenlabsService: ElevenLabsService;
  private dialogController: DialogController;
  private lastHoveredLink: HoverLinkType = "none";
  private hoverCount: number = 0;
  private dialogCompleted: boolean = false;
  private isHandlingHover: boolean = false;
  private hasInteractedWithHover: boolean = false;
  private processedTexts: Set<string> = new Set(); // Menyimpan teks yang sudah ditampilkan
  private hoverCountAfterSecondLevel: number = 0; // Counter untuk hover setelah secondLevel annoyance

  // Flag untuk kontrol annoyance level agar hanya ditampilkan sekali per sesi
  private hasShownFirstLevelAnnoyance: boolean = false;
  private hasShownSecondLevelAnnoyance: boolean = false;

  // Flag untuk kontrol jika idle timeout telah terjadi
  private hasIdleTimeoutOccurred: boolean = false;
  
  // Flag untuk kontrol apakah user sudah pernah dilempar dan ini adalah hover pertama setelah reset
  private isPostResetFirstHover: boolean = false;
  private hasShownHoverAfterReset: boolean = false;

  // Menyimpan jumlah kalimat yang sudah diucapkan berdasarkan kategori
  private categoryUtteranceCount: {
    interruption: { contact: number; social: number };
    completed: { contact: number; social: number };
    transition: { socialToContact: number; contactToSocial: number };
  } = {
    interruption: { contact: 0, social: 0 },
    completed: { contact: 0, social: 0 },
    transition: { socialToContact: 0, contactToSocial: 0 },
  };

  // Debounce function untuk menghindari terlalu banyak trigger saat hover
  private debouncedHoverHandler = debounce(
    this.handleHoverDialogActual.bind(this),
    300,
  );

  private constructor() {
    this.elevenlabsService = ElevenLabsService.getInstance();
    this.dialogController = DialogController.getInstance();
  }

  public static getInstance(): HoverDialogController {
    if (!HoverDialogController.instance) {
      HoverDialogController.instance = new HoverDialogController();
    }
    return HoverDialogController.instance;
  }

  // Method untuk mendapatkan service ElevenLabs untuk pengecekan audio
  public getElevenLabsService(): ElevenLabsService {
    return this.elevenlabsService;
  }

  // Method ini dipanggil saat dialog normal selesai
  public setDialogCompleted(completed: boolean): void {
    this.dialogCompleted = completed;
  }

  // Method untuk mengecek apakah user sudah berinteraksi dengan hover dialog
  public hasUserInteractedWithHover(): boolean {
    return this.hasInteractedWithHover;
  }

  public setHasInteractedWithHover(value: boolean): void {
    this.hasInteractedWithHover = value;
  }

  // Method untuk mengatur status idle timeout dari IdleTimeoutController
  public setIdleTimeoutOccurred(value: boolean): void {
    this.hasIdleTimeoutOccurred = value;
  }

  // Method untuk mengatur flag post-reset hover
  public setPostResetFirstHover(value: boolean): void {
    this.isPostResetFirstHover = value;
    console.log(`[HoverDialogController] Post-reset first hover flag set to: ${value}`);
  }

  // Method untuk mengecek apakah sudah menampilkan HOVER_AFTER_RESET
  public hasShownHoverAfterResetDialog(): boolean {
    return this.hasShownHoverAfterReset;
  }

  // Method untuk menentukan apakah link termasuk kategori kontak atau sosial
  private getLinkCategory(
    linkType: HoverLinkType,
  ): "contact" | "social" | "none" {
    if (linkType === "whatsapp" || linkType === "email") {
      return "contact";
    } else if (
      linkType === "linkedin" ||
      linkType === "github" ||
      linkType === "tiktok" ||
      linkType === "youtube"
    ) {
      return "social";
    }
    return "none";
  }

  // Handler untuk hover event dari komponen SocialLink
  public handleHoverDialog(linkType: HoverLinkType): void {
    // Jika tidak ada link yang di-hover, reset saja
    if (linkType === "none") {
      return;
    }

    // Force reset isHandlingHover jika hover event baru terjadi terlalu cepat setelah yang sebelumnya
    if (this.isHandlingHover) {
      this.isHandlingHover = false;
    }

    // Jika sama dengan hover terakhir, abaikan
    if (this.lastHoveredLink === linkType) return;

    // Get category of the current hovered link
    const currentCategory = this.getLinkCategory(linkType);
    const previousCategory = this.getLinkCategory(this.lastHoveredLink);

    // Jika idle timeout sudah terjadi, tidak perlu menampilkan hover dialog lagi
    if (this.hasIdleTimeoutOccurred) {
      console.log("Idle timeout telah terjadi, hover dialog diabaikan");
      this.lastHoveredLink = linkType; // Update last hovered link tanpa trigger dialog
      return;
    }

    // Logika khusus untuk post-reset first hover
    if (this.isPostResetFirstHover && !this.hasShownHoverAfterReset) {
      console.log("[HoverDialogController] First hover after reset detected - triggering HOVER_AFTER_RESET");
      this.hasShownHoverAfterReset = true;
      this.isPostResetFirstHover = false;
      
      // Trigger HOVER_AFTER_RESET melalui IdleTimeoutController
      try {
        const idleController = IdleTimeoutController.getInstance();
        if (idleController) {
          // Import IDLE_DIALOGS from idleTimeoutController
          const HOVER_AFTER_RESET = "Hmph... Finally, you decide to move... Suit yourself. You want to check it or just get on with signing the damn contract?";
          idleController.showIdleWarning(HOVER_AFTER_RESET);
          
          // Unlock hover achievement
          const achievementController = AchievementController.getInstance();
          achievementController.unlockAchievement('hover', true);
          console.log("[HoverDialogController] Unlocked 'hover' achievement for post-reset hover");
        }
      } catch (e) {
        console.error("Could not trigger HOVER_AFTER_RESET:", e);
      }
      
      // Update last hovered link dan return tanpa menjalankan hover dialog normal
      this.lastHoveredLink = linkType;
      return;
    }

    // Jika sudah pernah menampilkan HOVER_AFTER_RESET, abaikan semua hover selanjutnya
    if (this.hasShownHoverAfterReset) {
      console.log("[HoverDialogController] HOVER_AFTER_RESET already shown, ignoring subsequent hover");
      this.lastHoveredLink = linkType;
      return;
    }

    // Jika sudah menampilkan second level annoyance, hitung hover setelahnya
    if (this.hasShownSecondLevelAnnoyance) {
      this.hoverCountAfterSecondLevel++;
      console.log(
        "Hover setelah peringatan level kedua:",
        this.hoverCountAfterSecondLevel,
      );

      // Setelah 2 kali hover, trigger EXCESSIVE_HOVER_WARNING
      if (this.hoverCountAfterSecondLevel === 2) {
        try {
          const idleController = IdleTimeoutController.getInstance();
          if (idleController) {
            console.log(
              "Triggering excessive hover punishment via IdleTimeoutController after 2 hovers following second level warning",
            );
            
            // Trigger achievement for anger at this point
            try {
              console.log("Unlocking ANGER achievement during excessive hover");
              const achievementController = AchievementController.getInstance();
              achievementController.unlockAchievement('anger');
            } catch (error) {
              console.error("Failed to unlock anger achievement:", error);
            }
            
            idleController.handleExcessiveHover();
          }
        } catch (e) {
          console.error("Could not trigger IdleTimeoutController warning:", e);
        }
      }
      // Setelah 3 kali hover, trigger FINAL_HOVER_WARNING
      else if (this.hoverCountAfterSecondLevel === 3) {
        try {
          const idleController = IdleTimeoutController.getInstance();
          if (idleController) {
            console.log(
              "Triggering final hover warning via IdleTimeoutController after 3 hovers following second level warning",
            );
            idleController.handleFinalHoverWarning();
          }
        } catch (e) {
          console.error(
            "Could not trigger IdleTimeoutController final warning:",
            e,
          );
        }
      }
      // Setelah 4 kali hover, trigger punchUser (bukan throwUser)
      else if (this.hoverCountAfterSecondLevel === 4) {
        try {
          const idleController = IdleTimeoutController.getInstance();
          if (idleController) {
            console.log(
              "Triggering punch user effect via IdleTimeoutController after 4 hovers following second level warning",
            );
            // Perlu menambahkan metode public handlePunchUser di IdleTimeoutController
            if (typeof idleController.handlePunchUser === "function") {
              idleController.handlePunchUser();
            } else {
              // Fallback jika metode belum diimplementasikan
              idleController.startExcessiveHoverTimers();
            }
          }
        } catch (e) {
          console.error(
            "Could not trigger IdleTimeoutController punch user:",
            e,
          );
        }
      }

      // Update last hovered link tanpa trigger dialog
      this.lastHoveredLink = linkType;
      return;
    }

    // Jika first level annoyance sudah muncul, hanya perbolehkan perpindahan antar kategori
    // yang akan memicu second level annoyance, tolak semua tipe dialog lainnya
    if (
      this.hasShownFirstLevelAnnoyance &&
      !this.hasShownSecondLevelAnnoyance
    ) {
      // Hanya izinkan hover jika ini adalah perpindahan kategori yang berbeda
      if (previousCategory !== "none" && currentCategory !== previousCategory) {
        // Biarkan proses lanjut ke handler hover untuk second level annoyance
        console.log(
          "First level annoyance triggered, only allowing category switch to trigger second level",
        );
      } else {
        console.log(
          "First level annoyance telah ditampilkan, dialog completed/interruption diabaikan",
        );
        this.lastHoveredLink = linkType; // Update last hovered link tanpa trigger dialog
        return;
      }
    }

    // Jika perpindahan dalam kategori yang sama (LinkedIn ke GitHub atau Email ke WhatsApp)
    // Maka tidak perlu memunculkan dialog
    if (previousCategory !== "none" && currentCategory === previousCategory) {
      console.log(
        `Perpindahan dalam kategori yang sama: ${previousCategory} -> ${currentCategory}, dialog diabaikan`,
      );
      this.lastHoveredLink = linkType; // Update last hovered link tanpa trigger dialog
      return;
    }

    // Determine overall total utterances across all main categories (excluding annoyance)
    const totalUtterances =
      this.categoryUtteranceCount.interruption.contact +
      this.categoryUtteranceCount.interruption.social +
      this.categoryUtteranceCount.completed.contact +
      this.categoryUtteranceCount.completed.social +
      this.categoryUtteranceCount.transition.contactToSocial +
      this.categoryUtteranceCount.transition.socialToContact;

    // Always increment hoverCount for tracking excessive hovering
    this.hoverCount++;

    // Call the actual handler with debounce
    this.debouncedHoverHandler(linkType);
  }

  // Callback untuk dialog text
  private hoverTextCallback:
    | ((text: string, isComplete: boolean) => void)
    | null = null;
  private isTypingHover: boolean = false;

  // Method publik untuk mengecek status typing dari luar
  public isTypingHoverDialog(): boolean {
    return this.isTypingHover;
  }

  // Method untuk mengatur dialogSource di DialogBox
  public setDialogSource: ((source: "main" | "hover") => void) | null = null;
  private typingSpeed: number = 40; // Sedikit lebih cepat dari dialog utama
  private typingInterval: NodeJS.Timeout | null = null;
  private currentText: string = "";
  private fullText: string = "";
  private charIndex: number = 0;

  // Set callback untuk dialog text
  public setHoverTextCallback(
    callback: (text: string, isComplete: boolean) => void,
  ): void {
    this.hoverTextCallback = callback;
  }

  // Helper untuk mengecek apakah dialog perlu persistent
  private isPersistent(text: string): boolean {
    // Dialog yang sangat pendek atau adalah efek suara, selalu non-persistent
    if (text.length < 15 || text === "........" || text.startsWith("*")) {
      return false;
    }

    // Cek apakah ada tanda tanya (kemungkinan pertanyaan)
    if (text.includes("?")) {
      return true;
    }

    // Default untuk dialog umum: tidak persistent
    return false;
  }

  // Typewriter effect untuk hover dialog
  private typeHoverText(text: string): void {
    // Stop any ongoing typing first
    this.stopTyping();

    // Set up typing variables
    this.fullText = text;
    this.currentText = "";
    this.charIndex = 0;
    this.isTypingHover = true;

    // Panggil callback di awal dengan teks kosong untuk memastikan dialog box muncul
    if (this.hoverTextCallback) {
      this.hoverTextCallback("", false);
    }

    // Start typewriter effect
    this.typingInterval = setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.currentText += this.fullText[this.charIndex];
        this.charIndex++;
        if (this.hoverTextCallback) {
          this.hoverTextCallback(this.currentText, false);
        }
      } else {
        // Typing complete
        this.isTypingHover = false;
        if (this.typingInterval) {
          clearInterval(this.typingInterval);
          this.typingInterval = null;
        }

        // Cek apakah dialog ini adalah persistent berdasarkan teksnya
        const isPersistent = this.isPersistent(this.fullText);

        if (isPersistent) {
          console.log(
            "Hover dialog adalah persistent, menunggu interaksi user",
          );
        } else {
          console.log(
            `Hover dialog akan dismiss dalam 3000ms (non-persistent)`,
          );
        }

        if (this.hoverTextCallback) {
          this.hoverTextCallback(this.currentText, true);
        }
      }
    }, this.typingSpeed);
  }

  // Stop typewriter effect
  public stopTyping(): void {
    this.isTypingHover = false;
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
  }

  // Implementasi actual dari handler hover setelah debounce
  private async handleHoverDialogActual(
    linkType: HoverLinkType,
  ): Promise<void> {
    this.isHandlingHover = true;

    // Jika tidak ada link yang di-hover, reset saja
    if (linkType === "none") {
      this.isHandlingHover = false;
      return;
    }

    // Cek apakah ada dialog yang sedang berjalan dari IdleTimeoutController
    try {
      const idleController = IdleTimeoutController.getInstance();
      if (
        idleController &&
        (idleController.isExcessiveHoverWarningShown() ||
          idleController.isFinalHoverWarningShown() ||
          idleController.isPunchExecuted() ||
          (idleController.isAnyIdleWarningActive &&
            idleController.isAnyIdleWarningActive()))
      ) {
        // Jika sudah ada dialog dari IdleTimeoutController, jangan interrupt
        console.log(
          "IdleTimeoutController sedang menampilkan dialog, hover dialog diabaikan",
        );
        this.isHandlingHover = false;
        return;
      }
    } catch (e) {
      console.error("Could not check IdleTimeoutController status:", e);
    }

    // Hentikan dialog yang sedang berjalan jika ada
    this.dialogController.stopTyping();
    this.elevenlabsService.stopSpeaking();

    // Tandai bahwa user sudah berinteraksi dengan hover dialog
    this.hasInteractedWithHover = true;

    // Tentukan kategori link yang di-hover sekarang dan sebelumnya
    const currentCategory = this.getLinkCategory(linkType);
    const previousCategory = this.getLinkCategory(this.lastHoveredLink);

    let dialogText = "";

    // Fungsi helper untuk mendapatkan dialog acak dari array
    // Memastikan dialog yang dipilih belum pernah diucapkan
    const getRandomDialog = (dialogArray: string[]): string => {
      // Filter dialog yang belum pernah diucapkan
      const unusedDialogs = dialogArray.filter(
        (dialog) => !this.processedTexts.has(dialog),
      );

      // Jika semua dialog sudah diucapkan, gunakan annoyance dialog sebagai fallback
      if (unusedDialogs.length === 0) {
        return HOVER_DIALOGS.annoyance.firstLevel[
          Math.floor(Math.random() * HOVER_DIALOGS.annoyance.firstLevel.length)
        ];
      }

      // Pilih secara acak dari dialog yang belum diucapkan
      const randomIndex = Math.floor(Math.random() * unusedDialogs.length);
      return unusedDialogs[randomIndex];
    };

    // Fungsi helper untuk mengecek apakah dialog utama sedang berlangsung (interruption detection)
    const isDialogInProgress = (): boolean => {
      // Jika ElevenLabs service sedang memainkan audio, berarti dialog utama sedang berlangsung
      const isAudioPlaying = this.elevenlabsService.isCurrentlyPlaying();

      // Jika dialog controller sedang mengetik, berarti dialog utama sedang berlangsung
      const isTyping = this.dialogController.isCurrentlyTyping();

      // Jika dialog belum selesai (dialogCompleted === false), berarti dialog utama masih dalam proses
      const isDialogNotCompleted = !this.dialogCompleted;

      return isAudioPlaying || isTyping || isDialogNotCompleted;
    };

    // Error checking untuk method dialogue controller yang belum diimplementasikan
    if (!this.dialogController.isCurrentlyTyping) {
      // Jika method belum diimplementasikan, kita perlu tambahkan sementara di sini
      this.dialogController.isCurrentlyTyping = () => false;
    }

    // Determine overall total utterances across all main categories (excluding annoyance)
    const totalUtterances =
      this.categoryUtteranceCount.interruption.contact +
      this.categoryUtteranceCount.interruption.social +
      this.categoryUtteranceCount.completed.contact +
      this.categoryUtteranceCount.completed.social +
      this.categoryUtteranceCount.transition.contactToSocial +
      this.categoryUtteranceCount.transition.socialToContact;

    // Jika user terlalu banyak hover bolak-balik, tampilkan dialog kesal
    // Jika sudah diucapkan beberapa kali, gunakan annoyance level pertama dan kedua

    // Jika sudah menampilkan annoyance level pertama dan user terus hover
    // bolak-balik antar kategori, maka tampilkan level kedua
    if (
      this.hasShownFirstLevelAnnoyance &&
      previousCategory !== currentCategory &&
      previousCategory !== "none" &&
      !this.hasShownSecondLevelAnnoyance
    ) {
      // Very annoyed - level 2, trigger idleTimeoutController (if available)
      // This will cause the punch effect from idleTimeoutController
      try {
        const idleController = IdleTimeoutController.getInstance();

        if (idleController && idleController.startExcessiveHoverTimers) {
          console.log(
            "Triggering excessive hover punishment via IdleTimeoutController",
          );
          idleController.startExcessiveHoverTimers();
        }
      } catch (e) {
        console.error("Could not trigger IdleTimeoutController:", e);
      }

      // Very annoyed response - hanya ditampilkan sekali
      this.hasShownSecondLevelAnnoyance = true;
      const annoyedTexts = HOVER_DIALOGS.annoyance.secondLevel;
      const randomIndex = Math.floor(Math.random() * annoyedTexts.length);
      dialogText = annoyedTexts[randomIndex];
      console.log(
        "Excessive hovering detected! Using second level annoyance dialog (only once)",
      );
    }
    // Jika mencapai batas utterances tapi belum menampilkan annoyance level pertama
    else if (totalUtterances >= 2 && !this.hasShownFirstLevelAnnoyance) {
      // Moderately annoyed - level 1 - hanya ditampilkan sekali
      this.hasShownFirstLevelAnnoyance = true;
      const annoyedTexts = HOVER_DIALOGS.annoyance.firstLevel;
      const randomIndex = Math.floor(Math.random() * annoyedTexts.length);
      dialogText = annoyedTexts[randomIndex];
      console.log(
        "All categories reached limit! Using first level annoyance dialog (only once)",
      );
    }
    // Jika sudah menampilkan first level annoyance, jangan tampilkan dialog apapun saat hover
    // kecuali saat pindah kategori yang akan memicu second level
    else if (
      this.hasShownFirstLevelAnnoyance &&
      !this.hasShownSecondLevelAnnoyance
    ) {
      // Tidak menampilkan dialog baru, hanya tingkatkan counter
      this.hoverCount++;
      console.log(
        "First level annoyance sudah ditampilkan, mengabaikan hover dialog sampai pindah kategori",
      );
      // Set isHandlingHover ke false dan return untuk keluar dari fungsi tanpa menampilkan dialog
      this.isHandlingHover = false;
      return;
    }
    // Jika kategori berubah (dari sosial ke kontak atau sebaliknya)
    else if (
      previousCategory !== "none" &&
      currentCategory !== previousCategory &&
      currentCategory !== "none" // Pastikan kategori saat ini valid
    ) {
      // Jika first level annoyance sudah ditampilkan, tidak menggunakan dialog transition lagi
      if (this.hasShownFirstLevelAnnoyance) {
        // Tidak perlu menampilkan dialog transition karena kita hanya menunggu second level annoyance
        console.log(
          "First level annoyance telah ditampilkan, dialog transition diabaikan",
        );
        // Set kode berdasarkan logic secondLevelAnnoyance di atas
        this.hoverCount++;
        return;
      }

      // Cek apakah sudah mencapai batas 2 ucapan untuk kategori ini
      if (previousCategory === "social" && currentCategory === "contact") {
        if (this.categoryUtteranceCount.transition.socialToContact < 2) {
          const texts = HOVER_DIALOGS.transition.socialToContact;
          dialogText = getRandomDialog(texts);
          this.categoryUtteranceCount.transition.socialToContact++;
        } else {
          // Jika sudah mencapai batas, gunakan annoyance dialog sebagai fallback
          dialogText =
            HOVER_DIALOGS.annoyance.firstLevel[
              Math.floor(
                Math.random() * HOVER_DIALOGS.annoyance.firstLevel.length,
              )
            ];
        }
      } else if (
        previousCategory === "contact" &&
        currentCategory === "social"
      ) {
        if (this.categoryUtteranceCount.transition.contactToSocial < 2) {
          const texts = HOVER_DIALOGS.transition.contactToSocial;
          dialogText = getRandomDialog(texts);
          this.categoryUtteranceCount.transition.contactToSocial++;
        } else {
          // Jika sudah mencapai batas, gunakan annoyance dialog sebagai fallback
          dialogText =
            HOVER_DIALOGS.annoyance.firstLevel[
              Math.floor(
                Math.random() * HOVER_DIALOGS.annoyance.firstLevel.length,
              )
            ];
        }
      }
      this.hoverCount++;
    }
    // Jika tidak ada kategori sebelumnya atau kategori sebelumnya adalah none
    // Ini adalah kasus pertama kali user hover ke sebuah kategori
    else if (previousCategory === "none" || this.lastHoveredLink === "none") {
      // Jika first level annoyance sudah ditampilkan, tidak menggunakan dialog completed/interruption lagi
      if (this.hasShownFirstLevelAnnoyance) {
        // Tidak perlu menampilkan dialog completed/interruption karena kita menunggu second level annoyance
        console.log(
          "First level annoyance telah ditampilkan, dialog completed/interruption diabaikan",
        );
        this.hoverCount++;
        this.isHandlingHover = false;
        return;
      }

      // Deteksi interupsi berdasarkan status dialog saat ini
      const isInterruption = isDialogInProgress();

      if (currentCategory === "contact") {
        const category = isInterruption ? "interruption" : "completed";
        const subCategory = "contact";

        // Cek apakah sudah mencapai batas 2 ucapan untuk kategori ini
        if (this.categoryUtteranceCount[category][subCategory] < 2) {
          const texts = isInterruption
            ? HOVER_DIALOGS.interruption.contact
            : HOVER_DIALOGS.completed.contact;
          dialogText = getRandomDialog(texts);
          this.categoryUtteranceCount[category][subCategory]++;
        } else {
          // Jika sudah mencapai batas, gunakan annoyance dialog sebagai fallback
          dialogText =
            HOVER_DIALOGS.annoyance.firstLevel[
              Math.floor(
                Math.random() * HOVER_DIALOGS.annoyance.firstLevel.length,
              )
            ];
        }
      } else if (currentCategory === "social") {
        const category = isInterruption ? "interruption" : "completed";
        const subCategory = "social";

        // Cek apakah sudah mencapai batas 2 ucapan untuk kategori ini
        if (this.categoryUtteranceCount[category][subCategory] < 2) {
          const texts = isInterruption
            ? HOVER_DIALOGS.interruption.social
            : HOVER_DIALOGS.completed.social;
          dialogText = getRandomDialog(texts);
          this.categoryUtteranceCount[category][subCategory]++;
        } else {
          // Jika sudah mencapai batas, gunakan annoyance dialog sebagai fallback
          dialogText =
            HOVER_DIALOGS.annoyance.firstLevel[
              Math.floor(
                Math.random() * HOVER_DIALOGS.annoyance.firstLevel.length,
              )
            ];
        }
      }
    }

    // Log status interupsi untuk debugging
    const isInterrupting = isDialogInProgress();
    if (isInterrupting) {
      console.log(
        "Hover dialog terjadi sebagai interupsi karena dialog utama masih berlangsung",
      );
    }

    // Cek apakah dialog ini sudah pernah ditampilkan sebelumnya atau jika sudah melebihi batas kategori
    if (dialogText) {
      // Log untuk debugging kategori dan jumlah ucapan
      console.log(
        `Hover dialog kategori: ${currentCategory} (${
          isInterrupting ? "interruption" : "completed"
        }), telah diucapkan: ${
          currentCategory === "contact"
            ? this.categoryUtteranceCount[
                isInterrupting ? "interruption" : "completed"
              ].contact
            : this.categoryUtteranceCount[
                isInterrupting ? "interruption" : "completed"
              ].social
        } kali`,
      );

      // Kecuali untuk dialog dari kategori jengkel level 2, tambahkan teks ke daftar yang sudah ditampilkan
      const isAnnoyedLastLevel =
        HOVER_DIALOGS.annoyance.secondLevel.includes(dialogText);
      const isAnnoyedFirstLevel =
        HOVER_DIALOGS.annoyance.firstLevel.includes(dialogText);

      if (!isAnnoyedLastLevel) {
        this.processedTexts.add(dialogText);
      }

      // Mulai animasi typing untuk dialog hover
      this.typeHoverText(dialogText);

      // Speak the dialog text menggunakan default voice hanya jika tidak di-mute
      if (!this.elevenlabsService.isMuted()) {
        await this.elevenlabsService.speakText(dialogText);
      } else {
        console.log("Audio is muted, skipping voice synthesis for hover dialog");
      }

      // Log untuk informasi tambahan
      if (isAnnoyedLastLevel) {
        console.log(
          "DIVA JUAN sangat jengkel (level 2) dan dialog akan menghilang setelah selesai",
        );
      } else if (isAnnoyedFirstLevel) {
        console.log("DIVA JUAN mulai jengkel (level 1)");
      }
    }

    // Update last hovered link
    this.lastHoveredLink = linkType;
    this.isHandlingHover = false;
  }

  // Method untuk menangani klik pada link dari hover dialog
  public handleLinkClick(linkType: HoverLinkType): void {
    try {
      // Trigger achievement 'success' saat link dari hover dialog diklik
      const achievementController = AchievementController.getInstance();
      achievementController.unlockAchievement('success');
      console.log(`Link dari hover dialog diklik (${linkType}), menampilkan achievement success`);
    } catch (error) {
      console.error("Gagal menampilkan achievement saat klik link hover dialog:", error);
    }
  }

  // Reset hover state (misalnya saat user meninggalkan halaman)
  public resetHoverState(): void {
    this.lastHoveredLink = "none";
    this.hoverCount = 0;
    this.hoverCountAfterSecondLevel = 0; // Reset hover counter setelah second level warning
    this.isHandlingHover = false;
    this.stopTyping(); // Stop typing animation jika ada
    
    // Reset text yang ditampilkan
    if (this.hoverTextCallback) {
      this.hoverTextCallback("", true);
    }
    this.currentText = "";
    this.fullText = "";
    // tidak reset processedTexts agar dialog tidak diulang
  }

  // Digunakan saat halaman di-refresh
  public resetAllState(): void {
    this.lastHoveredLink = "none";
    this.hoverCount = 0;
    this.hoverCountAfterSecondLevel = 0; // Reset hover counter setelah second level warning
    this.isHandlingHover = false;
    this.hasInteractedWithHover = false;
    this.processedTexts.clear(); // Clear set teks yang sudah ditampilkan
    this.stopTyping();

    // Reset annoyance flags
    this.hasShownFirstLevelAnnoyance = false;
    this.hasShownSecondLevelAnnoyance = false;
    this.hasIdleTimeoutOccurred = false;
    
    // Reset post-reset flags
    this.isPostResetFirstHover = false;
    this.hasShownHoverAfterReset = false;

    // Reset category utterance counts
    this.categoryUtteranceCount = {
      interruption: { contact: 0, social: 0 },
      completed: { contact: 0, social: 0 },
      transition: { socialToContact: 0, contactToSocial: 0 },
    };
  }
}

export default HoverDialogController;
