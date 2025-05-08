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
    // Perbarui checking untuk lebih akurat di development dan production
    const pathname = window.location.pathname;
    const href = window.location.href;
    
    // Cek lebih menyeluruh - URL bisa berbagai format
    this.isDreamPage = pathname.includes('dream.html') || 
                        pathname.includes('dream') || 
                        pathname === '/dream' || 
                        href.includes('dream') || 
                        document.title.toLowerCase().includes('dream');
                        
    console.log('[AchievementController] Page detection: isDreamPage =', this.isDreamPage, 'pathname =', pathname, 'href =', href);
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
  
  // Dispatch custom event untuk achievement unlocked
  private dispatchAchievementEvent(type: AchievementType): void {
    try {
      const event = new CustomEvent('achievementUnlocked', {
        detail: { achievement: type }
      });
      window.dispatchEvent(event);
      console.log(`[AchievementController] Dispatched achievementUnlocked event for: ${type}`);
    } catch (e) {
      console.error('[AchievementController] Failed to dispatch achievement event:', e);
    }
  }

  // Unlock achievement baru
  public unlockAchievement(type: AchievementType): void {
    // Jika achievement 'nightmare', pastikan kita handle dengan benar
    if (type === 'nightmare') {
      if (!this.isDreamPage) {
        console.log('Nightmare achievement will only be shown on dream.html page');
        return;
      } else {
        console.log('Unlocking nightmare achievement on dream page');
      }
    }
    
    console.log(`Showing achievement: ${type}`);
    
    // Jika achievement belum di-unlock dalam sesi ini (untuk testing)
    if (!this.unlockedAchievements.has(type)) {
      // Tambahkan ke daftar achievements yang unlocked (hanya di memori)
      this.unlockedAchievements.add(type);
      
      // Simpan ke localStorage untuk penyimpanan permanen
      try {
        this.saveAchievements();
        console.log(`Achievement "${type}" saved to localStorage`);
      } catch (e) {
        console.error('Failed to save achievement to localStorage:', e);
      }
      
      // Dispatch event untuk accessible notification system
      this.dispatchAchievementEvent(type);
      
      // Panggil callback untuk menampilkan notifikasi achievement (legacy method)
      if (this.achievementCallback) {
        this.achievementCallback(type);
      }
    } else {
      console.log(`Achievement "${type}" already unlocked, not showing notification`);
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