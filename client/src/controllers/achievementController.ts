import { AchievementType } from '../constants/achievementConstants';

// Key untuk local storage
const ACHIEVEMENTS_KEY = 'diva-juan-achievements';

class AchievementController {
  private static instance: AchievementController;
  private unlockedAchievements: Set<AchievementType>;
  private achievementCallback: ((type: AchievementType) => void) | null = null;
  private isDreamPage: boolean = false; // Flag untuk halaman dream.html
  
  private constructor() {
    // Load achievements dari localStorage
    this.unlockedAchievements = this.loadAchievements();
    
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
  
  // Simpan achievements ke localStorage
  private saveAchievements(): void {
    localStorage.setItem(
      ACHIEVEMENTS_KEY, 
      JSON.stringify(Array.from(this.unlockedAchievements))
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
      
      // Simpan ke localStorage untuk penyimpanan permanen
      try {
        this.saveAchievements();
        console.log(`Achievement "${type}" saved to localStorage`);
      } catch (e) {
        console.error('Failed to save achievement to localStorage:', e);
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
  
  // Reset semua achievements (untuk testing)
  public resetAchievements(): void {
    this.unlockedAchievements.clear();
    this.saveAchievements();
  }
}

export default AchievementController;