import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import DialogController from '../controllers/dialogController';
import HoverDialogController from '../controllers/hoverDialogController';

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

// Helper untuk menentukan apakah dialog perlu persistensi (tetap terbuka)
function isDialogPersistent(text: string): boolean {
  // Dialog yang mengandung pertanyaan biasanya perlu jawaban
  if (text.includes('?')) {
    return true;
  }
  
  // Dialog yang mengandung kata kunci tertentu perlu persistensi
  const persistentKeywords = [
    "need", "want", "tell me", "let me know", "choose", "decide", 
    "check", "verify", "convinced", "Smart", "Fine", "satisfy"
  ];
  
  for (const keyword of persistentKeywords) {
    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      return true;
    }
  }
  
  // Default: jika mengandung < 20 karakter, biasanya pernyataan biasa
  return text.length > 20;
}

// Ekstrak emosi dari dialog text - format [EMOSI] di awal text
function extractEmotion(text: string): { emotion: string | null; cleanText: string } {
  const emotionMatch = text.match(/^\[(.*?)\]/);
  if (emotionMatch) {
    const emotion = emotionMatch[1].trim().toUpperCase();
    const cleanText = text.replace(emotionMatch[0], '').trim();
    return { emotion, cleanText };
  }
  return { emotion: null, cleanText: text };
}

interface DialogBoxProps {
  onDialogComplete?: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ onDialogComplete }) => {
  const [text, setText] = useState<string>('');
  const [characterName, setCharacterName] = useState<string>('');
  const [emotion, setEmotion] = useState<string | null>(null);
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

  // Variabel state autoplay
  const [autoPlayEnabled, setAutoPlayEnabled] = useState<boolean>(false);

  // Effect untuk auto-continue ketika dialog selesai - jika tombol autoplay aktif
  useEffect(() => {
    if (isComplete && dialogSource === 'main' && autoPlayEnabled) {
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
        // Periksa apakah dialog ini adalah dialog yang membutuhkan respons
        if (text.includes('?') || text.length < 20) {
          // Dialog yang kemungkinan membutuhkan respons (persistent) tidak auto-continue
          console.log(`Dialog ${currentDialog.id} adalah persistent, menunggu interaksi user`);
        } else {
          // Untuk dialog yang tidak perlu persistent, auto-dismiss
          const textLength = currentDialog.text.length;
          const baseDelay = 2000; // 2 detik base delay
          const charDelay = 50; // 50ms per karakter
          const autoplayDelay = Math.min(baseDelay + (textLength * charDelay), 8000); // maksimal 8 detik
          
          console.log(`Autoplay untuk dialog ${currentDialog.id} dalam ${autoplayDelay}ms (non-persistent)`);
          
          autoPlayTimerRef.current = setTimeout(() => {
            handleContinue();
          }, autoplayDelay);
        }
      }
    } else if (isComplete && dialogSource === 'hover') {
      // Untuk hover dialog, periksa juga persistensi
      if (!(text.includes('?') || text.includes('Check') || text.includes('convinc') || text.includes('need') || text.includes('want'))) {
        // Hover dialog yang tidak memerlukan respons
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
  }, [isComplete, dialogSource, text, handleContinue, dialogController, hoverDialogController, setIsDialogFinished, autoPlayEnabled]);

  useEffect(() => {
    // Start the dialog sequence hanya jika user belum berinteraksi dengan hover dialog
    if (!hoverDialogController.hasUserInteractedWithHover()) {
      dialogController.startDialog((text, complete) => {
        // Ekstrak emosi dari text jika ada
        const { emotion: extractedEmotion, cleanText } = extractEmotion(text);
        setText(cleanText);
        setEmotion(extractedEmotion);
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
      const { emotion: extractedEmotion, cleanText } = extractEmotion(text);
      setText(cleanText);
      setEmotion(extractedEmotion);
      setIsComplete(complete);
      setDialogSource('hover');
      setCharacterName('DIVA JUAN NUR TAQARRUB'); // Dialog hover dari DIVA (idle warnings juga)
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
        <div className={`character-name ${dialogSource === 'hover' ? 'hover-character' : ''} ${emotion ? 'with-emotion' : ''}`}>
          {characterName}
          {dialogSource === 'hover' && <span className="hover-indicator">⟳</span>}
          {emotion && <span className={`emotion-indicator ${emotion.toLowerCase()}`}>[{emotion}]</span>}
        </div>
        <div className="dialog-text">{text}</div>
        <div className="dialog-actions">
          <div className="dialog-controls">
            {isComplete ? (
              dialogSource === 'main' && (
                <button 
                  className={`autoplay-toggle ${autoPlayEnabled ? 'autoplay-active' : ''}`}
                  onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                  title={autoPlayEnabled ? "Disable autoplay" : "Enable autoplay"}
                >
                  {autoPlayEnabled ? "▶ Auto" : "▷ Auto"}
                </button>
              )
            ) : null}
            
            {isComplete ? (
              (text.includes('?') || text.includes('need') || text.includes('check')) ? (
                <div className="waiting-interaction-hint">Waiting for your action...</div>
              ) : (
                autoPlayEnabled && <div className="auto-continue-hint">Auto-continues in a moment...</div>
              )
            ) : null}
          </div>
          
          <button 
            className={`dialog-continue ${dialogSource === 'hover' ? 'hover-continue' : ''}`}
            onClick={handleContinue}
          >
            {isComplete ? (dialogSource === 'main' ? 'Next' : 'Continue') : 'Skip'}
            <span className="continue-indicator">{isComplete ? (dialogSource === 'main' ? '▼' : '▼') : '▶'}</span>
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
          background: rgba(15, 12, 10, 0.7); /* Warna gelap khas Souls */
          border: 1px solid rgba(150, 130, 100, 0.3); /* Border emas pudar */
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
          border-radius: 0; /* No rounded corners untuk Souls-like */
          width: 100%;
          max-width: 800px;
          padding: 1.8rem 2rem;
          position: relative;
          pointer-events: auto;
          backdrop-filter: blur(5px);
          /* Tambahkan dekorasi border tipis di dalamnya */
          box-sizing: border-box;
        }
        
        /* Tambahkan pseudo-element untuk inner border ornament */
        .dialog-box::before {
          content: '';
          position: absolute;
          top: 5px;
          left: 5px;
          right: 5px;
          bottom: 5px;
          border: 1px solid rgba(150, 130, 100, 0.15);
          pointer-events: none;
        }
        
        .character-name {
          position: absolute;
          top: -1.2rem;
          left: 1rem;
          background: rgba(30, 25, 20, 0.9); /* Warna gelap */
          color: #d4c9a8; /* Warna emas redup */
          padding: 0.35rem 1.2rem;
          border-radius: 0; /* No rounded corners */
          font-weight: 500;
          font-size: 0.9rem;
          font-family: 'Trajan Pro', 'Cinzel', 'Garamond', serif;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(150, 130, 100, 0.4);
        }
        
        .dialog-text {
          color: #e8e0cf; /* Warna text emas pucat */
          font-family: 'Garamond', 'Times New Roman', serif; /* Font serif untuk dialog */
          font-size: clamp(1rem, 2.5vw, 1.1rem);
          line-height: 1.7;
          margin-bottom: 1.2rem;
          min-height: 5rem; /* Ensure consistent height */
          text-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
          letter-spacing: 0.3px;
        }
        
        .dialog-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          border-top: 1px solid rgba(150, 130, 100, 0.15);
          padding-top: 0.6rem;
          margin-top: 0.5rem;
        }
        
        .dialog-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .autoplay-toggle {
          background: transparent;
          border: 1px solid rgba(150, 130, 100, 0.4);
          color: rgba(180, 160, 120, 0.7);
          font-family: 'Trajan Pro', 'Cinzel', 'Garamond', serif;
          font-size: 0.75rem;
          padding: 0.25rem 0.6rem;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        
        .autoplay-toggle:hover {
          background: rgba(150, 130, 100, 0.15);
          color: #e8debc;
          text-shadow: 0 0 4px rgba(150, 130, 100, 0.6);
        }
        
        .autoplay-active {
          background: rgba(150, 130, 100, 0.25);
          color: #e8debc;
          text-shadow: 0 0 4px rgba(150, 130, 100, 0.6);
        }
        
        .auto-continue-hint {
          font-size: 0.8rem;
          color: rgba(180, 160, 120, 0.5);
          font-style: italic;
          animation: pulse 2s infinite;
          padding-left: 0.5rem;
        }
        
        .waiting-interaction-hint {
          font-size: 0.8rem;
          color: rgba(200, 180, 100, 0.7);
          font-weight: bold;
          animation: pulse 1.5s infinite;
          padding-left: 0.5rem;
        }
        
        /* Ornamen dekoratif untuk tombol continue */
        .dialog-actions::before {
          content: '';
          position: absolute;
          top: -2px;
          right: 45px;
          width: 40px;
          height: 3px;
          background: rgba(150, 130, 100, 0.2);
        }
        
        .dialog-continue {
          background: transparent;
          border: none;
          color: rgba(200, 180, 140, 0.7); /* Warna emas pudar */
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.9rem;
          font-family: 'Trajan Pro', 'Cinzel', 'Garamond', serif;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          padding: 0.4rem 0.8rem;
          border-radius: 0; /* No rounded corners */
          transition: all 0.2s ease;
        }
        
        .dialog-continue:hover {
          background: rgba(150, 130, 100, 0.15); /* Background emas saat hover */
          color: #e8debc; /* Warna emas yang lebih terang */
          text-shadow: 0 0 4px rgba(150, 130, 100, 0.6); /* Efek glow saat hover */
        }
        
        /* Styling for hover dialog continue button */
        .hover-continue {
          color: rgba(200, 180, 140, 0.7); /* Sama dengan warna dialog utama */
          font-family: 'Trajan Pro', 'Cinzel', 'Garamond', serif;
        }
        
        .hover-continue:hover {
          background: rgba(150, 130, 100, 0.15); /* Warna emas yang lebih gelap */
          color: #e8debc;
          text-shadow: 0 0 4px rgba(150, 130, 100, 0.6);
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
        
        /* Styling for hover dialogs - konsisten dengan tema */
        .hover-dialog {
          background: rgba(15, 12, 10, 0.7); /* Konsisten dengan dialog utama */
          border: 1px solid rgba(150, 130, 100, 0.3);
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
        }
        
        .hover-character {
          background: rgba(30, 25, 20, 0.9); /* Konsisten dengan dialog utama */
          color: #d4c9a8;
          font-family: 'Trajan Pro', 'Cinzel', 'Garamond', serif;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(150, 130, 100, 0.4);
        }
        
        .hover-indicator {
          font-size: 0.8rem;
          animation: spin 2s linear infinite;
          display: inline-block;
        }
        
        .with-emotion {
          min-width: 200px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-right: 0.8rem;
        }
        
        .emotion-indicator {
          font-size: 0.7rem;
          font-weight: normal;
          font-style: italic;
          margin-left: 0.5rem;
          letter-spacing: 0.5px;
          color: rgba(200, 180, 140, 0.8);
          text-transform: none;
        }
        
        /* Styling untuk berbagai emosi */
        .emotion-indicator.angry {
          color: rgba(220, 100, 80, 0.9);
        }
        
        .emotion-indicator.worried,
        .emotion-indicator.concerned {
          color: rgba(200, 160, 60, 0.9);
        }
        
        .emotion-indicator.sad,
        .emotion-indicator.melancholic {
          color: rgba(100, 150, 220, 0.9);
        }
        
        .emotion-indicator.annoyed,
        .emotion-indicator.irritated {
          color: rgba(220, 120, 60, 0.9);
        }
        
        .emotion-indicator.neutral,
        .emotion-indicator.calm {
          color: rgba(180, 180, 180, 0.9);
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