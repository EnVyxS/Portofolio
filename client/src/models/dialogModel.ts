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
      text: "Hmm. A wanderer, I see. Welcome to my campfire. The flames provide comfort in these dark times.",
      character: "geralt",
      voiceId: "geralt"
    },
    {
      id: 2,
      text: "You seek a skilled developer? Someone who can craft powerful code and elegant solutions? I might be what you're looking for.",
      character: "geralt",
      voiceId: "geralt"
    },
    {
      id: 3,
      text: "I've honed my skills through many battles with JavaScript, React, and Node.js. The scars of debugging have made me stronger.",
      character: "geralt",
      voiceId: "geralt"
    },
    {
      id: 4,
      text: "My medallion hums when I sense clean, efficient code. And it's humming now as I think about the projects we could build together.",
      character: "geralt",
      voiceId: "geralt"
    },
    {
      id: 5,
      text: "Feel free to explore my skills and achievements. When you're ready to embark on a quest together, you know where to find me.",
      character: "geralt",
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
    return this.dialogs[this.currentDialogIndex];
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