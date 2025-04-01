import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DialogController from '../controllers/dialogController';
import DialogModel, { Dialog } from '../models/dialogModel';

interface Message {
  id: number;
  character: string;
  text: string;
  voiceId?: string;
}

interface DialogBoxProps {
  onDialogComplete?: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ onDialogComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [isDialogFinished, setIsDialogFinished] = useState<boolean>(false);
  const dialogController = DialogController.getInstance();
  const dialogModel = DialogModel.getInstance();

  // Load all dialogs on mount
  useEffect(() => {
    const allDialogs = dialogModel.getAllDialogs();
    setMessages(allDialogs.map(dialog => ({
      id: dialog.id,
      character: dialog.character,
      text: dialog.text,
      voiceId: dialog.voiceId
    })));
    
    // Start typing the first message
    if (allDialogs.length > 0) {
      startTyping(allDialogs[0]);
    }
    
    // Cleanup on unmount
    return () => {
      dialogController.stopTyping();
    };
  }, []);

  // Function to start typing animation for a dialog
  const startTyping = (dialog: Dialog) => {
    setIsTyping(true);
    dialogController.startDialog((text, complete) => {
      setDisplayedText(text);
      if (complete) {
        setIsTyping(false);
      }
    });
  };

  const handleContinue = () => {
    if (isTyping) {
      // Skip to the end of the current message
      dialogController.skipToFullText();
      setIsTyping(false);
      return;
    }
    
    // Move to the next message
    const nextIndex = currentMessageIndex + 1;
    if (nextIndex < messages.length) {
      setCurrentMessageIndex(nextIndex);
      // Get the next dialog from model
      const nextDialog = dialogModel.nextDialog();
      if (nextDialog) {
        startTyping(nextDialog);
      }
    } else {
      // No more messages - we're finished
      setIsDialogFinished(true);
      if (onDialogComplete) {
        onDialogComplete();
      }
    }
  };

  if (isDialogFinished || messages.length === 0) {
    return null; // Don't render anything when dialog is finished or no messages
  }

  const currentMessage = messages[currentMessageIndex];

  return (
    <motion.div 
      className="dialog-box-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="dialog-box">
        <div className="character-name">{currentMessage.character}</div>
        <div className="dialog-text">{displayedText}</div>
        <div className="dialog-actions">
          <button 
            className="dialog-continue"
            onClick={handleContinue}
          >
            {isTyping ? 'Skip' : 'Next'}
            <span className="continue-indicator">{isTyping ? '▶' : '▼'}</span>
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
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(249, 115, 22, 0.6);
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          width: 100%;
          max-width: 800px;
          padding: 1.5rem;
          position: relative;
          pointer-events: auto;
          backdrop-filter: blur(10px);
        }
        
        .character-name {
          position: absolute;
          top: -1.8rem;
          left: 0;
          background: rgba(249, 115, 22, 0.9);
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 4px 4px 0 0;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
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