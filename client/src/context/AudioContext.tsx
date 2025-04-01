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
    // Function to try auto play - will likely be blocked by browser without interaction
    const tryAutoPlay = () => {
      if (!autoPlayAttempted.current && !isAudioPlaying) {
        autoPlayAttempted.current = true;
        
        // Add muted attribute to make autoplay more likely to work
        music.muted = true;
        ambient.muted = true;
        
        const musicPromise = music.play()
          .then(() => {
            // If autoplay succeeds, unmute after 300ms
            setTimeout(() => {
              music.muted = false;
              ambient.muted = false;
              setIsAudioPlaying(true);
              console.log("Autoplay succeeded with muted approach");
            }, 300);
          })
          .catch(error => {
            console.log("Autoplay blocked by browser, waiting for user interaction", error);
            music.muted = false;
            ambient.muted = false;
            // If autoplay fails, we'll wait for interaction
          });
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

  const playAudio = useCallback(() => {
    if (!isAudioPlaying) {
      try {
        // Play main music first
        const playMusic = async () => {
          try {
            await music.play();
            console.log("Music started successfully");
            
            // After music starts, try playing ambient sound
            try {
              await ambient.play();
              setIsAudioPlaying(true);
              console.log("Audio berhasil diputar");
            } catch (ambientError) {
              console.error('Failed to play ambient sound:', ambientError);
              // Still mark as playing if main music works even if ambient fails
              setIsAudioPlaying(true);
            }
          } catch (musicError) {
            console.error('Failed to play music:', musicError);
            // In some browsers, audio can only play after user interaction
            setIsAudioPlaying(false);
            
            // If music failed due to autoplay restrictions, we can try muted approach
            if (!hasInteracted) {
              console.log("Attempting muted autoplay workaround...");
              music.muted = true;
              try {
                await music.play();
                // If that worked, unmute after a delay 
                setTimeout(() => {
                  music.muted = false;
                  setIsAudioPlaying(true);
                }, 300);
              } catch (mutedError) {
                console.error("Even muted autoplay failed:", mutedError);
                music.muted = false;
              }
            }
          }
        };
        
        // Start the async playback process
        playMusic().catch(error => {
          console.error("Unexpected error during playback:", error);
        });
      } catch (error) {
        console.error("Unexpected error initiating playback:", error);
      }
    }
  }, [music, ambient, isAudioPlaying, hasInteracted]);

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