import DialogModel, { Dialog } from '../models/dialogModel';
import ElevenLabsService from '../services/elevenlabsService';

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

  private constructor() {
    this.dialogModel = DialogModel.getInstance();
    this.elevenlabsService = ElevenLabsService.getInstance();
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
    // Stop current typing if in progress
    this.stopTyping();
    
    // Move to next dialog
    const nextDialog = this.dialogModel.nextDialog();
    
    if (nextDialog) {
      this.typeDialog(nextDialog, callback);
    } else {
      // We've reached the end of the dialog
      callback(this.currentText, true);
    }
  }

  public previousDialog(callback: (text: string, isComplete: boolean) => void): void {
    // Stop current typing if in progress
    this.stopTyping();
    
    // Move to previous dialog
    const prevDialog = this.dialogModel.previousDialog();
    
    if (prevDialog) {
      this.typeDialog(prevDialog, callback);
    } else {
      // We're at the beginning, just restart the current dialog
      const currentDialog = this.dialogModel.getCurrentDialog();
      if (currentDialog) {
        this.typeDialog(currentDialog, callback);
      }
    }
  }

  public startDialog(callback: (text: string, isComplete: boolean) => void): void {
    // Reset to the beginning of dialog
    this.dialogModel.resetDialog();
    
    // Get current dialog
    const currentDialog = this.dialogModel.getCurrentDialog();
    
    if (currentDialog) {
      this.typeDialog(currentDialog, callback);
    }
  }

  private typeDialog(dialog: Dialog, callback: (text: string, isComplete: boolean) => void): void {
    this.isTyping = true;
    this.typewriterCallback = callback;
    this.fullText = dialog.text;
    this.currentText = '';
    this.charIndex = 0;
    
    // Start the voice synthesis if we have an API key and voice ID
    if (this.elevenlabsService.getApiKey() && dialog.voiceId) {
      this.elevenlabsService.speakText(dialog.text, dialog.voiceId);
    }
    
    // Start the typewriter effect
    this.typingInterval = setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.currentText += this.fullText.charAt(this.charIndex);
        this.charIndex++;
        
        if (this.typewriterCallback) {
          this.typewriterCallback(this.currentText, false);
        }
      } else {
        // Text is complete
        this.isTyping = false;
        if (this.typingInterval) {
          clearInterval(this.typingInterval);
          this.typingInterval = null;
        }
        
        if (this.typewriterCallback) {
          this.typewriterCallback(this.currentText, true);
        }
      }
    }, this.typingSpeed);
  }

  public stopTyping(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    
    this.isTyping = false;
    this.elevenlabsService.stopSpeaking();
  }

  public skipToFullText(): void {
    if (this.isTyping && this.typewriterCallback) {
      // Clear the typing interval
      if (this.typingInterval) {
        clearInterval(this.typingInterval);
        this.typingInterval = null;
      }
      
      // Set text to full text
      this.currentText = this.fullText;
      this.isTyping = false;
      
      // Call the callback with the full text
      this.typewriterCallback(this.currentText, true);
    }
  }

  public isCurrentlyTyping(): boolean {
    return this.isTyping;
  }
}

export default DialogController;