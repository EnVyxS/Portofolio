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

  // Reset achievements to clean state (for fixing the current 12+ achievement issue)
  public resetToCorrectState(): void {
    // Keep only the base 10 achievements that user currently has legitimately
    const correctBaseAchievements: AchievementType[] = [
      'approach', 'contract', 'document', 'social', 'anger', 'success', 
      'nightmare', 'escape', 'return', 'hover'
    ];
    
    this.unlockedAchievements.clear();
    this.notifiedAchievements.clear();
    
    correctBaseAchievements.forEach(achievement => {
      this.unlockedAchievements.add(achievement);
    });
    
    this.saveAchievements();
    this.saveNotifiedAchievements();
    console.log('Reset achievements to correct state: 10 base achievements');
  }

  // Sistem substitusi achievement berdasarkan kondisi
  public performAchievementSubstitution(triggerContext: string = ''): void {
    const kondisi1 = this.checkCondition1();
    const kondisi2 = this.checkCondition2();
    const achievementCount = this.getAchievementCount();

    console.log(`Achievement substitution check - Kondisi1: ${kondisi1}, Kondisi2: ${kondisi2}, Count: ${achievementCount}, Context: ${triggerContext}`);

    // Fix current state if user has more than 12 achievements
    if (achievementCount > 12) {
      console.log('Detected achievement count > 12, resetting to correct state');
      this.resetToCorrectState();
      return; // Exit and let user refresh
    }

    // Scenario 1: User has Patient Listener but missing Time Gazer (11 achievements)
    if (kondisi1 && kondisi2 && achievementCount === 11 && 
        this.hasAchievement('patientListener') && !this.hasAchievement('timeGazer') &&
        (triggerContext === 'achievement_gallery_access' || triggerContext === 'achievement_click')) {
      
      // Replace Patient Listener with Against Your Will
      if (!this.hasAchievement('againstWill')) {
        console.log('Replacing Patient Listener with Against Your Will');
        this.unlockedAchievements.delete('patientListener' as AchievementType);
        this.unlockedAchievements.add('againstWill' as AchievementType);
        this.saveAchievements();
        
        if (this.achievementCallback) {
          this.achievementCallback('againstWill' as AchievementType);
        }
      }
      
      // Add Till Death Do Us Part to complete 12 achievements
      if (!this.hasAchievement('tillDeath')) {
        console.log('Adding Till Death Do Us Part achievement');
        this.unlockedAchievements.add('tillDeath' as AchievementType);
        this.saveAchievements();
        
        if (this.achievementCallback) {
          this.achievementCallback('tillDeath' as AchievementType);
        }
      }
    }
    
    // Scenario 2: User has Time Gazer but missing Patient Listener (11 achievements)  
    else if (kondisi1 && kondisi2 && achievementCount === 11 && 
             this.hasAchievement('timeGazer') && !this.hasAchievement('patientListener') &&
             (triggerContext === 'achievement_gallery_access' || triggerContext === 'achievement_click')) {
      
      // Replace Time Gazer with Till Death Do Us Part
      if (!this.hasAchievement('tillDeath')) {
        console.log('Replacing Time Gazer with Till Death Do Us Part');
        this.unlockedAchievements.delete('timeGazer' as AchievementType);
        this.unlockedAchievements.add('tillDeath' as AchievementType);
        this.saveAchievements();
        
        if (this.achievementCallback) {
          this.achievementCallback('tillDeath' as AchievementType);
        }
      }
      
      // Add Against Your Will to complete 12 achievements
      if (!this.hasAchievement('againstWill')) {
        console.log('Adding Against Your Will achievement');
        this.unlockedAchievements.add('againstWill' as AchievementType);
        this.saveAchievements();
        
        if (this.achievementCallback) {
          this.achievementCallback('againstWill' as AchievementType);
        }
      }
    }
    
    // Scenario 3: User has both Patient Listener and Time Gazer (12 achievements)
    else if (kondisi1 && kondisi2 && achievementCount === 12 && 
             this.hasAchievement('patientListener') && this.hasAchievement('timeGazer') &&
             (triggerContext === 'achievement_gallery_access' || triggerContext === 'achievement_click')) {
      
      // Replace Patient Listener with Against Your Will
      if (!this.hasAchievement('againstWill')) {
        console.log('Replacing Patient Listener with Against Your Will');
        this.unlockedAchievements.delete('patientListener' as AchievementType);
        this.unlockedAchievements.add('againstWill' as AchievementType);
        this.saveAchievements();
        
        if (this.achievementCallback) {
          this.achievementCallback('againstWill' as AchievementType);
        }
      }
      
      // Replace Time Gazer with Till Death Do Us Part  
      if (!this.hasAchievement('tillDeath')) {
        console.log('Replacing Time Gazer with Till Death Do Us Part');
        this.unlockedAchievements.delete('timeGazer' as AchievementType);
        this.unlockedAchievements.add('tillDeath' as AchievementType);
        this.saveAchievements();
        
        if (this.achievementCallback) {
          this.achievementCallback('tillDeath' as AchievementType);
        }
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
        url: 'https://youtu.be/zUzd9KyIDrM?si=qZ1YMSl8z-MdwIq_', // System of a Down - B.Y.O.B.
        title: '✨ CLAIM YOUR ULTIMATE REWARD'
      };
    }
    // Jika hanya Against Your Will
    else if (hasAgainstWill && !hasTillDeath) {
      return {
        url: 'https://youtu.be/wc2s9skF_58?si=4K3M8BrMqnQJdXI8', // My Chemical Romance - Cancer
        title: '🎭 CLAIM YOUR DARK REWARD'
      };
    }
    // Jika hanya Till Death Do Us Part
    else if (hasTillDeath && !hasAgainstWill) {
      return {
        url: 'https://www.youtube.com/watch?v=KVjBCT2Lc94', // Avenged Sevenfold - A Little Piece of Heaven
        title: '💀 CLAIM YOUR ETERNAL REWARD'
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