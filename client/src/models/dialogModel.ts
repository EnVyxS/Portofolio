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
      character: "Geralt of Rivia",
      text: "Hmm. Greetings, traveler. You've found yourself at a bonfire. A moment of respite in these dark lands.",
      voiceId: "geralt"
    },
    {
      id: 2,
      character: "Geralt of Rivia",
      text: "I am Geralt. A witcher. You might say I'm a software monster hunter. My blades are code and logic, seeking out bugs and slaying them without mercy.",
      voiceId: "geralt"
    },
    {
      id: 3,
      character: "Geralt of Rivia",
      text: "You seek knowledge of my skills? Very well.\n\nIn the front realms, I wield React and TypeScript with precision. The dark arts of CSS and animations are tools in my arsenal.",
      voiceId: "geralt"
    },
    {
      id: 4,
      character: "Geralt of Rivia",
      text: "Behind the veil, Node.js and Express are my silver weapons against the beasts of backend complexity. Databases bend to my will, be they SQL or NoSQL.",
      voiceId: "geralt"
    },
    {
      id: 5,
      character: "Geralt of Rivia",
      text: "My path has taken me through quests at various guilds - startups seeking innovation, established kingdoms maintaining order in their digital realms.",
      voiceId: "geralt"
    },
    {
      id: 6,
      character: "Geralt of Rivia",
      text: "Danger lurks in every codebase. Security vulnerabilities, performance issues... I track them down, using the Signs of testing and best practices.",
      voiceId: "geralt"
    },
    {
      id: 7,
      character: "Geralt of Rivia",
      text: "If you wish to enlist my services for your quest, my contact details await you. Choose your method of communication wisely.",
      voiceId: "geralt"
    },
    {
      id: 8,
      character: "Geralt of Rivia",
      text: "Remember, in this digital world, a witcher's work is never truly done. There's always another monster to slay, another feature to build.",
      voiceId: "geralt"
    },
    {
      id: 9,
      character: "Geralt of Rivia",
      text: "Now, shall we discuss your project? Or perhaps you'd like to see evidence of my past conquests?",
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
    if (this.currentDialogIndex >= this.dialogs.length) {
      return undefined;
    }
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