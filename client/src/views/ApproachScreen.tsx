import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../context/AudioManager';
import gifPath from '/assets/darksouls.gif';

interface ApproachScreenProps {
  onApproach: () => void;
}

const ApproachScreen: React.FC<ApproachScreenProps> = ({ onApproach }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const { isAudioPlaying, playAudio, pauseAudio, setHasInteracted, hasInteracted } = useAudio();
  const [isVisible, setIsVisible] = useState(false);
  const bonfireSoundRef = useRef<HTMLAudioElement | null>(null);
  const menuSoundRef = useRef<HTMLAudioElement | null>(null);
  const itemSoundRef = useRef<HTMLAudioElement | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);

  // Efek fade-in untuk komponen setelah load
  useEffect(() => {
    // Preload sounds
    bonfireSoundRef.current = new Audio('/assets/sounds/souls-bonfire.mp3');
    menuSoundRef.current = new Audio('/assets/sounds/souls-menu.mp3');
    itemSoundRef.current = new Audio('/assets/sounds/souls-item.mp3');
    hoverSoundRef.current = new Audio('/assets/sounds/souls-menu.mp3'); // Menggunakan menu sound juga untuk hover
    
    // Set volume untuk sound effects
    if (bonfireSoundRef.current) bonfireSoundRef.current.volume = 0.3;
    if (menuSoundRef.current) menuSoundRef.current.volume = 0.4;
    if (itemSoundRef.current) itemSoundRef.current.volume = 0.4;
    if (hoverSoundRef.current) hoverSoundRef.current.volume = 0.2; // Volume lebih kecil untuk hover
    
    setIsVisible(true);
    
    // Cleanup
    return () => {
      if (bonfireSoundRef.current) {
        bonfireSoundRef.current.pause();
        bonfireSoundRef.current = null;
      }
      if (menuSoundRef.current) {
        menuSoundRef.current.pause();
        menuSoundRef.current = null;
      }
      if (itemSoundRef.current) {
        itemSoundRef.current.pause();
        itemSoundRef.current = null;
      }
      if (hoverSoundRef.current) {
        hoverSoundRef.current.pause();
        hoverSoundRef.current = null;
      }
    };
  }, []);

  // Fungsi untuk memainkan efek suara
  const playSoulsSound = () => {
    try {
      // Play menu sound first (short select sound)
      if (menuSoundRef.current) {
        menuSoundRef.current.currentTime = 0;
        menuSoundRef.current.play()
          .then(() => {
            // After menu sound, play item pickup sound
            setTimeout(() => {
              if (itemSoundRef.current) {
                itemSoundRef.current.currentTime = 0;
                itemSoundRef.current.play()
                  .then(() => {
                    // After item sound, play bonfire sound
                    setTimeout(() => {
                      if (bonfireSoundRef.current) {
                        bonfireSoundRef.current.currentTime = 0;
                        bonfireSoundRef.current.play().catch(e => console.log("Couldn't play bonfire sound:", e));
                      }
                    }, 300);
                  })
                  .catch(e => console.log("Couldn't play item sound:", e));
              }
            }, 100);
          })
          .catch(e => console.log("Couldn't play menu sound:", e));
      }
    } catch (error) {
      console.log("Error playing souls sounds:", error);
    }
  };

  const handleApproach = () => {
    setIsClicked(true);
    setHasInteracted(true); // Trigger audio to play with volume full
    
    // Mainkan efek suara souls-like
    playSoulsSound();
    
    // Add a delay for the animation to complete before proceeding
    setTimeout(() => {
      onApproach();
    }, 1000);
  };
  
  // Toggle audio play/pause
  const toggleAudio = useCallback(() => {
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      // Set hasInteracted to true when playing audio
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      playAudio();
    }
  }, [isAudioPlaying, playAudio, pauseAudio, hasInteracted, setHasInteracted]);

  return (
    <div className="approach-screen">
      {/* Background dari kejauhan dengan efek zoom */}
      <div className="distant-background"></div>
      
      {/* Audio control button - visible from approach screen */}
      <button
        onClick={toggleAudio}
        className="absolute top-4 right-4 z-40 bg-black bg-opacity-50 p-2 rounded-full text-amber-500 hover:text-amber-400 transition-colors"
        title={isAudioPlaying ? "Mute" : "Unmute"}
      >
        {isAudioPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>
      
      <motion.div 
        className="approach-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
      >
        <motion.button
          className={`approach-button ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`}
          onMouseEnter={() => {
            if (!isClicked && hoverSoundRef.current) {
              hoverSoundRef.current.currentTime = 0;
              hoverSoundRef.current.play().catch(e => console.log("Couldn't play hover sound:", e));
            }
            setIsHovered(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleApproach}
          disabled={isClicked}
          initial={{ scale: 1 }}
          whileHover={{ 
            scale: 1.05,
            textShadow: "0 0 8px rgba(200, 180, 120, 0.8)"
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
          {/* Ornamen dekoratif kiri dan kanan ala Souls */}
          <span className="ornament left">•</span>
          {isClicked ? "APPROACHING..." : "APPROACH HIM"}
          <span className="ornament right">•</span>
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
          padding: 1.2rem 2.5rem;
          font-family: 'Trajan Pro', 'Cinzel', 'Garamond', serif;
          font-size: clamp(1.2rem, 4vw, 2rem);
          font-weight: 600;
          color: #d4c9a8; /* Warna emas pudar khas Souls */
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(150, 125, 80, 0.6); /* Border gold pudar */
          border-radius: 0; /* Souls-like tidak menggunakan rounded corners */
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 4px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-shadow: 0 0 5px rgba(100, 80, 40, 0.8); /* Text shadow gelap */
          box-shadow: 0 0 25px rgba(100, 80, 40, 0.4), inset 0 0 15px rgba(80, 60, 30, 0.3);
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
            rgba(180, 160, 120, 0.15), /* Warna cahaya emas pudar khas Souls */
            transparent
          );
          transition: all 0.4s ease;
        }

        /* Efek dekorasi ala Souls-like */
        .approach-button::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(180, 160, 120, 0.6), 
            transparent
          );
        }

        .approach-button.hovered::before {
          left: 100%;
          transition: all 0.8s ease;
        }

        .approach-button:hover {
          background: rgba(20, 15, 10, 0.7);
          border-color: rgba(180, 160, 100, 0.8);
          color: #e8debc; /* Warna emas yang lebih terang */
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(100, 80, 40, 0.6), inset 0 0 15px rgba(80, 60, 40, 0.4);
          text-shadow: 0 0 8px rgba(180, 160, 120, 0.8);
        }

        .approach-button:disabled {
          cursor: default;
        }

        .approach-button.clicked {
          border-color: rgba(200, 180, 120, 0.9);
          color: #f0e6c9; /* Warna emas lebih cerah */
          background: rgba(40, 30, 20, 0.8);
          box-shadow: 0 0 35px rgba(150, 130, 80, 0.7), inset 0 0 20px rgba(120, 100, 60, 0.5);
          letter-spacing: 6px; /* Memperbesar jarak huruf saat diklik */
        }

        /* Styling untuk ornamen dekoratif */
        .ornament {
          display: inline-block;
          color: rgba(180, 160, 100, 0.6);
          font-size: 1.5rem;
          margin: 0 12px;
          position: relative;
          top: -1px;
          transform: translateY(2px);
          text-shadow: 0 0 6px rgba(150, 130, 80, 0.4);
          transition: all 0.3s ease;
        }
        
        .ornament.left {
          margin-right: 18px;
        }
        
        .ornament.right {
          margin-left: 18px;
        }
        
        .approach-button:hover .ornament {
          color: rgba(220, 200, 150, 0.8);
          text-shadow: 0 0 10px rgba(200, 180, 120, 0.6);
        }
        
        .approach-button.clicked .ornament {
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s ease;
        }

        @media (max-width: 640px) {
          .approach-button {
            padding: 1rem 2rem;
            font-size: 1.2rem;
            letter-spacing: 2px;
          }
          
          .ornament {
            font-size: 1.2rem;
            margin: 0 8px;
          }
          
          .ornament.left {
            margin-right: 12px;
          }
          
          .ornament.right {
            margin-left: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ApproachScreen;