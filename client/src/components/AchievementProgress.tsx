import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { AchievementType } from '../constants/achievementConstants';
import AchievementController from '../controllers/achievementController';
import AchievementGallery from './AchievementGallery2';

interface AchievementProgressProps {
  className?: string;
}

const AchievementProgress: React.FC<AchievementProgressProps> = ({ className }) => {
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(12); // Total sekarang 12 achievement setelah penambahan "escape" dan "social"
  const [isVisible, setIsVisible] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  
  // Animations
  const glowAnimationControls = useAnimation();
  const trophyAnimationControls = useAnimation();
  const progressBarControls = useAnimation();
  const soulParticlesControls = useAnimation();
  const achievementTextControls = useAnimation();
  
  // References for soul particles
  const particlesRef = useRef<HTMLDivElement>(null);
  const [newUnlock, setNewUnlock] = useState(false);
  
  // Always show on the left side
  const posVariation = useRef(Math.floor(Math.random() * 2));
  const positionStyles = [
    { left: '20px', bottom: '20px', right: 'auto', transform: 'none' }, // Bottom left
    { left: '20px', top: '20px', right: 'auto', transform: 'none' }, // Top left
  ];
  
  // Daftar semua achievement yang mungkin
  const allAchievements: AchievementType[] = [
    'approach', 'contract', 'document', 'success',
    'anger', 'nightmare', 'listener', 'patience',
    'return', 'hover', 'escape', 'social'
  ];
  
  // Load achievement saat komponen dimuat
  useEffect(() => {
    const achievementController = AchievementController.getInstance();
    const unlocked = achievementController.getUnlockedAchievements();
    setUnlockedCount(unlocked.length);
    
    // Tampilkan progress setelah sedikit delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // Start background glow animation
      glowAnimationControls.start({
        opacity: [0.4, 0.7, 0.4],
        scale: [1, 1.05, 1],
        transition: {
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }
      });
      
      // Start trophy animation
      trophyAnimationControls.start({
        y: [0, -3, 0],
        filter: [
          "drop-shadow(0 0 4px rgba(255, 215, 0, 0.3))",
          "drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))",
          "drop-shadow(0 0 4px rgba(255, 215, 0, 0.3))",
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }
      });
      
      // Animate progress bar
      progressBarControls.start({
        width: `${(unlockedCount / totalCount) * 100}%`,
        transition: { duration: 1.5, ease: "easeOut" }
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Update achievement count saat gallery ditutup
  useEffect(() => {
    if (!showGallery) {
      const achievementController = AchievementController.getInstance();
      const unlocked = achievementController.getUnlockedAchievements();
      
      // Detect if there's a new achievement unlocked
      if (unlocked.length > unlockedCount) {
        setNewUnlock(true);
        
        // Trigger Dark Souls style animation
        playSoulsUnlockAnimation();
        
        // Reset after animation completes
        setTimeout(() => {
          setNewUnlock(false);
        }, 3000);
      }
      
      setUnlockedCount(unlocked.length);
      
      // Update progress bar animation when count changes
      progressBarControls.start({
        width: `${(unlocked.length / totalCount) * 100}%`,
        transition: { duration: 1.5, ease: "easeOut" }
      });
    }
  }, [showGallery]);
  
  // Dark Souls style achievement unlock animation
  const playSoulsUnlockAnimation = () => {
    // Play the "Achievement Unlocked" animation
    achievementTextControls.start({
      opacity: [0, 1, 1, 0],
      y: [20, 0, 0, -20],
      scale: [0.8, 1, 1, 0.9],
      transition: { 
        duration: 3, 
        times: [0, 0.2, 0.8, 1],
        ease: "easeInOut" 
      }
    });
    
    // Create and animate soul particles
    soulParticlesControls.start({
      opacity: [0, 1, 0],
      transition: { duration: 2.5 }
    });
    
    // Create particle effects programmatically
    if (particlesRef.current) {
      particlesRef.current.innerHTML = '';
      
      // Create multiple particles
      for (let i = 0; i < 20; i++) {
        createSoulParticle(particlesRef.current);
      }
    }
    
    // Add sound effect here if needed
    // playAchievementSound();
  }
  
  // Create a single soul particle element
  const createSoulParticle = (container: HTMLDivElement) => {
    const particle = document.createElement('div');
    particle.className = 'soul-particle';
    
    // Random position
    const startX = 50 + (Math.random() * 100 - 50);
    const startY = 50 + (Math.random() * 100 - 50);
    
    // Random size
    const size = 3 + Math.random() * 12;
    
    // Random animation duration
    const duration = 1.5 + Math.random() * 1.5;
    const delay = Math.random() * 0.5;
    
    // Random movement direction
    const endX = startX + (Math.random() * 140 - 70);
    const endY = startY - 50 - Math.random() * 100;
    
    // Set styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${startX}%`;
    particle.style.top = `${startY}%`;
    particle.style.animation = `floatUp ${duration}s ease-out ${delay}s forwards`;
    
    // Add to container
    container.appendChild(particle);
    
    // Remove after animation completes
    setTimeout(() => {
      if (container.contains(particle)) {
        container.removeChild(particle);
      }
    }, (duration + delay) * 1000);
  };
  
  // Hitung persentase achievement yang sudah di-unlock
  const percentage = Math.round((unlockedCount / totalCount) * 100);
  
  // Efek flash untuk milestone achievement (Dark Souls inspired)
  useEffect(() => {
    // Trigger milestone effects at certain achievement counts
    const milestones = [3, 6, 9, 12]; // 25%, 50%, 75%, 100%
    
    if (milestones.includes(unlockedCount) && unlockedCount > 0) {
      // Trigger milestone flash effect
      document.body.classList.add('achievement-milestone-flash');
      
      // Remove class after animation completes
      setTimeout(() => {
        document.body.classList.remove('achievement-milestone-flash');
      }, 1500);
      
      // Trigger stronger soul particles for milestone
      if (particlesRef.current) {
        // Create more particles for milestone achievements
        for (let i = 0; i < 40; i++) {
          createSoulParticle(particlesRef.current);
        }
        
        // Create milestone specific golden rays
        createMilestoneRays();
      }
    }
  }, [unlockedCount]);
  
  // Create milestone specific golden rays (Dark Souls boss defeated style)
  const createMilestoneRays = () => {
    if (!particlesRef.current) return;
    
    // Create ray container if it doesn't exist
    let rayContainer = document.querySelector('.milestone-rays-container') as HTMLDivElement;
    if (!rayContainer) {
      rayContainer = document.createElement('div');
      rayContainer.className = 'milestone-rays-container';
      document.body.appendChild(rayContainer);
    }
    
    // Clear existing rays
    rayContainer.innerHTML = '';
    
    // Create rays
    for (let i = 0; i < 12; i++) {
      const ray = document.createElement('div');
      ray.className = 'milestone-ray';
      const angle = (i / 12) * 360;
      ray.style.transform = `rotate(${angle}deg)`;
      
      // Randomize ray properties
      const width = 1 + Math.random() * 2;
      const length = 40 + Math.random() * 60;
      const delay = Math.random() * 0.3;
      
      ray.style.width = `${width}px`;
      ray.style.height = `${length}px`;
      ray.style.animationDelay = `${delay}s`;
      
      rayContainer.appendChild(ray);
    }
    
    // Remove ray container after animation completes
    setTimeout(() => {
      if (document.body.contains(rayContainer)) {
        document.body.removeChild(rayContainer);
      }
    }, 3000);
  };
  
  // Toggle gallery saat progress ditekan
  const toggleGallery = () => {
    setShowGallery(prev => !prev);
  };
  
  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`achievement-progress-indicator ${className || ''}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20
              }
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={toggleGallery}
            style={{ 
              cursor: 'pointer',
              ...positionStyles[posVariation.current]
            }}
            title="Click to view achievements"
            whileHover={{ 
              scale: 1.05,
              transition: { 
                duration: 0.2 
              }
            }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.div 
              className="achievement-progress-glow"
              animate={glowAnimationControls}
            />
            
            <div className="achievement-progress-title">
              <motion.span 
                className="achievement-icon" 
                animate={trophyAnimationControls}
              >
                🏆
              </motion.span>
              <span className="achievement-label">Achievements:</span>
              <span className="achievement-count">{unlockedCount}/{totalCount}</span>
            </div>
            
            <div className="achievement-progress-bar-container">
              <motion.div 
                className="achievement-progress-bar"
                initial={{ width: 0 }}
                animate={progressBarControls}
              />
            </div>
            
            {/* Glow indicator instead of numeric badge */}
            {unlockedCount > 0 && (
              <motion.div 
                className="achievement-glow-indicator"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: {
                    duration: 1.2,
                    delay: 0.3
                  }
                }}
              />
            )}
            
            {/* Dark Souls style particles container */}
            <div 
              ref={particlesRef} 
              className="souls-particles-container"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Dark Souls style achievement unlock animation */}
      <AnimatePresence>
        {newUnlock && (
          <motion.div 
            className="dark-souls-achievement-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="souls-achievement-text"
              animate={achievementTextControls}
            >
              <span className="souls-achievement-heading font-souls"></span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Achievement Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="achievement-gallery-modal"
            onClick={(e) => {
              // Tutup modal jika yang diklik adalah background (bukan konten)
              if (e.target === e.currentTarget) {
                setShowGallery(false);
              }
            }}
          >
            <motion.div 
              className="achievement-gallery-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="achievement-gallery-close" 
                onClick={() => setShowGallery(false)}
              >
                ×
              </button>
              <AchievementGallery />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Styles untuk modal dan achievement progress */}
      <style dangerouslySetInnerHTML={{ __html: `
        .achievement-gallery-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          backdrop-filter: blur(3px);
        }
        
        .achievement-gallery-content {
          position: relative;
          width: 90%;
          max-width: 600px;
          max-height: 85vh;
          background: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 8px;
          padding: 24px;
          overflow-y: auto;
          box-shadow: 0 0 30px rgba(255, 193, 7, 0.15), inset 0 0 20px rgba(0, 0, 0, 0.4);
        }
        
        .achievement-gallery-close {
          position: absolute;
          top: 12px;
          right: 16px;
          background: none;
          border: none;
          color: rgba(255, 193, 7, 0.7);
          font-size: 24px;
          cursor: pointer;
          padding: 4px 10px;
          line-height: 1;
          z-index: 10;
          transition: all 0.2s ease;
        }
        
        .achievement-gallery-close:hover {
          color: rgba(255, 193, 7, 1);
          transform: scale(1.1);
        }
        
        /* Enhanced achievement progress indicator */
        .achievement-progress-indicator {
          position: fixed;
          width: auto;
          min-width: 200px;
          background: rgba(20, 20, 20, 0.9);
          border: 1px solid rgba(255, 215, 0, 0.4);
          border-radius: 8px;
          padding: 10px 15px;
          z-index: 40;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), inset 0 0 5px rgba(255, 215, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          overflow: hidden;
        }
        
        .achievement-progress-indicator:hover {
          border-color: rgba(255, 215, 0, 0.7);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.2);
        }
        
        .achievement-progress-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: -1;
        }
        
        .achievement-progress-title {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          color: rgba(255, 215, 0, 0.9);
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .achievement-icon {
          margin-right: 8px;
          font-size: 1.1rem;
          filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.3));
        }
        
        .achievement-label {
          flex: 1;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .achievement-count {
          font-weight: bold;
          background: linear-gradient(to bottom, rgba(255, 215, 130, 0.95), rgba(200, 150, 50, 0.7));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 4px rgba(200, 150, 30, 0.3);
          font-size: 0.95rem;
        }
        
        .achievement-progress-bar-container {
          height: 6px;
          background: rgba(40, 30, 20, 0.6);
          border-radius: 3px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
        }
        
        .achievement-progress-bar {
          height: 100%;
          background: linear-gradient(to right, #ffd700, #ffa500);
          box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
          position: relative;
          overflow: hidden;
        }
        
        .achievement-progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: -50%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, 0.4) 50%, 
            rgba(255, 255, 255, 0) 100%
          );
          animation: progressShine 2s infinite linear;
        }
        
        @keyframes progressShine {
          0% { left: -50%; }
          100% { left: 150%; }
        }
        
        /* Glow indicator instead of numbered badge */
        .achievement-glow-indicator {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
          border-radius: 8px;
          background: none;
          pointer-events: none;
          z-index: 5;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.5), inset 0 0 10px rgba(255, 215, 0, 0.3);
          border: 1px solid rgba(255, 215, 0, 0.7);
          animation: pulseGlow 2s infinite alternate ease-in-out;
        }
        
        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.3), inset 0 0 5px rgba(255, 215, 0, 0.2);
            border-color: rgba(255, 215, 0, 0.5);
          }
          100% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.4);
            border-color: rgba(255, 215, 0, 0.9);
          }
        }
        
        /* Class untuk menyembunyikan achievement progress */
        .achievement-progress-indicator.hidden {
          opacity: 0 !important;
          transform: translateY(20px) !important;
          pointer-events: none;
          transition: all 0.5s ease;
        }
        
        /* Media queries for responsive design */
        @media (max-width: 768px) {
          .achievement-progress-indicator {
            min-width: 180px;
            padding: 8px 12px;
          }
          
          .achievement-progress-title {
            font-size: 0.75rem;
          }
          
          .achievement-icon {
            font-size: 0.95rem;
          }
        }
        
        /* Entrance animation keyframes */
        @keyframes enterFromBottom {
          0% { 
            transform: translateY(30px);
            opacity: 0;
          }
          100% { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        /* Dark Souls style achievement unlock popup */
        .dark-souls-achievement-popup {
          position: fixed;
          bottom: 30%;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
          pointer-events: none;
        }
        
        .souls-achievement-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 215, 0, 0.5);
          padding: 15px 40px;
          border-radius: 4px;
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 15px rgba(0, 0, 0, 0.6);
          position: relative;
          overflow: hidden;
        }
        
        .souls-achievement-text::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
          z-index: -1;
        }
        
        .souls-achievement-heading {
          font-family: 'Cinzel', serif;
          font-size: 22px;
          color: rgba(255, 215, 0, 0.9);
          letter-spacing: 2px;
          font-weight: 600;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
          text-transform: uppercase;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
        }
        
        /* Souls particles container */
        .souls-particles-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 5;
          pointer-events: none;
        }
        
        /* Soul particle styling */
        .soul-particle {
          position: absolute;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 215, 0, 0.4) 50%, rgba(255, 215, 0, 0) 100%);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
          pointer-events: none;
          z-index: 6;
        }
        
        /* Souls particle float animation */
        @keyframes floatUp {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-150px) translateX(var(--x-offset, 0)) scale(0.4);
            opacity: 0;
          }
        }
      `}} />
    </>
  );
};

export default AchievementProgress;