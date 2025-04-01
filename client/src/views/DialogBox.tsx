import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import DialogController from '../controllers/dialogController';
import HoverDialogController from '../controllers/hoverDialogController';

// Import fungsi hash untuk debugging
function generateSimpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString();
}

interface DialogBoxProps {
  onDialogComplete?: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ onDialogComplete }) => {
  const [text, setText] = useState<string>('');
  const [characterName, setCharacterName] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isDialogFinished, setIsDialogFinished] = useState<boolean>(false);
  const [dialogSource, setDialogSource] = useState<'main' | 'hover'>('main');
  const dialogController = DialogController.getInstance();
  const hoverDialogController = HoverDialogController.getInstance();

  // Timer reference untuk auto-continue
  const autoPlayTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Handle Continue sebagai useCallback untuk dapat digunakan dalam useEffect
  const handleContinue = useCallback(() => {
    if (dialogSource === 'main') {
      if (!isComplete) {
        // Skip to the end of the current dialog
        dialogController.skipToFullText();
      } else {
        // Move to the next dialog
        dialogController.nextDialog((text, complete) => {
          setText(text);
          setIsComplete(complete);
          
          // Get current dialog to display character name
          const currentDialog = dialogController.getCurrentDialog();
          if (currentDialog) {
            setCharacterName(currentDialog.character);
            // Update hover dialog controller with completion status
            hoverDialogController.setDialogCompleted(complete);
          } else {
            // No more dialogs - we're finished
            setIsDialogFinished(true);
            // Set dialog as fully completed for hover interactions
            hoverDialogController.setDialogCompleted(true);
            if (onDialogComplete) {
              onDialogComplete();
            }
          }
        });
      }
    } else if (dialogSource === 'hover') {
      // For hover dialogs, immediately skip to full text
      if (!isComplete) {
        // Assume hover dialog controller is handling typing
        hoverDialogController.stopTyping();
        // Immediately show full text
        setIsComplete(true);
      }
    }
  }, [dialogSource, isComplete, dialogController, hoverDialogController, onDialogComplete, setText, setIsComplete, setIsDialogFinished, setCharacterName]);

  // Effect untuk auto-continue ketika dialog selesai
  useEffect(() => {
    if (isComplete && dialogSource === 'main') {
      // Clear any existing timer
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
      
      // Set new timer to auto-continue
      autoPlayTimerRef.current = setTimeout(() => {
        handleContinue();
      }, 2000); // Tunggu 2 detik sebelum melanjutkan
    }
    
    // Cleanup timer when unmounting or when dependencies change
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [isComplete, dialogSource, handleContinue]);

  useEffect(() => {
    // Start the dialog sequence
    dialogController.startDialog((text, complete) => {
      setText(text);
      setIsComplete(complete);
      setDialogSource('main');
      
      // Get current dialog to display character name
      const currentDialog = dialogController.getCurrentDialog();
      if (currentDialog) {
        setCharacterName(currentDialog.character);
      }
      
      // Notify HoverDialogController about dialog completion status
      hoverDialogController.setDialogCompleted(complete);
    });
    
    // Set hover dialog callback
    hoverDialogController.setHoverTextCallback((text, complete) => {
      setText(text);
      setIsComplete(complete);
      setDialogSource('hover');
      setCharacterName('GERALT'); // Semua dialog hover dari Geralt
    });
    
    // Cleanup on unmount
    return () => {
      dialogController.stopTyping();
      hoverDialogController.resetHoverState();
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, []);

  if (isDialogFinished) {
    return null; // Don't render anything when dialog is finished
  }

  return (
    <motion.div 
      className="dialog-box-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className={`dialog-box ${dialogSource === 'hover' ? 'hover-dialog' : ''}`}>
        <div className={`character-name ${dialogSource === 'hover' ? 'hover-character' : ''}`}>
          {characterName}
          {dialogSource === 'hover' && <span className="hover-indicator">⟳</span>}
        </div>
        <div className="dialog-text">{text}</div>
        <div className="dialog-actions">
          <button 
            className={`dialog-continue ${dialogSource === 'hover' ? 'hover-continue' : ''}`}
            onClick={handleContinue}
          >
            {isComplete ? (dialogSource === 'main' ? 'Next' : '') : 'Skip'}
            <span className="continue-indicator">{isComplete ? (dialogSource === 'main' ? '▼' : '') : '▶'}</span>
          </button>
        </div>
      </div>
      
      <style>{`
        .dialog-box-container {
          position: fixed;
          bottom: 2rem;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 50;
          pointer-events: none;
          padding: 0 1rem;
        }
        
        .dialog-box {
          background: rgba(15, 23, 42, 0.4); /* Lebih transparan untuk menyatu dengan background */
          border: 1px solid rgba(249, 115, 22, 0.3); /* Border lebih halus */
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
          border-radius: 6px; /* Border radius lebih kecil untuk gaya game */
          width: 100%;
          max-width: 800px;
          padding: 1.5rem;
          position: relative;
          pointer-events: auto;
          backdrop-filter: blur(5px); /* Blur lebih halus */
        }
        
        .character-name {
          position: absolute;
          top: -1.8rem;
          left: 0;
          background: rgba(249, 115, 22, 0.6); /* Lebih transparan untuk efek menyatu */
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 4px 4px 0 0;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2); /* Efek bayangan halus */
          border-top: 1px solid rgba(255, 165, 0, 0.3); /* Border halus atas */
        }
        
        .dialog-text {
          color: #f1f5f9;
          font-size: clamp(1rem, 2.5vw, 1.1rem);
          line-height: 1.6;
          margin-bottom: 1rem;
          min-height: 5rem; /* Ensure consistent height */
        }
        
        .dialog-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .dialog-continue {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .dialog-continue:hover {
          background: rgba(249, 115, 22, 0.1);
          color: #fff;
        }
        
        /* Styling for hover dialog continue button */
        .hover-continue {
          color: rgba(0, 191, 255, 0.8);
        }
        
        .hover-continue:hover {
          background: rgba(0, 191, 255, 0.1);
          color: #fff;
        }
        
        .continue-indicator {
          font-size: 0.8rem;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }
        
        /* Styling for hover dialogs */
        .hover-dialog {
          border: 1px solid rgba(0, 191, 255, 0.4); /* Different border color for hover dialog */
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.2);
        }
        
        .hover-character {
          background: rgba(0, 191, 255, 0.6); /* Different background for hover character name */
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .hover-indicator {
          font-size: 0.8rem;
          animation: spin 2s linear infinite;
          display: inline-block;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .dialog-box {
            padding: 1rem;
          }
          
          .dialog-text {
            min-height: 3.5rem;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default DialogBox;