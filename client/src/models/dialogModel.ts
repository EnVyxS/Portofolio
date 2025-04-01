export interface Dialog {
  id: number;
  text: string;
  character: string;
  voiceId?: string; // For ElevenLabs voice ID
}

class DialogModel {
  private static instance: DialogModel;
  private dialogs: Dialog[] = [
    {
      id: 1,
      character: "Geralt",
      text: "Hmm... a visitor. *Witcher medallion vibrates softly* Not a common occurrence to have someone approach my fire.",
      voiceId: "geralt"
    },
    {
      id: 2,
      character: "Geralt",
      text: "I see you're looking for someone with particular... skills. Perhaps I can be of help. Though my methods are unconventional.",
      voiceId: "geralt"
    },
    {
      id: 3,
      character: "Geralt",
      text: "Web development, app architecture, user experience... different beasts than what I'm used to hunting. But every monster has a pattern.",
      voiceId: "geralt"
    },
    {
      id: 4,
      character: "Geralt",
      text: "Take a look at my previous contracts. They may tell you more about how I work than any words could.",
      voiceId: "geralt"
    },
    {
      id: 5,
      character: "Geralt",
      text: "If you've got a project that needs someone who sees beyond the obvious, who can track solutions where others see only problems, then perhaps we have a deal to strike.",
      voiceId: "geralt"
    },
    {
      id: 6,
      character: "Geralt",
      text: "Contact me through those mystical portals in the card. We'll discuss the details, the payment, everything that matters.",
      voiceId: "geralt"
    },
    {
      id: 7,
      character: "Geralt",
      text: "Remember, though... *stares into the fire* Code, like destiny, is a double-edged blade. The choices we make echo through the systems we build.",
      voiceId: "geralt"
    },
    {
      id: 8,
      character: "Geralt",
      text: "Now, go ahead. Reach out if you need a skilled hand for your next digital hunt.",
      voiceId: "geralt"
    }
  ];
  private currentDialogIndex: number = 0;

  private constructor() {}

  public static getInstance(): DialogModel {
    if (!DialogModel.instance) {
      DialogModel.instance = new DialogModel();
    }
    return DialogModel.instance;
  }

  public getCurrentDialog(): Dialog | undefined {
    if (this.currentDialogIndex < this.dialogs.length) {
      return this.dialogs[this.currentDialogIndex];
    }
    return undefined;
  }

  public nextDialog(): Dialog | undefined {
    if (this.currentDialogIndex < this.dialogs.length - 1) {
      this.currentDialogIndex++;
      return this.dialogs[this.currentDialogIndex];
    }
    return undefined;
  }

  public previousDialog(): Dialog | undefined {
    if (this.currentDialogIndex > 0) {
      this.currentDialogIndex--;
      return this.dialogs[this.currentDialogIndex];
    }
    return undefined;
  }

  public resetDialog(): void {
    this.currentDialogIndex = 0;
  }

  public getAllDialogs(): Dialog[] {
    return [...this.dialogs];
  }
}

export default DialogModel;