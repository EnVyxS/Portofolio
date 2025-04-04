import ElevenLabsService from "../services/elevenlabsService";
import DialogController from "./dialogController";
import IdleTimeoutController from "./idleTimeoutController";
import { debounce } from "../lib/utils";

// Jenis link yang mungkin di-hover
export type HoverLinkType =
  | "whatsapp"
  | "email"
  | "linkedin"
  | "github"
  | "none";

// Dialog khusus berdasarkan status dan jenis link
// Menyediakan beberapa variasi untuk setiap kategori agar DIVA JUAN tidak mengulang kalimat yang sama
const HOVER_DIALOGS = {
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
      "ENOUGH! Stop this childish behavior RIGHT NOW!",
      "I SAID STOP! This is your FINAL warning!",
      "THAT'S IT! You're getting on my LAST nerve!",
      "I'M DONE with this ridiculous game. LAST WARNING!",
      "STOP THIS IMMEDIATELY or you'll REGRET it!",
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
  
  // Flag untuk kontrol annoyance level agar hanya ditampilkan sekali per sesi
  private hasShownFirstLevelAnnoyance: boolean = false;
  private hasShownSecondLevelAnnoyance: boolean = false;
  
  // Flag untuk kontrol jika idle timeout telah terjadi
  private hasIdleTimeoutOccurred: boolean = false;
  
  // Menyimpan jumlah kalimat yang sudah diucapkan berdasarkan kategori
  private categoryUtteranceCount: {
    interruption: { contact: number; social: number; };
    completed: { contact: number; social: number; };
    transition: { socialToContact: number; contactToSocial: number; };
  } = {
    interruption: { contact: 0, social: 0 },
    completed: { contact: 0, social: 0 },
    transition: { socialToContact: 0, contactToSocial: 0 }
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

  // Method untuk menentukan apakah link termasuk kategori kontak atau sosial
  private getLinkCategory(
    linkType: HoverLinkType,
  ): "contact" | "social" | "none" {
    if (linkType === "whatsapp" || linkType === "email") {
      return "contact";
    } else if (linkType === "linkedin" || linkType === "github") {
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
    
    // Jika perpindahan dalam kategori yang sama (LinkedIn ke GitHub atau Email ke WhatsApp)
    // Maka tidak perlu memunculkan dialog
    if (previousCategory !== "none" && currentCategory === previousCategory) {
      console.log(`Perpindahan dalam kategori yang sama: ${previousCategory} -> ${currentCategory}, dialog diabaikan`);
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
        clearInterval(this.typingInterval as NodeJS.Timeout);
        this.typingInterval = null;

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
      const unusedDialogs = dialogArray.filter(dialog => !this.processedTexts.has(dialog));
      
      // Jika semua dialog sudah diucapkan, gunakan annoyance dialog sebagai fallback
      if (unusedDialogs.length === 0) {
        return HOVER_DIALOGS.annoyance.firstLevel[Math.floor(Math.random() * HOVER_DIALOGS.annoyance.firstLevel.length)];
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
    if (totalUtterances >= 4 && this.hoverCount > 8 && !this.hasShownSecondLevelAnnoyance) {
      // Very annoyed - level 2, trigger idleTimeoutController (if available)
      // This will cause the punch effect from idleTimeoutController
      try {
        const idleController = IdleTimeoutController.getInstance();
        
        if (idleController && idleController.startExcessiveHoverTimers) {
          console.log("Triggering excessive hover punishment via IdleTimeoutController");
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
      console.log("Excessive hovering detected! Using second level annoyance dialog (only once)");
    } else if (totalUtterances >= 2 && !this.hasShownFirstLevelAnnoyance) {
      // Moderately annoyed - level 1 - hanya ditampilkan sekali
      this.hasShownFirstLevelAnnoyance = true;
      const annoyedTexts = HOVER_DIALOGS.annoyance.firstLevel;
      const randomIndex = Math.floor(Math.random() * annoyedTexts.length);
      dialogText = annoyedTexts[randomIndex];
      console.log("All categories reached limit! Using first level annoyance dialog (only once)");
    }
    // Jika kategori berubah (dari sosial ke kontak atau sebaliknya)
    else if (
      previousCategory !== "none" &&
      currentCategory !== previousCategory
    ) {
      // Cek apakah sudah mencapai batas 2 ucapan untuk kategori ini
      if (previousCategory === "social" && currentCategory === "contact") {
        if (this.categoryUtteranceCount.transition.socialToContact < 2) {
          const texts = HOVER_DIALOGS.transition.socialToContact;
          dialogText = getRandomDialog(texts);
          this.categoryUtteranceCount.transition.socialToContact++;
        } else {
          // Jika sudah mencapai batas, gunakan annoyance dialog sebagai fallback
          dialogText = HOVER_DIALOGS.annoyance.firstLevel[Math.floor(Math.random() * HOVER_DIALOGS.annoyance.firstLevel.length)];
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
          dialogText = HOVER_DIALOGS.annoyance.firstLevel[Math.floor(Math.random() * HOVER_DIALOGS.annoyance.firstLevel.length)];
        }
      }
      this.hoverCount++;
    }
    // Jika dialog normal sudah selesai atau belum selesai (interruption or not)
    else {
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
          dialogText = HOVER_DIALOGS.annoyance.firstLevel[Math.floor(Math.random() * HOVER_DIALOGS.annoyance.firstLevel.length)];
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
          dialogText = HOVER_DIALOGS.annoyance.firstLevel[Math.floor(Math.random() * HOVER_DIALOGS.annoyance.firstLevel.length)];
        }
      }

      // Log status interupsi untuk debugging
      if (isInterruption) {
        console.log(
          "Hover dialog terjadi sebagai interupsi karena dialog utama masih berlangsung",
        );
      }
    }

    // Cek apakah dialog ini sudah pernah ditampilkan sebelumnya atau jika sudah melebihi batas kategori
    if (dialogText) {
      // Log untuk debugging kategori dan jumlah ucapan
      console.log(`Hover dialog kategori: ${currentCategory} (${
        isDialogInProgress() ? 'interruption' : 'completed'
      }), telah diucapkan: ${
        currentCategory === 'contact' 
          ? this.categoryUtteranceCount[isDialogInProgress() ? 'interruption' : 'completed'].contact 
          : this.categoryUtteranceCount[isDialogInProgress() ? 'interruption' : 'completed'].social
      } kali`);
      
      // Kecuali untuk dialog dari kategori jengkel level 2, tambahkan teks ke daftar yang sudah ditampilkan
      const isAnnoyedLastLevel = HOVER_DIALOGS.annoyance.secondLevel.includes(dialogText);
      const isAnnoyedFirstLevel = HOVER_DIALOGS.annoyance.firstLevel.includes(dialogText);
      
      if (!isAnnoyedLastLevel) {
        this.processedTexts.add(dialogText);
      }

      // Mulai animasi typing untuk dialog hover
      this.typeHoverText(dialogText);

      // Speak the dialog text menggunakan default voice
      await this.elevenlabsService.speakText(dialogText);

      // Log untuk informasi tambahan
      if (isAnnoyedLastLevel) {
        console.log("DIVA JUAN sangat jengkel (level 2) dan dialog akan menghilang setelah selesai");
      } else if (isAnnoyedFirstLevel) {
        console.log("DIVA JUAN mulai jengkel (level 1)");
      }
    }

    // Update last hovered link
    this.lastHoveredLink = linkType;
    this.isHandlingHover = false;
  }

  // Reset hover state (misalnya saat user meninggalkan halaman)
  public resetHoverState(): void {
    this.lastHoveredLink = "none";
    this.hoverCount = 0;
    this.isHandlingHover = false;
    this.stopTyping(); // Stop typing animation jika ada
    // tidak reset processedTexts agar dialog tidak diulang
  }

  // Digunakan saat halaman di-refresh
  public resetAllState(): void {
    this.lastHoveredLink = "none";
    this.hoverCount = 0;
    this.isHandlingHover = false;
    this.hasInteractedWithHover = false;
    this.processedTexts.clear(); // Clear set teks yang sudah ditampilkan
    this.stopTyping();
    
    // Reset annoyance flags
    this.hasShownFirstLevelAnnoyance = false;
    this.hasShownSecondLevelAnnoyance = false;
    this.hasIdleTimeoutOccurred = false;
    
    // Reset category utterance counts
    this.categoryUtteranceCount = {
      interruption: { contact: 0, social: 0 },
      completed: { contact: 0, social: 0 },
      transition: { socialToContact: 0, contactToSocial: 0 }
    };
  }
}

export default HoverDialogController;
