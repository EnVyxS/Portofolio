import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DialogController from '../controllers/dialogController';
import { Dialog } from '../models/dialogModel';

interface DialogBoxProps {
  onDialogComplete?: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ onDialogComplete }) => {
  const [currentText, setCurrentText] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [currentDialog, setCurrentDialog] = useState<Dialog | undefined>();
  const [emotionalTone, setEmotionalTone] = useState<string>('neutral');
  const dialogController = DialogController.getInstance();
  const boxRef = useRef<HTMLDivElement>(null);

  // Start dialog on mount
  useEffect(() => {
    startDialog();
  }, []);

  // Detect emotional tone from dialog text
  useEffect(() => {
    if (!currentDialog?.text) return;
    
    // Simple tone detection based on keywords in the dialog
    const text = currentDialog.text.toLowerCase();
    
    if (text.includes('danger') || text.includes('threat') || text.includes('beware') || text.includes('danger') || text.includes('fear')) {
      setEmotionalTone('danger');
    } else if (text.includes('sad') || text.includes('unfortunate') || text.includes('pity') || text.includes('regret')) {
      setEmotionalTone('sad');
    } else if (text.includes('happy') || text.includes('joy') || text.includes('celebrate') || text.includes('pleased')) {
      setEmotionalTone('happy');
    } else if (text.includes('wise') || text.includes('wisdom') || text.includes('ancient') || text.includes('knowledge')) {
      setEmotionalTone('wise');
    } else if (text.includes('quest') || text.includes('journey') || text.includes('adventure') || text.includes('path')) {
      setEmotionalTone('quest');
    } else {
      setEmotionalTone('neutral');
    }
  }, [currentDialog]);

  const startDialog = () => {
    dialogController.startDialog((text, complete) => {
      setCurrentText(text);
      setIsComplete(complete);
      
      // Update current dialog
      const dialog = dialogController.getCurrentDialog();
      if (dialog) {
        setCurrentDialog(dialog);
      }
      
      // If dialog is complete, notify parent component
      if (complete && onDialogComplete) {
        setTimeout(() => {
          onDialogComplete();
        }, 1000);
      }
    });
  };

  const handleNext = () => {
    if (dialogController.isCurrentlyTyping()) {
      // If currently typing, skip to the end of the current dialog
      dialogController.skipToFullText();
    } else {
      // If typing is complete, proceed to next dialog
      dialogController.nextDialog((text, complete) => {
        setCurrentText(text);
        setIsComplete(complete);
        
        // Update current dialog
        const dialog = dialogController.getCurrentDialog();
        if (dialog) {
          setCurrentDialog(dialog);
        }
        
        // If dialog is complete, notify parent component
        if (complete && onDialogComplete) {
          setTimeout(() => {
            onDialogComplete();
          }, 1000);
        }
      });
    }
  };

  // Map emotional tone to a background color/gradient
  const getEmotionalBackground = () => {
    switch (emotionalTone) {
      case 'danger':
        return 'linear-gradient(to bottom, rgba(30, 0, 0, 0.95), rgba(20, 0, 0, 0.95))';
      case 'sad':
        return 'linear-gradient(to bottom, rgba(0, 14, 36, 0.95), rgba(0, 10, 26, 0.95))';
      case 'happy':
        return 'linear-gradient(to bottom, rgba(25, 20, 0, 0.95), rgba(20, 15, 0, 0.95))';
      case 'wise':
        return 'linear-gradient(to bottom, rgba(20, 20, 30, 0.95), rgba(15, 15, 25, 0.95))';
      case 'quest':
        return 'linear-gradient(to bottom, rgba(15, 25, 15, 0.95), rgba(10, 20, 10, 0.95))';
      default:
        return 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(10, 15, 30, 0.95))';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="dialog-box-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '800px',
          zIndex: 50,
        }}
      >
        <div
          ref={boxRef}
          className="dialog-box"
          style={{
            background: getEmotionalBackground(),
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), 0 0 2px rgba(255, 165, 0, 0.3)',
            border: '1px solid rgba(255, 165, 0, 0.2)',
          }}
        >
          {/* Character name */}
          {currentDialog && (
            <div 
              className="character-name"
              style={{
                color: '#f97316',
                fontSize: '1.1rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: '"Cinzel", serif',
              }}
            >
              {currentDialog.character}
            </div>
          )}
          
          {/* Dialog text with typewriter effect */}
          <div 
            className="dialog-text"
            style={{
              color: '#f1f5f9',
              fontSize: '1rem',
              lineHeight: 1.6,
              minHeight: '5rem',
              fontFamily: 'Georgia, serif',
              whiteSpace: 'pre-line', // Respect line breaks in dialog
            }}
          >
            {currentText}
          </div>
          
          {/* Next button */}
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'absolute',
              bottom: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontFamily: '"Cinzel", serif',
              fontSize: '0.9rem',
              opacity: isComplete ? 1 : 0.7,
            }}
          >
            {dialogController.isCurrentlyTyping() ? (
              'Skip'
            ) : (
              'Continue'
            )} 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DialogBox;