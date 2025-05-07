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

// Dark Souls inspired fog/mist particles for achievement
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
        bottom: '-10px',
        background: color,
        filter: `blur(${blur}px)`,
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [0, -20 - size * 0.8], 
        opacity: [0, 0.4, 0],
        scale: [1, 1.8, 0.6]
      }}
      transition={{
        duration,
        ease: "easeOut",
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 0.3,
      }}
    />
  );
};

// Soul essence particle effect
const SoulEssence: React.FC<{
  delay: number;
  duration: number;
  startX: number;
  startY: number;
}> = ({ delay, duration, startX, startY }) => {
  // Random end positions
  const endX = startX + (Math.random() * 40 - 20);
  const endY = startY - 10 - Math.random() * 30;
  const size = 2 + Math.random() * 3;
  
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-blue-400/30"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: `0 0 ${6 + size}px 1px rgba(120, 170, 255, 0.7)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.7, 0],
        scale: [0.3, 1, 0.2],
        x: [0, endX - startX],
        y: [0, endY - startY],
      }}
      transition={{
        duration,
        ease: "easeOut",
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2 + 1,
      }}
    />
  );
};

// Generate random mystical fog particles
const generateFogParticles = (count: number) => {
  const particles = [];
  
  // Dark fog
  for (let i = 0; i < count; i++) {
    particles.push({
      id: `dark-${i}`,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 3,
      positionX: Math.random() * 100,
      size: 12 + Math.random() * 30,
      color: 'rgba(20, 15, 35, 0.7)',
      blur: 10 + Math.random() * 8
    });
  }
  
  // Mystical blue/purple fog
  for (let i = 0; i < Math.floor(count/2); i++) {
    particles.push({
      id: `mystic-${i}`,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 3,
      positionX: Math.random() * 100,
      size: 5 + Math.random() * 20,
      color: `rgba(${30 + Math.random() * 30}, ${20 + Math.random() * 40}, ${80 + Math.random() * 80}, 0.4)`,
      blur: 8 + Math.random() * 5
    });
  }
  
  // Amber highlights
  for (let i = 0; i < Math.floor(count/3); i++) {
    particles.push({
      id: `amber-${i}`,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      positionX: Math.random() * 100,
      size: 4 + Math.random() * 12,
      color: 'rgba(255, 193, 7, 0.1)',
      blur: 7 + Math.random() * 3
    });
  }
  
  return particles;
};

// Generate soul essence particles
const generateSoulEssences = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `soul-${i}`,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    startX: 30 + Math.random() * 40, // position in the middle area
    startY: 30 + Math.random() * 60, // random vertical position
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
          {/* Dark Souls style achievement - dengan efek kabut mistis */}
          <motion.div 
            className="flex flex-col items-start"
            animate={{ 
              boxShadow: [
                "0 0 15px rgba(120, 170, 255, 0.1)", 
                "0 0 25px rgba(120, 170, 255, 0.2)", 
                "0 0 15px rgba(120, 170, 255, 0.1)"
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {/* Achievement notification - wider for more dramatic effect */}
            <div className="px-5 py-4 bg-black/95 border border-blue-900/50 shadow-lg relative overflow-hidden w-80">
              {/* Dark mystical background */}
              <div 
                className="absolute inset-0" 
                style={{
                  background: 'radial-gradient(circle at 50% 30%, rgba(30, 30, 60, 0.7) 0%, rgba(15, 15, 35, 0.8) 60%, rgba(5, 5, 15, 0.9) 100%)',
                }}
              />
              
              {/* Mystical effects container */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Deep void gradient background */}
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(20, 20, 40, 0.5), rgba(5, 5, 20, 0.8))'
                  }}
                  animate={{ 
                    opacity: [0.6, 0.8, 0.6]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                {/* Mystical fog particles */}
                {fogParticles.current.map((particle) => (
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
                
                {/* Soul essence particles */}
                {soulEssences.current.map((essence) => (
                  <SoulEssence
                    key={essence.id}
                    delay={essence.delay}
                    duration={essence.duration}
                    startX={essence.startX}
                    startY={essence.startY}
                  />
                ))}
                
                {/* Dramatic light rays */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'radial-gradient(circle at 70% 20%, rgba(100, 130, 255, 0.3) 0%, transparent 50%)',
                    filter: 'blur(10px)',
                  }}
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                  }}
                />
              </div>
              
              {/* Dark Souls style vignette edges */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/70 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70 pointer-events-none"></div>
              
              {/* Title with mystic animation */}
              <div className="mb-2 relative z-10">
                <motion.p
                  className="text-[10px] text-blue-300/80 uppercase tracking-widest font-serif"
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span 
                    className="text-blue-200/90 mr-1.5 inline-block"
                    animate={{ 
                      textShadow: [
                        '0 0 3px rgba(120, 170, 255, 0.5)', 
                        '0 0 8px rgba(120, 170, 255, 0.8)', 
                        '0 0 3px rgba(120, 170, 255, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >★</motion.span>
                  <span className="text-gradient-souls">Achievement Unlocked</span>
                </motion.p>
              </div>
              
              {/* Achievement name - animated mystic entrance */}
              <motion.div 
                className="flex items-center gap-2 relative z-10 pl-1"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.div 
                  className="text-blue-100 text-base uppercase font-serif tracking-widest"
                  animate={{
                    textShadow: ['0 0 4px rgba(120, 170, 255, 0.3)', '0 0 8px rgba(120, 170, 255, 0.6)', '0 0 4px rgba(120, 170, 255, 0.3)']
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {AchievementTitles[type]}
                </motion.div>
              </motion.div>
              
              {/* Dark Souls style rune */}
              <motion.div 
                className="absolute -right-3 -top-3 w-24 h-24 opacity-20 z-0"
                style={{
                  background: 'radial-gradient(circle at center, rgba(100, 130, 255, 0.4) 0%, transparent 70%)',
                }}
                animate={{
                  opacity: [0.15, 0.25, 0.15],
                  rotate: [0, 360],
                }}
                transition={{
                  opacity: { duration: 3, repeat: Infinity },
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                }}
              />
              
              {/* Achievement icon - with mystical glow */}
              <motion.div 
                className="absolute right-4 top-4 opacity-80"
                animate={{ 
                  opacity: [0.7, 0.9, 0.7],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                <div className="text-blue-300/90 z-10 relative filter drop-shadow-md">
                  {AchievementIcons[type]}
                </div>
                <motion.div 
                  className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 10px 5px rgba(100, 130, 255, 0.1)',
                      '0 0 20px 10px rgba(100, 130, 255, 0.2)',
                      '0 0 10px 5px rgba(100, 130, 255, 0.1)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              {/* Mystical runes/glyphs scattered in the background */}
              <motion.div
                className="absolute left-3 bottom-3 text-[8px] text-blue-500/30 font-serif"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                ⦿⦾⧖⧗
              </motion.div>
              
              <motion.div
                className="absolute right-3 bottom-3 text-[8px] text-blue-500/30 font-serif"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                ⦿⧗⧉
              </motion.div>
              
              {/* Dark Souls style separator lines */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 h-[1px]"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(100, 130, 255, 0.7), transparent)'
                }}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  boxShadow: [
                    '0 0 3px 0 rgba(100, 130, 255, 0.3)',
                    '0 0 8px 0 rgba(100, 130, 255, 0.5)',
                    '0 0 3px 0 rgba(100, 130, 255, 0.3)'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity
                }}
              />
              
              {/* Vertical mystic line accents */}
              <motion.div 
                className="absolute left-0 top-0 bottom-0 w-[1px]"
                style={{
                  background: 'linear-gradient(to bottom, transparent, rgba(100, 130, 255, 0.5), transparent)'
                }}
                initial={{ opacity: 0, scaleY: 0.7 }}
                animate={{ 
                  opacity: 1, 
                  scaleY: 1,
                  boxShadow: [
                    '0 0 2px 0 rgba(100, 130, 255, 0.2)',
                    '0 0 5px 0 rgba(100, 130, 255, 0.4)',
                    '0 0 2px 0 rgba(100, 130, 255, 0.2)'
                  ]
                }}
                transition={{ 
                  opacity: { duration: 0.5 },
                  scaleY: { duration: 0.5 },
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
              />
              
              <motion.div 
                className="absolute right-0 top-0 bottom-0 w-[1px]"
                style={{
                  background: 'linear-gradient(to bottom, transparent, rgba(100, 130, 255, 0.5), transparent)'
                }}
                initial={{ opacity: 0, scaleY: 0.7 }}
                animate={{ 
                  opacity: 1, 
                  scaleY: 1,
                  boxShadow: [
                    '0 0 2px 0 rgba(100, 130, 255, 0.2)',
                    '0 0 5px 0 rgba(100, 130, 255, 0.4)',
                    '0 0 2px 0 rgba(100, 130, 255, 0.2)'
                  ]
                }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.2 },
                  scaleY: { duration: 0.5, delay: 0.2 },
                  boxShadow: { duration: 2, repeat: Infinity, delay: 0.5 }
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Achievement;