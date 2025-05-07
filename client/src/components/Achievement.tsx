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
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 4Z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.8" />
    </svg>
  ),
  contract: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8H4C3.44772 8 3 8.44772 3 9V19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V9C21 8.44772 20.5523 8 20 8Z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.8" />
      <path d="M16 8V6C16 4.89543 15.1046 4 14 4H10C8.89543 4 8 4.89543 8 6V8" 
        stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 13H17M7 16H14" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.7" />
      <path d="M9 12L11 14L15 10" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  anger: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 10C15 10 13.8 12 12 12C10.2 12 9 10 9 10M3 8L5 10M21 8L19 10M12 18L12 16" 
        stroke="#FF5722" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.7" />
      <path d="M12 18V16M3 8L5 10M21 8L19 10" stroke="#FF5722" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  nightmare: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12Z" 
        stroke="currentColor" strokeWidth="1.5" fill="#2c2c2c" />
      <path d="M6 11L8 13M18 11L16 13M9 16C9 16 10 17 12 17C14 17 15 16 15 16" 
        stroke="#9C27B0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 7L10 9M13 7L14 9" stroke="#9C27B0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
};

// Definisi teks untuk setiap jenis achievement
const AchievementTitles: Record<AchievementType, string> = {
  approach: 'The First Step',
  contract: 'Contract Revealed',
  success: 'Soul Bound',
  anger: 'Wrath Unleashed',
  nightmare: 'Nightmare Descent'
};

// Deskripsi achievement
const AchievementDescriptions: Record<AchievementType, string> = {
  approach: 'You dared to approach him.',
  contract: 'You uncovered the contract of souls.',
  success: 'You have linked your soul to the contract.',
  anger: 'You have provoked his wrath.',
  nightmare: 'You have entered the realm of nightmares.'
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
    }, 5000);

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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.5
          }}
          className="fixed bottom-8 right-8 z-50 flex items-center p-4 
                    bg-black bg-opacity-90 border border-amber-600 
                    text-amber-100 rounded-lg shadow-lg max-w-sm"
        >
          <div className="mr-4 text-amber-400 flex-shrink-0">
            {AchievementIcons[type]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-400 mb-1">{AchievementTitles[type]}</h3>
            <p className="text-sm text-amber-200">{AchievementDescriptions[type]}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Achievement;