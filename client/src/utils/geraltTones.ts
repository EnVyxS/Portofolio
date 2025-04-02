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
  // Sesuai permintaan, menggunakan pengaturan yang konsisten untuk semua tone
  // Stability 80%, Similarity 100%, Style 60%, Speaking Rate 0.95
  return {
    stability: 0.80,            // 80% stability sesuai permintaan
    similarity_boost: 1.0,      // 100% similarity sesuai permintaan 
    style: 0.60,                // Style moderate untuk karakter Geralt
    use_speaker_boost: true,
    speaking_rate: 0.95         // 0.95 speaking rate sesuai permintaan
  };
}

/**
 * Mendapatkan tone yang sesuai berdasarkan konten teks
 * Menganalisis teks untuk menentukan emosi yang paling sesuai dengan konteks
 * 
 * @param text Teks dialog untuk dianalisis
 * @returns Tone yang paling sesuai dengan konten teks
 */
export function analyzeToneFromText(text: string): GeraltTone {
  // Semua dialog menggunakan NEUTRAL tone sesuai permintaan, terlepas dari konten teksnya
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
  // Dialog dari model untuk mapping ke tone yang tepat - semua dijadikan NEUTRAL sesuai permintaan
  "...Didn't ask for company.": { tone: "NEUTRAL", persistent: false },
  "Tch... Fire's warm. Always brings strays.": { tone: "NEUTRAL", persistent: false },
  "Haahhhh... You need something or are you just here to waste my time?": { tone: "NEUTRAL", persistent: true }, // Pertanyaan
  "Curiosity?... Hmph... Doesn't pay the bills...": { tone: "NEUTRAL", persistent: false },
  "Pfftt... Waiting... Drinking... What else is there?": { tone: "NEUTRAL", persistent: false },
  "A job?.., A way out?.., Some miracle?..": { tone: "NEUTRAL", persistent: false },
  "Heh... Yeah, real fucking hilarious, isn't it?": { tone: "NEUTRAL", persistent: false },
  "...You got a name?": { tone: "NEUTRAL", persistent: true }, // Pertanyaan
  "Hm. Not that it matters,": { tone: "NEUTRAL", persistent: false },
  "Diva Juan Nur Taqarrub , , Call me what you want. Doesn't do shit,": { tone: "NEUTRAL", persistent: false },
  "Hmph... why am I even here?..": { tone: "NEUTRAL", persistent: false },
  "Anything that keeps me breathing,": { tone: "NEUTRAL", persistent: false },
  "Hunting work's like hunting a ghost. No signs, no tracks, just hope and a headache,": { tone: "NEUTRAL", persistent: false },
  "Graduated. Computer Science. 2024,": { tone: "NEUTRAL", persistent: false },
  "Yeah... Cum laude. Thought it'd mean something.. Turns out it's worth less than a stiff drink,": { tone: "NEUTRAL", persistent: false },
  "Backend. Java. Databases. Know my way around. Not that anyone cares,": { tone: "NEUTRAL", persistent: false },
  "Made a game for my thesis. Thought it'd mean something. It didn't,": { tone: "NEUTRAL", persistent: false },
  "Editing too. Years of it. Doesn't put food on the table,": { tone: "NEUTRAL", persistent: false },
  "Vegas Pro. After Effects. Cut, stitch, fix. Life's not that simple,": { tone: "NEUTRAL", persistent: false },
  "SQL... PostgreSQL... MySQL... Data's just numbers. Like debts. Like failures,": { tone: "NEUTRAL", persistent: false },
  "Used to like puzzles. Now? Just another thing that doesn't pay,": { tone: "NEUTRAL", persistent: false },
  "...Leaving this place?": { tone: "NEUTRAL", persistent: true }, // Pertanyaan
  "Huhhhh... Like that's so easy,": { tone: "NEUTRAL", persistent: false },
  "Go where? With what? Got coin to spare?,": { tone: "NEUTRAL", persistent: true }, // Pertanyaan
  "Nothing's free. Not even dreams,": { tone: "NEUTRAL", persistent: false },
  "But if the pay's right… maybe,": { tone: "NEUTRAL", persistent: true }, // Membuka diskusi
  "For now? I drink. Sit. Hope the fire lasts longer than the night,": { tone: "NEUTRAL", persistent: false },
  "Hmph... You fight... you bleed... you try...,": { tone: "NEUTRAL", persistent: false },
  "And in the end, still nothing,": { tone: "NEUTRAL", persistent: false },
  "...Enough about me": { tone: "NEUTRAL", persistent: false },
  "What do you want?..": { tone: "NEUTRAL", persistent: true }, // Pertanyaan
  "Talk... You got a job, or just wasting my time?..": { tone: "NEUTRAL", persistent: true }, // Pertanyaan akhir, perlu jawaban
  
  // Hover dialog - kebanyakan persistent karena menunggu interaksi
  "Hmph... In a rush, are we? Fine. Tell me what you need done.": { tone: "NEUTRAL", persistent: true }, // Menunggu pengguna memberikan info
  "Not listening, huh? Fine. Decide after you've checked.": { tone: "NEUTRAL", persistent: true }, // Menunggu pengguna mengecek
  "Straight to the point—I like that. Fine. Give me the contract.": { tone: "NEUTRAL", persistent: true }, // Menunggu kontrak
  "Need to check first before deciding? Fine. Not like I'm in a hurry.": { tone: "NEUTRAL", persistent: true }, // Menunggu pengguna mengecek
  "Took your time, didn't you? Fine. Hand me the damn contract.": { tone: "NEUTRAL", persistent: true }, // Menunggu kontrak
  "Fine. Go ahead, check it first.": { tone: "NEUTRAL", persistent: true }, // Menunggu pengguna mengecek
  "Talk... You got a job, or just wasting my time?": { tone: "NEUTRAL", persistent: true }, // Pertanyaan
  "Arghh... whatever you want. I'm done.": { tone: "NEUTRAL", persistent: false } // Jengkel dan selesai bicara
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