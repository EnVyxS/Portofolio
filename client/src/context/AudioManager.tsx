import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Import background music from attached assets
import backgroundMusicSrc from "@assets/relaxing-fire-sounds.m4a";
import fireplaceAmbientSrc from "@assets/pink-noise-audio.mp3";

interface AudioContextProps {
  isAudioPlaying: boolean;
  playAudio: () => void;
  pauseAudio: () => void;
  hasInteracted: boolean;
  setHasInteracted: (value: boolean) => void;
  setVolume: (volume: number) => void;
  setAmbientVolume: (volume: number) => void;
  currentVolume: number;
  currentAmbientVolume: number;
}

// Menciptakan konteks dengan nilai default
const AudioContextValue = createContext<AudioContextProps>({
  isAudioPlaying: false,
  playAudio: () => {},
  pauseAudio: () => {},
  hasInteracted: false,
  setHasInteracted: () => {},
  setVolume: () => {},
  setAmbientVolume: () => {},
  currentVolume: 0.4,
  currentAmbientVolume: 0.2
});

// Hook untuk menggunakan konteks audio
export const useAudio = () => useContext(AudioContextValue);

interface AudioProviderProps {
  children: React.ReactNode;
}

// Provider untuk konteks audio
export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [music] = useState<HTMLAudioElement>(new Audio(backgroundMusicSrc));
  const [ambient] = useState<HTMLAudioElement>(new Audio(fireplaceAmbientSrc));
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [currentVolume, setCurrentVolume] = useState<number>(0.4);
  const [currentAmbientVolume, setCurrentAmbientVolume] = useState<number>(0.2);
  const [userHasManuallyStopped, setUserHasManuallyStopped] = useState<boolean>(false);
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoPlayAttempted = useRef<boolean>(false);

  // Set audio properties
  useEffect(() => {
    // Setup main music
    music.loop = true;
    music.volume = 0.4;
    
    // Setup ambient sound
    ambient.loop = true;
    ambient.volume = 0.2;
    
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

  // Handle visibility change (pause when tab/window is not visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isAudioPlaying) {
          console.log("Tab not visible - pausing audio");
          music.pause();
          ambient.pause();
        }
      } else if (isAudioPlaying) {
        console.log("Tab visible again - resuming audio");
        music.play().catch(() => console.log("Failed to resume music on visibility change"));
        ambient.play().catch(() => console.log("Failed to resume ambient on visibility change"));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [music, ambient, isAudioPlaying]);

  // Setup automatic play triggers
  useEffect(() => {
    const tryAutoPlay = async () => {
      if (!autoPlayAttempted.current && !isAudioPlaying) {
        autoPlayAttempted.current = true;
        
        music.muted = true;
        ambient.muted = true;
        
        try {
          await music.play();
          setTimeout(() => {
            music.muted = false;
            ambient.muted = false;
            setIsAudioPlaying(true);
            console.log("Autoplay succeeded with muted approach");
          }, 300);
          
          try {
            await ambient.play();
          } catch (error) {
            console.log("Ambient autoplay failed, will try again with user interaction");
          }
        } catch (error) {
          console.log("Autoplay blocked by browser, waiting for user interaction");
          music.muted = false;
          ambient.muted = false;
        }
      }
    };

    interactionTimeout.current = setTimeout(() => {
      tryAutoPlay();
    }, 1000);

    const handleUserInteraction = () => {
      if (!hasInteracted) {
        console.log("User interaction detected, enabling audio");
        setHasInteracted(true);
      }
    };

    const interactionEvents = [
      'click', 'touchstart', 'mousedown', 'keydown', 
      'mousemove', 'scroll', 'touchmove'
    ];
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current);
      }
      
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [isAudioPlaying, hasInteracted]);

  const playAudio = useCallback(async () => {
    if (!isAudioPlaying) {
      try {
        console.log("Attempting to play audio...");
        
        music.muted = false;
        ambient.muted = false;
        music.volume = currentVolume;
        ambient.volume = currentAmbientVolume;
        
        try {
          await music.play();
          console.log("Music started successfully");
          setIsAudioPlaying(true);
          setUserHasManuallyStopped(false); // Reset manual stop flag when user plays audio
          
          setTimeout(async () => {
            try {
              await ambient.play();
              console.log("Ambient sound started successfully");
            } catch (error: any) {
              console.log("Failed to play ambient sound:", error.message || error);
            }
          }, 100);
          
        } catch (error: any) {
          console.log("Music play failed:", error.message || error);
          
          if (hasInteracted) {
            try {
              music.muted = true;
              await music.play();
              
              setTimeout(() => {
                music.muted = false;
                music.volume = currentVolume;
                setIsAudioPlaying(true);
                console.log("Music started with muted workaround");
              }, 200);
              
            } catch (mutedError: any) {
              console.log("Muted play also failed:", mutedError.message || mutedError);
              music.muted = false;
            }
          }
        }
      } catch (error: any) {
        console.log("Unexpected error in audio playback:", error);
      }
    }
  }, [music, ambient, isAudioPlaying, hasInteracted, currentVolume, currentAmbientVolume]);

  const pauseAudio = useCallback(() => {
    if (isAudioPlaying) {
      console.log("Pausing background music and ambient sound");
      music.pause();
      ambient.pause();
      setIsAudioPlaying(false);
      setUserHasManuallyStopped(true);
    }
  }, [music, ambient, isAudioPlaying]);

  const setVolume = useCallback((volume: number) => {
    if (volume >= 0 && volume <= 1) {
      music.volume = volume;
      setCurrentVolume(volume);
    }
  }, [music]);
  
  const setAmbientVolume = useCallback((volume: number) => {
    if (volume >= 0 && volume <= 1) {
      ambient.volume = volume;
      setCurrentAmbientVolume(volume);
    }
  }, [ambient]);

  // Play audio when hasInteracted changes to true, but only if user hasn't manually stopped it
  useEffect(() => {
    if (hasInteracted && !isAudioPlaying && !userHasManuallyStopped) {
      playAudio();
    }
  }, [hasInteracted, isAudioPlaying, userHasManuallyStopped, playAudio]);

  return (
    <AudioContextValue.Provider
      value={{
        isAudioPlaying,
        playAudio,
        pauseAudio,
        hasInteracted,
        setHasInteracted,
        setVolume,
        setAmbientVolume,
        currentVolume,
        currentAmbientVolume,
      }}
    >
      {children}
    </AudioContextValue.Provider>
  );
};