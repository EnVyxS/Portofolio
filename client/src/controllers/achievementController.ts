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
    
    // Cek apakah achievement sudah ada
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
    
    // Panggil callback untuk menampilkan notifikasi achievement hanya jika:
    // 1. Achievement baru unlock dan belum pernah ditampilkan notifikasinya, atau
    // 2. Force notification dinyalakan DAN achievement belum pernah dinotifikasi
    if (this.achievementCallback && (isNewAchievement || (forceNotification && !isAlreadyNotified))) {
      this.achievementCallback(type);
      // Tandai achievement sudah dinotifikasi
      this.markAsNotified(type);
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
  
  // Mengecek apakah semua achievement sudah terkumpul (dengan substitusi)
  public hasAllAchievements(): boolean {
    // Achievement count harus 12, tapi bisa kombinasi dari original + substituted
    if (this.unlockedAchievements.size < 12) return false;
    
    // Minimal harus punya base achievements yang tidak bisa disubstitusi
    const requiredBaseAchievements: AchievementType[] = [
      'approach', 'contract', 'success', 'document', 'anger', 'nightmare',
      'return', 'hover', 'escape', 'social'
    ];
    
    const hasAllRequired = requiredBaseAchievements.every(type => this.unlockedAchievements.has(type));
    
    // Dan harus punya kombinasi dari listener/againstWill dan patience/tillDeath
    const hasListenerVariant = this.hasAchievement('listener') || this.hasAchievement('againstWill');
    const hasPatienceVariant = this.hasAchievement('patience') || this.hasAchievement('tillDeath');
    
    return hasAllRequired && hasListenerVariant && hasPatienceVariant;
  }

  // Mengecek kondisi flags untuk sistem substitusi achievement
  private checkCondition1(): boolean {
    // hasDigitalOdyssey AND hasEscapist
    return this.hasAchievement('nightmare') && this.hasAchievement('escape');
  }

  private checkCondition2(): boolean {
    // (hasBeenThrown OR hasBeenPunched) AND userHasBeenReturn
    return this.hasAchievement('anger') && this.hasAchievement('return');
  }

  // Menghitung jumlah achievement yang dimiliki user
  public getAchievementCount(): number {
    return this.unlockedAchievements.size;
  }

  // Mengecek apakah user memiliki semua achievement dalam array
  public hasAllSpecificAchievements(achievementTypes: AchievementType[]): boolean {
    return achievementTypes.every(type => this.hasAchievement(type));
  }

  // Mengecek apakah user memiliki salah satu achievement dalam array
  public hasAnyAchievement(achievementTypes: AchievementType[]): boolean {
    return achievementTypes.some(type => this.hasAchievement(type));
  }

  // Sistem substitusi achievement berdasarkan kondisi
  public performAchievementSubstitution(triggerContext: string = ''): void {
    const kondisi1 = this.checkCondition1();
    const kondisi2 = this.checkCondition2();
    const achievementCount = this.getAchievementCount();

    console.log(`Achievement substitution check - Kondisi1: ${kondisi1}, Kondisi2: ${kondisi2}, Count: ${achievementCount}, Context: ${triggerContext}`);

    // Skenario 1: 11 achievements, only missing Time Gazer, auto substitute with Till Death Do Us Part
    if (kondisi1 && kondisi2 && achievementCount === 11 && 
        !this.hasAchievement('patience') && !this.hasAchievement('tillDeath') &&
        (triggerContext === 'achievement_gallery_access' || triggerContext === 'achievement_click')) {
      
      console.log('Substituting Time Gazer with Till Death Do Us Part');
      // Remove Time Gazer and add Till Death Do Us Part
      this.unlockedAchievements.delete('patience');
      this.unlockedAchievements.add('tillDeath' as AchievementType);
      this.saveAchievements();
      
      // Trigger callback untuk refresh UI jika ada
      if (this.achievementCallback) {
        this.achievementCallback('tillDeath' as AchievementType);
      }
    }
    
    // Skenario 2: 10 achievements, missing Patient Listener, Time Gazer, Till Death Do Us Part
    else if (kondisi1 && kondisi2 && achievementCount === 10 && 
             !this.hasAnyAchievement(['listener', 'patience']) &&
             (triggerContext === 'achievement_gallery_access' || triggerContext === 'achievement_click')) {
      
      console.log('Force unlocking Against Your Will, replacing Patient Listener');
      // Replace Patient Listener with Against Your Will
      this.unlockedAchievements.delete('listener');
      this.unlockedAchievements.add('againstWill' as AchievementType);
      this.saveAchievements();
      
      // Trigger callback untuk refresh UI jika ada
      if (this.achievementCallback) {
        this.achievementCallback('againstWill' as AchievementType);
      }
    }
  }

  // Menentukan reward track berdasarkan achievement yang dimiliki
  public getEasterEggReward(): { url: string; title: string } {
    const hasTillDeath = this.hasAchievement('tillDeath' as AchievementType);
    const hasAgainstWill = this.hasAchievement('againstWill' as AchievementType);

    // Jika kedua achievement baru dimiliki
    if (hasTillDeath && hasAgainstWill) {
      return {
        url: 'https://www.youtube.com/watch?v=L397TWLwrUU', // System of a Down - B.Y.O.B.
        title: '🎵 SYSTEM OF A DOWN - B.Y.O.B.'
      };
    }
    // Jika hanya Against Your Will
    else if (hasAgainstWill && !hasTillDeath) {
      return {
        url: 'https://www.youtube.com/watch?v=sX_Jj3PlFaQ', // My Chemical Romance - Cancer
        title: '🎵 MY CHEMICAL ROMANCE - CANCER'
      };
    }
    // Jika hanya Till Death Do Us Part
    else if (hasTillDeath && !hasAgainstWill) {
      return {
        url: 'https://www.youtube.com/watch?v=KVjBCT2Lc94', // Avenged Sevenfold - A Little Piece of Heaven
        title: '🎵 AVENGED SEVENFOLD - A LITTLE PIECE OF HEAVEN'
      };
    }
    // Default Rick Roll
    else {
      return {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll
        title: '🎁 CLAIM YOUR REWARD'
      };
    }
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