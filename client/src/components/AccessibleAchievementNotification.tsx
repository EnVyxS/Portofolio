import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AchievementType,
  AchievementTitles,
  AchievementDescriptions,
  AchievementIcons
} from '../constants/achievementConstants';

interface AccessibleAchievementNotificationProps {
  achievements: AchievementType[];
  onAcknowledge?: (achievement: AchievementType) => void;
  autoHideDuration?: number;
  className?: string;
}

const AccessibleAchievementNotification: React.FC<AccessibleAchievementNotificationProps> = ({
  achievements = [],
  onAcknowledge,
  autoHideDuration = 8000,
  className = ''
}) => {
  const [queue, setQueue] = useState<AchievementType[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementType | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const acknowledgeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const announcerRef = useRef<HTMLDivElement | null>(null);
  
  // Update queue when achievements prop changes
  useEffect(() => {
    if (achievements.length > 0) {
      setQueue(prevQueue => [...prevQueue, ...achievements.filter(a => !prevQueue.includes(a))]);
    }
  }, [achievements]);
  
  // Process the queue
  useEffect(() => {
    if (queue.length > 0 && !currentAchievement && !isVisible) {
      const nextAchievement = queue[0];
      const newQueue = queue.slice(1);
      
      setCurrentAchievement(nextAchievement);
      setQueue(newQueue);
      setIsVisible(true);
      setIsAcknowledged(false);
      
      // Announce to screen readers
      if (announcerRef.current) {
        announcerRef.current.textContent = `Achievement unlocked: ${AchievementTitles[nextAchievement]}. ${AchievementDescriptions[nextAchievement]}`;
      }
      
      // Auto-hide after duration
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDuration);
    }
  }, [queue, currentAchievement, isVisible, autoHideDuration]);
  
  // Handle notification dismissal and cleanup
  useEffect(() => {
    if (!isVisible && currentAchievement && isAcknowledged) {
      // Small delay to allow exit animation to complete
      const cleanup = setTimeout(() => {
        if (onAcknowledge && currentAchievement) {
          onAcknowledge(currentAchievement);
        }
        setCurrentAchievement(null);
        setIsAcknowledged(false);
      }, 300);
      
      return () => clearTimeout(cleanup);
    }
  }, [isVisible, currentAchievement, isAcknowledged, onAcknowledge]);
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (acknowledgeTimerRef.current) {
        clearTimeout(acknowledgeTimerRef.current);
      }
    };
  }, []);
  
  // Handle user acknowledgment of notification
  const handleAcknowledge = () => {
    setIsVisible(false);
    setIsAcknowledged(true);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      handleAcknowledge();
    }
  };
  
  // Focus trap for accessibility
  useEffect(() => {
    const notificationElement = notificationRef.current;
    
    if (isVisible && notificationElement) {
      notificationElement.focus();
    }
    
    return () => {
      if (document.activeElement === notificationElement) {
        document.body.focus();
      }
    };
  }, [isVisible]);

  return (
    <>
      {/* Screen reader announcement */}
      <div 
        ref={announcerRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      
      {/* Visual notification */}
      <AnimatePresence>
        {isVisible && currentAchievement && (
          <motion.div
            ref={notificationRef}
            className={`achievement-notification ${className}`}
            tabIndex={0}
            role="dialog"
            aria-label={`Achievement unlocked: ${AchievementTitles[currentAchievement]}`}
            aria-modal="true"
            aria-describedby="achievement-description"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onKeyDown={handleKeyDown}
          >
            <div className="achievement-notification-content">
              <div className="achievement-icon">
                {AchievementIcons[currentAchievement]}
              </div>
              
              <div className="achievement-text">
                <div className="achievement-header">
                  <div className="achievement-badge">Achievement Unlocked!</div>
                  <h2 className="achievement-title">{AchievementTitles[currentAchievement]}</h2>
                </div>
                
                <p 
                  id="achievement-description"
                  className="achievement-description"
                >
                  {AchievementDescriptions[currentAchievement]}
                </p>
              </div>
              
              <button
                className="close-notification"
                aria-label="Close notification"
                onClick={handleAcknowledge}
              >
                ×
              </button>
            </div>
            
            <div className="progress-bar-container">
              <motion.div 
                className="progress-bar" 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: autoHideDuration / 1000, ease: "linear" }}
              />
            </div>
            
            <button
              className="acknowledge-button"
              onClick={handleAcknowledge}
              aria-label="Acknowledge achievement"
            >
              Acknowledge
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .achievement-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 350px;
          background: rgba(20, 20, 20, 0.9);
          border-radius: 10px;
          border: 1px solid rgba(255, 215, 0, 0.4);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 215, 0, 0.3);
          overflow: hidden;
          z-index: 1000;
          outline: none;
        }
        
        .achievement-notification:focus-visible {
          border-color: rgba(255, 215, 0, 0.8);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.5);
        }
        
        .achievement-notification-content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          position: relative;
        }
        
        .achievement-icon {
          flex-shrink: 0;
          width: 60px;
          height: 60px;
          background: rgba(20, 20, 20, 0.7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 215, 0, 0.6);
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }
        
        .achievement-text {
          flex: 1;
          min-width: 0;
        }
        
        .achievement-header {
          margin-bottom: 5px;
        }
        
        .achievement-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 3px 8px;
          background: rgba(255, 215, 0, 0.2);
          color: rgba(255, 215, 0, 0.9);
          border-radius: 4px;
          margin-bottom: 5px;
          letter-spacing: 0.5px;
        }
        
        .achievement-title {
          font-size: 16px;
          font-weight: 600;
          color: rgba(255, 215, 0, 0.9);
          margin: 0;
          margin-top: 2px;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }
        
        .achievement-description {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          line-height: 1.4;
        }
        
        .close-notification {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          background: rgba(20, 20, 20, 0.5);
          border: none;
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .close-notification:hover,
        .close-notification:focus-visible {
          background: rgba(30, 30, 30, 0.8);
          color: rgba(255, 255, 255, 0.9);
        }
        
        .progress-bar-container {
          width: 100%;
          height: 4px;
          background: rgba(40, 40, 40, 0.6);
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(to right, rgba(255, 215, 0, 0.7), rgba(255, 165, 0, 0.9));
          width: 100%;
        }
        
        .acknowledge-button {
          width: 100%;
          padding: 10px;
          background: rgba(255, 215, 0, 0.15);
          color: rgba(255, 215, 0, 0.9);
          border: none;
          border-top: 1px solid rgba(255, 215, 0, 0.2);
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .acknowledge-button:hover,
        .acknowledge-button:focus-visible {
          background: rgba(255, 215, 0, 0.25);
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        @media (max-width: 480px) {
          .achievement-notification {
            width: calc(100% - 40px);
            max-width: 350px;
          }
        }
      `}} />
    </>
  );
};

export default AccessibleAchievementNotification;