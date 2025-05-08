import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AchievementType, AchievementDescriptions, AchievementTitles, AchievementIcons } from '../constants/achievementConstants';
import AchievementController from '../controllers/achievementController';

// Easter egg yang muncul ketika semua achievement terbuka
const EASTER_EGG_MESSAGE = 'Kamu telah menaklukkan semua tantangan Diva Juan!';

// Teks misterius untuk achievement yang belum terbuka
const MYSTERIOUS_TITLE = '???';
const MYSTERIOUS_DESCRIPTION = 'Achievement ini masih tersembunyi. Teruslah menjelajahi untuk menemukannya...';

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
  
  // Render ikon achievement - yang terbuka atau misterius
  const renderAchievementIcon = (type: AchievementType) => {
    if (isUnlocked(type)) {
      return (
        <div className="achievement-icon-container">
          {AchievementIcons[type]}
        </div>
      );
    } else {
      // Ikon misterius untuk achievement yang belum terbuka
      return (
        <div className="achievement-icon-container locked">
          <svg viewBox="0 0 24 24" fill="none" className="mysterious-icon" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="3" 
                  stroke="rgba(255, 193, 7, 0.4)" strokeWidth="1.5" 
                  fill="rgba(30, 30, 30, 0.6)" />
            <circle cx="12" cy="12" r="7" 
                    stroke="rgba(255, 193, 7, 0.5)" strokeWidth="1" 
                    fill="rgba(20, 20, 20, 0.4)" />
            <text x="12" y="16" 
                  fontSize="10" fontWeight="bold" textAnchor="middle" 
                  fill="rgba(255, 193, 7, 0.7)" className="question-mark">?</text>
            <path className="mysterious-glow" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" 
                  stroke="rgba(255, 193, 7, 0.4)" strokeOpacity="0.6" 
                  strokeWidth="0.5" strokeDasharray="1 2" />
          </svg>
        </div>
      );
    }
  };
  
  // Menangani klik pada achievement
  const handleAchievementClick = (type: AchievementType) => {
    // Selalu set selected achievement, apakah terbuka atau tidak
    setSelectedAchievement(type);
  };
  
  // Menampilkan detail achievement yang dipilih
  const renderAchievementDetail = () => {
    if (!selectedAchievement) return null;
    
    const isUnlocked = unlockedAchievements.includes(selectedAchievement);
    
    return (
      <motion.div 
        className={`achievement-detail ${isUnlocked ? 'unlocked' : 'mysterious'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-amber-100 text-sm font-semibold mb-1">
          {isUnlocked ? AchievementTitles[selectedAchievement] : MYSTERIOUS_TITLE}
        </h3>
        <p className="text-amber-300/70 text-xs">
          {isUnlocked ? AchievementDescriptions[selectedAchievement] : MYSTERIOUS_DESCRIPTION}
        </p>
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
            <div className="achievement-name">
              {isUnlocked(achievement) 
                ? AchievementTitles[achievement]
                : MYSTERIOUS_TITLE
              }
            </div>
          </div>
        ))}
      </div>
      
      {/* Detail achievement yang dipilih */}
      {renderAchievementDetail()}
      
      {/* Custom styling for mysterious achievements */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* General styling for achievement grid */
        .achievement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .achievement-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(30, 30, 30, 0.6);
          padding: 12px 8px;
          border-radius: 4px;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid rgba(255, 193, 7, 0.2);
          position: relative;
          overflow: hidden;
        }
        
        .achievement-item.unlocked {
          border-color: rgba(255, 193, 7, 0.5);
          box-shadow: 0 0 10px rgba(255, 193, 7, 0.15);
        }
        
        .achievement-item.unlocked:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(255, 193, 7, 0.2);
        }
        
        .achievement-name {
          margin-top: 8px;
          font-size: 12px;
          text-align: center;
          color: rgba(255, 193, 7, 0.9);
          font-weight: 500;
        }
        
        .achievement-icon-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 64px;
          height: 64px;
        }
        
        /* Styling untuk achievement yang misterius */
        .achievement-item.locked {
          opacity: 0.7;
          filter: brightness(0.7) blur(0.5px);
          border: 1px dashed rgba(255, 193, 7, 0.25);
          background: rgba(20, 20, 20, 0.6);
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
        }
        
        .achievement-item.locked:hover {
          opacity: 0.85;
          filter: brightness(0.85) blur(0px);
          transform: translateY(-2px);
          border-color: rgba(255, 193, 7, 0.4);
        }
        
        .achievement-item.locked .achievement-name {
          color: rgba(255, 193, 7, 0.5);
          text-shadow: 0 0 5px rgba(255, 193, 7, 0.3);
          font-style: italic;
        }
        
        .mysterious-icon {
          height: 48px;
          width: 48px;
          opacity: 0.6;
          filter: drop-shadow(0 0 2px rgba(255, 193, 7, 0.3));
          animation: pulse 3s infinite alternate;
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.5;
            transform: scale(0.97);
          }
          100% {
            opacity: 0.7;
            transform: scale(1.03);
          }
        }
        
        .question-mark {
          animation: questionPulse 2s infinite alternate;
          opacity: 0.8;
        }
        
        @keyframes questionPulse {
          0% {
            fill: rgba(255, 193, 7, 0.5);
            font-size: 9px;
          }
          100% {
            fill: rgba(255, 193, 7, 0.8);
            font-size: 11px;
          }
        }
        
        .mysterious-glow {
          animation: glowPulse 4s infinite alternate;
        }
        
        @keyframes glowPulse {
          0% {
            stroke: rgba(255, 193, 7, 0.3);
            stroke-width: 0.5;
          }
          100% {
            stroke: rgba(255, 193, 7, 0.6);
            stroke-width: 1;
          }
        }
        
        .achievement-detail.mysterious {
          background: rgba(30, 30, 30, 0.7);
          border: 1px dashed rgba(255, 193, 7, 0.3);
          border-radius: 4px;
          padding: 12px;
          margin-top: 12px;
          text-align: center;
        }
        
        .achievement-detail.mysterious h3 {
          font-size: 14px;
          letter-spacing: 3px;
          animation: mysteriousPulse 3s infinite alternate;
        }
        
        @keyframes mysteriousPulse {
          0% {
            color: rgba(255, 193, 7, 0.6);
            text-shadow: 0 0 3px rgba(255, 193, 7, 0.3);
          }
          100% {
            color: rgba(255, 193, 7, 0.8);
            text-shadow: 0 0 6px rgba(255, 193, 7, 0.5);
          }
        }
      `}} />
    </div>
  );
};

export default AchievementGallery;