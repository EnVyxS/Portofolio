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
      character: "geralt",
      text: "...Didn't ask for company.",
      voiceId: "geralt"
    },
    {
      id: 2,
      character: "geralt",
      text: "Tch... Fire's warm. Always brings strays.",
      voiceId: "geralt"
    },
    {
      id: 3,
      character: "geralt",
      text: "Haahhhh... You need something or are you just here to waste my time?",
      voiceId: "geralt"
    },
    {
      id: 4,
      character: "geralt",
      text: ".....",
      voiceId: "geralt"
    },
    {
      id: 5,
      character: "geralt",
      text: "Curiosity?... Hmph... Doesn't pay the bills...",
      voiceId: "geralt"
    },
    {
      id: 6,
      character: "geralt",
      text: ".....",
      voiceId: "geralt"
    },
    {
      id: 7,
      character: "geralt",
      text: "Pfftt... Waiting... Drinking... What else is there?",
      voiceId: "geralt"
    },
    {
      id: 8,
      character: "geralt",
      text: "Hmm... Got a handful of coins and a longsword. That's all a man like me needs...",
      voiceId: "geralt"
    },
    {
      id: 9,
      character: "geralt",
      text: ".....",
      voiceId: "geralt"
    },
    {
      id: 10,
      character: "geralt",
      text: "There's a contract I'll have to deal with come sunrise. Some beast's been picking off villagers near the old mill...",
      voiceId: "geralt"
    },
    {
      id: 11,
      character: "geralt",
      text: "You want to know more about me? Hmmm... Why would you care?",
      voiceId: "geralt"
    },
    {
      id: 12,
      character: "geralt",
      text: "Witcher by trade. Monster hunter. I follow the Path.",
      voiceId: "geralt"
    },
    {
      id: 13,
      character: "geralt",
      text: "I see by your eyes you've heard the tales. Yes, they're all true. The mutations. The training.",
      voiceId: "geralt"
    },
    {
      id: 14,
      character: "geralt",
      text: "Not many of us left. Most don't make it through the Trial of Grasses. I was... lucky. Or cursed. Depends who you ask.",
      voiceId: "geralt"
    },
    {
      id: 15,
      character: "geralt",
      text: ".....",
      voiceId: "geralt"
    },
    {
      id: 16,
      character: "geralt",
      text: "I don't talk much about my past. No point dwelling on what's done.",
      voiceId: "geralt"
    },
    {
      id: 17,
      character: "geralt",
      text: "What's that look for? Expected something more? *grunts* Don't we all...",
      voiceId: "geralt"
    },
    {
      id: 18,
      character: "geralt",
      text: "The Path is a lonely one. That's just how it is.",
      voiceId: "geralt"
    },
    {
      id: 19,
      character: "geralt",
      text: ".....",
      voiceId: "geralt"
    },
    {
      id: 20,
      character: "geralt",
      text: "If you're looking to hire me, I'm not cheap. But I'm good at what I do.",
      voiceId: "geralt"
    },
    {
      id: 21,
      character: "geralt",
      text: "Hmm... I notice you're still here. You're either brave or stupid. Most people keep their distance.",
      voiceId: "geralt"
    },
    {
      id: 22,
      character: "geralt",
      text: ".....",
      voiceId: "geralt"
    },
    {
      id: 23,
      character: "geralt",
      text: "You can find me on the Path. Or through Kaer Morhen, when winter comes.",
      voiceId: "geralt"
    },
    {
      id: 24,
      character: "geralt",
      text: "I've left my mark in several places. Some remember me. Others... prefer to forget.",
      voiceId: "geralt"
    },
    {
      id: 25,
      character: "geralt",
      text: "There are ways to reach me if you truly need a witcher's services. Just follow the rumors of monsters slain.",
      voiceId: "geralt"
    },
    {
      id: 26,
      character: "geralt",
      text: "Or perhaps you'd prefer more direct methods...",
      voiceId: "geralt"
    },
    {
      id: 27,
      character: "geralt",
      text: ".....",
      voiceId: "geralt"
    },
    {
      id: 28,
      character: "geralt",
      text: "There's a code among witchers. We don't kill humans. Not without reason.",
      voiceId: "geralt"
    },
    {
      id: 29,
      character: "geralt",
      text: "Sometimes, though, the monsters look just like you and me.",
      voiceId: "geralt"
    },
    {
      id: 30,
      character: "geralt",
      text: ".....",
      voiceId: "geralt"
    },
    {
      id: 31,
      character: "geralt",
      text: "The fire's dying. And I've said more than I usually do in a month.",
      voiceId: "geralt"
    },
    {
      id: 32,
      character: "geralt",
      text: "Take what you need from our conversation. I'll be here until dawn.",
      voiceId: "geralt"
    },
    {
      id: 33,
      character: "geralt",
      text: "After that, the Path calls again.",
      voiceId: "geralt"
    },
    {
      id: 34,
      character: "geralt",
      text: ".....",
      voiceId: "geralt"
    },
    {
      id: 35,
      character: "geralt",
      text: "Do what you will with my words. Just remember, a witcher never forgets a face.",
      voiceId: "geralt"
    },
    {
      id: 36,
      character: "geralt",
      text: "Now leave me be. I've had enough talk for one night.",
      voiceId: "geralt"
    },
    {
      id: 37,
      character: "geralt",
      text: "Hmm.",
      voiceId: "geralt"
    },
    {
      id: 38,
      character: "geralt",
      text: "*stares into the fire*",
      voiceId: "geralt"
    },
    {
      id: 39,
      character: "geralt",
      text: ".....",
      voiceId: "geralt"
    },
    {
      id: 40,
      character: "geralt",
      text: "*sighs* One last word of advice: in this world, it's rarely about the monsters. It's about the men. Remember that.",
      voiceId: "geralt"
    },
    {
      id: 41,
      character: "geralt",
      text: "Farewell, stranger.",
      voiceId: "geralt"
    },
    {
      id: 42,
      character: "geralt",
      text: "*turns back to the fire*",
      voiceId: "geralt"
    },
    {
      id: 43,
      character: "geralt",
      text: ".....",
      voiceId: "geralt"
    },
    {
      id: 44,
      character: "geralt",
      text: "*end of conversation*",
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