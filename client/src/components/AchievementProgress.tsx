import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { AchievementType } from '../constants/achievementConstants';
import AchievementController from '../controllers/achievementController';
import AchievementGallery from './AchievementGallery2';

interface AchievementProgressProps {
  className?: string;
}

const AchievementProgress: React.FC<AchievementProgressProps> = ({ className }) => {
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(10); // Total adalah 10 achievement
  const [isVisible, setIsVisible] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  
  // Animations
  const glowAnimationControls = useAnimation();
  const trophyAnimationControls = useAnimation();
  const progressBarControls = useAnimation();
  
  // Randomizing position effects
  const posVariation = useRef(Math.floor(Math.random() * 4));
  const positionStyles = [
    { right: '20px', bottom: '20px', left: 'auto', transform: 'none' }, // Bottom right
    { left: '20px', bottom: '20px', right: 'auto', transform: 'none' }, // Bottom left
    { right: '20px', top: '20px', left: 'auto', transform: 'none' }, // Top right
    { left: '20px', top: '20px', right: 'auto', transform: 'none' }, // Top left
  ];
  
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
      
      // Start background glow animation
      glowAnimationControls.start({
        opacity: [0.4, 0.7, 0.4],
        scale: [1, 1.05, 1],
        transition: {
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }
      });
      
      // Start trophy animation
      trophyAnimationControls.start({
        y: [0, -3, 0],
        filter: [
          "drop-shadow(0 0 4px rgba(255, 215, 0, 0.3))",
          "drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))",
          "drop-shadow(0 0 4px rgba(255, 215, 0, 0.3))",
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }
      });
      
      // Animate progress bar
      progressBarControls.start({
        width: `${(unlockedCount / totalCount) * 100}%`,
        transition: { duration: 1.5, ease: "easeOut" }
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Update achievement count saat gallery ditutup
  useEffect(() => {
    if (!showGallery) {
      const achievementController = AchievementController.getInstance();
      const unlocked = achievementController.getUnlockedAchievements();
      setUnlockedCount(unlocked.length);
      
      // Update progress bar animation when count changes
      progressBarControls.start({
        width: `${(unlocked.length / totalCount) * 100}%`,
        transition: { duration: 1.5, ease: "easeOut" }
      });
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20
              }
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={toggleGallery}
            style={{ 
              cursor: 'pointer',
              ...positionStyles[posVariation.current]
            }}
            title="Click to view achievements"
            whileHover={{ 
              scale: 1.05,
              transition: { 
                duration: 0.2 
              }
            }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.div 
              className="achievement-progress-glow"
              animate={glowAnimationControls}
            />
            
            <div className="achievement-progress-title">
              <motion.span 
                className="achievement-icon" 
                animate={trophyAnimationControls}
              >
                🏆
              </motion.span>
              <span className="achievement-label">Achievements:</span>
              <span className="achievement-count">{unlockedCount}/{totalCount}</span>
            </div>
            
            <div className="achievement-progress-bar-container">
              <motion.div 
                className="achievement-progress-bar"
                initial={{ width: 0 }}
                animate={progressBarControls}
              />
            </div>
            
            {/* Badge for new achievements if any */}
            {unlockedCount > 0 && (
              <motion.div 
                className="achievement-badge"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    delay: 0.3
                  }
                }}
              >
                {unlockedCount}
              </motion.div>
            )}
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
      
      {/* Styles untuk modal dan achievement progress */}
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
          border-radius: 8px;
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
        
        /* Enhanced achievement progress indicator */
        .achievement-progress-indicator {
          position: fixed;
          width: auto;
          min-width: 200px;
          background: rgba(20, 20, 20, 0.9);
          border: 1px solid rgba(255, 215, 0, 0.4);
          border-radius: 8px;
          padding: 10px 15px;
          z-index: 40;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), inset 0 0 5px rgba(255, 215, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          overflow: hidden;
        }
        
        .achievement-progress-indicator:hover {
          border-color: rgba(255, 215, 0, 0.7);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.2);
        }
        
        .achievement-progress-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: -1;
        }
        
        .achievement-progress-title {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          color: rgba(255, 215, 0, 0.9);
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .achievement-icon {
          margin-right: 8px;
          font-size: 1.1rem;
          filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.3));
        }
        
        .achievement-label {
          flex: 1;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .achievement-count {
          font-weight: bold;
          background: linear-gradient(to bottom, rgba(255, 215, 130, 0.95), rgba(200, 150, 50, 0.7));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 4px rgba(200, 150, 30, 0.3);
          font-size: 0.95rem;
        }
        
        .achievement-progress-bar-container {
          height: 6px;
          background: rgba(40, 30, 20, 0.6);
          border-radius: 3px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
        }
        
        .achievement-progress-bar {
          height: 100%;
          background: linear-gradient(to right, #ffd700, #ffa500);
          box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
          position: relative;
          overflow: hidden;
        }
        
        .achievement-progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: -50%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, 0.4) 50%, 
            rgba(255, 255, 255, 0) 100%
          );
          animation: progressShine 2s infinite linear;
        }
        
        @keyframes progressShine {
          0% { left: -50%; }
          100% { left: 150%; }
        }
        
        /* Badge notification */
        .achievement-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff5722;
          color: white;
          font-size: 0.7rem;
          font-weight: bold;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.8);
        }
        
        /* Class untuk menyembunyikan achievement progress */
        .achievement-progress-indicator.hidden {
          opacity: 0 !important;
          transform: translateY(20px) !important;
          pointer-events: none;
          transition: all 0.5s ease;
        }
        
        /* Media queries for responsive design */
        @media (max-width: 768px) {
          .achievement-progress-indicator {
            min-width: 180px;
            padding: 8px 12px;
          }
          
          .achievement-progress-title {
            font-size: 0.75rem;
          }
          
          .achievement-icon {
            font-size: 0.95rem;
          }
        }
        
        /* Entrance animation keyframes */
        @keyframes enterFromBottom {
          0% { 
            transform: translateY(30px);
            opacity: 0;
          }
          100% { 
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}} />
    </>
  );
};

export default AchievementProgress;