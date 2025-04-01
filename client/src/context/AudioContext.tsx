import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

interface AudioContextProps {
  isAudioPlaying: boolean;
  playAudio: () => void;
  pauseAudio: () => void;
  hasInteracted: boolean;
  setHasInteracted: (value: boolean) => void;
}

const AudioContext = createContext<AudioContextProps>({
  isAudioPlaying: false,
  playAudio: () => {},
  pauseAudio: () => {},
  hasInteracted: false,
  setHasInteracted: () => {},
});

export const useAudio = () => useContext(AudioContext);

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    // Only initialize if it hasn't been initialized yet
    if (!isAudioInitialized) {
      const audio = new Audio('/assets/Darksouls-Chill.m4a');
      audio.volume = 0.15; // Lower initial volume
      audio.loop = true;
      
      audioRef.current = audio;
      setIsAudioInitialized(true);
      
      // Check if audio was previously playing from localStorage
      const wasPlaying = localStorage.getItem('isAudioPlaying') === 'true';
      setIsAudioPlaying(wasPlaying);
      
      // Cleanup
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [isAudioInitialized]);

  // Handle auto-play when user has interacted
  useEffect(() => {
    if (hasInteracted && audioRef.current && isAudioPlaying) {
      // Try to play audio - browser might block it until user interaction
      audioRef.current.play().catch(error => {
        console.warn('Auto-play prevented:', error);
        setIsAudioPlaying(false);
      });
    }
  }, [hasInteracted, isAudioPlaying]);

  // Handle playing/pausing based on isAudioPlaying state
  useEffect(() => {
    if (!audioRef.current) return;

    if (isAudioPlaying) {
      audioRef.current.play().catch(error => {
        console.warn('Play prevented:', error);
        setIsAudioPlaying(false);
      });
      // Save preference to localStorage
      localStorage.setItem('isAudioPlaying', 'true');
    } else {
      audioRef.current.pause();
      // Save preference to localStorage
      localStorage.setItem('isAudioPlaying', 'false');
    }
  }, [isAudioPlaying]);

  const playAudio = () => {
    setIsAudioPlaying(true);
  };

  const pauseAudio = () => {
    setIsAudioPlaying(false);
  };

  return (
    <AudioContext.Provider
      value={{
        isAudioPlaying,
        playAudio,
        pauseAudio,
        hasInteracted,
        setHasInteracted,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext;