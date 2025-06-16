import { AchievementType } from '../constants/achievementConstants';

// Key untuk local storage
const ACHIEVEMENTS_KEY = 'diva-juan-achievements';
// Key untuk achievement yang sudah ditampilkan notifikasinya
const NOTIFIED_ACHIEVEMENTS_KEY = 'diva-juan-notified-achievements';

class AchievementController {
  private static instance: AchievementController;
  private unlockedAchievements: Set<AchievementType>;
  private notifiedAchievements: Set<AchievementType>; // Menyimpan achievement yang sudah ditampilkan notifikasinya
  private achievementCallback: ((type: AchievementType) => void) | null = null;
  private isDreamPage: boolean = false; // Flag untuk halaman dream.html
  
  private constructor() {
    // Load achievements dari localStorage
    this.unlockedAchievements = this.loadAchievements();
    this.notifiedAchievements = this.loadNotifiedAchievements();
    
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
          
          // Bug fix: Jika user sudah memiliki achievement yang memerlukan final warning
          // tapi belum memiliki "patience", tambahkan secara otomatis
          const achievementSet = new Set(achievements);
          if ((achievementSet.has('escape') || achievementSet.has('nightmare')) && !achievementSet.has('patience')) {
            console.log('User reached final stages but missing patience achievement - adding it automatically');
            achievementSet.add('patience');
            // Save the updated achievements back to localStorage
            localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(Array.from(achievementSet)));
          }
          
          return achievementSet;
        } catch (e) {
          console.error('Error parsing achievements data:', e);
        }
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
    return new Set<AchievementType>();
  }
  
  // Load daftar achievement yang sudah ditampilkan notifikasinya
  private loadNotifiedAchievements(): Set<AchievementType> {
    try {
      const savedData = localStorage.getItem(NOTIFIED_ACHIEVEMENTS_KEY);
      if (savedData) {
        try {
          const achievements = JSON.parse(savedData) as AchievementType[];
          return new Set(achievements);
        } catch (e) {
          console.error('Error parsing notified achievements data:', e);
        }
      }
    } catch (e) {
      console.error('Error accessing localStorage for notified achievements:', e);
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
  
  // Simpan daftar achievement yang sudah ditampilkan notifikasinya
  private saveNotifiedAchievements(): void {
    localStorage.setItem(
      NOTIFIED_ACHIEVEMENTS_KEY,
      JSON.stringify(Array.from(this.notifiedAchievements))
    );
  }
  
  // Menandai achievement sudah dinotifikasi
  private markAsNotified(type: AchievementType): void {
    if (!this.notifiedAchievements.has(type)) {
      this.notifiedAchievements.add(type);
      this.saveNotifiedAchievements();
    }
  }
  
  // Unlock achievement baru
  public unlockAchievement(type: AchievementType, forceNotification: boolean = false): void {
    // Cek apakah nightmare achievement masih ada di localStorage dari dream.html
    if (type === 'nightmare' && !this.isDreamPage) {
      try {
        const savedData = localStorage.getItem(ACHIEVEMENTS_KEY);
        if (savedData) {
          const achievements = JSON.parse(savedData) as AchievementType[];
          if (achievements.includes('nightmare')) {
            // Jika ada di localStorage, tambahkan ke daftar unlockedAchievements
            this.unlockedAchievements.add('nightmare');
            console.log('Nightmare achievement found in localStorage and added to unlocked achievements');
          }
        }
      } catch (e) {
        console.error('Error checking for nightmare achievement:', e);
      }
    }
    
    console.log(`Showing achievement: ${type}, forceNotification: ${forceNotification}`);
    
    // Cek apakah achievement sudah ada, baru memunculkan notifikasi jika belum ada atau forceNotification=true
    const isNewAchievement = !this.unlockedAchievements.has(type);
    // Cek apakah achievement sudah pernah ditampilkan notifikasinya
    const isAlreadyNotified = this.notifiedAchievements.has(type);
    
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
    // 1. Achievement baru unlock dan belum pernah ditampilkan notifikasinya, atau
    // 2. Force notification dinyalakan (untuk kasus khusus, seperti ESCAPE achievement)
    if (((isNewAchievement && !isAlreadyNotified) || forceNotification) && this.achievementCallback) {
      this.achievementCallback(type);
      // Tandai achievement sudah dinotifikasi (kecuali force notification)
      if (!forceNotification) {
        this.markAsNotified(type);
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
  
  // Mengecek apakah semua achievement sudah terkumpul
  public hasAllAchievements(): boolean {
    const allAchievementTypes: AchievementType[] = [
      'approach', 'contract', 'success', 'document', 'anger', 'nightmare',
      'listener', 'patience', 'return', 'hover', 'escape', 'social'
    ];
    
    return allAchievementTypes.every(type => this.unlockedAchievements.has(type));
  }

  // Reset semua achievements (untuk testing)
  public resetAchievements(): void {
    this.unlockedAchievements.clear();
    this.notifiedAchievements.clear();
    this.saveAchievements();
    this.saveNotifiedAchievements();
  }
}

export default AchievementController;