import ElevenLabsService from "../services/elevenlabsService";
import DialogController from "./dialogController";
import { debounce } from "../lib/utils";

// Jenis link yang mungkin di-hover
export type HoverLinkType =
  | "whatsapp"
  | "email"
  | "linkedin"
  | "github"
  | "none";

// Dialog khusus berdasarkan status dan jenis link
// Menyediakan beberapa variasi untuk setiap kategori agar Geralt tidak mengulang kalimat yang sama
const HOVER_DIALOGS = {
  // Saat Geralt sedang berbicara (interupsi)
  interruption: {
    contact: [
      "Hmph... In a rush, are we? Fine. Tell me what you need done.",
      "Can't wait till I'm done talking? Fine. What do you want?",
      "Interrupting me? Rude. But I'm listening.",
      "Not even letting me finish? Fine, what's the contract?",
      "Hmm. Impatient, aren't you? What is it?"
    ],
    social: [
      "Not listening, huh? Fine. Decide after you've checked.",
      "My story's boring you? Go on then, look elsewhere.",
      "Hmm. Distracted already? Go ahead, check it out.",
      "Prefer looking around than listening? Your choice.",
      "Lost interest so quickly? Whatever. Go look."
    ],
  },
  // Saat Geralt sudah selesai berbicara
  completed: {
    contact: [
      "Straight to the point—I like that. Fine. Give me the contract.",
      "Business it is then. What's the job?",
      "Contract details? Let's hear it.",
      "Talk business. I'm listening.",
      "Hmm. Cutting to the chase. Good."
    ],
    social: [
      "Need to check first before deciding? Fine. Not like I'm in a hurry.",
      "Want to know more about me first? Suit yourself.",
      "Curious about my past work? Take a look.",
      "Checking my credentials? Smart. Not that I care.",
      "Due diligence, huh? Look all you want."
    ],
  },
  // Transisi antar kategori
  transition: {
    socialToContact: [
      "Took your time, didn't you? Fine. Hand me the damn contract.",
      "Done looking? Ready for business now?",
      "Satisfied with what you found? Let's talk work.",
      "Seen enough? What's the job then?",
      "Research complete? Let's hear about the contract."
    ],
    contactToSocial: [
      "Fine. Go ahead, check it first.",
      "Having second thoughts? Look around then.",
      "Changed your mind? Go on, look me up.",
      "Not convinced yet? See for yourself.",
      "Hmm. Still uncertain? Check my background."
    ],
  },
  // Saat user bermain-main (bolak-balik hover)
  annoyance: {
    firstLevel: [
      "Talk... You got a job, or just wasting my time?",
      "Make up your mind. I don't have all day.",
      "Hmm. This back and forth is getting irritating.",
      "Decide already. Contract or not?",
      "Getting annoyed with the indecision here."
    ],
    secondLevel: [
      "Arghh... whatever you want. I'm done.",
      "That's it. I'm done with this nonsense.",
      "Enough of this. Make a choice or leave me be.",
      "*sighs deeply* I've lost my patience. We're done here.",
      "I'm through with this game. Decide or go away."
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

  // Method ini dipanggil saat dialog normal selesai
  public setDialogCompleted(completed: boolean): void {
    this.dialogCompleted = completed;
  }

  // Method untuk mengecek apakah user sudah berinteraksi dengan hover dialog
  public hasUserInteractedWithHover(): boolean {
    return this.hasInteractedWithHover;
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

    this.debouncedHoverHandler(linkType);
  }

  // Callback untuk dialog text
  private hoverTextCallback:
    | ((text: string, isComplete: boolean) => void)
    | null = null;
  private isTypingHover: boolean = false;
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
    // Dialog yang sangat pendek biasanya adalah hanya efek suara
    if (text.length < 15 || text === "........" || text.startsWith("*")) {
      return false;
    }
    
    // Dialog yang mengandung kata kunci berikut adalah statement, tidak perlu persistent (autoplay)
    const nonPersistentKeywords = [
      "Hmm", "Tch", "Whatever", "Enough of",
      "Not listening", "Cutting", "My story", "Straight to",
      "Hmph", "Not like", "Go on then", "Lost interest", 
      "I'm done", "I don't care", "what you want", "leave me", 
      "farewell"
    ];
    
    for (const keyword of nonPersistentKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        return false;
      }
    }
    
    // Dialog yang mengandung pertanyaan biasanya lebih penting
    if (text.includes('?')) {
      return true;
    }
    
    // Dialog dari kontrak dan bisnis biasanya memerlukan perhatian
    const businessKeywords = ["contract", "business", "details", "work", "hire", "professional"];
    for (const keyword of businessKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      }
    }
    
    // Default untuk hover dialog: auto-dismiss setelah beberapa saat
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
          console.log("Hover dialog adalah persistent, menunggu interaksi user");
        } else {
          console.log(`Hover dialog akan dismiss dalam 3000ms (non-persistent)`);
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
    const getRandomDialog = (dialogArray: string[]): string => {
      const randomIndex = Math.floor(Math.random() * dialogArray.length);
      return dialogArray[randomIndex];
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

    // Jika user terlalu banyak hover bolak-balik, tampilkan dialog kesal
    if (this.hoverCount > 5) {
      const annoyedTexts = HOVER_DIALOGS.annoyance.secondLevel;
      const randomIndex = Math.floor(Math.random() * annoyedTexts.length);
      dialogText = annoyedTexts[randomIndex];
    } else if (this.hoverCount > 3) {
      const annoyedTexts = HOVER_DIALOGS.annoyance.firstLevel;
      const randomIndex = Math.floor(Math.random() * annoyedTexts.length);
      dialogText = annoyedTexts[randomIndex];
      this.hoverCount++;
    }
    // Jika kategori berubah (dari sosial ke kontak atau sebaliknya)
    else if (
      previousCategory !== "none" &&
      currentCategory !== previousCategory
    ) {
      if (previousCategory === "social" && currentCategory === "contact") {
        const texts = HOVER_DIALOGS.transition.socialToContact;
        const randomIndex = Math.floor(Math.random() * texts.length);
        dialogText = texts[randomIndex];
      } else if (
        previousCategory === "contact" &&
        currentCategory === "social"
      ) {
        const texts = HOVER_DIALOGS.transition.contactToSocial;
        const randomIndex = Math.floor(Math.random() * texts.length);
        dialogText = texts[randomIndex];
      }
      this.hoverCount++;
    }
    // Jika dialog normal sudah selesai atau belum selesai (interruption or not)
    else {
      // Deteksi interupsi berdasarkan status dialog saat ini
      const isInterruption = isDialogInProgress();
      
      if (currentCategory === "contact") {
        const texts = isInterruption
          ? HOVER_DIALOGS.interruption.contact
          : HOVER_DIALOGS.completed.contact;
        const randomIndex = Math.floor(Math.random() * texts.length);
        dialogText = texts[randomIndex];
      } else if (currentCategory === "social") {
        const texts = isInterruption
          ? HOVER_DIALOGS.interruption.social
          : HOVER_DIALOGS.completed.social;
        const randomIndex = Math.floor(Math.random() * texts.length);
        dialogText = texts[randomIndex];
      }
      
      // Log status interupsi untuk debugging
      if (isInterruption) {
        console.log("Hover dialog terjadi sebagai interupsi karena dialog utama masih berlangsung");
      }
    }

    // Cek apakah dialog ini sudah pernah ditampilkan sebelumnya
    // Jika hoverCount > 5, selalu tampilkan dialog terakhir (walaupun sudah ditampilkan sebelumnya)
    if (dialogText && (!this.processedTexts.has(dialogText) || this.hoverCount > 5)) {
      // Kecuali untuk dialog dari kategori jengkel level 2,
      // tambahkan teks ke daftar yang sudah ditampilkan
      const isAnnoyedLastLevel = HOVER_DIALOGS.annoyance.secondLevel.includes(dialogText);
      if (!isAnnoyedLastLevel) {
        this.processedTexts.add(dialogText);
      }

      // Mulai animasi typing untuk dialog hover
      this.typeHoverText(dialogText);

      // Speak the dialog text menggunakan Geralt voice
      await this.elevenlabsService.speakText(dialogText, "geralt");
      
      // Jika dialog jengkel terakhir, ini akan menjadi dialog terakhir sebelum menghilang
      // Dialog box akan otomatis hilang karena sudah ditandai sebagai non-persistent di dialogToToneMap
      if (isAnnoyedLastLevel) {
        console.log("Geralt jengkel dan dialog akan menghilang setelah selesai");
      }
    }

    // Update last hovered link
    this.lastHoveredLink = linkType;
    this.isHandlingHover = false;
  }

  // Akses ke link yang terakhir di-hover untuk tujuan analytics
  public getLastHoveredLink(): HoverLinkType {
    return this.lastHoveredLink;
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
  }
}

export default HoverDialogController;
