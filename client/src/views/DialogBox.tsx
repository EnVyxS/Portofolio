import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DialogController from '../controllers/dialogController';

interface DialogBoxProps {
  onDialogComplete?: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ onDialogComplete }) => {
  const [dialogText, setDialogText] = useState('');
  const [isDialogComplete, setIsDialogComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const dialogController = DialogController.getInstance();

  useEffect(() => {
    // Start the initial dialog when component mounts
    dialogController.startDialog((text, isComplete) => {
      setDialogText(text);
      setIsDialogComplete(isComplete);
      
      if (isComplete && onDialogComplete) {
        onDialogComplete();
      }
    });
    
    // Clean up
    return () => {
      dialogController.stopTyping();
    };
  }, [onDialogComplete]);

  const handleNextDialog = () => {
    if (dialogController.isCurrentlyTyping()) {
      // If currently typing, skip to full text
      dialogController.skipToFullText();
    } else {
      // Advance to next dialog
      dialogController.nextDialog((text, isComplete) => {
        setDialogText(text);
        setIsDialogComplete(isComplete);
        
        if (isComplete && onDialogComplete) {
          onDialogComplete();
        }
      });
    }
  };

  const toggleDialogVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <motion.div 
      className="dialog-box"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dialog-header">
        <span className="dialog-title">Geralt of Rivia</span>
        <button 
          className="dialog-toggle" 
          onClick={toggleDialogVisibility}
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="dialog-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="dialog-text">
              {dialogText}
              <span className={`dialog-cursor ${!dialogController.isCurrentlyTyping() ? 'hidden' : 'blink'}`}>_</span>
            </p>
            
            <div className="dialog-controls">
              <button 
                className="dialog-next-btn"
                onClick={handleNextDialog}
              >
                {dialogController.isCurrentlyTyping() ? 'Skip' : 'Next ▶'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="dialog-arrow"></div>
      
      <style>{`
        .dialog-box {
          position: absolute;
          top: 8%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          width: 90%;
          max-width: 500px;
        }
        
        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: rgba(30, 30, 35, 0.9);
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          padding: 0.5rem 1rem;
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-bottom: none;
        }
        
        .dialog-title {
          font-family: 'VT323', monospace;
          font-size: 1.1rem;
          color: #f97316;
          text-shadow: 0 0 5px rgba(249, 115, 22, 0.5);
        }
        
        .dialog-toggle {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .dialog-toggle:hover {
          color: #f97316;
        }
        
        .dialog-content {
          background-color: rgba(40, 40, 45, 0.85);
          backdrop-filter: blur(4px);
          padding: 1rem;
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        
        .dialog-text {
          font-family: 'VT323', monospace;
          font-size: clamp(1rem, 3vw, 1.2rem);
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 1rem 0;
          line-height: 1.4;
          letter-spacing: 0.5px;
          min-height: 60px;
        }
        
        .dialog-cursor {
          display: inline-block;
          margin-left: 4px;
          font-family: 'VT323', monospace;
          font-size: clamp(1rem, 3vw, 1.2rem);
          color: rgba(255, 255, 255, 0.9);
        }
        
        .blink {
          animation: blink 0.8s infinite;
        }
        
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        
        .hidden {
          opacity: 0;
        }
        
        .dialog-controls {
          display: flex;
          justify-content: flex-end;
        }
        
        .dialog-next-btn {
          background-color: rgba(249, 115, 22, 0.2);
          border: 1px solid rgba(249, 115, 22, 0.4);
          color: rgba(255, 255, 255, 0.9);
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-family: 'VT323', monospace;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .dialog-next-btn:hover {
          background-color: rgba(249, 115, 22, 0.4);
          border-color: rgba(249, 115, 22, 0.6);
        }
        
        .dialog-arrow {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid rgba(40, 40, 45, 0.85);
          margin: 0 auto;
          display: ${isVisible ? 'block' : 'none'};
        }
      `}</style>
    </motion.div>
  );
};

export default DialogBox;