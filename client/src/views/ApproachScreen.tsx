import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../context/AudioContext';

interface ApproachScreenProps {
  onApproach: () => void;
}

const ApproachScreen: React.FC<ApproachScreenProps> = ({ onApproach }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const { setHasInteracted } = useAudio();

  const handleApproach = () => {
    setIsClicked(true);
    setHasInteracted(true); // Trigger audio to play
    
    // Add a delay for the animation to complete before proceeding
    setTimeout(() => {
      onApproach();
    }, 1000);
  };

  return (
    <div className="approach-screen">
      <motion.div 
        className="approach-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
      >
        <motion.button
          className={`approach-button ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleApproach}
          disabled={isClicked}
          initial={{ scale: 1 }}
          whileHover={{ 
            scale: 1.05,
            textShadow: "0 0 8px rgba(255, 255, 255, 0.8)"
          }}
          whileTap={{ scale: 0.95 }}
          animate={isClicked ? { 
            scale: [1, 1.2, 0], 
            opacity: [1, 1, 0]
          } : {}}
          transition={isClicked ? { 
            duration: 0.8, 
            times: [0, 0.4, 1] 
          } : {}}
        >
          {isClicked ? "APPROACHING..." : "APPROACH HIM"}
        </motion.button>
      </motion.div>
      <style>{`
        .approach-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          background: rgba(0, 0, 0, 0.1); /* Opacity sangat rendah untuk memperlihatkan background */
        }

        .approach-container {
          text-align: center;
        }

        .approach-button {
          padding: 1.2rem 2.5rem;
          font-family: 'Cinzel', serif;
          font-size: clamp(1.2rem, 5vw, 2rem);
          font-weight: 700;
          color: #f1f5f9;
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-radius: 2px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 4px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-shadow: 0 0 3px rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
        }

        .approach-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: all 0.4s ease;
        }

        .approach-button.hovered::before {
          left: 100%;
          transition: all 0.8s ease;
        }

        .approach-button:disabled {
          cursor: default;
        }

        .approach-button.clicked {
          border-color: rgba(249, 115, 22, 0.8);
          color: #f97316;
          box-shadow: 0 0 30px rgba(249, 115, 22, 0.6);
        }

        @media (max-width: 640px) {
          .approach-button {
            padding: 1rem 2rem;
            font-size: 1.2rem;
            letter-spacing: 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default ApproachScreen;