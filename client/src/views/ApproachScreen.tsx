import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../context/AudioContext';
import gifPath from '/assets/darksouls.gif';

interface ApproachScreenProps {
  onApproach: () => void;
}

const ApproachScreen: React.FC<ApproachScreenProps> = ({ onApproach }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const { setHasInteracted } = useAudio();
  const [isVisible, setIsVisible] = useState(false);
  const [floatingEmbers, setFloatingEmbers] = useState<{ id: number, x: number, y: number, size: number, duration: number }[]>([]);

  // Efek fade-in untuk komponen setelah load
  useEffect(() => {
    setIsVisible(true);
    
    // Generate floating embers - seminimal mungkin
    const embers = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1.5, // Ember lebih kecil
      duration: Math.random() * 8 + 7
    }));
    setFloatingEmbers(embers);
  }, []);

  const handleApproach = () => {
    setIsClicked(true);
    setHasInteracted(true); // Trigger audio to play with volume full
    
    // Add a delay for the animation to complete before proceeding
    setTimeout(() => {
      onApproach();
    }, 1200);
  };

  return (
    <div className="approach-screen">
      {/* Background dari kejauhan dengan efek zoom */}
      <div className="distant-background"></div>
      
      {/* Floating embers - minimal untuk efek subtle */}
      {floatingEmbers.map(ember => (
        <motion.div
          key={ember.id}
          className="floating-ember"
          initial={{ 
            x: `${ember.x}vw`, 
            y: `${ember.y}vh`, 
            opacity: 0 
          }}
          animate={{ 
            y: [`${ember.y}vh`, `${ember.y - 25}vh`], 
            opacity: [0, 0.5, 0] 
          }}
          transition={{ 
            duration: ember.duration, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ 
            width: `${ember.size}px`, 
            height: `${ember.size}px` 
          }}
        />
      ))}
      
      <motion.div 
        className="approach-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
      >
        {/* Boss health bar design - simple dan elegan */}
        {isHovered && !isClicked && (
          <motion.div 
            className="boss-name"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            GERALT OF RIVIA
          </motion.div>
        )}
        
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
            opacity: [1, 1, 0],
            filter: "brightness(1.5)"
          } : {}}
          transition={isClicked ? { 
            duration: 1, 
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
          background: rgba(0, 0, 0, 0.45); /* Background lebih transparan agar terlihat api */
          overflow: hidden;
        }

        .distant-background {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8); /* Tampilkan background lebih besar agar lebih jelas */
          width: 100%;
          height: 100%;
          background-image: url(${gifPath});
          background-size: cover;
          background-position: center;
          opacity: 0.6; /* Lebih jelas terlihat */
          filter: blur(2px) brightness(0.6); /* Kurangi blur agar lebih jelas */
          z-index: -1;
          animation: breathe 10s infinite ease-in-out; /* Efek nafas api dari jauh */
        }

        @keyframes breathe {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.8);
            filter: blur(2px) brightness(0.6);
          }
          50% {
            transform: translate(-50%, -50%) scale(0.83);
            filter: blur(1.5px) brightness(0.65);
          }
        }

        .approach-container {
          text-align: center;
          position: relative;
          z-index: 5;
        }

        .approach-button {
          padding: 1rem 2.2rem;
          font-family: 'OptimusPrinceps', 'Trajan Pro', 'Cinzel', serif;
          font-size: clamp(1rem, 3.5vw, 1.6rem);
          font-weight: 400;
          color: rgba(248, 250, 252, 0.7); /* Opacity berkurang untuk text Dark Souls-like */
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(214, 168, 85, 0.35); /* Warna keemasan Dark Souls */
          border-radius: 0; /* Sharp edges like DS */
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 5px; /* Lebih besar letter spacing - DS style */
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-shadow: 0 0 8px rgba(214, 168, 85, 0.3);
          box-shadow: 0 0 25px rgba(180, 120, 50, 0.2), inset 0 0 15px rgba(214, 168, 85, 0.1);
          backdrop-filter: blur(3px);
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
            rgba(255, 165, 0, 0.2),
            transparent
          );
          transition: all 0.4s ease;
        }

        .approach-button.hovered::before {
          left: 100%;
          transition: all 0.8s ease;
        }

        .approach-button:hover {
          background: rgba(30, 10, 0, 0.5);
          border-color: rgba(255, 165, 0, 0.8);
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(255, 165, 0, 0.6), inset 0 0 15px rgba(255, 165, 0, 0.3);
        }

        .approach-button:disabled {
          cursor: default;
        }

        .approach-button.clicked {
          border-color: rgba(255, 140, 0, 0.9);
          color: #ff8c00;
          background: rgba(40, 10, 0, 0.6);
          box-shadow: 0 0 35px rgba(255, 140, 0, 0.7), inset 0 0 20px rgba(255, 140, 0, 0.4);
        }

        /* CSS yang tidak digunakan lagi (dihapus) */
        
        /* Boss name display - Dark Souls style */
        .boss-name {
          font-family: 'OptimusPrinceps', 'Trajan Pro', 'Cinzel', serif;
          font-size: 1.8rem;
          font-weight: 400;
          color: rgba(241, 241, 241, 0.75); /* Opacity Dark Souls style */
          text-transform: uppercase;
          letter-spacing: 6px; /* Extra wide letter spacing like in DS */
          text-shadow: 0 0 8px rgba(214, 168, 85, 0.4); /* Gold-like glow */
          margin-bottom: 2rem;
          position: relative;
          display: inline-block;
        }
        
        .boss-name::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 150%;
          height: 2px; /* Ultra thin line like DS */
          background: linear-gradient(90deg, 
            rgba(214, 168, 85, 0) 0%, 
            rgba(214, 168, 85, 0.7) 50%, 
            rgba(214, 168, 85, 0) 100%); /* Gold gradient */
          border-radius: 0; /* Sharp edges */
        }
        
        .boss-name::before {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, 
            rgba(214, 168, 85, 0) 0%, 
            rgba(214, 168, 85, 0.4) 50%, 
            rgba(214, 168, 85, 0) 100%); /* Second gold line for Dark Souls effect */
        }
        
        /* Floating embers */
        .floating-ember {
          position: absolute;
          background: radial-gradient(circle, rgba(255,140,0,0.5) 0%, rgba(255,69,0,0.2) 70%, rgba(255,69,0,0) 100%);
          border-radius: 50%;
          z-index: 2;
          pointer-events: none;
        }
        
        @media (max-width: 768px) {          
          .boss-name {
            font-size: 1.5rem;
          }
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