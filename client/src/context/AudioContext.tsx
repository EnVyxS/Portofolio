import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Gunakan path relatif untuk akses langsung public assets
const backgroundMusicPath = '/assets/Darksouls-Chill.m4a';

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
  setHasInteracted: () => {}
});

export const useAudio = () => useContext(AudioContext);

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [audio] = useState<HTMLAudioElement>(new Audio(backgroundMusicPath));
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Set audio properties
  useEffect(() => {
    audio.loop = true;
    audio.volume = 0.3;
    
    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  // Play audio when hasInteracted changes to true
  useEffect(() => {
    if (hasInteracted) {
      playAudio();
    }
  }, [hasInteracted]);

  const playAudio = useCallback(() => {
    if (!isAudioPlaying) {
      audio.play()
        .then(() => {
          setIsAudioPlaying(true);
        })
        .catch(error => {
          console.error('Failed to play audio:', error);
          // In some browsers, audio can only play after user interaction
          setIsAudioPlaying(false);
        });
    }
  }, [audio, isAudioPlaying]);

  const pauseAudio = useCallback(() => {
    if (isAudioPlaying) {
      audio.pause();
      setIsAudioPlaying(false);
    }
  }, [audio, isAudioPlaying]);

  return (
    <AudioContext.Provider
      value={{
        isAudioPlaying,
        playAudio,
        pauseAudio,
        hasInteracted,
        setHasInteracted
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext;