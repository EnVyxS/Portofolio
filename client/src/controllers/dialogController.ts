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
    const nextDialog = this.dialogModel.nextDialog();
    if (nextDialog) {
      this.typeDialog(nextDialog, callback);
    } else {
      // If no more dialogs, inform the callback
      callback(this.currentText, true);
    }
  }

  public previousDialog(callback: (text: string, isComplete: boolean) => void): void {
    const prevDialog = this.dialogModel.previousDialog();
    if (prevDialog) {
      this.typeDialog(prevDialog, callback);
    } else {
      // If no previous dialogs, keep the current one
      callback(this.currentText, false);
    }
  }

  public startDialog(callback: (text: string, isComplete: boolean) => void): void {
    // Reset and start from the beginning
    this.dialogModel.resetDialog();
    const dialog = this.dialogModel.getCurrentDialog();
    if (dialog) {
      this.typeDialog(dialog, callback);
    }
  }

  private typeDialog(dialog: Dialog, callback: (text: string, isComplete: boolean) => void): void {
    // Stop any current typing
    this.stopTyping();
    
    this.fullText = dialog.text;
    this.currentText = '';
    this.charIndex = 0;
    this.typewriterCallback = callback;
    this.isTyping = true;

    // Try to speak using Elevenlabs if the API key is available
    if (this.elevenlabsService.getApiKey() && dialog.voiceId) {
      this.elevenlabsService.speakText(dialog.text, dialog.voiceId).catch(err => {
        console.error('Error with text-to-speech:', err);
      });
    }

    // Start typewriter effect
    this.typingInterval = setInterval(() => {
      // Skip if we've reached the end
      if (this.charIndex >= this.fullText.length) {
        this.stopTyping();
        if (this.typewriterCallback) {
          this.typewriterCallback(this.fullText, false);
        }
        return;
      }

      // Add character to current text
      this.currentText += this.fullText.charAt(this.charIndex);
      this.charIndex++;

      // Call the callback with updated text
      if (this.typewriterCallback) {
        this.typewriterCallback(this.currentText, false);
      }

      // Adjust typing speed based on punctuation
      const currentChar = this.fullText.charAt(this.charIndex - 1);
      if (currentChar === '.' || currentChar === '!' || currentChar === '?') {
        // Pause longer at end of sentences
        clearInterval(this.typingInterval!);
        setTimeout(() => {
          this.typingInterval = setInterval(() => {
            this.typeCharacter();
          }, this.typingSpeed);
        }, 500); // Pause for 500ms at end of sentence
      } else if (currentChar === ',' || currentChar === ';' || currentChar === ':') {
        // Slight pause at commas and other mid-sentence punctuation
        clearInterval(this.typingInterval!);
        setTimeout(() => {
          this.typingInterval = setInterval(() => {
            this.typeCharacter();
          }, this.typingSpeed);
        }, 250); // Pause for 250ms at mid-sentence punctuation
      } else if (currentChar === '\n') {
        // Pause at new lines for paragraph breaks
        clearInterval(this.typingInterval!);
        setTimeout(() => {
          this.typingInterval = setInterval(() => {
            this.typeCharacter();
          }, this.typingSpeed);
        }, 750); // Pause for 750ms at paragraph breaks
      }

    }, this.typingSpeed);
  }

  private typeCharacter(): void {
    // Skip if we've reached the end
    if (this.charIndex >= this.fullText.length) {
      this.stopTyping();
      if (this.typewriterCallback) {
        this.typewriterCallback(this.fullText, false);
      }
      return;
    }

    // Add character to current text
    this.currentText += this.fullText.charAt(this.charIndex);
    this.charIndex++;

    // Call the callback with updated text
    if (this.typewriterCallback) {
      this.typewriterCallback(this.currentText, false);
    }
  }

  public stopTyping(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    this.isTyping = false;
  }

  public skipToFullText(): void {
    this.stopTyping();
    this.currentText = this.fullText;
    if (this.typewriterCallback) {
      this.typewriterCallback(this.currentText, false);
    }
  }

  public isCurrentlyTyping(): boolean {
    return this.isTyping;
  }
}

export default DialogController;