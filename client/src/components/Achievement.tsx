import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Definisi tipe achievement
export type AchievementType = 
  | 'approach'    // "Approach Him" ditekan
  | 'contract'    // Membuka kontrak
  | 'success'     // Berhasil membuat kontrak (link ditekan)
  | 'document'    // Berhasil membuka dokumen kontrak
  | 'anger'       // Berhasil membuat marah
  | 'nightmare'   // Berhasil masuk ke nightmare
  | 'listener'    // Mendengar semua dialog tanpa interupsi
  | 'patience'    // Diaktifkan setelah 9 menit tidak ada interaksi (FINAL_WARNING)
  | 'return'      // Setelah reset, user menekan APPROACH HIM lagi (RETURN_DIALOG)
  | 'hover';      // Setelah reset, user melakukan hover (HOVER_AFTER_RESET)

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
  document: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Simbol 'magnifier' yang lebih terlihat untuk menunjukkan dokumen yang dapat dilihat */}
      <circle cx="18" cy="20" r="2" stroke="#FFC107" strokeWidth="1.5" fill="none" />
      <path d="M15 17l2 2" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Highlight dokumen */}
      <path d="M9 14h6" stroke="#FFC107" strokeWidth="0.75" strokeLinecap="round" strokeOpacity="0.7" />
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
  ),
  listener: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1C7.03 1 3 5.03 3 10v7c0 1.66 1.34 3 3 3h5c1.66 0 3-1.34 3-3v-4c0-1.66-1.34-3-3-3H5V10c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-1c-1.66 0-3 1.34-3 3v4c0 1.66 1.34 3 3 3h5c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M7 15c1.5-1 3.5-1 5 0" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 14c1.5-1 3-1 4.5 0" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 12c1-0.7 2-0.7 3 0" stroke="#FFC107" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M17 11c0.7-0.5 1.3-0.5 2 0" stroke="#FFC107" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="#FFC107" strokeWidth="0.5" strokeDasharray="1 2" />
    </svg>
  ),
  patience: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 8v4l3 3" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 12a5 5 0 0110 0" stroke="#FFC107" strokeWidth="1" strokeDasharray="1 1" />
      <path d="M16 16.5a7 7 0 01-8 0" stroke="#FFC107" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  return: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 3h-7a2 2 0 00-2 2v14a2 2 0 002 2h7a2 2 0 002-2V5a2 2 0 00-2-2z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M1 12h12M8 7l-7 5 7 5" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 8v8" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 1.5" />
    </svg>
  ),
  hover: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="20" height="14" rx="2" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M8 12h8M12 8v8" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 16l2 2M5 16l-2 2M17 8l2-2M5 8L3 6" 
        stroke="#FFC107" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
};

// Definisi teks untuk setiap jenis achievement
const AchievementTitles: Record<AchievementType, string> = {
  approach: 'FIRST IMPRESSION',
  contract: 'PORTFOLIO EXPLORER',
  document: 'DOCUMENT VIEWER',
  success: 'CONNECTION ESTABLISHED',
  anger: 'CHALLENGE ACCEPTED',
  nightmare: 'DIGITAL ODYSSEY',
  listener: 'PATIENT LISTENER',
  patience: 'TIME GAZER',
  return: 'UNDETERRED SEEKER',
  hover: 'CURIOUS OBSERVER'
};

// Deskripsi achievement
const AchievementDescriptions: Record<AchievementType, string> = {
  approach: 'You took the first step to discover this unique portfolio.',
  contract: 'You explored the professional projects and credentials.',
  document: 'You\'ve examined the detailed documents within the contract.',
  success: 'You\'ve successfully connected with the professional profile.',
  anger: 'You tested the limits of the interactive experience.',
  nightmare: 'You discovered the creative side of this digital portfolio.',
  listener: 'You\'ve listened to the full story without interruption.',
  patience: 'You\'ve spent significant time contemplating the possibilities.',
  return: 'Despite challenges, you returned to continue exploring.',
  hover: 'You\'ve shown curiosity in exploring interactive elements.'
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

// Soul essence particle effect - authentic Dark Souls soul essence style
const SoulEssence: React.FC<{
  delay: number;
  duration: number;
  startX: number;
  startY: number;
}> = ({ delay, duration, startX, startY }) => {
  // Generate more authentic dark souls soul movement
  // In Dark Souls, souls have a gentle floating, rising motion
  const endX = startX + (Math.random() * 16 - 8); // Less horizontal movement
  const endY = startY - 10 - Math.random() * 20; // More vertical rise
  const size = 1.8 + Math.random() * 2.5; // Slightly larger particle
  
  // Choose color from authentic Dark Souls palette
  // Soul particles range from pale gold to amber orange
  const hue = 35 + Math.random() * 10; // Range from amber-yellow to gold
  const saturation = 80 + Math.random() * 20; // Highly saturated
  const lightness = 60 + Math.random() * 20; // Moderate lightness
  const opacity = 0.6 + Math.random() * 0.3; // Semi-transparent
  const color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  
  // Generate a soft glow intensity proportional to particle size
  const glowSize = 3 + size * 1.2;
  const glowIntensity = 0.6 + Math.random() * 0.3;
  
  // Control path variation for more authentic soul movement
  const pathVariation = Math.random() > 0.5 ? "pathA" : "pathB";
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        boxShadow: `0 0 ${glowSize}px ${glowSize/2}px hsla(${hue}, ${saturation}%, ${lightness}%, ${glowIntensity/2})`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={pathVariation === "pathA" ? {
        opacity: [0, opacity, 0],
        scale: [0.3, 1, 0.2],
        x: [0, endX * 0.3 - startX, endX - startX],
        y: [0, (endY - startY) * 0.4, endY - startY],
      } : {
        opacity: [0, opacity, 0],
        scale: [0.4, 0.9, 0.3],
        x: [0, endX - startX, (endX - startX) * 0.8],
        y: [0, (endY - startY) * 0.6, endY - startY],
      }}
      transition={{
        duration: duration * 1.2, // Slightly slower for more authentic movement
        ease: "easeOut",
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2 + 1, // Longer delay between particles
      }}
    />
  );
};

// Generate random dark souls gold/orange fog particles
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
      color: 'rgba(15, 10, 5, 0.6)',
      blur: 6 + Math.random() * 4
    });
  }
  
  // Dark souls gold/orange fog
  for (let i = 0; i < Math.floor(count/2); i++) {
    particles.push({
      id: `mystic-${i}`,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      positionX: Math.random() * 100,
      size: 4 + Math.random() * 10,
      color: `rgba(${150 + Math.random() * 50}, ${100 + Math.random() * 50}, ${20 + Math.random() * 30}, 0.3)`,
      blur: 5 + Math.random() * 4
    });
  }
  
  // Subtle gold highlights
  for (let i = 0; i < Math.floor(count/4); i++) {
    particles.push({
      id: `gold-${i}`,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 1.5,
      positionX: Math.random() * 100,
      size: 3 + Math.random() * 8,
      color: 'rgba(255, 215, 100, 0.2)',
      blur: 4 + Math.random() * 3
    });
  }
  
  return particles;
};

// Generate soul essence particles with better distribution
const generateSoulEssences = (count: number) => {
  const essences = [];
  
  // Generate particles in different regions for better distribution
  
  // Left side of achievement (near icon)
  for (let i = 0; i < Math.floor(count * 0.4); i++) {
    essences.push({
      id: `soul-left-${i}`,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 2,
      startX: 5 + Math.random() * 20, // concentrated around the icon area
      startY: 30 + Math.random() * 40, // mix of heights
    });
  }
  
  // Center area of achievement
  for (let i = 0; i < Math.floor(count * 0.3); i++) {
    essences.push({
      id: `soul-center-${i}`,
      delay: 0.5 + Math.random() * 2,
      duration: 1.8 + Math.random() * 1.8,
      startX: 30 + Math.random() * 30, // center section
      startY: 20 + Math.random() * 60, // full height range
    });
  }
  
  // Right side of achievement
  for (let i = 0; i < Math.floor(count * 0.3); i++) {
    essences.push({
      id: `soul-right-${i}`,
      delay: 1 + Math.random() * 2,
      duration: 2 + Math.random() * 1.5,
      startX: 65 + Math.random() * 30, // right side
      startY: 25 + Math.random() * 50, // mid to high positions
    });
  }
  
  return essences;
};

interface AchievementProps {
  type: AchievementType;
  onComplete?: () => void;
}

const Achievement: React.FC<AchievementProps> = ({ type, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const achievementSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Generate mystical particles - increased amounts for more dramatic effect
  const fogParticles = useRef(generateFogParticles(18)); // Increased from 12 to 18
  const soulEssences = useRef(generateSoulEssences(15)); // Increased from 8 to 15
  
  useEffect(() => {
    // Mainkan suara achievement dengan Web Audio API
    try {
      // Pastikan script achievement-sound.js sudah dimuat
      const createAchievementSound = (window as any).createAchievementSound;
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

    // Otomatis sembunyikan achievement setelah 3 detik
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Callback setelah animasi exit selesai
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500); // Tunggu animasi exit selesai
    }, 3000); // Lebih cepat untuk meningkatkan pengalaman pengguna

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
          className="fixed top-4 sm:top-5 md:top-6 lg:top-8 right-3 sm:right-4 md:right-6 lg:right-8 z-40 max-w-[85vw] sm:max-w-[340px]"
        >
          {/* Dark Souls style achievement - compact design like the screenshot */}
          <motion.div 
            className="flex flex-col items-start"
            animate={{ 
              boxShadow: [
                "0 0 8px rgba(255, 180, 30, 0.15)", 
                "0 0 12px rgba(255, 180, 30, 0.25)", 
                "0 0 8px rgba(255, 180, 30, 0.15)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {/* Achievement notification - styled like Dark Souls, responsive width */}
            <div className="px-2 py-2 sm:px-3 sm:py-3 bg-black/95 border-2 border-amber-500/50 shadow-xl relative overflow-hidden w-[250px] sm:w-[280px] md:w-72 rounded-sm">
              {/* Dark mystical background */}
              <div 
                className="absolute inset-0" 
                style={{
                  background: 'linear-gradient(to right, rgba(30, 25, 15, 0.95), rgba(20, 15, 10, 0.98))',
                }}
              />
              
              {/* Mystical effects container */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Dark Souls style gradient background */}
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(35, 25, 15, 0.9), rgba(15, 10, 5, 0.95))'
                  }}
                  animate={{ 
                    opacity: [0.8, 0.95, 0.8]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                {/* Ornamental border like in Dark Souls */}
                <div className="absolute inset-0 border border-amber-700/40 m-[3px] pointer-events-none"></div>
                
                {/* Glowing border effect */}
                <motion.div 
                  className="absolute inset-0 opacity-0"
                  style={{
                    boxShadow: 'inset 0 0 10px 2px rgba(255, 180, 50, 0.3)',
                  }}
                  animate={{ 
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                {/* Gold fog particles - enhanced */}
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
                
                {/* Soul essence particles - enhanced */}
                {soulEssences.current.map((essence) => (
                  <SoulEssence
                    key={essence.id}
                    delay={essence.delay}
                    duration={essence.duration}
                    startX={essence.startX}
                    startY={essence.startY}
                  />
                ))}
                
                {/* Dark Souls icon glow - enhanced */}
                <motion.div
                  className="absolute h-10 w-10 left-2 top-3 opacity-40"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255, 180, 50, 0.4) 0%, transparent 70%)',
                    filter: 'blur(4px)',
                  }}
                  animate={{
                    opacity: [0.4, 0.6, 0.4],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
              
              {/* Dark Souls style inner container - responsive for mobile */}
              <div className="relative z-10 flex items-start py-1">
                {/* Achievement icon - smaller on mobile */}
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mr-1.5 sm:mr-2 md:mr-3">
                  <motion.div 
                    className="text-amber-500/90"
                    animate={{ 
                      opacity: [0.8, 1, 0.8],
                      filter: ["drop-shadow(0 0 3px rgba(255, 180, 30, 0.3))", "drop-shadow(0 0 5px rgba(255, 180, 30, 0.5))", "drop-shadow(0 0 3px rgba(255, 180, 30, 0.3))"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    {/* Dark Souls style icon with golden border and glow */}
                    <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-sm bg-gradient-to-br from-black to-gray-900 flex items-center justify-center border border-amber-500/40 relative">
                      {/* Icon background glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-900/20 rounded-sm"></div>
                      
                      {/* Achievement type specific icon */}
                      {type === 'approach' && (
                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 8l-7-7-7 7v11a2 2 0 002 2h10a2 2 0 002-2V8z" 
                            stroke="#FFC107" strokeWidth="1.5" fill="rgba(255, 180, 30, 0.3)" />
                          <path d="M9 15l3 3 5-5" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      
                      {type === 'contract' && (
                        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 sm:h-7 sm:w-7" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" 
                            stroke="#FFC107" strokeWidth="1.5" fill="rgba(255, 180, 30, 0.3)" />
                          <path d="M7 7h10M7 11h10M7 15h6" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                      
                      {type === 'document' && (
                        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 sm:h-7 sm:w-7" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" 
                            stroke="#FFC107" strokeWidth="1.5" fill="rgba(255, 180, 30, 0.3)" />
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="18" cy="20" r="2" stroke="#FFC107" strokeWidth="1.5" fill="none" />
                          <path d="M15 17l2 2" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      
                      {type === 'success' && (
                        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 sm:h-7 sm:w-7" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" 
                            stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="12" r="3" stroke="#FFC107" strokeWidth="1.5" fill="rgba(255, 180, 30, 0.3)" />
                        </svg>
                      )}
                      
                      {type === 'anger' && (
                        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 sm:h-7 sm:w-7" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" 
                            stroke="#FFC107" strokeWidth="1.5" fill="rgba(255, 180, 30, 0.2)" />
                          <path d="M12 8v8M8 12h8" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                      
                      {type === 'nightmare' && (
                        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 sm:h-7 sm:w-7" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2l2.5 5 5.5.5-4 4 1 5.5-5-2.5-5 2.5 1-5.5-4-4 5.5-.5L12 2z" 
                            stroke="#FFC107" strokeWidth="1.5" fill="rgba(255, 180, 30, 0.3)" />
                          <path d="M12 7v5M12 16v.1" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                      
                      {type === 'listener' && (
                        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 sm:h-7 sm:w-7" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 1C7.03 1 3 5.03 3 10v7c0 1.66 1.34 3 3 3h5c1.66 0 3-1.34 3-3v-4c0-1.66-1.34-3-3-3H5V10c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-1c-1.66 0-3 1.34-3 3v4c0 1.66 1.34 3 3 3h5c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"
                            stroke="#FFC107" strokeWidth="1.5" fill="rgba(255, 180, 30, 0.3)" />
                          <path d="M7 15c1.5-1 3.5-1 5 0" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M16 14c1.5-1 3-1 4.5 0" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                      
                      {/* Small glowing accent in corner */}
                      <div className="absolute top-[2px] right-[2px] h-1 w-1 bg-amber-400 rounded-full opacity-80"></div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Achievement text content - responsive for mobile */}
                <div className="flex flex-col mt-1">
                  {/* Achievement title with Dark Souls style - uppercase, letterSpacing */}
                  <motion.p
                    className="text-xs sm:text-sm text-amber-100 font-semibold tracking-wide uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ textShadow: '0 0 5px rgba(255, 180, 30, 0.3)' }}
                  >
                    {AchievementTitles[type]}
                  </motion.p>
                  
                  {/* Thin decorative line */}
                  <div className="h-px w-full bg-gradient-to-r from-amber-500/50 via-amber-400/30 to-transparent my-1 sm:my-1.5"></div>
                  
                  {/* Achievement description - smaller text with subtle color */}
                  <motion.p
                    className="text-[10px] sm:text-xs text-amber-400/70 leading-snug"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {AchievementDescriptions[type]}
                  </motion.p>
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