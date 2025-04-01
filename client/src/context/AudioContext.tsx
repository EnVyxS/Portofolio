import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
// Gunakan path relatif untuk akses langsung public assets
const backgroundMusicPath = '/assets/Darksouls-Chill.m4a';

interface AudioContextProps {
  isAudioPlaying: boolean;
  playAudio: () => void;
  pauseAudio: () => void;
  hasInteracted: boolean;
  setHasInteracted: (value: boolean) => void;
  setVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextProps>({
  isAudioPlaying: false,
  playAudio: () => {},
  pauseAudio: () => {},
  hasInteracted: false,
  setHasInteracted: () => {},
  setVolume: () => {}
});

export const useAudio = () => useContext(AudioContext);

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [audio] = useState<HTMLAudioElement>(new Audio(backgroundMusicPath));
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoPlayAttempted = useRef<boolean>(false);

  // Set audio properties
  useEffect(() => {
    audio.loop = true;
    audio.volume = 0.15; // Lebih pelan dari biasanya (15% volume)
    
    // Cleanup on unmount
    return () => {
      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current);
      }
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  // Setup automatic play triggers
  useEffect(() => {
    const tryAutoPlay = () => {
      if (!autoPlayAttempted.current) {
        autoPlayAttempted.current = true;
        playAudio();
      }
    };

    // 1. Tunggu 1 detik untuk mencoba auto-play
    interactionTimeout.current = setTimeout(() => {
      tryAutoPlay();
    }, 1000);

    // 2. Coba mainkan audio saat mouse bergerak
    const handleMouseMove = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };

    // 3. Atau saat scroll
    const handleScroll = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };

    // 4. Atau jika ada input keyboard
    const handleKeyPress = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };

    // Tambahkan listener
    window.addEventListener('mousemove', handleMouseMove, { once: true });
    window.addEventListener('scroll', handleScroll, { once: true });
    window.addEventListener('keydown', handleKeyPress, { once: true });

    // Cleanup listener
    return () => {
      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Play audio when hasInteracted changes to true
  useEffect(() => {
    if (hasInteracted) {
      playAudio();
    }
  }, [hasInteracted]);

  const playAudio = useCallback(() => {
    if (!isAudioPlaying) {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsAudioPlaying(true);
            console.log("Audio berhasil diputar");
          })
          .catch(error => {
            console.error('Failed to play audio:', error);
            // In some browsers, audio can only play after user interaction
            setIsAudioPlaying(false);
          });
      }
    }
  }, [audio, isAudioPlaying]);

  const pauseAudio = useCallback(() => {
    if (isAudioPlaying) {
      audio.pause();
      setIsAudioPlaying(false);
    }
  }, [audio, isAudioPlaying]);

  const setVolume = useCallback((volume: number) => {
    if (volume >= 0 && volume <= 1) {
      audio.volume = volume;
    }
  }, [audio]);

  return (
    <AudioContext.Provider
      value={{
        isAudioPlaying,
        playAudio,
        pauseAudio,
        hasInteracted,
        setHasInteracted,
        setVolume
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext;