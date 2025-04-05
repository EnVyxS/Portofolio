import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllEmotions, EmotionType } from '../types/emotions';
import '../styles/emotionAnimations.css';

interface EmotionPaletteProps {
  onSelectEmotion: (emotion: EmotionType) => void;
  currentEmotion?: EmotionType;
  isOpen?: boolean;
}

const EmotionPalette: React.FC<EmotionPaletteProps> = ({ 
  onSelectEmotion, 
  currentEmotion = 'neutral',
  isOpen = false 
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isOpen);
  const emotions = getAllEmotions();

  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const togglePalette = () => {
    setIsExpanded(prev => !prev);
  };

  const handleSelectEmotion = (emotion: EmotionType) => {
    onSelectEmotion(emotion);
    // Opsional: sembunyikan palette setelah pemilihan
    // setIsExpanded(false);
  };

  return (
    <div className="emotion-palette-container">
      <motion.button
        className={`emotion-toggle-button ${isExpanded ? 'active' : ''}`}
        onClick={togglePalette}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className={`emotion-preview emotion-${currentEmotion}`}>
          {currentEmotion}
        </div>
      </motion.button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="emotion-grid"
        >
          {emotions.map(emotion => (
            <motion.div
              key={emotion.id}
              className={`emotion-item ${currentEmotion === emotion.id ? 'selected' : ''}`}
              onClick={() => handleSelectEmotion(emotion.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className={`emotion-icon emotion-${emotion.id}`}>
                <div className="emotion-label">{emotion.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default EmotionPalette;