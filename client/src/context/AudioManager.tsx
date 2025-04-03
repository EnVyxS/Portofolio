import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
// Gunakan path relatif untuk akses langsung public assets
const backgroundMusicPath = '/assets/Darksouls-Chill.m4a';
const fireplaceAmbientPath = '/assets/fireplace-ambient.m4a';

interface AudioContextProps {
  isAudioPlaying: boolean;
  playAudio: () => void;
  pauseAudio: () => void;
  hasInteracted: boolean;
  setHasInteracted: (value: boolean) => void;
  setVolume: (volume: number) => void;
  setAmbientVolume: (volume: number) => void;
}

// Menciptakan konteks dengan nilai default
const AudioContextValue = createContext<AudioContextProps>({
  isAudioPlaying: false,
  playAudio: () => {},
  pauseAudio: () => {},
  hasInteracted: false,
  setHasInteracted: () => {},
  setVolume: () => {},
  setAmbientVolume: () => {}
});

// Hook untuk menggunakan konteks audio
export const useAudio = () => useContext(AudioContextValue);

interface AudioProviderProps {
  children: React.ReactNode;
}

// Provider untuk konteks audio
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

  // Handle visibility change (pause when tab/window is not visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause audio when user switches tabs or minimizes window
        if (isAudioPlaying) {
          console.log("Tab not visible - pausing audio");
          music.pause();
          ambient.pause();
          // We don't set isAudioPlaying to false here because we want to resume on return
        }
      } else if (isAudioPlaying) {
        // Resume audio when user returns to tab, if it was playing before
        console.log("Tab visible again - resuming audio");
        music.play().catch(() => console.log("Failed to resume music on visibility change"));
        ambient.play().catch(() => console.log("Failed to resume ambient on visibility change"));
      }
    };

    // Register and clean up visibility change event
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [music, ambient, isAudioPlaying]);

  // Setup automatic play triggers
  useEffect(() => {
    // Function to try auto play - will likely be blocked by browser without interaction
    const tryAutoPlay = async () => {
      if (!autoPlayAttempted.current && !isAudioPlaying) {
        autoPlayAttempted.current = true;
        
        // Add muted attribute to make autoplay more likely to work
        music.muted = true;
        ambient.muted = true;
        
        try {
          await music.play();
          // If autoplay succeeds, unmute after 300ms
          setTimeout(() => {
            music.muted = false;
            ambient.muted = false;
            setIsAudioPlaying(true);
            console.log("Autoplay succeeded with muted approach");
          }, 300);
          
          // Try to play ambient sound too, but don't worry if it fails
          try {
            await ambient.play();
          } catch (error) {
            console.log("Ambient autoplay failed, will try again with user interaction");
          }
        } catch (error) {
          console.log("Autoplay blocked by browser, waiting for user interaction");
          music.muted = false;
          ambient.muted = false;
          // If autoplay fails, we'll wait for interaction
        }
      }
    };

    // Try autoplay after a short delay
    interactionTimeout.current = setTimeout(() => {
      tryAutoPlay();
    }, 1000);

    // Event handlers for user interaction
    const handleUserInteraction = () => {
      if (!hasInteracted) {
        console.log("User interaction detected, enabling audio");
        setHasInteracted(true);
      }
    };

    // Add multiple interaction event listeners to improve chances of catching interaction
    const interactionEvents = [
      'click', 'touchstart', 'mousedown', 'keydown', 
      'mousemove', 'scroll', 'touchmove'
    ];
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    // Cleanup listeners
    return () => {
      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current);
      }
      
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [isAudioPlaying]);

  // Play audio when hasInteracted changes to true
  useEffect(() => {
    if (hasInteracted) {
      playAudio();
    }
  }, [hasInteracted]);

  const playAudio = useCallback(async () => {
    if (!isAudioPlaying) {
      try {
        // Play main music first with proper promise handling
        console.log("Attempting to play audio...");
        
        try {
          await music.play();
          console.log("Music started successfully");
          
          // Only after music starts successfully, try ambient sound
          try {
            await ambient.play();
            console.log("Ambient sound started successfully");
          } catch (error: any) {
            console.log("Failed to play ambient sound:", error.message || error);
            // But continue anyway - we can live without ambient sound
          }
          
          // Mark as playing since at least music worked
          setIsAudioPlaying(true);
          
        } catch (error: any) {
          console.log("Standard play attempt failed:", error.message || error);
          
          // If music failed and user has interacted, try muted workaround
          if (!music.muted) {
            console.log("Attempting muted autoplay workaround...");
            music.muted = true;
            
            try {
              await music.play();
              console.log("Muted play successful, will unmute shortly");
              
              // If muted play worked, unmute after a short delay
              setTimeout(() => {
                music.muted = false;
                setIsAudioPlaying(true);
              }, 500);
              
            } catch (error: any) {
              console.log("Even muted autoplay failed:", error.message || error);
              music.muted = false;
            }
          }
        }
      } catch (error: any) {
        // This catches any errors not caught in the inner try/catch blocks
        console.log("Unexpected error in audio playback:", error);
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
    <AudioContextValue.Provider
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
    </AudioContextValue.Provider>
  );
};