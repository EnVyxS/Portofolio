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

interface AchievementProps {
  type: AchievementType;
  onComplete?: () => void;
}

const Achievement: React.FC<AchievementProps> = ({ type, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const achievementSoundRef = useRef<HTMLAudioElement | null>(null);

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
    }, 4000); // Tampilkan selama 4 detik saja agar tidak terlalu lama

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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.4
          }}
          className="fixed bottom-6 right-6 z-50"
        >
          {/* Dark Souls style achievement - minimalis dan kecil di pojok kanan bawah */}
          <div className="flex flex-col items-start">
            {/* Achievement notification */}
            <div className="px-4 py-2 bg-black/90 border border-amber-900/50 shadow-lg relative overflow-hidden w-64">
              {/* Soft glow */}
              <div className="absolute inset-0 opacity-10 bg-amber-500 blur-md"></div>
              
              {/* Title with subtle animation */}
              <div className="mb-1 relative z-10">
                <p className="text-[10px] text-amber-500/80 uppercase tracking-widest">Achievement Unlocked</p>
              </div>
              
              {/* Achievement name */}
              <div className="flex items-center gap-2 relative z-10">
                <div className="text-amber-200 text-sm uppercase font-serif tracking-wider">
                  {AchievementTitles[type]}
                </div>
              </div>
              
              {/* Souls-style line separator */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-900/70 to-transparent"></div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Achievement;