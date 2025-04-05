import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EmotionType, getEmotionById } from '../types/emotions';

interface EmotionContextProps {
  currentEmotion: EmotionType;
  setEmotion: (emotion: EmotionType) => void;
  getEmotionParams: () => {
    voiceParams?: {
      stability?: number;
      similarity_boost?: number;
      style?: number;
      speaking_rate?: number;
    };
    visualParams?: {
      filter?: string;
      animation?: string;
      transform?: string;
      transition?: string;
    };
  };
}

const EmotionContext = createContext<EmotionContextProps | undefined>(undefined);

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (!context) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};

interface EmotionProviderProps {
  children: ReactNode;
}

export const EmotionProvider: React.FC<EmotionProviderProps> = ({ children }) => {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral');

  const setEmotion = (emotion: EmotionType) => {
    console.log(`Changing character emotion to: ${emotion}`);
    setCurrentEmotion(emotion);
  };

  const getEmotionParams = () => {
    const emotion = getEmotionById(currentEmotion);
    return {
      voiceParams: emotion.voiceParams,
      visualParams: emotion.visualParams,
    };
  };

  return (
    <EmotionContext.Provider value={{ currentEmotion, setEmotion, getEmotionParams }}>
      {children}
    </EmotionContext.Provider>
  );
};

export default EmotionContext;