import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AchievementType, AchievementDescriptions, AchievementTitles, AchievementIcons } from '../constants/achievementConstants';
import AchievementController from '../controllers/achievementController';

// Easter egg yang muncul ketika semua achievement terbuka
const EASTER_EGG_MESSAGE = 'Kamu telah menaklukkan semua tantangan Diva Juan!';

const AchievementGallery: React.FC = () => {
  // State untuk menyimpan achievement yang terbuka
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementType[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementType | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  
  // Daftar semua achievement yang mungkin
  const allAchievements: AchievementType[] = [
    'approach', 'contract', 'document', 'success',
    'anger', 'nightmare', 'listener', 'patience',
    'return', 'hover'
  ];
  
  // Load achievement saat komponen dimuat
  useEffect(() => {
    const achievementController = AchievementController.getInstance();
    // Load achievement yang sudah terbuka
    const unlocked = achievementController.getUnlockedAchievements();
    setUnlockedAchievements(unlocked);
    
    // Cek apakah semua achievement sudah terbuka
    const allUnlocked = allAchievements.every(achievement => 
      unlocked.includes(achievement)
    );
    
    if (allUnlocked && unlocked.length === allAchievements.length) {
      setShowEasterEgg(true);
    }
  }, []);
  
  // Mengecek apakah achievement sudah di-unlock
  const isUnlocked = (type: AchievementType): boolean => {
    return unlockedAchievements.includes(type);
  };
  
  // Render ikon achievement - yang terbuka atau tanda tanya
  const renderAchievementIcon = (type: AchievementType) => {
    if (isUnlocked(type)) {
      return (
        <div className="achievement-icon-container">
          {AchievementIcons[type]}
        </div>
      );
    } else {
      // Ikon tanda tanya untuk achievement yang belum terbuka
      return (
        <div className="achievement-icon-container locked">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 opacity-50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
            <path d="M12 17v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 14c0-1 .6-1.5 1.2-2 .6-.5 1.2-1 1.2-2 0-1.1-.9-2-2-2s-2 .9-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    }
  };
  
  // Menangani klik pada achievement
  const handleAchievementClick = (type: AchievementType) => {
    if (isUnlocked(type)) {
      setSelectedAchievement(type);
    }
  };
  
  // Menampilkan detail achievement yang dipilih
  const renderAchievementDetail = () => {
    if (!selectedAchievement) return null;
    
    return (
      <motion.div 
        className="achievement-detail"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-amber-100 text-sm font-semibold mb-1">{AchievementTitles[selectedAchievement]}</h3>
        <p className="text-amber-300/70 text-xs">{AchievementDescriptions[selectedAchievement]}</p>
      </motion.div>
    );
  };
  
  return (
    <div className="achievement-gallery-container">
      <h2 className="text-amber-100 text-lg font-bold mb-3 text-center">Achievements</h2>
      
      {/* Tampilkan easter egg jika semua achievement terbuka */}
      {showEasterEgg && (
        <motion.div 
          className="easter-egg-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p className="text-amber-400 text-sm font-semibold text-center my-2">{EASTER_EGG_MESSAGE}</p>
          <div className="easter-egg-glow"></div>
        </motion.div>
      )}
      
      {/* Progress bar */}
      <div className="achievement-progress mb-4">
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${(unlockedAchievements.length / allAchievements.length) * 100}%` }}
          ></div>
        </div>
        <div className="text-amber-200 text-xs mt-1 text-center">
          {unlockedAchievements.length} / {allAchievements.length}
        </div>
      </div>
      
      {/* Grid achievement */}
      <div className="achievement-grid">
        {allAchievements.map((achievement) => (
          <div 
            key={achievement}
            className={`achievement-item ${isUnlocked(achievement) ? 'unlocked' : 'locked'}`}
            onClick={() => handleAchievementClick(achievement)}
          >
            {renderAchievementIcon(achievement)}
            {isUnlocked(achievement) && (
              <div className="achievement-name">
                {AchievementTitles[achievement]}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Detail achievement yang dipilih */}
      {renderAchievementDetail()}
      
      {/* styles using className instead of inline styles */}
    </div>
  );
};

export default AchievementGallery;