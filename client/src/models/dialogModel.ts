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
      character: "Diva Juan Nur Taqarrub",
      text: "Selamat datang di situs portfolio Diva Juan. Saya seorang Software Engineer dan Game Developer dengan keahlian di bidang backend, frontend, dan multimedia.",
      voiceId: "geralt",
    },
    {
      id: 2,
      character: "Diva Juan Nur Taqarrub",
      text: "Saya memiliki pengalaman di bidang Software Engineering dengan keahlian utama di Java, Database, dan Game Development. Silahkan hubungi saya untuk kolaborasi.",
      voiceId: "geralt",
    },
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