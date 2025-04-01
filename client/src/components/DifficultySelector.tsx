import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DifficultyController, { DifficultyLevel } from '../controllers/difficultyController';

interface DifficultySelectorProps {
  onClose?: () => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onClose }) => {
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(DifficultyLevel.NORMAL);
  const [isVisible, setIsVisible] = useState(false);
  const difficultyController = DifficultyController.getInstance();
  
  useEffect(() => {
    // Get current difficulty level when component mounts
    setCurrentDifficulty(difficultyController.getCurrentLevel());
  }, []);
  
  const handleDifficultyChange = (level: DifficultyLevel) => {
    difficultyController.setDifficultyLevel(level);
    setCurrentDifficulty(level);
  };
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };
  
  // Map difficulty levels to human-readable descriptions
  const difficultyDescriptions: Record<DifficultyLevel, string> = {
    [DifficultyLevel.EASY]: 'Relaxed pace, longer reading time',
    [DifficultyLevel.NORMAL]: 'Balanced experience',
    [DifficultyLevel.HARD]: 'Fast-paced, challenging',
    [DifficultyLevel.SOULS]: 'True Souls experience, minimal assistance'
  };
  
  return (
    <div className="difficulty-selector-container">
      <button 
        className="difficulty-button"
        onClick={toggleVisibility}
        title="Adjust difficulty settings"
      >
        <span className="difficulty-icon">⚙️</span>
      </button>
      
      {isVisible && (
        <motion.div 
          className="difficulty-modal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="difficulty-modal-header">
            <h3>Difficulty Settings</h3>
            <button className="close-button" onClick={handleClose}>×</button>
          </div>
          
          <div className="difficulty-options">
            {Object.values(DifficultyLevel).map((level) => (
              <div 
                key={level}
                className={`difficulty-option ${currentDifficulty === level ? 'selected' : ''}`}
                onClick={() => handleDifficultyChange(level)}
              >
                <div className="difficulty-option-name">
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </div>
                <div className="difficulty-option-description">
                  {difficultyDescriptions[level]}
                </div>
              </div>
            ))}
          </div>
          
          <div className="difficulty-footer">
            Current mode adapts based on your interaction patterns
          </div>
        </motion.div>
      )}
      
      <style>{`
        .difficulty-selector-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 100;
        }
        
        .difficulty-button {
          background: rgba(20, 18, 15, 0.7);
          border: 1px solid rgba(150, 130, 100, 0.4);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .difficulty-button:hover {
          background: rgba(40, 35, 30, 0.8);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        
        .difficulty-icon {
          font-size: 20px;
        }
        
        .difficulty-modal {
          position: absolute;
          bottom: 50px;
          right: 0;
          width: 280px;
          background: rgba(20, 18, 15, 0.9);
          border: 1px solid rgba(150, 130, 100, 0.5);
          border-radius: 4px;
          padding: 15px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(6px);
          color: #d4c9a8;
        }
        
        .difficulty-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border-bottom: 1px solid rgba(150, 130, 100, 0.3);
          padding-bottom: 8px;
        }
        
        .difficulty-modal-header h3 {
          margin: 0;
          font-family: 'Trajan Pro', 'Cinzel', serif;
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 1px;
          color: #e8debc;
        }
        
        .close-button {
          background: transparent;
          border: none;
          color: #a69a7b;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-button:hover {
          color: #e8debc;
        }
        
        .difficulty-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;
        }
        
        .difficulty-option {
          padding: 10px 12px;
          border-radius: 4px;
          background: rgba(40, 35, 30, 0.5);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        
        .difficulty-option:hover {
          background: rgba(60, 50, 40, 0.6);
          transform: translateX(2px);
        }
        
        .difficulty-option.selected {
          background: rgba(80, 65, 45, 0.7);
          border: 1px solid rgba(150, 130, 100, 0.6);
        }
        
        .difficulty-option-name {
          font-family: 'Trajan Pro', 'Cinzel', serif;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 5px;
          color: #e8debc;
        }
        
        .difficulty-option-description {
          font-family: 'Garamond', serif;
          font-size: 12px;
          opacity: 0.7;
        }
        
        .difficulty-footer {
          font-size: 11px;
          text-align: center;
          opacity: 0.6;
          font-style: italic;
          padding-top: 8px;
          border-top: 1px solid rgba(150, 130, 100, 0.2);
        }
        
        @media (max-width: 768px) {
          .difficulty-selector-container {
            bottom: 15px;
            right: 15px;
          }
          
          .difficulty-modal {
            width: 240px;
          }
        }
      `}</style>
    </div>
  );
};

export default DifficultySelector;