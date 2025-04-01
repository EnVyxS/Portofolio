/**
 * Definisi tone untuk voice modulation dialog Geralt
 * Didasarkan pada karakter Geralt dari The Witcher - karakteristik suara yang khas
 */
export const GERALT_TONE = {
  BITTER: "bitter",       // Pahit, getir, lambat dan berat
  ANGRY: "angry",         // Marah, lebih cepat, terputus-putus
  TIRED: "tired",         // Lelah, sangat lambat dan terputus
  DRUNK: "drunk",         // Mabuk berat, tidak konsisten, slurring banyak
  NUMB: "numb",           // Mati rasa, monoton, datar
  SARCASTIC: "sarcastic", // Sarkastik, ritme bervariasi
  RESIGNED: "resigned",   // Pasrah, tempo lebih lambat
  HOLLOW: "hollow",       // Kosong, hampa, jeda panjang
  ANNOYED: "annoyed",     // Terganggu, tempo sedikit lebih cepat
  CONTEMPLATIVE: "contemplative" // Termenung, banyak jeda
}

// Tipe data untuk fungsi getVoiceSettings
export type GeraltTone = keyof typeof GERALT_TONE;

/**
 * Mendapatkan pengaturan suara ElevenLabs berdasarkan tone emosi
 * 
 * @param tone Tone emosi Geralt
 * @returns Pengaturan voice yang sesuai untuk API ElevenLabs
 */
export function getVoiceSettings(tone: GeraltTone) {
  // Default voice settings
  const defaultSettings = {
    stability: 0.35,
    similarity_boost: 0.75,
    style: 0.65,
    use_speaker_boost: true,
    speaking_rate: 0.70
  };
  
  // Sesuaikan pengaturan berdasarkan tone
  switch (tone) {
    case "ANGRY":
      return {
        ...defaultSettings,
        stability: 0.25,        // Less stable for anger
        style: 0.80,            // More stylistic expression
        speaking_rate: 0.85     // Faster speech when angry
      };
      
    case "TIRED":
      return {
        ...defaultSettings,
        stability: 0.45,        // More stable when tired
        style: 0.55,            // Less expression
        speaking_rate: 0.60     // Much slower when tired
      };
      
    case "DRUNK":
      return {
        ...defaultSettings,
        stability: 0.20,        // Very unstable for slurring
        style: 0.70,            // More stylized for drunk effect
        speaking_rate: 0.65     // Slightly slower, uneven pace
      };
      
    case "NUMB":
      return {
        ...defaultSettings,
        stability: 0.50,        // Very stable for monotone effect
        style: 0.30,            // Much less expression
        speaking_rate: 0.75     // Normal pace but flat
      };
      
    case "SARCASTIC":
      return {
        ...defaultSettings,
        stability: 0.30,        // Less stable for varied tone
        style: 0.85,            // High stylistic variation
        speaking_rate: 0.72     // Slightly faster for sharp delivery
      };
      
    case "RESIGNED":
      return {
        ...defaultSettings,
        stability: 0.40,        // More stable for resignation
        style: 0.50,            // Less expressive
        speaking_rate: 0.65     // Slower, resigned pace
      };
      
    case "HOLLOW":
      return {
        ...defaultSettings,
        stability: 0.45,        // More stable for emptiness
        style: 0.40,            // Less emotional expression
        speaking_rate: 0.68     // Slightly slower, empty
      };
      
    case "ANNOYED":
      return {
        ...defaultSettings,
        stability: 0.30,        // Less stable for annoyance
        style: 0.70,            // More expressive
        speaking_rate: 0.75     // Slightly faster for impatience
      };
      
    case "CONTEMPLATIVE":
      return {
        ...defaultSettings,
        stability: 0.38,        // Moderate stability
        style: 0.55,            // Moderate expression
        speaking_rate: 0.65     // Slower, thoughtful pace
      };
      
    case "BITTER":
      return {
        ...defaultSettings,
        stability: 0.35,        // Average stability
        style: 0.75,            // More expressive for bitterness
        speaking_rate: 0.67     // Slightly slower, heavy
      };
      
    default:
      return defaultSettings;
  }
}

/**
 * Mendapatkan tone yang sesuai berdasarkan konten teks
 * Menganalisis teks untuk menentukan emosi yang paling sesuai dengan konteks
 * 
 * @param text Teks dialog untuk dianalisis
 * @returns Tone yang paling sesuai dengan konten teks
 */
export function analyzeToneFromText(text: string): GeraltTone {
  // Set to lowercase for case-insensitive matching
  const lowercase = text.toLowerCase();
  
  // Check for anger markers
  if (
    lowercase.includes('fuck') || 
    lowercase.includes('damn') || 
    lowercase.includes('shit') ||
    lowercase.includes('bastard')
  ) {
    return "ANGRY";
  }
  
  // Check for tired/exhausted markers
  if (
    lowercase.includes('tired') || 
    lowercase.includes('exhausted') || 
    lowercase.includes('haah') ||
    lowercase.includes('sigh')
  ) {
    return "TIRED";
  }
  
  // Check for drunk markers - slurring words, ellipses
  if (
    lowercase.includes('...') || 
    lowercase.includes('huhh') ||
    (lowercase.match(/\.\.\./g)?.length || 0) > 2
  ) {
    return "DRUNK";
  }
  
  // Check for numb/emotionless markers
  if (
    lowercase.includes('nothing') || 
    lowercase.includes('doesn\'t matter') ||
    lowercase.includes('not that it matters')
  ) {
    return "NUMB";
  }
  
  // Check for sarcastic markers
  if (
    lowercase.includes('heh') || 
    lowercase.includes('hilarious') ||
    lowercase.includes('real funny')
  ) {
    return "SARCASTIC";
  }
  
  // Check for resigned markers
  if (
    lowercase.includes('fate') || 
    lowercase.includes('what else') ||
    lowercase.includes('that\'s how it is')
  ) {
    return "RESIGNED";
  }
  
  // Check for hollow/empty markers
  if (
    lowercase.includes('empty') || 
    lowercase.includes('void') ||
    lowercase.includes('alone')
  ) {
    return "HOLLOW";
  }
  
  // Check for annoyed markers - common for Geralt
  if (
    lowercase.includes('hmph') || 
    lowercase.includes('tch') ||
    lowercase.includes('what do you want') ||
    lowercase.includes('waste') ||
    lowercase.includes('my time')
  ) {
    return "ANNOYED";
  }
  
  // Check for contemplative markers
  if (
    lowercase.includes('why') || 
    lowercase.includes('perhaps') ||
    lowercase.includes('maybe')
  ) {
    return "CONTEMPLATIVE";
  }
  
  // Check for bitter markers
  if (
    lowercase.includes('bitter') || 
    lowercase.includes('no use') ||
    lowercase.includes('doesn\'t pay')
  ) {
    return "BITTER";
  }
  
  // Default to resigned as Geralt's baseline tone
  return "RESIGNED";
}

// Mapping dialog ke tone yang sesuai dengan karakter Geralt
export const dialogToToneMap: Record<string, GeraltTone> = {
  // Dialog dari model untuk mapping ke tone yang tepat
  "...Didn't ask for company.": "ANNOYED",
  "Tch... Fire's warm. Always brings strays.": "BITTER",
  "Haahhhh... You need something or are you just here to waste my time?": "ANNOYED",
  "Curiosity?... Hmph... Doesn't pay the bills...": "SARCASTIC",
  "Pfftt... Waiting... Drinking... What else is there?": "RESIGNED",
  "A job?.., A way out?.., Some miracle?..": "HOLLOW",
  "Heh... Yeah, real fucking hilarious, isn't it?": "SARCASTIC",
  "...You got a name?": "CONTEMPLATIVE",
  "Hm. Not that it matters,": "NUMB",
  "Diva Juan Nur Taqarrub , , Call me what you want. Doesn't do shit,": "BITTER",
  "Hmph... why am I even here?..": "CONTEMPLATIVE",
  "Anything that keeps me breathing,": "NUMB",
  "Hunting work's like hunting a ghost. No signs, no tracks, just hope and a headache,": "RESIGNED",
  "Graduated. Computer Science. 2024,": "HOLLOW",
  "Yeah... Cum laude. Thought it'd mean something.. Turns out it's worth less than a stiff drink,": "BITTER",
  "Backend. Java. Databases. Know my way around. Not that anyone cares,": "RESIGNED",
  "Made a game for my thesis. Thought it'd mean something. It didn't,": "BITTER",
  "Editing too. Years of it. Doesn't put food on the table,": "TIRED",
  "Vegas Pro. After Effects. Cut, stitch, fix. Life's not that simple,": "HOLLOW",
  "SQL... PostgreSQL... MySQL... Data's just numbers. Like debts. Like failures,": "NUMB",
  "Used to like puzzles. Now? Just another thing that doesn't pay,": "RESIGNED",
  "...Leaving this place?": "SARCASTIC",
  "Huhhhh... Like that's so easy,": "BITTER",
  "Go where? With what? Got coin to spare?,": "ANGRY",
  "Nothing's free. Not even dreams,": "HOLLOW",
  "But if the pay's right… maybe,": "CONTEMPLATIVE",
  "For now? I drink. Sit. Hope the fire lasts longer than the night,": "RESIGNED",
  "Hmph... You fight... you bleed... you try...,": "TIRED",
  "And in the end, still nothing,": "HOLLOW",
  "...Enough about me": "ANNOYED",
  "What do you want?..": "ANNOYED",
  "Talk... You got a job, or just wasting my time?..": "ANNOYED",
  
  // Hover dialog
  "Hmph... In a rush, are we? Fine. Tell me what you need done.": "ANNOYED",
  "Not listening, huh? Fine. Decide after you've checked.": "ANNOYED",
  "Straight to the point—I like that. Fine. Give me the contract.": "RESIGNED",
  "Need to check first before deciding? Fine. Not like I'm in a hurry.": "RESIGNED",
  "Took your time, didn't you? Fine. Hand me the damn contract.": "ANNOYED",
  "Fine. Go ahead, check it first.": "RESIGNED",
  "Talk... You got a job, or just wasting my time?": "ANNOYED",
  "Arghh... whatever you want. I'm done.": "ANGRY"
};

/**
 * Mendapatkan tone yang sesuai untuk dialog yang diberikan
 * Menggunakan mapping atau analisis otomatis jika tidak ditemukan di mapping
 * 
 * @param text Teks dialog
 * @returns Tone yang sesuai untuk dialog
 */
export function getToneForDialog(text: string): GeraltTone {
  // Clean text for matching (remove extra spaces, normalize)
  const cleanText = text.trim().replace(/\s+/g, ' ');
  
  // Check in predefined mapping first
  if (Object.prototype.hasOwnProperty.call(dialogToToneMap, cleanText)) {
    return dialogToToneMap[cleanText];
  }
  
  // If not found in mapping, analyze text
  return analyzeToneFromText(text);
}