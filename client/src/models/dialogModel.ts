export interface Dialog {
  id: number;
  text: string;
  character: string;
  voiceId?: string; // For ElevenLabs voice ID
  persistent?: boolean; // Apakah dialog tetap visible setelah selesai
}

// Variasi dialog untuk situasi setelah reset
const RETURN_DIALOG_VARIATIONS = [
  "[menacing] Now what, you little filth!?.. [threatening] Back for more punishment?",
  "You just don't learn, do you?",
  "Thought you'd had enough. Guess I was wrong.",
  "Back on your feet already? You're persistent, I'll give you that.",
  "I don't have time for this. But if you insist...",
  "Still breathing? Impressive. Stupid, but impressive.",
  "You should've stayed down.",
  "I warned you once. That was your mercy.",
  "You mistake survival for strength. Let me fix that.",
  "Back again? Your pain threshold must be as low as your wit.",
  "This isn't bravery. It's desperation… or stupidity.",
  "You bleed easy. Let's see how long before you break.",
  "Still standing? I'll make that regret last.",
  "You came all this way just to die tired.",
  "You had your chance. Now I take mine.",
  "Last time was a warning. This time, it's a lesson.",
  "You're not a challenge. You're an inconvenience.",
  "You came back. Brave… or foolish?",
  "Some people never know when to quit.",
  "Fine. One more lesson. Then it ends.",
  "Didn't think you'd crawl back so soon. But here we are."
];

// Extended return dialog variations for users with nightmare/escape achievements (experienced)
const RETURN_DIALOG_EXTENSIONS_EXPERIENCED = [
  "You've got two minutes. Or I'll beat you again.",
  "Same deal. Two minutes. Mess it up again, I'll finish what I started.",
  "You've had worse. Two minutes, then we go again.",
  "Two minutes. Last time you didn't listen. Your call.",
  "Two minutes. Or I'll remind you what happened last time."
];

// Extended return dialog variations for users without achievements (first time)
const RETURN_DIALOG_EXTENSIONS_FIRST_TIME = [
  "You've got two minutes. Then I beat you.",
  "Take two minutes. Waste them, and I'll beat the crap out of you.",
  "Two minutes. Use them well... or I won't be gentle.",
  "I'm giving you two minutes. Don't make me regret it.",
  "Two minutes. No more warnings."
];

// Fungsi untuk mendapatkan RETURN_DIALOG dengan variasi random
export const getReturnDialog = (): Dialog => {
  const randomIndex = Math.floor(Math.random() * RETURN_DIALOG_VARIATIONS.length);
  const selectedText = RETURN_DIALOG_VARIATIONS[randomIndex];
  
  return {
    id: 1001,
    character: "DIVA JUAN NUR TAQARRUB",
    text: selectedText,
    voiceId: "dBynzNhvSFj0l1D7I9yV",
    persistent: true
  };
};

// Fungsi untuk mendapatkan Extended Return Dialog berdasarkan achievement status
export const getExtendedReturnDialog = (hasNightmare: boolean, hasEscape: boolean): Dialog => {
  const isExperienced = hasNightmare || hasEscape;
  const variations = isExperienced ? RETURN_DIALOG_EXTENSIONS_EXPERIENCED : RETURN_DIALOG_EXTENSIONS_FIRST_TIME;
  const randomIndex = Math.floor(Math.random() * variations.length);
  const selectedText = variations[randomIndex];
  
  return {
    id: 1002,
    character: "DIVA JUAN NUR TAQARRUB", 
    text: selectedText,
    voiceId: "dBynzNhvSFj0l1D7I9yV",
    persistent: true
  };
};

// Dialog khusus untuk situasi setelah reset (backward compatibility)
export const RETURN_DIALOG: Dialog = {
  id: 1001,
  character: "DIVA JUAN NUR TAQARRUB",
  text: "[menacing] Now what, you little filth!?.. [threatening] Back for more punishment?",
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
