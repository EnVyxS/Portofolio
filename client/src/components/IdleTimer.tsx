import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock } from "react-icons/fa";
import IdleTimeoutController from "../controllers/idleTimeoutController";
import DialogController from "../controllers/dialogController";

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
        
        // Dialog aktif jika main dialog sedang typing ATAU mainDialog flag aktif
        const isMainDialogActive = dialogController.isCurrentlyTyping() || dialogController.isMainDialogActive();
        
        // Timer should be hidden when main dialog is active
        const hasActiveDialog = isMainDialogActive;
        
        setIsDialogActive(hasActiveDialog);
        
        // Hide timer from user - always set to false
        const shouldShow = false;
        console.log(`[IdleTimer] Timer visibility check - timeRemaining: ${info.timeRemaining}, hasActiveDialog: ${hasActiveDialog}, shouldShow: ${shouldShow}`);
        setIsVisible(shouldShow);
      } catch (e) {
        console.error("Error updating timer:", e);
        setIsVisible(false);
      }
    };

    // Update immediately
    updateTimer();
    
    // Set up interval
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (timerInfo.totalDuration === 0) return 0;
    return ((timerInfo.totalDuration - timerInfo.timeRemaining) / timerInfo.totalDuration) * 100;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50"
      >
        <motion.div
          className={`bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 ${
            isExpanded ? 'p-4' : 'p-2'
          } cursor-pointer transition-all duration-300`}
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center space-x-2">
            <FaClock className="text-orange-500" />
            <span className="font-mono text-sm">
              {formatTime(timerInfo.timeRemaining)}
            </span>
          </div>
          
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-2"
            >
              <div className="text-xs text-gray-400">
                Type: {timerInfo.type}
              </div>
              
              {/* Progress bar */}
              <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-orange-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${getProgress()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="text-xs text-gray-400">
                Total: {formatTime(timerInfo.totalDuration)}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IdleTimer;