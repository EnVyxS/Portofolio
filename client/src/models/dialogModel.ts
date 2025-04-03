export interface Dialog {
  id: number;
  text: string;
  character: string;
  voiceId?: string; // For ElevenLabs voice ID
  persistent?: boolean; // Apakah dialog tetap visible setelah selesai
}

// Dialog khusus untuk situasi setelah reset
export const RETURN_DIALOG: Dialog = {
  id: 1001,
  character: "DIVA JUAN NUR TAQARRUB",
  text: "Now what, you little filth!? Back for more punishment?",
  voiceId: "geralt",
  persistent: true
};

class DialogModel {
  private static instance: DialogModel;
  private dialogs: Dialog[] = [
    {
      id: 1,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "...Didn't ask for company.",
      voiceId: "geralt", // Voice ID untuk DIVA JUAN NUR TAQARRUB
    },
    {
      id: 2,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Fire's warm... Always brings strays....",
      voiceId: "geralt",
    },
    {
      id: 3,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Haahhhh... You need something or are you just here to waste my time?",
      voiceId: "geralt",
    },
    {
      id: 4,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 5,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Curiosity?... Hmph... Doesn't pay the bills...",
      voiceId: "geralt",
    },
    {
      id: 6,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 7,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Pfftt... Waiting... Drinking... What else is there?",
      voiceId: "geralt",
    },
    {
      id: 8,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 9,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "A job?.., A way out?.., Some miracle?..",
      voiceId: "geralt",
    },
    {
      id: 10,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 11,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Heh... Yeah, real fucking hilarious, isn't it?",
      voiceId: "geralt",
    },
    {
      id: 12,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "...You got a name?",
      voiceId: "geralt",
    },
    {
      id: 13,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 14,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Hm. Not that it matters,",
      voiceId: "geralt",
    },
    {
      id: 15,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "DIVA JUAN NUR TAQARRUB , , Call me what you want. Doesn't do shit,",
      voiceId: "geralt",
    },
    {
      id: 16,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 17,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Hmm... Why.. am I even here?..",
      voiceId: "geralt",
    },
    {
      id: 18,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Anything that keeps me breathing,",
      voiceId: "geralt",
    },
    {
      id: 19,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Hunting work's like hunting a ghost. No signs, no tracks, just hope and a headache,",
      voiceId: "geralt",
    },
    {
      id: 20,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 21,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Graduated. Computer Science. 2024,",
      voiceId: "geralt",
    },
    {
      id: 22,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Yeah... Cum laude. Thought it'd mean something.. Turns out it's worth less than a stiff drink,",
      voiceId: "geralt",
    },
    {
      id: 23,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 24,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Backend. Java. Databases. Know my way around. Not that anyone cares,",
      voiceId: "geralt",
    },
    {
      id: 25,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Made a game for my thesis. Thought it'd mean something. It didn't,",
      voiceId: "geralt",
    },
    {
      id: 26,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Editing too. Years of it. Doesn't put food on the table,",
      voiceId: "geralt",
    },
    {
      id: 27,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Vegas Pro. After Effects. Cut, stitch, fix. Life's not that simple,",
      voiceId: "geralt",
    },
    {
      id: 28,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "SQL... PostgreSQL... MySQL... Data's just numbers. Like debts. Like failures,",
      voiceId: "geralt",
    },
    {
      id: 29,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Used to like puzzles. Now? Just another thing that doesn't pay,",
      voiceId: "geralt",
    },
    {
      id: 30,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 31,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "...Leaving this place?",
      voiceId: "geralt",
    },
    {
      id: 32,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Huhhhh... Like that's so easy,",
      voiceId: "geralt",
    },
    {
      id: 33,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Go where? With what? Got coin to spare?,",
      voiceId: "geralt",
    },
    {
      id: 34,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Nothing's free... Not even dreams,",
      voiceId: "geralt",
    },
    {
      id: 35,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 36,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "But if the pay's right… maybe,",
      voiceId: "geralt",
    },
    {
      id: 37,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 38,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "For now? I drink. Sit. Hope the fire lasts longer than the night,",
      voiceId: "geralt",
    },
    {
      id: 39,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 40,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Hmph... You fight... you bleed... you try...,",
      voiceId: "geralt",
    },
    {
      id: 41,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "And in the end, still nothing,",
      voiceId: "geralt",
    },
    {
      id: 42,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "...Enough about me",
      voiceId: "geralt",
    },
    {
      id: 43,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "What do you want?..",
      voiceId: "geralt",
    },
    {
      id: 44,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Talk... You got a job, or just wasting my time?..",
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
  
  public setCurrentDialogIndex(index: number): void {
    if (index >= 0 && index < this.dialogs.length) {
      this.currentDialogIndex = index;
    }
  }

  public getAllDialogs(): Dialog[] {
    return [...this.dialogs];
  }
}

export default DialogModel;
