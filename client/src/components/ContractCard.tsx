import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaScroll, FaSearchPlus, FaSearchMinus, FaArrowLeft, FaArrowRight, FaFilePdf } from 'react-icons/fa';
import DialogController from '../controllers/dialogController';
import { useAudio } from '../context/AudioManager';

// Import swipe sound
import swipeSoundSrc from '@assets/Screen swipe sound effect (mp3cut.net).m4a';

// Respon variasi saat kartu diklik
const CONTRACT_RESPONSES = [
  "Didn't lie. Never have, never will. Maybe next time, use your damn brain before throwing accusations.",
  "Not a liar. Never was. Maybe next time, don't waste my time with your doubts.",
  "Told you the truth. Always do. Maybe next time, keep your mouth shut until you know better.",
  "Didn't lie. Don't need to. Maybe next time, think twice before making a fool of yourself.",
  "Believe me now? Thought so. Next time, don't question what you don't understand."
];

// Import gambar sertifikat
import ijazah from '@assets/Ijazah.jpg';
import transkrip1 from '@assets/Transkrip Nilai_page-0001.jpg';
import transkrip2 from '@assets/Transkrip Nilai_page-0002.jpg';
import universitas from '@assets/111202012560mhs.dinus.ac.id_page-0001.jpg';
import bnsp1 from '@assets/BNSP_page-0001.jpg';
import bnsp2 from '@assets/BNSP_page-0002.jpg';
import kampusMerdeka from '@assets/Backend Java MSIB_page-0001.jpg';
import studentReport1 from '@assets/KM 4_SR_BEJ2302KM4009_DIVA JUAN NUR TAQARRUB_2_page-0001.jpg';
import studentReport2 from '@assets/KM 4_SR_BEJ2302KM4009_DIVA JUAN NUR TAQARRUB_2_page-0002.jpg';

// Path ke file dokumen
const CONTRACT_IMAGES = [
  ijazah,
  transkrip1,
  transkrip2,
  universitas,
  bnsp1,
  bnsp2,
  kampusMerdeka,
  studentReport1,
  studentReport2,
];

// Untuk menampilkan nama file yang lebih pendek
const IMAGE_TITLES = [
  'Ijazah',
  'Transkrip Nilai - Page 1',
  'Transkrip Nilai - Page 2',
  'Universitas Dian Nuswantoro',
  'Sertifikat Kompetensi BNSP',
  'Daftar Unit Kompetensi BNSP',
  'Sertifikat Kampus Merdeka',
  'Student Report - Page 1',
  'Student Report - Page 2',
];

// Mendapatkan nama file yang lebih pendek untuk ditampilkan
const getDocumentName = (path: string) => {
  const fileName = path.split('/').pop() || '';
  // Jika filename terlalu panjang, potong
  return fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
};

const ContractCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dialogController = DialogController.getInstance();
  const { setVolume, currentVolume } = useAudio();
  
  // Audio reference for swipe sound
  const swipeSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize swipe sound audio on component mount
  useEffect(() => {
    swipeSoundRef.current = new Audio(swipeSoundSrc);
    swipeSoundRef.current.volume = 0.3; // Set appropriate volume
    
    // Clean up
    return () => {
      if (swipeSoundRef.current) {
        swipeSoundRef.current.pause();
        swipeSoundRef.current = null;
      }
    };
  }, []);
  
  // Play swipe sound function
  const playSwipeSound = () => {
    try {
      if (swipeSoundRef.current) {
        swipeSoundRef.current.currentTime = 0; // Reset to start
        swipeSoundRef.current.play().catch(e => console.error("Error playing swipe sound:", e));
      }
    } catch (err) {
      console.error("Error playing swipe sound:", err);
    }
  };
  
  // Animasi transisi seperti buku untuk swipe next
  const [pageDirection, setPageDirection] = useState<'next' | 'prev' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Track original volume to restore later
  const [originalVolume, setOriginalVolume] = useState<number | null>(null);
  
  // Adjust volume when opening/closing contract
  useEffect(() => {
    if (isOpen && originalVolume === null) {
      // Store current volume before lowering it
      setOriginalVolume(currentVolume);
      
      // Lower volume to 70% of original (still audible but lower)
      setVolume(currentVolume * 0.7);
    } else if (!isOpen && originalVolume !== null) {
      // Restore original volume when closing
      setVolume(originalVolume);
      // Reset original volume state
      setOriginalVolume(null);
    }
  }, [isOpen, currentVolume]);

  const handleContractClick = () => {
    if (!isOpen) {
      // Jika kontrak belum terbuka, maka buka dan munculkan dialog random
      const randomIndex = Math.floor(Math.random() * CONTRACT_RESPONSES.length);
      const response = CONTRACT_RESPONSES[randomIndex];
      
      dialogController.showCustomDialog(response, () => {});
      
      setIsOpen(true);
    }
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev + 0.2, 3)); // Maksimal zoom 3x
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.max(prev - 0.2, 0.5)); // Minimal zoom 0.5x
  };

  const handleNextDoc = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < CONTRACT_IMAGES.length - 1 && !isAnimating) {
      // Mulai animasi dan putar suara
      setIsAnimating(true);
      setPageDirection('next');
      playSwipeSound();
      
      // Tunggu animasi selesai sebelum update index
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setScale(1); // Reset zoom
        
        // Beri jeda sedikit sebelum mengizinkan animasi lagi
        setTimeout(() => {
          setIsAnimating(false);
          setPageDirection(null);
        }, 100);
      }, 200); // Tunggu 200ms untuk animasi flip
    }
  };

  const handlePrevDoc = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0 && !isAnimating) {
      // Mulai animasi dan putar suara
      setIsAnimating(true);
      setPageDirection('prev');
      playSwipeSound();
      
      // Tunggu animasi selesai sebelum update index
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setScale(1); // Reset zoom
        
        // Beri jeda sedikit sebelum mengizinkan animasi lagi
        setTimeout(() => {
          setIsAnimating(false);
          setPageDirection(null);
        }, 100);
      }, 200); // Tunggu 200ms untuk animasi flip
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setCurrentIndex(0);
    setScale(1);
  };

  const openImageInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(CONTRACT_IMAGES[currentIndex], '_blank');
  };

  return (
    <>
      {/* Kontrak Card tersembunyi di sisi kiri layar */}
      <motion.div 
        className="contract-card"
        initial={{ x: -10 }}
        animate={{ x: isOpen ? -120 : -10 }}
        onClick={handleContractClick}
      >
        <FaScroll size={24} />
        <span className="contract-label">CONTRACT</span>
      </motion.div>

      {/* Overlay Modal untuk menampilkan dokumen */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="contract-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div 
              className="contract-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="contract-controls">
                <button onClick={handleClose} className="control-button close-button">×</button>
                <div className="zoom-controls">
                  <button onClick={handleZoomIn} className="control-button"><FaSearchPlus /></button>
                  <button onClick={handleZoomOut} className="control-button"><FaSearchMinus /></button>
                </div>
                <div className="navigation-controls">
                  <button 
                    onClick={handlePrevDoc} 
                    className={`control-button ${currentIndex === 0 ? 'disabled' : ''}`}
                    disabled={currentIndex === 0}
                  >
                    <FaArrowLeft />
                  </button>
                  <span className="page-indicator">{currentIndex + 1}/{CONTRACT_IMAGES.length}</span>
                  <button 
                    onClick={handleNextDoc} 
                    className={`control-button ${currentIndex === CONTRACT_IMAGES.length - 1 ? 'disabled' : ''}`}
                    disabled={currentIndex === CONTRACT_IMAGES.length - 1}
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </div>
              
              <div className="contract-document-container">
                <div 
                  className={`document-content ${pageDirection ? `page-flip-${pageDirection}` : ''}`} 
                  style={{ transform: `scale(${scale})` }}
                >
                  <div className="document-header">
                    <h3 className="document-title">{IMAGE_TITLES[currentIndex]}</h3>
                  </div>
                  <div className="book-container">
                    <div className={`page-shadow ${pageDirection ? 'active' : ''}`}></div>
                    <img 
                      src={CONTRACT_IMAGES[currentIndex]} 
                      alt={IMAGE_TITLES[currentIndex]} 
                      className="document-image"
                      onDoubleClick={openImageInNewTab}
                      title="Double-click to open in new tab"
                    />
                    <div className={`page-fold ${pageDirection ? 'active' : ''} ${pageDirection || ''}`}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .contract-card {
          position: fixed;
          left: 0;
          top: 20px;
          background: rgba(30, 25, 20, 0.9);
          color: #d4c9a8;
          padding: 15px 10px 15px 15px;
          border-radius: 0 5px 5px 0;
          border: 1px solid rgba(150, 130, 100, 0.4);
          display: flex;
          flex-direction: row;
          align-items: center;
          cursor: pointer;
          z-index: 40;
          transition: all 0.3s ease;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .contract-card:hover {
          left: 5px;
          background: rgba(40, 35, 30, 0.95);
          border-color: rgba(180, 160, 120, 0.6);
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.4), 0 0 5px rgba(255, 220, 150, 0.2);
        }

        .contract-label {
          margin-left: 8px;
          font-family: 'Trajan Pro', 'Cinzel', serif;
          font-size: 0.7rem;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .contract-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          backdrop-filter: blur(3px);
        }

        .contract-modal {
          background: rgba(20, 16, 14, 0.95);
          border: 1px solid rgba(150, 130, 100, 0.3);
          border-radius: 2px;
          width: 90%;
          max-width: 900px;
          height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
          position: relative;
        }

        .contract-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: rgba(30, 25, 20, 0.9);
          border-bottom: 1px solid rgba(150, 130, 100, 0.2);
          flex-wrap: wrap;
        }

        .zoom-controls, .navigation-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .control-button {
          background: rgba(40, 35, 30, 0.9);
          color: #d4c9a8;
          border: 1px solid rgba(150, 130, 100, 0.3);
          border-radius: 2px;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .control-button:hover {
          background: rgba(50, 45, 40, 0.95);
          border-color: rgba(180, 160, 120, 0.5);
          color: #f0eadc;
        }

        .control-button.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .close-button {
          font-size: 24px;
          font-weight: bold;
        }

        .contract-document-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          background: rgba(20, 16, 14, 0.9);
          position: relative;
        }

        .document-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: transform 0.3s ease;
          transform-origin: center;
          width: 100%;
          height: 100%;
        }
        
        .document-header {
          margin-bottom: 15px;
          text-align: center;
        }
        
        .document-title {
          font-family: 'Trajan Pro', 'Cinzel', serif;
          color: #d4c9a8;
          font-size: 1.2rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          letter-spacing: 1px;
          margin: 0;
        }

        .document-image {
          max-width: 90%;
          max-height: 75%;
          object-fit: contain;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(150, 130, 100, 0.3);
          transition: all 0.3s ease;
          cursor: zoom-in;
        }
        
        .document-image:hover {
          transform: scale(1.02);
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5), 0 0 8px rgba(255, 220, 150, 0.2);
          border-color: rgba(180, 160, 120, 0.5);
        }
        
        /* Animasi transisi buku */
        .book-container {
          position: relative;
          perspective: 1500px;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }
        
        .page-flip-next .book-container {
          animation: flipNext 0.25s cubic-bezier(0.645, 0.045, 0.355, 1.000);
        }
        
        .page-flip-prev .book-container {
          animation: flipPrev 0.25s cubic-bezier(0.645, 0.045, 0.355, 1.000);
        }
        
        .page-shadow {
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);
          transition: opacity 0.2s ease;
          z-index: -1;
          transform: translateZ(-10px);
        }
        
        .page-shadow.active {
          opacity: 0.4;
        }
        
        .page-fold {
          position: absolute;
          top: 0;
          width: 0;
          height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0.1), rgba(30,25,20,0.3));
          box-shadow: -5px 0 15px rgba(0,0,0,0.25);
          z-index: 2;
          opacity: 0;
          transition: all 0.1s ease-out;
        }
        
        .page-fold.active {
          opacity: 1;
        }
        
        .page-fold.next {
          left: 0;
        }
        
        .page-fold.prev {
          right: 0;
          background: linear-gradient(to left, rgba(255,255,255,0.1), rgba(30,25,20,0.3));
          box-shadow: 5px 0 15px rgba(0,0,0,0.25);
        }
        
        @keyframes flipNext {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(-15deg); }
          100% { transform: rotateY(0deg); }
        }
        
        @keyframes flipPrev {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(15deg); }
          100% { transform: rotateY(0deg); }
        }

        .pdf-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .pdf-preview {
          background: white;
          width: 80%;
          max-width: 500px;
          padding: 40px 30px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pdf-icon {
          font-size: 72px;
          color: #d12123;
          margin-bottom: 20px;
        }

        .pdf-title {
          font-size: 1.4rem;
          color: #333;
          margin-bottom: 10px;
          word-break: break-word;
        }

        .pdf-desc {
          font-size: 1rem;
          color: #666;
          margin-bottom: 20px;
        }

        .pdf-open-button {
          background: #d12123;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pdf-open-button:hover {
          background: #e63e3e;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .page-indicator {
          color: #d4c9a8;
          font-family: 'Trajan Pro', 'Cinzel', serif;
          font-size: 0.8rem;
          min-width: 40px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .contract-card {
            top: 10px;
            padding: 10px 12px 10px 8px;
          }
          
          .contract-label {
            font-size: 0.6rem;
          }
          
          .contract-modal {
            width: 95%;
            height: 85vh;
            margin-top: 10px;
          }
          
          .contract-controls {
            flex-direction: row;
            justify-content: space-between;
            gap: 8px;
            padding: 8px;
          }
          
          .control-button {
            width: 28px;
            height: 28px;
          }
          
          .zoom-controls, .navigation-controls {
            gap: 5px;
          }
          
          .page-indicator {
            font-size: 0.7rem;
            min-width: 30px;
          }
          
          .pdf-preview {
            width: 85%;
            padding: 20px 15px;
          }
          
          .pdf-icon {
            font-size: 48px;
            margin-bottom: 15px;
          }
          
          .pdf-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  );
};

export default ContractCard;