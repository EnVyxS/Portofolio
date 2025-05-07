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
  currentVolume: 0.4, // Meningkatkan dari 0.15 menjadi 0.4 untuk perangkat mobile
  currentAmbientVolume: 0.2 // Meningkatkan dari 0.06 menjadi 0.2 untuk perangkat mobile
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
  const [currentVolume, setCurrentVolume] = useState<number>(0.4); // Meningkatkan default music volume untuk mobile
  const [currentAmbientVolume, setCurrentAmbientVolume] = useState<number>(0.2); // Meningkatkan default ambient volume untuk mobile
  const interactionTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoPlayAttempted = useRef<boolean>(false);

  // Set audio properties
  useEffect(() => {
    // Setup main music
    music.loop = true;
    music.volume = 0.4; // Meningkatkan default volume dari 0.15 menjadi 0.4 untuk mobile

    // Setup ambient sound
    ambient.loop = true;
    ambient.volume = 0.2; // Meningkatkan ambient volume dari 0.06 menjadi 0.2 untuk mobile

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

  // Setup automatic play triggers with better user interaction handling
  useEffect(() => {
    // Function to try audio playback
    const startAudioPlayback = async () => {
      if (!autoPlayAttempted.current && !isAudioPlaying) {
        autoPlayAttempted.current = true;

        try {
          // Load audio first to prepare for playback
          await Promise.all([
            music.load(),
            ambient.load()
          ]);

          // Start with very low volume and muted
          music.volume = 0.001;
          ambient.volume = 0.001;
          music.muted = true;
          ambient.muted = true;

          // Try to play both tracks
          const playPromises = [
            music.play().catch(() => console.log("Music autoplay failed")),
            ambient.play().catch(() => console.log("Ambient autoplay failed"))
          ];

          await Promise.all(playPromises);

          // Gradually increase volume and unmute after successful play
          setTimeout(() => {
            music.muted = false;
            ambient.muted = false;

            // Fade in volume smoothly
            const fadeInterval = setInterval(() => {
              if (music.volume < currentVolume) {
                music.volume = Math.min(music.volume + 0.1, currentVolume);
                ambient.volume = Math.min(ambient.volume + 0.05, currentAmbientVolume);
              } else {
                clearInterval(fadeInterval);
              }
            }, 100);

            setIsAudioPlaying(true);
            console.log("Audio playback started successfully");
          }, 500);

        } catch (error) {
          console.log("Audio playback failed, waiting for user interaction");
          // Reset audio states
          music.volume = currentVolume;
          ambient.volume = currentAmbientVolume;
          music.muted = false;
          ambient.muted = false;
        }
      }
    };

    // Try playback after a short delay
    interactionTimeout.current = setTimeout(() => {
      startAudioPlayback();
    }, 1500);

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
  }, [isAudioPlaying, currentVolume, currentAmbientVolume]);

  // Play audio when hasInteracted changes to true
  useEffect(() => {
    if (hasInteracted) {
      playAudio();
    }
  }, [hasInteracted, playAudio]);

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
      setCurrentVolume(volume);
    }
  }, [music]);

  const setAmbientVolume = useCallback((volume: number) => {
    if (volume >= 0 && volume <= 1) {
      ambient.volume = volume;
      setCurrentAmbientVolume(volume);
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
        setAmbientVolume,
        currentVolume,
        currentAmbientVolume
      }}
    >
      {children}
    </AudioContextValue.Provider>
  );
};