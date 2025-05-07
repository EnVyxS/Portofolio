
import React, { createContext, useContext, useState } from 'react';
import Achievement, { AchievementData } from '../components/Achievement';

interface AchievementContextType {
  showAchievement: (achievement: AchievementData) => void;
}

const AchievementContext = createContext<AchievementContextType>({
  showAchievement: () => {},
});

export const useAchievements = () => useContext(AchievementContext);

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAchievement, setCurrentAchievement] = useState<AchievementData | null>(null);
  
  const showAchievement = (achievement: AchievementData) => {
    setCurrentAchievement(achievement);
  };

  return (
    <AchievementContext.Provider value={{ showAchievement }}>
      {children}
      {currentAchievement && (
        <Achievement 
          achievement={currentAchievement}
          onComplete={() => setCurrentAchievement(null)}
        />
      )}
    </AchievementContext.Provider>
  );
};
