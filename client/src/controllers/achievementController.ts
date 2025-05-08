import { AchievementType } from '../constants/achievementConstants';

// Key untuk local storage
const ACHIEVEMENTS_KEY = 'diva-juan-achievements';
const ACHIEVEMENT_TIMESTAMPS_KEY = 'diva-juan-achievement-timestamps';

// Interface untuk menyimpan data timestamp achievement
interface AchievementTimestamp {
  achievement: AchievementType;
  timestamp: number;
}

class AchievementController {
  private static instance: AchievementController;
  private unlockedAchievements: Set<AchievementType>;
  private achievementTimestamps: AchievementTimestamp[] = [];
  private achievementCallback: ((type: AchievementType) => void) | null = null;
  private isDreamPage: boolean = false; // Flag untuk halaman dream.html
  
  private constructor() {
    // Load achievements dari localStorage
    this.unlockedAchievements = this.loadAchievements();
    
    // Load achievement timestamps
    this.achievementTimestamps = this.loadAchievementTimestamps();
    
    // Cek apakah kita berada di halaman dream.html
    this.isDreamPage = window.location.pathname.includes('dream.html');
  }
  
  // Singleton pattern
  public static getInstance(): AchievementController {
    if (!AchievementController.instance) {
      AchievementController.instance = new AchievementController();
    }
    return AchievementController.instance;
  }
  
  // Mengatur callback untuk menampilkan achievement
  public setAchievementCallback(callback: (type: AchievementType) => void): void {
    this.achievementCallback = callback;
  }
  
  // Load achievements dari localStorage
  private loadAchievements(): Set<AchievementType> {
    try {
      const savedData = localStorage.getItem(ACHIEVEMENTS_KEY);
      if (savedData) {
        try {
          const achievements = JSON.parse(savedData) as AchievementType[];
          console.log('Loaded achievements from localStorage:', achievements);
          return new Set(achievements);
        } catch (e) {
          console.error('Error parsing achievements data:', e);
        }
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
    return new Set<AchievementType>();
  }
  
  // Load achievement timestamps dari localStorage
  private loadAchievementTimestamps(): AchievementTimestamp[] {
    try {
      const savedData = localStorage.getItem(ACHIEVEMENT_TIMESTAMPS_KEY);
      if (savedData) {
        try {
          const timestamps = JSON.parse(savedData) as AchievementTimestamp[];
          console.log('Loaded achievement timestamps from localStorage:', timestamps);
          return timestamps;
        } catch (e) {
          console.error('Error parsing achievement timestamps data:', e);
        }
      }
    } catch (e) {
      console.error('Error accessing localStorage for timestamps:', e);
    }
    return [];
  }
  
  // Simpan achievements ke localStorage
  private saveAchievements(): void {
    localStorage.setItem(
      ACHIEVEMENTS_KEY, 
      JSON.stringify(Array.from(this.unlockedAchievements))
    );
  }
  
  // Simpan achievement timestamps ke localStorage
  private saveAchievementTimestamps(): void {
    localStorage.setItem(
      ACHIEVEMENT_TIMESTAMPS_KEY,
      JSON.stringify(this.achievementTimestamps)
    );
  }
  
  // Unlock achievement baru
  public unlockAchievement(type: AchievementType, forceNotification: boolean = false): void {
    // Jika achievement 'nightmare' dan tidak pada halaman dream.html, abaikan
    if (type === 'nightmare' && !this.isDreamPage) {
      console.log('Nightmare achievement will only be shown on dream.html page');
      return;
    }
    
    console.log(`Showing achievement: ${type}, forceNotification: ${forceNotification}`);
    
    // Cek apakah achievement sudah ada, baru memunculkan notifikasi jika belum ada atau forceNotification=true
    const isNewAchievement = !this.unlockedAchievements.has(type);
    
    // Tambahkan achievement ke daftar (jika belum ada)
    if (isNewAchievement) {
      // Tambahkan ke daftar achievements yang unlocked
      this.unlockedAchievements.add(type);
      
      // Catat timestamp untuk achievement baru
      const timestamp = Date.now();
      this.achievementTimestamps.push({
        achievement: type,
        timestamp
      });
      
      // Simpan ke localStorage untuk penyimpanan permanen
      try {
        this.saveAchievements();
        this.saveAchievementTimestamps();
        console.log(`Achievement "${type}" saved with timestamp ${new Date(timestamp).toLocaleString()}`);
      } catch (e) {
        console.error('Failed to save achievement data to localStorage:', e);
      }
    }
    
    // Panggil callback untuk menampilkan notifikasi achievement jika:
    // 1. Achievement baru unlock, atau
    // 2. Force notification dinyalakan
    if ((isNewAchievement || forceNotification) && this.achievementCallback) {
      this.achievementCallback(type);
    }
  }
  
  // Mengecek apakah achievement tertentu sudah di-unlock
  public hasAchievement(type: AchievementType): boolean {
    return this.unlockedAchievements.has(type);
  }
  
  // Mendapatkan semua achievements yang sudah di-unlock
  public getUnlockedAchievements(): AchievementType[] {
    return Array.from(this.unlockedAchievements);
  }
  
  // Mendapatkan data timestamps untuk achievement
  public getAchievementTimestamps(): AchievementTimestamp[] {
    return [...this.achievementTimestamps];
  }
  
  // Reset semua achievements (untuk testing)
  public resetAchievements(): void {
    this.unlockedAchievements.clear();
    this.achievementTimestamps = [];
    this.saveAchievements();
    this.saveAchievementTimestamps();
  }
  
  // Reset semua achievements (untuk user)
  public resetAllAchievements(): void {
    this.unlockedAchievements.clear();
    this.achievementTimestamps = [];
    
    // Hapus data dari localStorage
    try {
      localStorage.removeItem(ACHIEVEMENTS_KEY);
      localStorage.removeItem(ACHIEVEMENT_TIMESTAMPS_KEY);
      console.log('All achievements have been reset');
    } catch (e) {
      console.error('Error removing achievement data from localStorage:', e);
      // Fallback jika removeItem gagal
      this.saveAchievements();
      this.saveAchievementTimestamps();
    }
  }
}

export default AchievementController;