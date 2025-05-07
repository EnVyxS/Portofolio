
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AchievementData {
  id: string;
  title: string;
  description: string;
}

export const ACHIEVEMENTS = {
  APPROACH: {
    id: 'approach',
    title: 'First Contact',
    description: 'You dared to approach him...'
  },
  CONTRACT_OPEN: {
    id: 'contract-open',
    title: 'Seeker of Truth',
    description: 'You\'ve laid eyes upon the contract'
  },
  CONTRACT_SIGN: {
    id: 'contract-sign',
    title: 'Bound by Blood',
    description: 'The pact has been sealed'
  },
  ANGER: {
    id: 'anger',
    title: 'Provocation',
    description: 'You\'ve awakened his wrath'
  },
  NIGHTMARE: {
    id: 'nightmare',
    title: 'Into the Abyss',
    description: 'You\'ve entered the realm of nightmares'
  }
};

const Achievement: React.FC<{
  achievement: AchievementData;
  onComplete?: () => void;
}> = ({ achievement, onComplete }) => {
  const [audio] = useState(new Audio('/assets/sounds/achievement.m4a'));
  
  useEffect(() => {
    audio.volume = 0.4;
    audio.play().catch(console.error);
    
    const timer = setTimeout(() => {
      onComplete?.();
    }, 4000);
    
    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="achievement-notification"
      >
        <div className="achievement-icon">★</div>
        <div className="achievement-content">
          <h3>{achievement.title}</h3>
          <p>{achievement.description}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Achievement;
