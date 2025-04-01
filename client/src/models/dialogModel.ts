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
      text: "[annoyed] ...Didn't ask for company.",
      voiceId: "geralt", // geralt sekarang mengarah ke voice ID L9oqKdX7JyDJa0dK6AzN
    },
    {
      id: 2,
      character: "Diva Juan Nur Taqarrub",
      text: "[irritated] Tch... Fire's warm. Always brings strays.",
      voiceId: "geralt",
    },
    {
      id: 3,
      character: "Diva Juan Nur Taqarrub",
      text: "[cynical, tired] Haahhhh... You need something or are you just here to waste my time?",
      voiceId: "geralt",
    },
    {
      id: 4,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 5,
      character: "Diva Juan Nur Taqarrub",
      text: "Curiosity?... Hmph... Doesn’t pay the bills...",
      voiceId: "geralt",
    },
    {
      id: 6,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 7,
      character: "Diva Juan Nur Taqarrub",
      text: "Pfftt... Waiting... Drinking... What else is there?",
      voiceId: "geralt",
    },
    {
      id: 8,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 9,
      character: "Diva Juan Nur Taqarrub",
      text: "A job?.., A way out?.., Some miracle?..",
      voiceId: "geralt",
    },
    {
      id: 10,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 11,
      character: "Diva Juan Nur Taqarrub",
      text: "Heh... Yeah, real fucking hilarious, isn't it?",
      voiceId: "geralt",
    },
    {
      id: 12,
      character: "Diva Juan Nur Taqarrub",
      text: "...You got a name?",
      voiceId: "geralt",
    },
    {
      id: 13,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 14,
      character: "Diva Juan Nur Taqarrub",
      text: "Hm. Not that it matters,",
      voiceId: "geralt",
    },
    {
      id: 15,
      character: "Diva Juan Nur Taqarrub",
      text: "Diva Juan Nur Taqarrub , , Call me what you want. Doesn't do shit,",
      voiceId: "geralt",
    },
    {
      id: 16,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 17,
      character: "Diva Juan Nur Taqarrub",
      text: "Hmph... why am I even here?..",
      voiceId: "geralt",
    },
    {
      id: 18,
      character: "Diva Juan Nur Taqarrub",
      text: "Anything that keeps me breathing,",
      voiceId: "geralt",
    },
    {
      id: 19,
      character: "Diva Juan Nur Taqarrub",
      text: "Hunting work's like hunting a ghost. No signs, no tracks, just hope and a headache,",
      voiceId: "geralt",
    },
    {
      id: 20,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 21,
      character: "Diva Juan Nur Taqarrub",
      text: "Graduated. Computer Science. 2024,",
      voiceId: "geralt",
    },
    {
      id: 22,
      character: "Diva Juan Nur Taqarrub",
      text: "Yeah... Cum laude. Thought it'd mean something.. Turns out it's worth less than a stiff drink,",
      voiceId: "geralt",
    },
    {
      id: 23,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 24,
      character: "Diva Juan Nur Taqarrub",
      text: "Backend. Java. Databases. Know my way around. Not that anyone cares,",
      voiceId: "geralt",
    },
    {
      id: 25,
      character: "Diva Juan Nur Taqarrub",
      text: "Made a game for my thesis. Thought it'd mean something. It didn't,",
      voiceId: "geralt",
    },
    {
      id: 26,
      character: "Diva Juan Nur Taqarrub",
      text: "Editing too. Years of it. Doesn't put food on the table,",
      voiceId: "geralt",
    },
    {
      id: 27,
      character: "Diva Juan Nur Taqarrub",
      text: "Vegas Pro. After Effects. Cut, stitch, fix. Life's not that simple,",
      voiceId: "geralt",
    },
    {
      id: 28,
      character: "Diva Juan Nur Taqarrub",
      text: "SQL... PostgreSQL... MySQL... Data's just numbers. Like debts. Like failures,",
      voiceId: "geralt",
    },
    {
      id: 29,
      character: "Diva Juan Nur Taqarrub",
      text: "Used to like puzzles. Now? Just another thing that doesn't pay,",
      voiceId: "geralt",
    },
    {
      id: 30,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 31,
      character: "Diva Juan Nur Taqarrub",
      text: "...Leaving this place?",
      voiceId: "geralt",
    },
    {
      id: 32,
      character: "Diva Juan Nur Taqarrub",
      text: "Huhhhh... Like that's so easy,",
      voiceId: "geralt",
    },
    {
      id: 33,
      character: "Diva Juan Nur Taqarrub",
      text: "Go where? With what? Got coin to spare?,",
      voiceId: "geralt",
    },
    {
      id: 34,
      character: "Diva Juan Nur Taqarrub",
      text: "Nothing's free. Not even dreams,",
      voiceId: "geralt",
    },
    {
      id: 35,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 36,
      character: "Diva Juan Nur Taqarrub",
      text: "But if the pay's right… maybe,",
      voiceId: "geralt",
    },
    {
      id: 37,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 38,
      character: "Diva Juan Nur Taqarrub",
      text: "For now? I drink. Sit. Hope the fire lasts longer than the night,",
      voiceId: "geralt",
    },
    {
      id: 39,
      character: "Diva Juan Nur Taqarrub",
      text: ".....",
      voiceId: "geralt",
    },
    {
      id: 40,
      character: "Diva Juan Nur Taqarrub",
      text: "Hmph... You fight... you bleed... you try...,",
      voiceId: "geralt",
    },
    {
      id: 41,
      character: "Diva Juan Nur Taqarrub",
      text: "And in the end, still nothing,",
      voiceId: "geralt",
    },
    {
      id: 42,
      character: "Diva Juan Nur Taqarrub",
      text: "...Enough about me",
      voiceId: "geralt",
    },
    {
      id: 43,
      character: "Diva Juan Nur Taqarrub",
      text: "What do you want?..",
      voiceId: "geralt",
    },
    {
      id: 44,
      character: "Diva Juan Nur Taqarrub",
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

  public getAllDialogs(): Dialog[] {
    return [...this.dialogs];
  }
}

export default DialogModel;
