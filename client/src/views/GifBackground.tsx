import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useAudio } from '../context/AudioContext';

interface GifBackgroundProps {
  children: React.ReactNode;
}

interface Ember {
  id: number;
  size: number;
  positionX: number;
  duration: number;
  delay: number;
}

const GifBackground: React.FC<GifBackgroundProps> = ({ children }) => {
  const [embers, setEmbers] = useState<Ember[]>([]);
  const { isAudioPlaying, playAudio, pauseAudio } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate random embers on component mount
  useEffect(() => {
    const generateEmbers = () => {
      const newEmbers: Ember[] = [];
      const emberCount = Math.floor(Math.random() * 10) + 15; // 15-25 embers
      
      for (let i = 0; i < emberCount; i++) {
        newEmbers.push({
          id: i,
          size: Math.random() * 6 + 2, // 2-8px
          positionX: Math.random() * 100, // 0-100%
          duration: Math.random() * 8 + 4, // 4-12s
          delay: Math.random() * 5 // 0-5s delay
        });
      }
      
      setEmbers(newEmbers);
    };
    
    generateEmbers();
    
    // Regenerate embers periodically
    const interval = setInterval(() => {
      generateEmbers();
    }, 15000); // Every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  const toggleAudio = () => {
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  return (
    <div className="gif-background-container" ref={containerRef}>
      <div className="audio-controls">
        <motion.button 
          className={`audio-button ${isAudioPlaying ? 'playing' : ''}`}
          onClick={toggleAudio}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="audio-icon">
            {isAudioPlaying ? <FaVolumeUp color="#f97316" /> : <FaVolumeMute color="#f97316" />}
          </span>
        </motion.button>
      </div>
      
      <div className="bg-image">
        <img 
          className="campfire-gif" 
          src="/images/darksouls.gif" 
          alt="Dark Souls Campfire" 
        />
      </div>
      
      <div className="bg-overlay"></div>
      
      <div className="ember-container">
        {embers.map((ember) => (
          <motion.div
            key={ember.id}
            className="ember"
            initial={{ 
              bottom: "30%", 
              left: `${ember.positionX}%`,
              opacity: 0.7,
              width: ember.size,
              height: ember.size,
              backgroundColor: `rgba(${255}, ${Math.floor(Math.random() * 150) + 100}, ${Math.floor(Math.random() * 50)}, 0.7)`
            }}
            animate={{ 
              bottom: "90%",
              opacity: 0,
              x: Math.random() > 0.5 ? Math.random() * 100 : Math.random() * -100, // Random horizontal drift
            }}
            transition={{ 
              duration: ember.duration,
              delay: ember.delay,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
          />
        ))}
      </div>
      
      <div className="content">
        {children}
      </div>
      
      <style>{`
        .gif-background-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background-color: #000;
        }
        
        .bg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%);
          z-index: 1;
        }
        
        .bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .campfire-gif {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        
        .ember-container {
          position: absolute;
          width: 100%;
          height: 100%;
          bottom: 30%;
          left: 0;
          pointer-events: none;
        }
        
        .ember {
          position: absolute;
          border-radius: 50%;
          bottom: 30%;
        }
        
        .content {
          position: relative;
          z-index: 10;
          width: 100%;
          min-height: 100vh;
        }
        
        .audio-controls {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 100;
        }
        
        .audio-button {
          background-color: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }
        
        .audio-button:hover {
          background-color: rgba(30, 30, 30, 0.8);
          border-color: rgba(249, 115, 22, 0.4);
          transform: scale(1.05);
        }
        
        .audio-button.playing {
          border-color: rgba(249, 115, 22, 0.6);
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
        }
        
        .audio-icon {
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
};

export default GifBackground;