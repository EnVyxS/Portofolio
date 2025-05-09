import React, { useState, useEffect, useRef } from 'react';
import Achievement from './Achievement';
import { AchievementType } from '../constants/achievementConstants';
import AchievementController from '../controllers/achievementController';

const AchievementDisplay: React.FC = () => {
  const [currentAchievement, setCurrentAchievement] = useState<AchievementType | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<AchievementType[]>([]);
  const isProcessingQueue = useRef(false);

  // Effect untuk menginisialisasi controller achievement
  useEffect(() => {
    const achievementController = AchievementController.getInstance();
    
    // Set callback pada achievement controller
    achievementController.setAchievementCallback((type: AchievementType) => {
      console.log(`[AchievementDisplay] Adding achievement to queue: ${type}`);
      
      // Cek jika achievement sudah ada di antrian untuk mencegah duplikat
      setAchievementQueue(prevQueue => {
        // Jika achievement sudah ada di antrian, jangan tambahkan lagi
        if (prevQueue.includes(type)) {
          return prevQueue;
        }
        return [...prevQueue, type];
      });
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
    if (achievementQueue.length > 0 && !currentAchievement && !isProcessingQueue.current) {
      isProcessingQueue.current = true;
      
      // Tambahkan sedikit delay untuk memastikan UI telah diperbarui sebelum menampilkan achievement berikutnya
      setTimeout(() => {
        // Ambil achievement pertama dari antrian
        const nextAchievement = achievementQueue[0];
        console.log(`[AchievementDisplay] Showing next achievement from queue: ${nextAchievement}`);
        
        // Update state untuk menampilkan achievement
        setCurrentAchievement(nextAchievement);
        
        // Hapus achievement dari antrian
        setAchievementQueue(prevQueue => prevQueue.slice(1));
        
        isProcessingQueue.current = false;
      }, 100); // Delay 100ms untuk memastikan UI telah diperbarui
    }
  }, [achievementQueue, currentAchievement]);

  // Handle ketika animasi achievement selesai
  const handleAchievementComplete = () => {
    console.log('[AchievementDisplay] Achievement display completed');
    setCurrentAchievement(null);
    
    // Tambahkan delay sebelum menampilkan achievement berikutnya (jika ada)
    setTimeout(() => {
      isProcessingQueue.current = false;
    }, 500); // Delay 500ms untuk memberikan jeda antar achievement
  };

  // Khusus untuk achievement "escape" pada dream.html, tampilkan dengan ukuran penuh
  const isEscapeAchievement = currentAchievement === 'escape';
  const isDreamPage = window.location.pathname.includes('dream.html');
  const showFullScreenEscape = isEscapeAchievement && isDreamPage;

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