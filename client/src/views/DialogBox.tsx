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

  // Effect untuk auto-continue ketika dialog selesai - dimodifikasi untuk hanya menampilkan sekali
  useEffect(() => {
    if (isComplete && dialogSource === 'main') {
      // Clear any existing timer
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
      
      // Set new timer to auto-continue - hanya untuk dialog pertama
      const currentDialog = dialogController.getCurrentDialog();
      if (currentDialog && currentDialog.id < 2) { // Hanya lanjut jika dialog saat ini adalah yang pertama
        autoPlayTimerRef.current = setTimeout(() => {
          handleContinue();
        }, 3500); // Waktu lebih lama (3.5 detik) untuk membaca
      }
    }
    
    // Cleanup timer when unmounting or when dependencies change
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [isComplete, dialogSource, handleContinue, dialogController]);

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
      setCharacterName('Diva Juan Nur Taqarrub'); // Semua dialog hover dari karakter utama
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
          background: rgba(25, 15, 10, 0.5); /* Background lebih gelap dengan sentuhan merah/coklat */
          border: 1px solid rgba(255, 140, 0, 0.3); /* Border oranye (warna api) */
          box-shadow: 0 0 15px rgba(180, 70, 0, 0.2);
          border-radius: 6px;
          width: 100%;
          max-width: 800px;
          padding: 1.5rem;
          position: relative;
          pointer-events: auto;
          backdrop-filter: blur(5px);
        }
        
        .character-name {
          position: absolute;
          top: -1.8rem;
          left: 0;
          background: rgba(180, 60, 0, 0.8); /* Oranye kemerahan untuk karakter */
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 4px 4px 0 0;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 -2px 10px rgba(180, 60, 0, 0.3); /* Efek bayangan api */
          border-top: 1px solid rgba(255, 140, 0, 0.4); /* Border api */
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
          color: rgba(255, 235, 205, 0.8); /* Warna teks lebih kecoklatan untuk tema api */
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
          background: rgba(255, 140, 0, 0.15); /* Background orange saat hover */
          color: #fff;
          text-shadow: 0 0 4px rgba(255, 165, 0, 0.6); /* Efek glow saat hover */
        }
        
        /* Styling for hover dialog continue button */
        .hover-continue {
          color: rgba(255, 165, 0, 0.8); /* Oranye untuk tombol hover dialog */
        }
        
        .hover-continue:hover {
          background: rgba(255, 140, 0, 0.15);
          color: #fff;
          text-shadow: 0 0 4px rgba(255, 165, 0, 0.6);
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
          border: 1px solid rgba(255, 165, 0, 0.4); /* Border oranye untuk hover dialog */
          box-shadow: 0 0 15px rgba(255, 140, 0, 0.25);
        }
        
        .hover-character {
          background: rgba(255, 140, 0, 0.7); /* Background oranye api untuk nama karakter hover */
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