// Definisi tipe untuk emosi karakter
export type EmotionType = 
  | 'neutral'     // Ekspresi normal
  | 'angry'       // Marah
  | 'annoyed'     // Kesal/jengkel
  | 'curious'     // Penasaran
  | 'suspicious'  // Curiga
  | 'smirk'       // Senyum sinis
  | 'threatening' // Mengancam
  | 'frustrated'  // Frustrasi
  | 'satisfied'   // Puas
  | 'dismissive'  // Acuh tak acuh
  | 'sarcastic';  // Sarkastik

// Informasi tentang setiap emosi
export interface EmotionInfo {
  id: EmotionType;
  label: string;
  description: string;
  // Parameter suara untuk ElevenLabs (opsional)
  voiceParams?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speaking_rate?: number;
  };
  // Parameter visual untuk tampilan karakter (akan diimplementasikan nanti)
  visualParams?: {
    filter?: string;        // Filter CSS untuk gambar karakter
    animation?: string;     // Nama animasi CSS
    transform?: string;     // Transformasi CSS
    transition?: string;    // Transisi CSS
  };
}

// Data emosi default
export const EMOTIONS: Record<EmotionType, EmotionInfo> = {
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    description: 'Ekspresi normal tanpa emosi khusus',
    voiceParams: {
      stability: 0.9,
      similarity_boost: 1,
      style: 0.25,
      speaking_rate: 0.95
    },
    visualParams: {
      filter: 'none',
      animation: 'none',
      transform: 'none',
      transition: 'all 0.3s ease'
    }
  },
  angry: {
    id: 'angry',
    label: 'Angry',
    description: 'Marah dengan intensitas tinggi',
    voiceParams: {
      stability: 0.7,
      similarity_boost: 1,
      style: 0.4,
      speaking_rate: 1.1
    },
    visualParams: {
      filter: 'saturate(1.3) contrast(1.2)',
      animation: 'shake 0.5s infinite',
      transform: 'scale(1.05)',
      transition: 'all 0.2s ease'
    }
  },
  annoyed: {
    id: 'annoyed',
    label: 'Annoyed',
    description: 'Kesal atau jengkel',
    voiceParams: {
      stability: 0.8,
      similarity_boost: 1,
      style: 0.3,
      speaking_rate: 1.05
    },
    visualParams: {
      filter: 'saturate(1.1) contrast(1.1)',
      animation: 'subtle-shake 2s infinite',
      transform: 'none',
      transition: 'all 0.3s ease'
    }
  },
  curious: {
    id: 'curious',
    label: 'Curious',
    description: 'Penasaran atau tertarik',
    voiceParams: {
      stability: 0.9,
      similarity_boost: 1,
      style: 0.2,
      speaking_rate: 0.9
    },
    visualParams: {
      filter: 'brightness(1.05)',
      animation: 'subtle-tilt 3s infinite',
      transform: 'scale(1.02)',
      transition: 'all 0.4s ease'
    }
  },
  suspicious: {
    id: 'suspicious',
    label: 'Suspicious',
    description: 'Curiga atau waspada',
    voiceParams: {
      stability: 0.85,
      similarity_boost: 1,
      style: 0.3,
      speaking_rate: 0.9
    },
    visualParams: {
      filter: 'contrast(1.1) brightness(0.95)',
      animation: 'squint 4s infinite',
      transform: 'scale(0.98)',
      transition: 'all 0.3s ease'
    }
  },
  smirk: {
    id: 'smirk',
    label: 'Smirk',
    description: 'Senyum sinis atau mengejek',
    voiceParams: {
      stability: 0.85,
      similarity_boost: 1,
      style: 0.35,
      speaking_rate: 0.9
    },
    visualParams: {
      filter: 'brightness(1.05) saturate(1.1)',
      animation: 'subtle-bounce 3s infinite',
      transform: 'none',
      transition: 'all 0.3s ease'
    }
  },
  threatening: {
    id: 'threatening',
    label: 'Threatening',
    description: 'Mengancam atau intimidasi',
    voiceParams: {
      stability: 0.7,
      similarity_boost: 1,
      style: 0.4,
      speaking_rate: 0.85
    },
    visualParams: {
      filter: 'contrast(1.2) brightness(0.9)',
      animation: 'slow-pulse 3s infinite',
      transform: 'scale(1.05)',
      transition: 'all 0.3s ease'
    }
  },
  frustrated: {
    id: 'frustrated',
    label: 'Frustrated',
    description: 'Frustrasi atau kewalahan',
    voiceParams: {
      stability: 0.75,
      similarity_boost: 1,
      style: 0.35,
      speaking_rate: 1
    },
    visualParams: {
      filter: 'saturate(1.1) contrast(1.1)',
      animation: 'head-shake 2s infinite',
      transform: 'none',
      transition: 'all 0.3s ease'
    }
  },
  satisfied: {
    id: 'satisfied',
    label: 'Satisfied',
    description: 'Puas atau senang',
    voiceParams: {
      stability: 0.9,
      similarity_boost: 1,
      style: 0.2,
      speaking_rate: 0.9
    },
    visualParams: {
      filter: 'brightness(1.1) saturate(1.1)',
      animation: 'subtle-bounce 4s infinite',
      transform: 'none',
      transition: 'all 0.4s ease'
    }
  },
  dismissive: {
    id: 'dismissive',
    label: 'Dismissive',
    description: 'Acuh tak acuh atau meremehkan',
    voiceParams: {
      stability: 0.9,
      similarity_boost: 1,
      style: 0.25,
      speaking_rate: 0.9
    },
    visualParams: {
      filter: 'brightness(0.95)',
      animation: 'wave-off 3s infinite',
      transform: 'rotate(-2deg)',
      transition: 'all 0.3s ease'
    }
  },
  sarcastic: {
    id: 'sarcastic',
    label: 'Sarcastic',
    description: 'Sarkastik atau mengejek',
    voiceParams: {
      stability: 0.85,
      similarity_boost: 1,
      style: 0.35,
      speaking_rate: 0.95
    },
    visualParams: {
      filter: 'brightness(1.05) contrast(1.05)',
      animation: 'eye-roll 4s infinite',
      transform: 'none',
      transition: 'all 0.3s ease'
    }
  }
};

// Helper untuk mendapatkan informasi emosi berdasarkan ID
export function getEmotionById(emotionId: EmotionType): EmotionInfo {
  return EMOTIONS[emotionId] || EMOTIONS.neutral;
}

// Helper untuk mendapatkan semua emosi sebagai array
export function getAllEmotions(): EmotionInfo[] {
  return Object.values(EMOTIONS);
}