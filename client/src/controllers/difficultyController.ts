/**
 * DifficultyController
 * 
 * Mengatur tingkat kesulitan interaksi dialog berdasarkan perilaku pengguna
 * Sistem adaptif yang menyesuaikan waktu dialog, opsi interaksi, dan respons Geralt
 * berdasarkan seberapa banyak pengguna berinteraksi dengan sistem
 */

import { HoverLinkType } from './hoverDialogController';
import DialogController from './dialogController';
import ElevenLabsService from '../services/elevenlabsService';

export enum DifficultyLevel {
  EASY = 'easy',       // Untuk pengguna baru/newbie - lebih banyak waktu, dialog lebih jelas
  NORMAL = 'normal',   // Default setting - balance antara bantuan dan tantangan
  HARD = 'hard',       // Untuk pengguna yang sudah terbiasa - waktu dialog singkat, lebih challenging
  SOULS = 'souls'      // Full dark souls experience - sangat sulit, hampir tidak ada bantuan UI
}

export interface DifficultySettings {
  autoplayDelay: number;        // Base delay untuk autoplay dialog (ms)
  charDelayFactor: number;      // Faktor penambahan delay per karakter
  maxAutoplayDelay: number;     // Maksimal delay untuk autoplay (ms)
  typewriterSpeed: number;      // Kecepatan typewriter effect (ms per karakter)
  hoverDialogDelay: number;     // Delay untuk auto-dismiss hover dialog (ms)
  hintVisibility: boolean;      // Whether to show interaction hints
  persistentDialogChance: number; // Probabilitas dialog menjadi persistent (0-1)
  idleWarningDelay: number;     // Delay untuk menampilkan idle warnings (ms)
}

class DifficultyController {
  private static instance: DifficultyController;
  private dialogController: DialogController;
  private elevenlabsService: ElevenLabsService;
  
  private currentLevel: DifficultyLevel = DifficultyLevel.NORMAL;
  private adaptiveScore: number = 0; // Skor adaptif: bertambah dengan interaksi pengguna, mengurangi saat idle
  
  private interactionData = {
    dialogSkipCount: 0,         // Berapa kali pengguna skip dialog
    dialogReadCompleteCount: 0, // Berapa kali pengguna baca dialog sampai selesai
    hoverInteractionCount: 0,   // Berapa banyak interaksi hover
    linkClickCount: 0,          // Berapa kali klik link
    idleCount: 0,               // Berapa kali idle warning muncul
    startTime: Date.now(),      // Waktu awal sesi
    lastInteractionTime: Date.now(), // Waktu interaksi terakhir
  };
  
  // Settings untuk setiap difficulty level
  private difficultySettings: Record<DifficultyLevel, DifficultySettings> = {
    [DifficultyLevel.EASY]: {
      autoplayDelay: 3000,       // 3 detik base delay
      charDelayFactor: 60,       // 60ms per karakter
      maxAutoplayDelay: 10000,   // Max 10 detik
      typewriterSpeed: 40,       // 40ms per karakter (lebih lambat)
      hoverDialogDelay: 4000,    // 4 detik untuk hover dialog
      hintVisibility: true,      // Tampilkan semua hint
      persistentDialogChance: 0.2, // 20% chance dialog perlu interaksi
      idleWarningDelay: 60000    // 60 detik idle warning
    },
    [DifficultyLevel.NORMAL]: {
      autoplayDelay: 2000,       // 2 detik base delay
      charDelayFactor: 50,       // 50ms per karakter
      maxAutoplayDelay: 8000,    // Max 8 detik
      typewriterSpeed: 30,       // 30ms per karakter
      hoverDialogDelay: 3000,    // 3 detik untuk hover dialog
      hintVisibility: true,      // Tampilkan semua hint
      persistentDialogChance: 0.4, // 40% chance dialog perlu interaksi
      idleWarningDelay: 45000    // 45 detik idle warning
    },
    [DifficultyLevel.HARD]: {
      autoplayDelay: 1500,       // 1.5 detik base delay
      charDelayFactor: 40,       // 40ms per karakter
      maxAutoplayDelay: 6000,    // Max 6 detik
      typewriterSpeed: 25,       // 25ms per karakter (lebih cepat)
      hoverDialogDelay: 2000,    // 2 detik untuk hover dialog
      hintVisibility: false,     // Sembunyikan sebagian hint
      persistentDialogChance: 0.6, // 60% chance dialog perlu interaksi
      idleWarningDelay: 30000    // 30 detik idle warning
    },
    [DifficultyLevel.SOULS]: {
      autoplayDelay: 1000,       // 1 detik base delay
      charDelayFactor: 30,       // 30ms per karakter
      maxAutoplayDelay: 4000,    // Max 4 detik
      typewriterSpeed: 20,       // 20ms per karakter (sangat cepat)
      hoverDialogDelay: 1500,    // 1.5 detik untuk hover dialog
      hintVisibility: false,     // Sembunyikan semua hint
      persistentDialogChance: 0.8, // 80% chance dialog perlu interaksi
      idleWarningDelay: 20000    // 20 detik idle warning
    },
  };
  
  private constructor() {
    this.dialogController = DialogController.getInstance();
    this.elevenlabsService = ElevenLabsService.getInstance();
    
    // Set difficulty dari local storage jika ada
    this.loadDifficultyFromStorage();
    
    // Start interval untuk menyesuaikan difficulty secara otomatis
    setInterval(() => this.adjustDifficulty(), 60000); // Check setiap 1 menit
  }
  
  public static getInstance(): DifficultyController {
    if (!DifficultyController.instance) {
      DifficultyController.instance = new DifficultyController();
    }
    return DifficultyController.instance;
  }
  
  /**
   * Mendapatkan level kesulitan saat ini
   */
  public getCurrentLevel(): DifficultyLevel {
    return this.currentLevel;
  }
  
  /**
   * Mendapatkan settings untuk level kesulitan saat ini
   */
  public getCurrentSettings(): DifficultySettings {
    return this.difficultySettings[this.currentLevel];
  }
  
  /**
   * Set level kesulitan secara manual
   */
  public setDifficultyLevel(level: DifficultyLevel): void {
    this.currentLevel = level;
    this.saveDifficultyToStorage();
    console.log(`Difficulty level set to ${level}`);
    
    // Update dialog controller dan hover dialog settings
    this.updateRelatedControllers();
  }
  
  /**
   * Rekam berbagai jenis interaksi pengguna
   */
  public recordDialogSkip(): void {
    this.interactionData.dialogSkipCount++;
    this.interactionData.lastInteractionTime = Date.now();
    this.adaptiveScore += 2; // Skip menambah skor lebih banyak (pengguna ingin lebih cepat)
    
    // Check untuk auto-adjust
    if (this.interactionData.dialogSkipCount > 5 && this.interactionData.dialogSkipCount % 5 === 0) {
      this.considerDifficultyIncrease();
    }
  }
  
  public recordDialogReadComplete(): void {
    this.interactionData.dialogReadCompleteCount++;
    this.interactionData.lastInteractionTime = Date.now();
    this.adaptiveScore += 1;
  }
  
  public recordHoverInteraction(linkType: HoverLinkType): void {
    this.interactionData.hoverInteractionCount++;
    this.interactionData.lastInteractionTime = Date.now();
    this.adaptiveScore += 1;
  }
  
  public recordLinkClick(linkType: HoverLinkType): void {
    this.interactionData.linkClickCount++;
    this.interactionData.lastInteractionTime = Date.now();
    this.adaptiveScore += 3; // Link click adalah tanda engagement tinggi
  }
  
  public recordIdle(): void {
    this.interactionData.idleCount++;
    this.adaptiveScore -= 2; // Idle mengurangi skor (pengguna kurang engage)
    
    // Jika terlalu banyak idle, buat lebih mudah
    if (this.interactionData.idleCount > 3) {
      this.considerDifficultyDecrease();
    }
  }
  
  /**
   * Memeriksa apakah dialog harus persistent berdasarkan tingkat kesulitan dan RNG
   */
  public shouldDialogBePersistent(text: string): boolean {
    // Beberapa dialog memang selalu persistent berdasarkan konten
    if (text.includes('?') && 
        (text.includes('credentials') || 
         text.includes('check') || 
         text.includes('want to know') || 
         text.includes('need to') || 
         text.includes('convinced'))) {
      return true;
    }
    
    // RNG berdasarkan difficulty level
    const settings = this.getCurrentSettings();
    return Math.random() < settings.persistentDialogChance;
  }
  
  /**
   * Mendapatkan autoplay delay berdasarkan tingkat kesulitan
   */
  public getAutoplayDelay(textLength: number): number {
    const settings = this.getCurrentSettings();
    return Math.min(
      settings.autoplayDelay + (textLength * settings.charDelayFactor),
      settings.maxAutoplayDelay
    );
  }
  
  /**
   * Mendapatkan typewriter speed berdasarkan tingkat kesulitan
   */
  public getTypewriterSpeed(): number {
    return this.getCurrentSettings().typewriterSpeed;
  }
  
  /**
   * Mendapatkan hover dialog delay berdasarkan tingkat kesulitan
   */
  public getHoverDialogDelay(): number {
    return this.getCurrentSettings().hoverDialogDelay;
  }
  
  /**
   * Mendapatkan apakah hints harus ditampilkan berdasarkan tingkat kesulitan
   */
  public shouldShowHints(): boolean {
    return this.getCurrentSettings().hintVisibility;
  }
  
  /**
   * Mendapatkan idle warning delay berdasarkan tingkat kesulitan
   */
  public getIdleWarningDelay(): number {
    return this.getCurrentSettings().idleWarningDelay;
  }
  
  /**
   * Load difficulty setting dari local storage
   */
  private loadDifficultyFromStorage(): void {
    try {
      const savedLevel = localStorage.getItem('difficultyLevel');
      if (savedLevel && Object.values(DifficultyLevel).includes(savedLevel as DifficultyLevel)) {
        this.currentLevel = savedLevel as DifficultyLevel;
        console.log(`Loaded difficulty level from storage: ${this.currentLevel}`);
      }
    } catch (error) {
      console.error('Error loading difficulty settings:', error);
    }
  }
  
  /**
   * Save difficulty setting ke local storage
   */
  private saveDifficultyToStorage(): void {
    try {
      localStorage.setItem('difficultyLevel', this.currentLevel);
    } catch (error) {
      console.error('Error saving difficulty settings:', error);
    }
  }
  
  /**
   * Update controllers lain yang terpengaruh oleh perubahan difficulty
   */
  private updateRelatedControllers(): void {
    // Untuk sekarang, tidak ada controller lain yang perlu diupdate
    // Nantinya bisa ditambahkan di sini
  }
  
  /**
   * Secara otomatis menyesuaikan kesulitan berdasarkan interaksi pengguna
   */
  private adjustDifficulty(): void {
    // Calculate time-based decay of adaptive score
    const now = Date.now();
    const elapsedTime = now - this.interactionData.lastInteractionTime;
    const hoursPassed = elapsedTime / (1000 * 60 * 60);
    
    // Score decays over time if user is inactive
    if (hoursPassed > 0.25) { // 15 menit
      this.adaptiveScore = Math.max(0, this.adaptiveScore - (hoursPassed * 5));
    }
    
    // Check if we should auto-adjust difficulty
    if (this.adaptiveScore > 25) {
      this.considerDifficultyIncrease();
    } else if (this.adaptiveScore < 5 && this.currentLevel !== DifficultyLevel.EASY) {
      this.considerDifficultyDecrease();
    }
  }
  
  /**
   * Pertimbangkan untuk meningkatkan kesulitan berdasarkan skor adaptif
   */
  private considerDifficultyIncrease(): void {
    if (this.currentLevel === DifficultyLevel.EASY) {
      this.setDifficultyLevel(DifficultyLevel.NORMAL);
      this.adaptiveScore = 15; // Reset score to mid-level
    } else if (this.currentLevel === DifficultyLevel.NORMAL) {
      this.setDifficultyLevel(DifficultyLevel.HARD);
      this.adaptiveScore = 20; // Reset score to mid-high-level
    } else if (this.currentLevel === DifficultyLevel.HARD && this.adaptiveScore > 35) {
      this.setDifficultyLevel(DifficultyLevel.SOULS);
      this.adaptiveScore = 25; // Reset score to maintain this level
    }
  }
  
  /**
   * Pertimbangkan untuk menurunkan kesulitan berdasarkan skor adaptif
   */
  private considerDifficultyDecrease(): void {
    if (this.currentLevel === DifficultyLevel.SOULS) {
      this.setDifficultyLevel(DifficultyLevel.HARD);
      this.adaptiveScore = 15; // Reset score to mid-level
    } else if (this.currentLevel === DifficultyLevel.HARD) {
      this.setDifficultyLevel(DifficultyLevel.NORMAL);
      this.adaptiveScore = 10; // Reset score to mid-low-level
    } else if (this.currentLevel === DifficultyLevel.NORMAL) {
      this.setDifficultyLevel(DifficultyLevel.EASY);
      this.adaptiveScore = 5; // Reset score to low-level
    }
  }
}

export default DifficultyController;