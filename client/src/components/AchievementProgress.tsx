import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AchievementType } from '../constants/achievementConstants';
import AchievementController from '../controllers/achievementController';

interface AchievementProgressProps {
  className?: string;
}

const AchievementProgress: React.FC<AchievementProgressProps> = ({ className }) => {
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(10); // Total adalah 10 achievement
  const [isVisible, setIsVisible] = useState(false);
  
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
  
  // Hitung persentase achievement yang sudah di-unlock
  const percentage = Math.round((unlockedCount / totalCount) * 100);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`achievement-progress-indicator ${className || ''}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
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
  );
};

export default AchievementProgress;