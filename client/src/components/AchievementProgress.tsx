import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AchievementType } from '../constants/achievementConstants';
import AchievementController from '../controllers/achievementController';
import AchievementGallery from './AchievementGallery';

interface AchievementProgressProps {
  className?: string;
}

const AchievementProgress: React.FC<AchievementProgressProps> = ({ className }) => {
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(10); // Total adalah 10 achievement
  const [isVisible, setIsVisible] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  
  // Daftar semua achievement yang mungkin
  const allAchievements: AchievementType[] = [
    'approach', 'contract', 'document', 'success',
    'anger', 'nightmare', 'listener', 'patience',
    'return', 'hover'
  ];
  
  // Load achievement saat komponen dimuat
  useEffect(() => {
    const achievementController = AchievementController.getInstance();
    const unlocked = achievementController.getUnlockedAchievements();
    setUnlockedCount(unlocked.length);
    
    // Tampilkan progress setelah sedikit delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Update achievement count saat gallery ditutup
  useEffect(() => {
    if (!showGallery) {
      const achievementController = AchievementController.getInstance();
      const unlocked = achievementController.getUnlockedAchievements();
      setUnlockedCount(unlocked.length);
    }
  }, [showGallery]);
  
  // Hitung persentase achievement yang sudah di-unlock
  const percentage = Math.round((unlockedCount / totalCount) * 100);
  
  // Toggle gallery saat progress ditekan
  const toggleGallery = () => {
    setShowGallery(prev => !prev);
  };
  
  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`achievement-progress-indicator ${className || ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onClick={toggleGallery}
            style={{ cursor: 'pointer' }}
            title="Click to view achievements"
          >
            <div className="achievement-progress-title">
              <span className="achievement-icon">🏆</span>
              <span className="achievement-label">Achievements:</span>
              <span className="achievement-count">{unlockedCount}/{totalCount}</span>
            </div>
            <div className="achievement-progress-bar-container">
              <div 
                className="achievement-progress-bar" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Achievement Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="achievement-gallery-modal"
            onClick={(e) => {
              // Tutup modal jika yang diklik adalah background (bukan konten)
              if (e.target === e.currentTarget) {
                setShowGallery(false);
              }
            }}
          >
            <motion.div 
              className="achievement-gallery-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="achievement-gallery-close" 
                onClick={() => setShowGallery(false)}
              >
                ×
              </button>
              <AchievementGallery />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Styles untuk modal */}
      <style dangerouslySetInnerHTML={{ __html: `
        .achievement-gallery-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(3px);
        }
        
        .achievement-gallery-content {
          position: relative;
          width: 90%;
          max-width: 600px;
          max-height: 85vh;
          background: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 4px;
          padding: 24px;
          overflow-y: auto;
          box-shadow: 0 0 30px rgba(255, 193, 7, 0.15), inset 0 0 20px rgba(0, 0, 0, 0.4);
        }
        
        .achievement-gallery-close {
          position: absolute;
          top: 12px;
          right: 16px;
          background: none;
          border: none;
          color: rgba(255, 193, 7, 0.7);
          font-size: 24px;
          cursor: pointer;
          padding: 4px 10px;
          line-height: 1;
          z-index: 10;
          transition: all 0.2s ease;
        }
        
        .achievement-gallery-close:hover {
          color: rgba(255, 193, 7, 1);
          transform: scale(1.1);
        }
        
        /* Make progress indicator more clickable */
        .achievement-progress-indicator {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .achievement-progress-indicator:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        /* Class untuk menyembunyikan achievement progress */
        .achievement-progress-indicator.hidden {
          opacity: 0 !important;
          pointer-events: none;
          transition: opacity 0.5s ease;
        }
      `}} />
    </>
  );
};

export default AchievementProgress;