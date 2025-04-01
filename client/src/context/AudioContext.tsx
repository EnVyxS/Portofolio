import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
// Gunakan path relatif untuk akses langsung public assets
const backgroundMusicPath = '/assets/Darksouls-Chill.m4a';
const fireplaceAmbientPath = '/audio/ambient_fire.m4a';

interface AudioContextProps {
  isAudioPlaying: boolean;
  playAudio: () => void;
  pauseAudio: () => void;
  hasInteracted: boolean;
  setHasInteracted: (value: boolean) => void;
  setVolume: (volume: number) => void;
  setAmbientVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextProps>({
  isAudioPlaying: false,
  playAudio: () => {},
  pauseAudio: () => {},
  hasInteracted: false,
  setHasInteracted: () => {},
  setVolume: () => {},
  setAmbientVolume: () => {}
});

export const useAudio = () => useContext(AudioContext);

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [music] = useState<HTMLAudioElement>(new Audio(backgroundMusicPath));
  const [ambient] = useState<HTMLAudioElement>(new Audio(fireplaceAmbientPath));
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoPlayAttempted = useRef<boolean>(false);

  // Set audio properties
  useEffect(() => {
    // Setup main music
    music.loop = true;
    music.volume = 0.15; // Lebih pelan dari biasanya (15% volume)
    
    // Setup ambient sound
    ambient.loop = true;
    ambient.volume = 0.06; // Sekitar 40% dari volume musik utama
    
    // Cleanup on unmount
    return () => {
      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current);
      }
      music.pause();
      music.currentTime = 0;
      ambient.pause();
      ambient.currentTime = 0;
    };
  }, [music, ambient]);

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
      // Play main music
      const musicPromise = music.play();
      
      if (musicPromise !== undefined) {
        musicPromise
          .then(() => {
            // Play ambient sound after music starts
            const ambientPromise = ambient.play();
            if (ambientPromise !== undefined) {
              ambientPromise
                .then(() => {
                  setIsAudioPlaying(true);
                  console.log("Audio berhasil diputar");
                })
                .catch(error => {
                  console.error('Failed to play ambient sound:', error);
                });
            }
          })
          .catch(error => {
            console.error('Failed to play music:', error);
            // In some browsers, audio can only play after user interaction
            setIsAudioPlaying(false);
          });
      }
    }
  }, [music, ambient, isAudioPlaying]);

  const pauseAudio = useCallback(() => {
    if (isAudioPlaying) {
      music.pause();
      ambient.pause();
      setIsAudioPlaying(false);
    }
  }, [music, ambient, isAudioPlaying]);

  const setVolume = useCallback((volume: number) => {
    if (volume >= 0 && volume <= 1) {
      music.volume = volume;
    }
  }, [music]);
  
  const setAmbientVolume = useCallback((volume: number) => {
    if (volume >= 0 && volume <= 1) {
      ambient.volume = volume;
    }
  }, [ambient]);

  return (
    <AudioContext.Provider
      value={{
        isAudioPlaying,
        playAudio,
        pauseAudio,
        hasInteracted,
        setHasInteracted,
        setVolume,
        setAmbientVolume
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext;