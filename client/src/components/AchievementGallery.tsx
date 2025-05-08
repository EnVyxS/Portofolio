import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AchievementType, AchievementDescriptions, AchievementTitles, AchievementIcons } from './Achievement';
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
      
      <style jsx>{`
        .achievement-gallery-container {
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 180, 30, 0.3);
          border-radius: 4px;
          padding: 1rem;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .achievement-progress {
          margin-bottom: 1rem;
        }
        
        .progress-bar-container {
          height: 6px;
          background: rgba(50, 40, 30, 0.5);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(to right, #ffd700, #ffa500);
          transition: width 0.5s ease;
        }
        
        .achievement-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        @media (max-width: 480px) {
          .achievement-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .achievement-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(30, 20, 10, 0.6);
          border: 1px solid rgba(255, 180, 30, 0.2);
          border-radius: 4px;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .achievement-item.unlocked:hover {
          background: rgba(50, 30, 10, 0.8);
          border-color: rgba(255, 180, 30, 0.5);
          transform: translateY(-2px);
        }
        
        .achievement-item.locked {
          opacity: 0.6;
          cursor: default;
        }
        
        .achievement-icon-container {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.25rem;
          color: #ffc107;
        }
        
        .achievement-icon-container.locked {
          color: #777;
        }
        
        .achievement-name {
          font-size: 0.55rem;
          text-align: center;
          color: rgba(255, 180, 30, 0.8);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        
        .achievement-detail {
          background: rgba(20, 15, 10, 0.8);
          border: 1px solid rgba(255, 180, 30, 0.3);
          border-radius: 4px;
          padding: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .easter-egg-message {
          position: relative;
          background: rgba(50, 30, 0, 0.3);
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          overflow: hidden;
        }
        
        .easter-egg-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
          animation: pulse 2s infinite alternate;
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.3;
          }
          100% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementGallery;