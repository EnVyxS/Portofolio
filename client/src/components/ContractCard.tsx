import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaScroll, FaSearch, FaSearchPlus, FaSearchMinus, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import DialogController from '../controllers/dialogController';
// Respon variasi saat kartu diklik
const CONTRACT_RESPONSES = [
  "Didn't lie. Never have, never will. Maybe next time, use your damn brain before throwing accusations.",
  "Not a liar. Never was. Maybe next time, don't waste my time with your doubts.",
  "Told you the truth. Always do. Maybe next time, keep your mouth shut until you know better.",
  "Didn't lie. Don't need to. Maybe next time, think twice before making a fool of yourself.",
  "Believe me now? Thought so. Next time, don't question what you don't understand."
];

// Path ke file SVG dokumen
const CONTRACT_IMAGES = [
  '/assets/certificate1.svg',
  '/assets/certificate2.svg',
];

const ContractCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dialogController = DialogController.getInstance();
  const dragRef = useRef<{ x: number, y: number } | null>(null);

  const handleContractClick = () => {
    if (!isOpen) {
      // Jika kontrak belum terbuka, maka buka dan munculkan dialog random
      const randomIndex = Math.floor(Math.random() * CONTRACT_RESPONSES.length);
      const response = CONTRACT_RESPONSES[randomIndex];
      
      dialogController.showCustomDialog(response, (text, isComplete) => {
        // Handle dialog completion if needed
      });
      
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

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex < CONTRACT_IMAGES.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      // Reset position when changing images
      setPosition({ x: 0, y: 0 });
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      // Reset position when changing images
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setScale(1);
    setCurrentImageIndex(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (isDragging && dragRef.current) {
      const newX = e.clientX - dragRef.current.x;
      const newY = e.clientY - dragRef.current.y;
      
      // Batasi pergerakan agar tidak terlalu jauh
      const maxOffset = 300 * scale;
      const clampedX = Math.min(Math.max(newX, -maxOffset), maxOffset);
      const clampedY = Math.min(Math.max(newY, -maxOffset), maxOffset);
      
      setPosition({ x: clampedX, y: clampedY });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragRef.current = null;
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

      {/* Overlay Modal untuk menampilkan gambar */}
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
                    onClick={prevImage} 
                    className={`control-button ${currentImageIndex === 0 ? 'disabled' : ''}`}
                    disabled={currentImageIndex === 0}
                  >
                    <FaArrowLeft />
                  </button>
                  <span className="page-indicator">{currentImageIndex + 1}/{CONTRACT_IMAGES.length}</span>
                  <button 
                    onClick={nextImage} 
                    className={`control-button ${currentImageIndex === CONTRACT_IMAGES.length - 1 ? 'disabled' : ''}`}
                    disabled={currentImageIndex === CONTRACT_IMAGES.length - 1}
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </div>
              <div 
                className="contract-image-container"
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <motion.img 
                  src={CONTRACT_IMAGES[currentImageIndex]} 
                  alt={`Contract page ${currentImageIndex + 1}`}
                  style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  draggable={false}
                />
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
          background: rgba(0, 0, 0, 0.8);
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

        .contract-image-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          background: rgba(20, 16, 14, 0.9);
          position: relative;
        }

        .contract-image-container img {
          max-width: 100%;
          max-height: 100%;
          transition: transform 0.1s ease;
          transform-origin: center center;
          touch-action: none;
          will-change: transform;
        }

        .page-indicator {
          color: #d4c9a8;
          font-family: 'Trajan Pro', 'Cinzel', serif;
          font-size: 0.8rem;
          min-width: 40px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .contract-modal {
            width: 95%;
            height: 90vh;
          }
          
          .contract-controls {
            flex-direction: column;
            gap: 10px;
            padding: 8px;
          }
          
          .control-button {
            width: 30px;
            height: 30px;
          }
        }
      `}</style>
    </>
  );
};

export default ContractCard;