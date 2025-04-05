import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useEmotion } from '../context/EmotionContext';
import '../styles/emotionAnimations.css';

interface CharacterDisplayProps {
  characterImage: string;
  className?: string;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ 
  characterImage,
  className = ''
}) => {
  const { currentEmotion, getEmotionParams } = useEmotion();
  const characterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyEmotionVisualParams = () => {
      if (!characterRef.current) return;
      
      const { visualParams } = getEmotionParams();
      if (!visualParams) return;
      
      const element = characterRef.current;
      
      // Terapkan filter CSS jika ada
      if (visualParams.filter && visualParams.filter !== 'none') {
        element.style.filter = visualParams.filter;
      } else {
        element.style.filter = 'none';
      }
      
      // Terapkan transformasi CSS jika ada
      if (visualParams.transform && visualParams.transform !== 'none') {
        element.style.transform = visualParams.transform;
      } else {
        element.style.transform = 'none';
      }
      
      // Terapkan transisi CSS jika ada
      if (visualParams.transition) {
        element.style.transition = visualParams.transition;
      }
      
      // Reset dan terapkan kelas animasi
      element.classList.remove(...Array.from(element.classList).filter(cls => cls.startsWith('emotion-')));
      element.classList.add(`emotion-${currentEmotion}`);
    };
    
    applyEmotionVisualParams();
  }, [currentEmotion, getEmotionParams]);

  return (
    <motion.div 
      className={`character-display ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div 
        ref={characterRef}
        className={`character-image emotion-${currentEmotion}`}
        style={{
          backgroundImage: `url(${characterImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    </motion.div>
  );
};

export default CharacterDisplay;