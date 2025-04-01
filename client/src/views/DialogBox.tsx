import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DialogController from '../controllers/dialogController';
import HoverDialogController from '../controllers/hoverDialogController';

interface DialogBoxProps {
  onDialogComplete?: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ onDialogComplete }) => {
  const [text, setText] = useState<string>('');
  const [characterName, setCharacterName] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isDialogFinished, setIsDialogFinished] = useState<boolean>(false);
  const dialogController = DialogController.getInstance();
  const hoverDialogController = HoverDialogController.getInstance();

  useEffect(() => {
    // Start the dialog sequence
    dialogController.startDialog((text, complete) => {
      setText(text);
      setIsComplete(complete);
      
      // Get current dialog to display character name
      const currentDialog = dialogController.getCurrentDialog();
      if (currentDialog) {
        setCharacterName(currentDialog.character);
      }
      
      // Notify HoverDialogController about dialog completion status
      hoverDialogController.setDialogCompleted(complete);
    });
    
    // Cleanup on unmount
    return () => {
      dialogController.stopTyping();
    };
  }, [hoverDialogController]);

  const handleContinue = () => {
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
  };

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
      <div className="dialog-box">
        <div className="character-name">{characterName}</div>
        <div className="dialog-text">{text}</div>
        <div className="dialog-actions">
          <button 
            className="dialog-continue"
            onClick={handleContinue}
          >
            {isComplete ? 'Next' : 'Skip'}
            <span className="continue-indicator">{isComplete ? '▼' : '▶'}</span>
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