import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AchievementController from '../controllers/achievementController';
import {
  AchievementType,
  AchievementDescriptions,
  AchievementTitles,
  AchievementIcons,
  AchievementCriteria,
} from "../constants/achievementConstants";
import ShareButton from './ShareButton';

interface AchievementSharingProps {
  className?: string;
}

const SHARE_DEFAULT_TEXT = 'I unlocked an achievement in Diva Juan\'s interactive portfolio!';

const AchievementSharing: React.FC<AchievementSharingProps> = ({ className = '' }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementType[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementType | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Load unlocked achievements
  useEffect(() => {
    const achievementController = AchievementController.getInstance();
    const unlocked = achievementController.getUnlockedAchievements();
    setUnlockedAchievements(unlocked);
  }, []);
  
  // Generate share text based on selected achievement
  const generateShareText = (achievement: AchievementType): string => {
    return `${SHARE_DEFAULT_TEXT} ${AchievementTitles[achievement]}: ${AchievementDescriptions[achievement]}`;
  };
  
  // Handle share button click
  const handleShareClick = (achievement: AchievementType) => {
    setSelectedAchievement(achievement);
    setCustomMessage(generateShareText(achievement));
    setShareModalOpen(true);
  };
  
  return (
    <div className={`achievement-sharing-container ${className}`}>
      <h3 className="achievement-sharing-title">Share Your Achievements</h3>
      
      {unlockedAchievements.length === 0 ? (
        <div className="no-achievements">
          <p>No achievements unlocked yet. Keep exploring the portfolio to earn achievements you can share!</p>
        </div>
      ) : (
        <div className="unlocked-achievements-list">
          {unlockedAchievements.map((achievement) => (
            <motion.div
              key={achievement}
              className="sharable-achievement-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="achievement-icon-container">
                {AchievementIcons[achievement]}
              </div>
              <div className="achievement-details">
                <h4 className="achievement-title">{AchievementTitles[achievement]}</h4>
                <p className="achievement-description">{AchievementDescriptions[achievement]}</p>
              </div>
              <button
                className="share-achievement-button"
                onClick={() => handleShareClick(achievement)}
                aria-label={`Share ${AchievementTitles[achievement]} achievement`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 10.5l7.5-3.5M9 13.5l7.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Share</span>
              </button>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Customizable share modal */}
      <AnimatePresence>
        {shareModalOpen && selectedAchievement && (
          <motion.div
            className="customize-share-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShareModalOpen(false)}
          >
            <motion.div
              className="customize-share-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Customize Your Share Message</h3>
                <button
                  className="close-modal-button"
                  onClick={() => setShareModalOpen(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="selected-achievement">
                <div className="achievement-icon-container">
                  {AchievementIcons[selectedAchievement]}
                </div>
                <div className="achievement-info">
                  <h4>{AchievementTitles[selectedAchievement]}</h4>
                  <p>{AchievementDescriptions[selectedAchievement]}</p>
                </div>
              </div>
              
              <div className="message-customization">
                <label htmlFor="share-message">Custom Message:</label>
                <textarea
                  id="share-message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  placeholder="Write your custom message..."
                />
              </div>
              
              <div className="share-buttons">
                <ShareButton 
                  className="custom-share-button"
                  title={`Diva Juan Portfolio - ${AchievementTitles[selectedAchievement]}`}
                  text={customMessage}
                  url={window.location.origin}
                />
                
                <button
                  className="cancel-share-button"
                  onClick={() => setShareModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CSS styles */}
      <style>{`
        .achievement-sharing-container {
          background: rgba(30, 30, 30, 0.7);
          border-radius: 10px;
          padding: 20px;
          border: 1px solid rgba(255, 215, 0, 0.3);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        .achievement-sharing-title {
          font-size: 1.2rem;
          color: rgba(255, 215, 0, 0.9);
          margin: 0 0 16px 0;
          text-align: center;
          position: relative;
        }
        
        .achievement-sharing-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent);
          border-radius: 2px;
        }
        
        .no-achievements {
          text-align: center;
          padding: 16px;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
          background: rgba(20, 20, 20, 0.4);
          border-radius: 8px;
          border: 1px dashed rgba(255, 215, 0, 0.2);
        }
        
        .unlocked-achievements-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 8px;
        }
        
        .unlocked-achievements-list::-webkit-scrollbar {
          width: 8px;
        }
        
        .unlocked-achievements-list::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        .unlocked-achievements-list::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 4px;
        }
        
        .unlocked-achievements-list::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.5);
        }
        
        .sharable-achievement-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(40, 40, 40, 0.7);
          border-radius: 8px;
          padding: 12px;
          border: 1px solid rgba(255, 215, 0, 0.3);
          transition: all 0.3s ease;
          position: relative;
        }
        
        .sharable-achievement-item:hover {
          background: rgba(50, 50, 50, 0.8);
          border-color: rgba(255, 215, 0, 0.5);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .achievement-icon-container {
          width: 50px;
          height: 50px;
          min-width: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(30, 30, 30, 0.8);
          border-radius: 50%;
          box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.4);
          overflow: hidden;
        }
        
        .achievement-details {
          flex: 1;
          min-width: 0;
        }
        
        .achievement-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255, 215, 0, 0.9);
          margin: 0 0 4px 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .achievement-description {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .share-achievement-button {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 215, 0, 0.15);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 6px;
          padding: 6px 12px;
          color: rgba(255, 215, 0, 0.9);
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .share-achievement-button:hover {
          background: rgba(255, 215, 0, 0.25);
          transform: translateY(-2px);
        }
        
        .share-achievement-button span {
          display: none;
        }
        
        @media (min-width: 768px) {
          .share-achievement-button span {
            display: inline;
          }
        }
        
        /* Customize Share Modal */
        .customize-share-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          backdrop-filter: blur(4px);
        }
        
        .customize-share-modal {
          background: rgba(30, 30, 30, 0.95);
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          border: 1px solid rgba(255, 215, 0, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .modal-header h3 {
          font-size: 1.2rem;
          color: rgba(255, 215, 0, 0.9);
          margin: 0;
        }
        
        .close-modal-button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.5rem;
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        
        .close-modal-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }
        
        .selected-achievement {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(40, 40, 40, 0.7);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }
        
        .achievement-info h4 {
          font-size: 1rem;
          color: rgba(255, 215, 0, 0.9);
          margin: 0 0 8px 0;
        }
        
        .achievement-info p {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }
        
        .message-customization {
          margin-bottom: 20px;
        }
        
        .message-customization label {
          display: block;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 8px;
        }
        
        .message-customization textarea {
          width: 100%;
          background: rgba(20, 20, 20, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          resize: vertical;
          min-height: 80px;
          transition: all 0.2s ease;
        }
        
        .message-customization textarea:focus {
          outline: none;
          border-color: rgba(255, 215, 0, 0.5);
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
        }
        
        .share-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        .custom-share-button {
          flex: 1;
        }
        
        .cancel-share-button {
          background: rgba(80, 80, 80, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 8px 16px;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .cancel-share-button:hover {
          background: rgba(100, 100, 100, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AchievementSharing;