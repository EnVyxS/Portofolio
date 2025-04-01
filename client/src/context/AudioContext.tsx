import React, { createContext, useState, useContext, useEffect } from "react";

interface AudioContextProps {
  isAudioPlaying: boolean;
  playAudio: () => void;
  pauseAudio: () => void;
}

const AudioContext = createContext<AudioContextProps>({
  isAudioPlaying: false,
  playAudio: () => {},
  pauseAudio: () => {},
});

export const useAudio = () => useContext(AudioContext);

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    // Create audio element
    const audioElement = new Audio("/audio/darksouls-chill.mp3");
    audioElement.loop = true;
    audioElement.volume = 0.15;
    
    // Add event listeners
    audioElement.addEventListener("play", () => setIsAudioPlaying(true));
    audioElement.addEventListener("pause", () => setIsAudioPlaying(false));
    
    // Set to state
    setAudio(audioElement);
    
    // Clean up on unmount
    return () => {
      audioElement.pause();
      audioElement.removeEventListener("play", () => setIsAudioPlaying(true));
      audioElement.removeEventListener("pause", () => setIsAudioPlaying(false));
    };
  }, []);

  const playAudio = () => {
    if (!audio) return;
    
    if (audio.paused) {
      const playPromise = audio.play();
      
      // Handle autoplay policy
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio started playing
            setIsAudioPlaying(true);
          })
          .catch(error => {
            // Autoplay was prevented
            console.error("Audio play failed:", error);
            setIsAudioPlaying(false);
          });
      }
    } else {
      // If already playing, pause
      audio.pause();
      setIsAudioPlaying(false);
    }
  };

  const pauseAudio = () => {
    if (!audio) return;
    audio.pause();
    setIsAudioPlaying(false);
  };

  return (
    <AudioContext.Provider
      value={{
        isAudioPlaying,
        playAudio,
        pauseAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
