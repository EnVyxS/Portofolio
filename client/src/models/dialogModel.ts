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
      text: "Hmm, another wanderer approaching the fire. Welcome to my campsite, traveler.",
      voiceId: "geralt"
    },
    {
      id: 2,
      character: "Geralt",
      text: "I'm Geralt of Rivia, a witcher by profession. I hunt monsters and solve problems... for the right price.",
      voiceId: "geralt"
    },
    {
      id: 3,
      character: "Geralt",
      text: "You seem interested in knowing more about me. Well, I've been developing software for quite some time now.",
      voiceId: "geralt"
    },
    {
      id: 4,
      character: "Geralt",
      text: "My specialties? Frontend sorcery with React, TypeScript enchantments, and backend rituals with Node.js.",
      voiceId: "geralt"
    },
    {
      id: 5,
      character: "Geralt",
      text: "I've faced many challenges in my journey - complex APIs, tricky UI animations, performance optimizations. All defeated.",
      voiceId: "geralt"
    },
    {
      id: 6,
      character: "Geralt",
      text: "If you need someone with my skills, my contact details are just ahead. Take a look at my previous contracts too.",
      voiceId: "geralt"
    },
    {
      id: 7,
      character: "Geralt",
      text: "Hmm. That's enough talk for now. Take a look at my portfolio card to learn more or to contact me for work.",
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
    if (this.currentDialogIndex >= 0 && this.currentDialogIndex < this.dialogs.length) {
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
    return [...this.dialogs]; // Return a copy to prevent external modification
  }
}

export default DialogModel;