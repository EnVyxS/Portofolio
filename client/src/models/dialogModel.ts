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
  voiceId: "dBynzNhvSFj0l1D7I9yV",
  persistent: true
};

class DialogModel {
  private static instance: DialogModel;
  private dialogs: Dialog[] = [
    {
      id: 1,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "...Didn't ask for company.",
      voiceId: "dBynzNhvSFj0l1D7I9yV", // Voice ID untuk DIVA JUAN NUR TAQARRUB
    },
    {
      id: 2,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Fire's warm... Always brings strays....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 3,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Haahhhh... You need something or are you just here to waste my time?",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 4,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 5,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Curiosity?... Hmph... Doesn't pay the bills...",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 6,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 7,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Pfftt... Waiting... Drinking... What else is there?",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 8,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 9,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "A job?.., A way out?.., Some miracle?..",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 10,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 11,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Heh... Yeah, real fucking hilarious, isn't it?",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 12,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "...You got a name?",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 13,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 14,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Hm. Not that it matters,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 15,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "DIVA JUAN NUR TAQARRUB , , Call me what you want. Doesn't do shit,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 16,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 17,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Hmm... Why.. am I even here?..",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 18,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Anything that keeps me breathing,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 19,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Hunting work's like hunting a ghost. No signs, no tracks, just hope and a headache,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 20,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 21,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Graduated. Computer Science. 2024,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 22,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Yeah... Cum laude. Thought it'd mean something.. Turns out it's worth less than a stiff drink,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 23,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 24,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Backend. Java. Databases. Know my way around. Not that anyone cares,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 25,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Made a game for my thesis. Thought it'd mean something. It didn't,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 26,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Editing too. Years of it. Doesn't put food on the table,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 27,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Vegas Pro. After Effects. Cut, stitch, fix. Life's not that simple,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 28,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "SQL... PostgreSQL... MySQL... Data's just numbers. Like debts. Like failures,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 29,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Used to like puzzles. Now? Just another thing that doesn't pay,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 30,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 31,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "...Leaving this place?",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 32,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Huhhhh... Like that's so easy,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 33,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Go where? With what? Got coin to spare?,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 34,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Nothing's free... Not even dreams,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 35,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 36,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "But if the pay's right… maybe,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 37,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 38,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "For now? I drink. Sit. Hope the fire lasts longer than the night,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 39,
      character: "DIVA JUAN NUR TAQARRUB",
      text: ".....",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 40,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Hmph... You fight... you bleed... you try...,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 41,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "And in the end, still nothing,",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 42,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "...Enough about me",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 43,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "What do you want?..",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
    },
    {
      id: 44,
      character: "DIVA JUAN NUR TAQARRUB",
      text: "Talk... You got a job, or just wasting my time?..",
      voiceId: "dBynzNhvSFj0l1D7I9yV",
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
  
  public getCurrentIndex(): number {
    return this.currentDialogIndex;
  }

  public getAllDialogs(): Dialog[] {
    return [...this.dialogs];
  }
}

export default DialogModel;
