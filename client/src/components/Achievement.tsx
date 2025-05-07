import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Definisi tipe achievement
export type AchievementType = 
  | 'approach'    // "Approach Him" ditekan
  | 'contract'    // Membuka kontrak
  | 'success'     // Berhasil membuat kontrak (link ditekan)
  | 'anger'       // Berhasil membuat marah
  | 'nightmare';  // Berhasil masuk ke nightmare

// Icon SVG untuk setiap jenis achievement
const AchievementIcons: Record<AchievementType, React.ReactNode> = {
  approach: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 8l-7-7-7 7v11a2 2 0 002 2h10a2 2 0 002-2V8z" 
        stroke="#FFC107" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M9 15l3 3 5-5" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  contract: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M7 7h10M7 11h10M7 15h6" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 19V5" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeDasharray="1 2" />
    </svg>
  ),
  success: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" 
        stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 16l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" 
        fill="currentColor" fillOpacity="0.2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  ),
  anger: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 8v8M8 12h8" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 9l-3-3-3 3M15 15l-3 3-3-3M9 15l-3-3 3-3M15 9l3 3-3 3" 
        stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  ),
  nightmare: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l2.5 5 5.5.5-4 4 1 5.5-5-2.5-5 2.5 1-5.5-4-4 5.5-.5L12 2z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M12 7v5M12 16v.1" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="1 1" />
    </svg>
  )
};

// Definisi teks untuk setiap jenis achievement
const AchievementTitles: Record<AchievementType, string> = {
  approach: 'FIRST IMPRESSION',
  contract: 'PORTFOLIO EXPLORER',
  success: 'CONNECTION ESTABLISHED',
  anger: 'CHALLENGE ACCEPTED',
  nightmare: 'DIGITAL ODYSSEY'
};

// Deskripsi achievement
const AchievementDescriptions: Record<AchievementType, string> = {
  approach: 'You took the first step to discover this unique portfolio.',
  contract: 'You explored the professional projects and credentials.',
  success: 'You\'ve successfully connected with the professional profile.',
  anger: 'You tested the limits of the interactive experience.',
  nightmare: 'You discovered the creative side of this digital portfolio.'
};

// Dark Souls inspired fog/mist particles for achievement with green color
const FogParticle: React.FC<{
  delay: number;
  duration: number;
  positionX: number;
  size: number;
  color: string;
  blur: number;
}> = ({ delay, duration, positionX, size, color, blur }) => {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${positionX}%`,
        bottom: '-5px',
        background: color,
        filter: `blur(${blur}px)`,
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [0, -15 - size * 0.6], 
        opacity: [0, 0.45, 0],
        scale: [1, 1.5, 0.8]
      }}
      transition={{
        duration,
        ease: "easeOut",
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 0.4,
      }}
    />
  );
};

// Soul essence particle effect - green souls style
const SoulEssence: React.FC<{
  delay: number;
  duration: number;
  startX: number;
  startY: number;
}> = ({ delay, duration, startX, startY }) => {
  // Random end positions
  const endX = startX + (Math.random() * 20 - 10);
  const endY = startY - 5 - Math.random() * 15;
  const size = 1.5 + Math.random() * 2;
  
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-emerald-400/40"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: `0 0 ${3 + size}px 1px rgba(30, 190, 90, 0.6)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0.4, 1, 0.3],
        x: [0, endX - startX],
        y: [0, endY - startY],
      }}
      transition={{
        duration,
        ease: "easeOut",
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 1.5 + 0.5,
      }}
    />
  );
};

// Generate random dark souls green fog particles
const generateFogParticles = (count: number) => {
  const particles = [];
  
  // Dark fog base
  for (let i = 0; i < count; i++) {
    particles.push({
      id: `dark-${i}`,
      delay: Math.random() * 1.2,
      duration: 1.8 + Math.random() * 2,
      positionX: Math.random() * 100,
      size: 8 + Math.random() * 15,
      color: 'rgba(5, 10, 12, 0.6)',
      blur: 6 + Math.random() * 4
    });
  }
  
  // Dark souls green fog
  for (let i = 0; i < Math.floor(count/2); i++) {
    particles.push({
      id: `mystic-${i}`,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      positionX: Math.random() * 100,
      size: 4 + Math.random() * 10,
      color: `rgba(${10 + Math.random() * 20}, ${100 + Math.random() * 70}, ${50 + Math.random() * 50}, 0.35)`,
      blur: 5 + Math.random() * 4
    });
  }
  
  // Subtle green highlights
  for (let i = 0; i < Math.floor(count/4); i++) {
    particles.push({
      id: `green-${i}`,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 1.5,
      positionX: Math.random() * 100,
      size: 3 + Math.random() * 8,
      color: 'rgba(30, 200, 100, 0.2)',
      blur: 4 + Math.random() * 3
    });
  }
  
  return particles;
};

// Generate soul essence particles
const generateSoulEssences = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `soul-${i}`,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 2,
    startX: 20 + Math.random() * 60, // position across the width
    startY: 40 + Math.random() * 40, // random vertical position
  }));
};

interface AchievementProps {
  type: AchievementType;
  onComplete?: () => void;
}

const Achievement: React.FC<AchievementProps> = ({ type, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const achievementSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Generate mystical particles
  const fogParticles = useRef(generateFogParticles(12));
  const soulEssences = useRef(generateSoulEssences(8));
  
  useEffect(() => {
    // Mainkan suara achievement dengan Web Audio API
    try {
      // Pastikan script achievement-sound.js sudah dimuat
      const createAchievementSound = window.createAchievementSound;
      if (createAchievementSound && typeof createAchievementSound === 'function') {
        const playAchievementSound = createAchievementSound();
        if (playAchievementSound) {
          playAchievementSound();
        }
      } else {
        // Fallback jika script belum dimuat
        achievementSoundRef.current = new Audio('/assets/sounds/souls-item.mp3');
        if (achievementSoundRef.current) {
          achievementSoundRef.current.volume = 0.8;
          achievementSoundRef.current.play().catch(e => console.log("Couldn't play achievement sound:", e));
        }
      }
    } catch (e) {
      console.error("Error playing achievement sound:", e);
    }

    // Otomatis sembunyikan achievement setelah 5 detik
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Callback setelah animasi exit selesai
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500); // Tunggu animasi exit selesai
    }, 5000); // Sedikit lebih lama untuk efek yang dramatis

    return () => {
      clearTimeout(timer);
      if (achievementSoundRef.current) {
        achievementSoundRef.current.pause();
        achievementSoundRef.current = null;
      }
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.4
          }}
          className="fixed bottom-6 right-6 z-50"
        >
          {/* Dark Souls style achievement - compact design like the screenshot */}
          <motion.div 
            className="flex flex-col items-start"
            animate={{ 
              boxShadow: [
                "0 0 8px rgba(30, 160, 80, 0.15)", 
                "0 0 12px rgba(30, 160, 80, 0.25)", 
                "0 0 8px rgba(30, 160, 80, 0.15)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {/* Achievement notification - compact like in Dark Souls */}
            <div className="px-3 py-2 bg-black/95 border-l-2 border-emerald-500/40 shadow-md relative overflow-hidden w-64">
              {/* Dark mystical background */}
              <div 
                className="absolute inset-0" 
                style={{
                  background: 'linear-gradient(to right, rgba(15, 25, 20, 0.9), rgba(10, 15, 15, 0.95))',
                }}
              />
              
              {/* Mystical effects container */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Dark Souls style gradient background */}
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(10, 25, 15, 0.8), rgba(0, 10, 5, 0.9))'
                  }}
                  animate={{ 
                    opacity: [0.7, 0.9, 0.7]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                {/* Green fog particles - subtle */}
                {fogParticles.current.slice(0, 8).map((particle) => (
                  <FogParticle 
                    key={particle.id}
                    delay={particle.delay}
                    duration={particle.duration}
                    positionX={particle.positionX}
                    size={particle.size}
                    color={particle.color}
                    blur={particle.blur}
                  />
                ))}
                
                {/* Soul essence particles - very subtle */}
                {soulEssences.current.slice(0, 4).map((essence) => (
                  <SoulEssence
                    key={essence.id}
                    delay={essence.delay}
                    duration={essence.duration}
                    startX={essence.startX}
                    startY={essence.startY}
                  />
                ))}
                
                {/* Dark Souls icon glow */}
                <motion.div
                  className="absolute h-8 w-8 left-2 top-2 opacity-40"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(30, 200, 100, 0.3) 0%, transparent 70%)',
                    filter: 'blur(3px)',
                  }}
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
              
              {/* Dark Souls style inner container */}
              <div className="relative z-10 flex items-start py-1">
                {/* Achievement icon */}
                <div className="flex-shrink-0 w-8 h-8 mr-3">
                  <motion.div 
                    className="text-emerald-400/90"
                    animate={{ 
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    {/* Small icon as in Dark Souls */}
                    <div className="h-8 w-8 rounded-sm bg-black/60 flex items-center justify-center border border-emerald-700/30">
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d="M12 2l2.5 5 5.5.5-4 4 1 5.5-5-2.5-5 2.5 1-5.5-4-4 5.5-.5L12 2z" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          fill="rgba(30, 200, 100, 0.3)" 
                        />
                      </svg>
                    </div>
                  </motion.div>
                </div>
                
                {/* Achievement text content */}
                <div className="flex flex-col">
                  {/* Today */}
                  <motion.p
                    className="text-xs text-emerald-300/80 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ duration: 0.5 }}
                  >
                    Today
                  </motion.p>
                  
                  {/* Achievement title */}
                  <motion.p
                    className="text-sm text-emerald-100 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {AchievementTitles[type]}
                  </motion.p>
                  
                  {/* Achievement description - smaller text with subtle color */}
                  <motion.p
                    className="text-xs text-emerald-400/60 mt-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {AchievementDescriptions[type]}
                  </motion.p>
                  
                  {/* Percentage line at bottom - Dark Souls style */}
                  <motion.div
                    className="mt-1.5 flex items-center space-x-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="text-xs text-emerald-300/70">
                      {Math.floor(90 + Math.random() * 9)}.{Math.floor(Math.random() * 9)}% of players have this achievement
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Dark edge overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Achievement;