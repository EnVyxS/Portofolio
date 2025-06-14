import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock } from "react-icons/fa";
import IdleTimeoutController from "../controllers/idleTimeoutController";
import DialogController from "../controllers/dialogController";
import HoverDialogController from "../controllers/hoverDialogController";

const IdleTimer: React.FC = () => {
  const [timerInfo, setTimerInfo] = useState({
    timeRemaining: 0,
    totalDuration: 0,
    type: "Tidak ada timer aktif"
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogActive, setIsDialogActive] = useState(false);
  
  // Update timer dan status dialog setiap 1 detik
  useEffect(() => {
    const updateTimer = () => {
      try {
        const idleController = IdleTimeoutController.getInstance();
        const info = idleController.getRemainingTime();
        setTimerInfo(info);
        
        // Cek apakah ada dialog aktif
        const dialogController = DialogController.getInstance();
        const hoverDialogController = HoverDialogController.getInstance();
        
        // Dialog aktif jika ada dialog utama atau hover dialog yang sedang berjalan
        const isMainDialogActive = dialogController.isTyping || dialogController.getCurrentDialog() !== null;
        const isHoverDialogActive = hoverDialogController.hasUserInteractedWithHover();
        const hasActiveDialog = isMainDialogActive || isHoverDialogActive;
        
        setIsDialogActive(hasActiveDialog);
        
        // Tampilkan timer hanya jika ada waktu tersisa DAN tidak ada dialog aktif
        setIsVisible(info.timeRemaining > 0 && !hasActiveDialog);
      } catch (e) {
        console.error("Error updating timer:", e);
        setIsVisible(false);
      }
    };
    
    // Update pertama kali
    updateTimer();
    
    // Buat interval untuk update setiap 1 detik
    const intervalId = setInterval(updateTimer, 1000);
    
    // Cleanup
    return () => clearInterval(intervalId);
  }, []);
  
  // Format waktu dalam format MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Hitung persentase waktu tersisa
  const calculatePercentage = () => {
    if (timerInfo.totalDuration === 0) return 0;
    return (timerInfo.timeRemaining / timerInfo.totalDuration) * 100;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="idle-timer-container"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        style={{ cursor: 'pointer' }}
      >
        <div className="idle-timer-content">
          <div className="timer-icon">
            <FaClock size={16} />
          </div>
          
          {isExpanded ? (
            <div className="timer-details">
              <div className="timer-type">{timerInfo.type}</div>
              <div className="timer-time">{formatTime(timerInfo.timeRemaining)}</div>
              <div className="timer-progress-container">
                <div 
                  className="timer-progress-bar"
                  style={{
                    width: `${calculatePercentage()}%`,
                    transition: 'width 1s linear'
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="timer-time-compact">{formatTime(timerInfo.timeRemaining)}</div>
          )}
        </div>

        <style>{`
          .idle-timer-container {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: rgba(15, 12, 10, 0.9);
            border: 1px solid rgba(150, 130, 100, 0.4);
            border-radius: 8px;
            padding: 1rem;
            min-width: 120px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(5px);
            z-index: 40;
            font-family: 'Trajan Pro', 'Cinzel', 'Garamond', serif;
            color: #d4c9a8;
          }

          .idle-timer-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .timer-icon {
            color: rgba(255, 235, 190, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .timer-details {
            flex: 1;
            min-width: 0;
          }

          .timer-type {
            font-size: 0.7rem;
            color: rgba(210, 190, 150, 0.7);
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .timer-time, .timer-time-compact {
            font-size: 0.9rem;
            font-weight: 600;
            color: rgba(255, 235, 190, 0.9);
            text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
          }

          .timer-time-compact {
            font-size: 0.8rem;
          }

          .timer-progress-container {
            width: 100%;
            height: 4px;
            background: rgba(150, 130, 100, 0.2);
            border-radius: 2px;
            margin-top: 0.5rem;
            overflow: hidden;
          }

          .timer-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, 
              rgba(255, 235, 190, 0.8) 0%, 
              rgba(255, 215, 150, 0.9) 50%, 
              rgba(255, 200, 120, 1) 100%);
            border-radius: 2px;
            box-shadow: 0 0 8px rgba(255, 220, 150, 0.3);
          }

          .idle-timer-container:hover {
            border-color: rgba(180, 160, 120, 0.6);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
          }

          .idle-timer-container:hover .timer-icon {
            color: rgba(255, 235, 190, 1);
          }

          @media (max-width: 768px) {
            .idle-timer-container {
              bottom: 1rem;
              right: 1rem;
              padding: 0.75rem;
              min-width: 100px;
            }
            
            .timer-time, .timer-time-compact {
              font-size: 0.75rem;
            }
            
            .timer-type {
              font-size: 0.6rem;
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default IdleTimer;