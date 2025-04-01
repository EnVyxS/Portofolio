import ElevenLabsService from "../services/elevenlabsService";
import DialogController from "./dialogController";
import { debounce } from "../lib/utils";

// Jenis link yang mungkin di-hover
export type HoverLinkType = 'whatsapp' | 'email' | 'linkedin' | 'github' | 'none';

// Dialog khusus berdasarkan status dan jenis link
const HOVER_DIALOGS = {
  // Saat Geralt sedang berbicara (interupsi)
  interruption: {
    contact: "Hmph... In a rush, are we? Fine. Tell me what you need done.",
    social: "Hmph... Not listening, huh? Fine. Decide after you've checked."
  },
  // Saat Geralt sudah selesai berbicara
  completed: {
    contact: "Hmph. Straight to the point—I like that. Fine. Give me the contract.",
    social: "Hmph. Need to check first before deciding? Fine. Not like I'm in a hurry."
  },
  // Transisi antar kategori
  transition: {
    socialToContact: "Hmph… Took your time, didn't you? Fine. Hand me the damn contract.",
    contactToSocial: "Okee… Fine. Go ahead, check it first."
  },
  // Saat user bermain-main (bolak-balik hover)
  annoyance: {
    firstLevel: "Arghh.. whatever you want",
    secondLevel: "Talk... You got a job, or just wasting my time?..."
  }
};

class HoverDialogController {
  private static instance: HoverDialogController;
  private elevenlabsService: ElevenLabsService;
  private dialogController: DialogController;
  private lastHoveredLink: HoverLinkType = 'none';
  private hoverCount: number = 0;
  private dialogCompleted: boolean = false;
  private isHandlingHover: boolean = false;
  
  // Debounce function untuk menghindari terlalu banyak trigger saat hover
  private debouncedHoverHandler = debounce(this.handleHoverDialogActual.bind(this), 300);

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

  // Method untuk menentukan apakah link termasuk kategori kontak atau sosial
  private getLinkCategory(linkType: HoverLinkType): 'contact' | 'social' | 'none' {
    if (linkType === 'whatsapp' || linkType === 'email') {
      return 'contact';
    } else if (linkType === 'linkedin' || linkType === 'github') {
      return 'social';
    }
    return 'none';
  }

  // Handler untuk hover event dari komponen SocialLink
  public handleHoverDialog(linkType: HoverLinkType): void {
    // Jika sedang dalam proses hover handling, abaikan
    if (this.isHandlingHover) return;
    
    // Jika sama dengan hover terakhir, abaikan
    if (this.lastHoveredLink === linkType) return;
    
    this.debouncedHoverHandler(linkType);
  }

  // Implementasi actual dari handler hover setelah debounce
  private async handleHoverDialogActual(linkType: HoverLinkType): Promise<void> {
    this.isHandlingHover = true;
    
    // Jika tidak ada link yang di-hover, reset saja
    if (linkType === 'none') {
      this.isHandlingHover = false;
      return;
    }

    // Hentikan dialog yang sedang berjalan jika ada
    this.dialogController.stopTyping();
    this.elevenlabsService.stopSpeaking();

    // Tentukan kategori link yang di-hover sekarang dan sebelumnya
    const currentCategory = this.getLinkCategory(linkType);
    const previousCategory = this.getLinkCategory(this.lastHoveredLink);

    let dialogText = '';

    // Jika user terlalu banyak hover bolak-balik, tampilkan dialog kesal
    if (this.hoverCount > 5) {
      dialogText = HOVER_DIALOGS.annoyance.secondLevel;
    } else if (this.hoverCount > 3) {
      dialogText = HOVER_DIALOGS.annoyance.firstLevel;
      this.hoverCount++;
    } 
    // Jika kategori berubah (dari sosial ke kontak atau sebaliknya)
    else if (previousCategory !== 'none' && currentCategory !== previousCategory) {
      if (previousCategory === 'social' && currentCategory === 'contact') {
        dialogText = HOVER_DIALOGS.transition.socialToContact;
      } else if (previousCategory === 'contact' && currentCategory === 'social') {
        dialogText = HOVER_DIALOGS.transition.contactToSocial;
      }
      this.hoverCount++;
    } 
    // Jika dialog normal sudah selesai atau belum selesai
    else {
      if (currentCategory === 'contact') {
        dialogText = this.dialogCompleted 
          ? HOVER_DIALOGS.completed.contact 
          : HOVER_DIALOGS.interruption.contact;
      } else if (currentCategory === 'social') {
        dialogText = this.dialogCompleted 
          ? HOVER_DIALOGS.completed.social 
          : HOVER_DIALOGS.interruption.social;
      }
    }

    if (dialogText) {
      // Speak the dialog text
      await this.elevenlabsService.speakText(dialogText, 'geralt');
    }

    // Update last hovered link
    this.lastHoveredLink = linkType;
    this.isHandlingHover = false;
  }

  // Reset hover state (misalnya saat user meninggalkan halaman)
  public resetHoverState(): void {
    this.lastHoveredLink = 'none';
    this.hoverCount = 0;
    this.isHandlingHover = false;
  }
}

export default HoverDialogController;