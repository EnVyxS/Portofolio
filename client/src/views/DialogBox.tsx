import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import DialogController from '../controllers/dialogController';
import HoverDialogController from '../controllers/hoverDialogController';
import { isDialogPersistent } from '../utils/geraltTones';

// Import fungsi hash untuk debugging
function generateSimpleHash(text: string): string {
  // Remove emotion tags for consistent hashing
  const cleanText = text.replace(/\[(.*?)\]/g, '').trim();
  
  let hash = 0;
  for (let i = 0; i < cleanText.length; i++) {
    hash = ((hash << 5) - hash) + cleanText.charCodeAt(i);
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
        // Cek apakah user sudah berinteraksi dengan hover dialog
        if (hoverDialogController.hasUserInteractedWithHover()) {
          // Jika user sudah berinteraksi dengan hover dialog, jangan tampilkan dialog utama lagi
          setIsDialogFinished(true);
          if (onDialogComplete) {
            onDialogComplete();
          }
          return;
        }
        
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

  // Effect untuk auto-continue ketika dialog selesai - dimodifikasi untuk berjalan untuk semua dialog
  useEffect(() => {
    if (isComplete && dialogSource === 'main') {
      // Clear any existing timer
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
      
      // Cek jika user sudah berinteraksi dengan hover dialog
      if (hoverDialogController.hasUserInteractedWithHover()) {
        return; // Jangan autoplay jika sudah ada interaksi hover
      }
      
      // Set new timer untuk auto-continue semua dialog
      const currentDialog = dialogController.getCurrentDialog();
      if (currentDialog) {
        // Periksa apakah dialog ini adalah dialog yang membutuhkan respons (persistent)
        const shouldPersist = isDialogPersistent(currentDialog.text);
        
        if (!shouldPersist) {
          // Untuk dialog yang tidak perlu persistent, auto-dismiss lebih cepat
          const textLength = currentDialog.text.length;
          const baseDelay = 2000; // 2 detik base delay
          const charDelay = 50; // 50ms per karakter
          const autoplayDelay = Math.min(baseDelay + (textLength * charDelay), 8000); // maksimal 8 detik
          
          console.log(`Autoplay untuk dialog ${currentDialog.id} dalam ${autoplayDelay}ms (non-persistent)`);
          
          autoPlayTimerRef.current = setTimeout(() => {
            handleContinue();
          }, autoplayDelay);
        } else {
          // Dialog yang membutuhkan respons (persistent) tidak auto-continue
          console.log(`Dialog ${currentDialog.id} adalah persistent, menunggu interaksi user`);
        }
      }
    } else if (isComplete && dialogSource === 'hover') {
      // Untuk hover dialog, periksa juga persistensi
      if (!isDialogPersistent(text)) {
        // Hover dialog yang tidak memerlukan respons seperti "Arghh... whatever you want. I'm done."
        const dismissDelay = 3000; // 3 detik untuk membaca pesan
        
        console.log(`Hover dialog akan dismiss dalam ${dismissDelay}ms (non-persistent)`);
        
        autoPlayTimerRef.current = setTimeout(() => {
          // Reset dialog
          hoverDialogController.resetHoverState();
          // Tandai dialog sebagai selesai untuk hilangkan kotak dialog
          setIsDialogFinished(true);
        }, dismissDelay);
      } else {
        console.log(`Hover dialog adalah persistent, menunggu interaksi user`);
      }
    }
    
    // Cleanup timer when unmounting or when dependencies change
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [isComplete, dialogSource, text, handleContinue, dialogController, hoverDialogController, setIsDialogFinished]);

  useEffect(() => {
    // Start the dialog sequence hanya jika user belum berinteraksi dengan hover dialog
    if (!hoverDialogController.hasUserInteractedWithHover()) {
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
    }
    
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
          background: rgba(20, 15, 12, 0.7); /* Darker background - DS style */
          border: 1px solid rgba(214, 168, 85, 0.2); /* Gold border like Dark Souls */
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
          border-radius: 0; /* Sharp edges like DS */
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
          background: rgba(30, 20, 10, 0.9); /* Dark background like DS */
          color: rgba(214, 168, 85, 0.9); /* Gold text like DS */
          padding: 0.5rem 1.2rem;
          border-radius: 0; /* Sharp edges */
          font-family: 'OptimusPrinceps', 'Trajan Pro', 'Cinzel', serif;
          font-weight: 400;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 2px; /* Wider spacing like DS */
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.4);
          border-top: 1px solid rgba(214, 168, 85, 0.3);
          border-left: 1px solid rgba(214, 168, 85, 0.3);
          border-right: 1px solid rgba(214, 168, 85, 0.3);
        }
        
        .dialog-text {
          color: rgba(241, 245, 249, 0.85); /* Slight opacity for Dark Souls feel */
          font-family: 'OptimusPrinceps', 'Trajan Pro', 'Cinzel', serif;
          font-size: clamp(1rem, 2.5vw, 1.1rem);
          line-height: 1.7;
          margin-bottom: 1rem;
          min-height: 5rem; /* Ensure consistent height */
          letter-spacing: 1px; /* Slightly wider spacing for better readability */
          text-shadow: 0 0 8px rgba(0, 0, 0, 0.5); /* Subtle shadow for depth */
          font-weight: 400;
        }
        
        .dialog-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .dialog-continue {
          background: transparent;
          border: none;
          color: rgba(214, 168, 85, 0.7); /* Gold text with opacity - DS style */
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-family: 'OptimusPrinceps', 'Trajan Pro', 'Cinzel', serif;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 0; /* Sharp edges like DS */
          transition: all 0.2s ease;
          letter-spacing: 1px;
        }
        
        .dialog-continue:hover {
          background: rgba(214, 168, 85, 0.1); /* Gold background with opacity */
          color: rgba(214, 168, 85, 0.95); 
          text-shadow: 0 0 4px rgba(214, 168, 85, 0.4);
        }
        
        /* Styling for hover dialog continue button - like main but Dark Souls style */
        .hover-continue {
          color: rgba(214, 168, 85, 0.7); /* Gold text with opacity - DS style */
          font-family: 'OptimusPrinceps', 'Trajan Pro', 'Cinzel', serif;
          letter-spacing: 1px;
        }
        
        .hover-continue:hover {
          background: rgba(214, 168, 85, 0.1); /* Gold background with opacity */
          color: rgba(214, 168, 85, 0.95);
          text-shadow: 0 0 4px rgba(214, 168, 85, 0.4);
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
        
        /* Styling for hover dialogs - match main dialog styles for Dark Souls theme */
        .hover-dialog {
          background: rgba(20, 15, 12, 0.7);
          border: 1px solid rgba(214, 168, 85, 0.2);
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
          border-radius: 0;
        }
        
        .hover-character {
          background: rgba(30, 20, 10, 0.9);
          color: rgba(214, 168, 85, 0.9);
          font-family: 'OptimusPrinceps', 'Trajan Pro', 'Cinzel', serif;
          font-weight: 400;
          letter-spacing: 2px;
          border-radius: 0;
          border-top: 1px solid rgba(214, 168, 85, 0.3);
          border-left: 1px solid rgba(214, 168, 85, 0.3);
          border-right: 1px solid rgba(214, 168, 85, 0.3);
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