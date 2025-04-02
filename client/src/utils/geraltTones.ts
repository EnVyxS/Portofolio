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
  CONTEMPLATIVE: "contemplative", // Termenung, banyak jeda
  NEUTRAL: "neutral"     // Nada bicara normal Geralt yang khas (deep, gruff, monotone)
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
  // Default voice settings untuk Geralt of Rivia
  // Menggunakan nilai yang diminta: Stability 80%, Similarity 100%, Speaking Rate 0.95
  const defaultSettings = {
    stability: 0.80,            // 80% stability sesuai permintaan
    similarity_boost: 1.0,      // 100% similarity sesuai permintaan 
    style: 0.60,                // Style moderate untuk karakter Geralt
    use_speaker_boost: true,
    speaking_rate: 0.95         // 0.95 speaking rate sesuai permintaan
  };
  
  // Sesuaikan pengaturan berdasarkan tone dengan tetap menjaga karakteristik suara Geralt
  // Variasi minimal untuk menjaga konsistensi suara Geralt yang khas
  switch (tone) {
    case "ANGRY":
      return {
        ...defaultSettings,
        style: 0.65,            // Sedikit lebih ekspresif untuk menunjukkan emosi marah Geralt
        speaking_rate: 0.98     // Sedikit lebih cepat ketika marah
      };
      
    case "TIRED":
      return {
        ...defaultSettings,
        style: 0.45,            // Kurang ekspresif ketika lelah
        speaking_rate: 0.85     // Lebih lambat ketika lelah
      };
      
    case "DRUNK":
      return {
        ...defaultSettings,
        stability: 0.75,        // Sedikit kurang stabil untuk efek mabuk
        style: 0.65,            // Ekspresivitas normal
        speaking_rate: 0.90     // Sedikit lebih lambat seperti orang mabuk
      };
      
    case "NUMB":
      return {
        ...defaultSettings,
        style: 0.40,            // Sangat kurang ekspresif untuk karakter Geralt yang mati rasa
        speaking_rate: 0.92     // Sedikit lebih lambat
      };
      
    case "SARCASTIC":
      return {
        ...defaultSettings,
        style: 0.75,            // Lebih ekspresif untuk menunjukkan sarkasme
        speaking_rate: 0.95     // Normal rate
      };
      
    case "RESIGNED":
      return {
        ...defaultSettings,
        style: 0.50,            // Kurang ekspresif untuk nada pasrah
        speaking_rate: 0.90     // Sedikit lebih lambat untuk kesan pasrah
      };
      
    case "HOLLOW":
      return {
        ...defaultSettings,
        style: 0.40,            // Sangat kurang ekspresif untuk nada hampa
        speaking_rate: 0.88     // Lebih lambat untuk kesan hampa
      };
      
    case "ANNOYED":
      return {
        ...defaultSettings,
        style: 0.70,            // Lebih ekspresif untuk menunjukkan kejengkelan
        speaking_rate: 0.97     // Sedikit lebih cepat karena tidak sabar
      };
      
    case "CONTEMPLATIVE":
      return {
        ...defaultSettings,
        style: 0.55,            // Kurang ekspresif ketika berpikir
        speaking_rate: 0.90     // Lebih lambat ketika sedang merenung
      };
      
    case "BITTER":
      return {
        ...defaultSettings,
        style: 0.65,            // Ekspresivitas normal dengan emosi pedih
        speaking_rate: 0.92     // Sedikit lebih lambat untuk kesan pahit
      };
      
    case "NEUTRAL":
      return {
        ...defaultSettings,
        style: 0.60,            // Style moderate sesuai karakter Geralt of Rivia
        speaking_rate: 0.95     // 0.95 speaking rate sesuai permintaan
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
  
  // Default to NEUTRAL as Geralt of Rivia's baseline tone
  return "NEUTRAL";
}

// Mapping dialog ke tone yang sesuai dengan karakter Geralt
// Interface untuk dialog info yang mencakup tone dan persistence
interface DialogInfo {
  tone: GeraltTone;
  // Apakah dialog box harus tetap terlihat setelah dialog selesai
  // True = tetap terlihat (dialog membutuhkan respons)
  // False = hilang setelah dialog (dialog hanya statement)
  persistent: boolean;
}

// Mapping dialog ke tone dan persistence
export const dialogToToneMap: Record<string, DialogInfo> = {
  // Dialog dari model untuk mapping ke tone yang tepat
  "...Didn't ask for company.": { tone: "ANNOYED", persistent: false },
  "Tch... Fire's warm. Always brings strays.": { tone: "BITTER", persistent: false },
  "Haahhhh... You need something or are you just here to waste my time?": { tone: "ANNOYED", persistent: true }, // Pertanyaan
  "Curiosity?... Hmph... Doesn't pay the bills...": { tone: "SARCASTIC", persistent: false },
  "Pfftt... Waiting... Drinking... What else is there?": { tone: "RESIGNED", persistent: false },
  "A job?.., A way out?.., Some miracle?..": { tone: "HOLLOW", persistent: false },
  "Heh... Yeah, real fucking hilarious, isn't it?": { tone: "SARCASTIC", persistent: false },
  "...You got a name?": { tone: "CONTEMPLATIVE", persistent: true }, // Pertanyaan
  "Hm. Not that it matters,": { tone: "NUMB", persistent: false },
  "Diva Juan Nur Taqarrub , , Call me what you want. Doesn't do shit,": { tone: "BITTER", persistent: false },
  "Hmph... why am I even here?..": { tone: "CONTEMPLATIVE", persistent: false },
  "Anything that keeps me breathing,": { tone: "NUMB", persistent: false },
  "Hunting work's like hunting a ghost. No signs, no tracks, just hope and a headache,": { tone: "RESIGNED", persistent: false },
  "Graduated. Computer Science. 2024,": { tone: "HOLLOW", persistent: false },
  "Yeah... Cum laude. Thought it'd mean something.. Turns out it's worth less than a stiff drink,": { tone: "BITTER", persistent: false },
  "Backend. Java. Databases. Know my way around. Not that anyone cares,": { tone: "RESIGNED", persistent: false },
  "Made a game for my thesis. Thought it'd mean something. It didn't,": { tone: "BITTER", persistent: false },
  "Editing too. Years of it. Doesn't put food on the table,": { tone: "TIRED", persistent: false },
  "Vegas Pro. After Effects. Cut, stitch, fix. Life's not that simple,": { tone: "HOLLOW", persistent: false },
  "SQL... PostgreSQL... MySQL... Data's just numbers. Like debts. Like failures,": { tone: "NUMB", persistent: false },
  "Used to like puzzles. Now? Just another thing that doesn't pay,": { tone: "RESIGNED", persistent: false },
  "...Leaving this place?": { tone: "SARCASTIC", persistent: true }, // Pertanyaan
  "Huhhhh... Like that's so easy,": { tone: "BITTER", persistent: false },
  "Go where? With what? Got coin to spare?,": { tone: "ANGRY", persistent: true }, // Pertanyaan
  "Nothing's free. Not even dreams,": { tone: "HOLLOW", persistent: false },
  "But if the pay's right… maybe,": { tone: "CONTEMPLATIVE", persistent: true }, // Membuka diskusi
  "For now? I drink. Sit. Hope the fire lasts longer than the night,": { tone: "RESIGNED", persistent: false },
  "Hmph... You fight... you bleed... you try...,": { tone: "TIRED", persistent: false },
  "And in the end, still nothing,": { tone: "HOLLOW", persistent: false },
  "...Enough about me": { tone: "ANNOYED", persistent: false },
  "What do you want?..": { tone: "ANNOYED", persistent: true }, // Pertanyaan
  "Talk... You got a job, or just wasting my time?..": { tone: "ANNOYED", persistent: true }, // Pertanyaan akhir, perlu jawaban
  
  // Hover dialog - kebanyakan persistent karena menunggu interaksi
  "Hmph... In a rush, are we? Fine. Tell me what you need done.": { tone: "ANNOYED", persistent: true }, // Menunggu pengguna memberikan info
  "Not listening, huh? Fine. Decide after you've checked.": { tone: "ANNOYED", persistent: true }, // Menunggu pengguna mengecek
  "Straight to the point—I like that. Fine. Give me the contract.": { tone: "RESIGNED", persistent: true }, // Menunggu kontrak
  "Need to check first before deciding? Fine. Not like I'm in a hurry.": { tone: "RESIGNED", persistent: true }, // Menunggu pengguna mengecek
  "Took your time, didn't you? Fine. Hand me the damn contract.": { tone: "ANNOYED", persistent: true }, // Menunggu kontrak
  "Fine. Go ahead, check it first.": { tone: "RESIGNED", persistent: true }, // Menunggu pengguna mengecek
  "Talk... You got a job, or just wasting my time?": { tone: "ANNOYED", persistent: true }, // Pertanyaan
  "Arghh... whatever you want. I'm done.": { tone: "ANGRY", persistent: false } // Jengkel dan selesai bicara
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
    return dialogToToneMap[cleanText].tone;
  }
  
  // If not found in mapping, analyze text
  return analyzeToneFromText(text);
}

/**
 * Mendapatkan informasi apakah dialog box harus tetap terlihat setelah dialog selesai
 * Dialog yang memerlukan respons (seperti pertanyaan) akan tetap terlihat
 * Dialog yang hanya pernyataan akan hilang setelah selesai
 * 
 * @param text Teks dialog
 * @returns True jika dialog box harus tetap terlihat, false jika boleh hilang
 */
export function isDialogPersistent(text: string): boolean {
  // Clean text for matching (remove extra spaces, normalize)
  const cleanText = text.trim().replace(/\s+/g, ' ');
  
  // Check in predefined mapping first
  if (Object.prototype.hasOwnProperty.call(dialogToToneMap, cleanText)) {
    return dialogToToneMap[cleanText].persistent;
  }
  
  // Jika tidak ditemukan di mapping, analisis teks secara otomatis
  // Dialog dengan tanda tanya dianggap memerlukan respons
  if (cleanText.includes('?')) {
    return true;
  }
  
  // Dialog dengan kata kunci ajakan/perintah dianggap memerlukan respons
  const responseKeywords = [
    'tell me', 'go ahead', 'check', 'show me', 'give me', 
    'fine.', 'decide', 'looking for', 'what about', 'waiting'
  ];
  
  for (const keyword of responseKeywords) {
    if (cleanText.toLowerCase().includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  // Default: tidak persistent (akan hilang)
  return false;
}