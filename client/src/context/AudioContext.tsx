// This file is deprecated - all audio management now happens in AudioManager.tsx
// File ini hanya dijaga agar tidak menyebabkan error import
// Since we're using AudioManager.tsx, we need stub implementations here
// to prevent import errors elsewhere

import React, { createContext } from 'react';

interface AudioContextProps {
  isAudioPlaying: boolean;
  playAudio: () => void;
  pauseAudio: () => void;
  hasInteracted: boolean;
  setHasInteracted: (value: boolean) => void;
  setVolume: (volume: number) => void;
  setAmbientVolume: (volume: number) => void;
}

// Create a stub context
const AudioContextInstance = createContext<AudioContextProps>({
  isAudioPlaying: false,
  playAudio: () => {},
  pauseAudio: () => {},
  hasInteracted: false,
  setHasInteracted: () => {},
  setVolume: () => {},
  setAmbientVolume: () => {}
});

// Stub hook
export const useAudio = () => {
  console.warn("useAudio() from AudioContext.tsx is deprecated. Use from AudioManager.tsx instead.");
  return AudioContextInstance;
};

// Stub provider that does nothing - it just renders children
export const AudioProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return <>{children}</>; // Just render children without any actual audio provider
};

// Export context
const audioContext = {
  useAudio,
  AudioProvider
};

export default audioContext;