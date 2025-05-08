import React, { useState, useEffect } from 'react';
import Achievement from './Achievement';
import { AchievementType } from '../constants/achievementConstants';
import AchievementController from '../controllers/achievementController';

const AchievementDisplay: React.FC = () => {
  const [currentAchievement, setCurrentAchievement] = useState<AchievementType | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<AchievementType[]>([]);

  // Effect untuk menginisialisasi controller achievement
  useEffect(() => {
    const achievementController = AchievementController.getInstance();
    
    // Set callback pada achievement controller
    achievementController.setAchievementCallback((type: AchievementType) => {
      // Menambahkan achievement ke antrian
      setAchievementQueue(prevQueue => [...prevQueue, type]);
    });
    
    // Cleanup
    return () => {
      // Clear callback saat component di-unmount
      achievementController.setAchievementCallback(() => {});
    };
  }, []);
  
  // Effect untuk menangani antrian achievements
  useEffect(() => {
    // Jika ada achievement di antrian dan tidak ada achievement yang ditampilkan
    if (achievementQueue.length > 0 && !currentAchievement) {
      // Ambil achievement pertama dari antrian
      const nextAchievement = achievementQueue[0];
      // Update state untuk menampilkan achievement
      setCurrentAchievement(nextAchievement);
      // Hapus achievement dari antrian
      setAchievementQueue(prevQueue => prevQueue.slice(1));
    }
  }, [achievementQueue, currentAchievement]);

  // Handle ketika animasi achievement selesai
  const handleAchievementComplete = () => {
    setCurrentAchievement(null);
  };

  // Render achievement jika ada
  return (
    <>
      {currentAchievement && (
        <Achievement 
          type={currentAchievement} 
          onComplete={handleAchievementComplete} 
        />
      )}
    </>
  );
};

export default AchievementDisplay;