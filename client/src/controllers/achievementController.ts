import { AchievementType } from '../components/Achievement';

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
    const savedData = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (savedData) {
      try {
        const achievements = JSON.parse(savedData) as AchievementType[];
        return new Set(achievements);
      } catch (e) {
        console.error('Error parsing achievements data:', e);
      }
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
  public unlockAchievement(type: AchievementType): void {
    // Jika achievement 'nightmare' dan tidak pada halaman dream.html, abaikan
    if (type === 'nightmare' && !this.isDreamPage) {
      return;
    }
    
    // Jika achievement belum di-unlock
    if (!this.unlockedAchievements.has(type)) {
      // Tambahkan ke daftar achievements yang unlocked
      this.unlockedAchievements.add(type);
      
      // Simpan ke localStorage
      this.saveAchievements();
      
      // Panggil callback untuk menampilkan notifikasi achievement
      if (this.achievementCallback) {
        this.achievementCallback(type);
      }
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