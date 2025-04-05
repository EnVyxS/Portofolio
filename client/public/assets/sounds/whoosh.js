// Whoosh sound effect generator
// This will generate an audio buffer with a whoosh sound effect

function createWhooshSound() {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.8; // Duration in seconds
    const sampleRate = audioContext.sampleRate;
    const bufferSize = duration * sampleRate;
    const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate the whoosh sound
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate; // Time in seconds
      const normalizedPosition = t / duration; // 0 to 1
      
      // Create whoosh by varying frequency and amplitude
      // Start with high frequency and decrease
      const frequencyStart = 1200;
      const frequencyEnd = 200;
      const currentFreq = frequencyStart * Math.pow(frequencyEnd / frequencyStart, normalizedPosition);
      
      // Amplitude envelope (start soft, get louder, then fade out)
      let amplitude;
      if (normalizedPosition < 0.1) {
        // Fade in
        amplitude = normalizedPosition / 0.1;
      } else if (normalizedPosition > 0.6) {
        // Fade out
        amplitude = (1 - normalizedPosition) / 0.4;
      } else {
        // Full volume
        amplitude = 1.0;
      }
      
      // Add some noise and frequency modulation
      const noise = (Math.random() * 2 - 1) * 0.15;
      const frequencyModulation = Math.sin(t * currentFreq * 0.5) * 0.3;
      
      // Combine signals
      data[i] = (noise + frequencyModulation) * amplitude * 0.7;
    }
    
    // Play the sound
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Add some processing
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);
    
    // Create a gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
    
    // Connect nodes
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Start playback
    source.start();
    return source;
  } catch (error) {
    console.error("Error generating whoosh sound:", error);
    return null;
  }
}

// Export the function
window.createWhooshSound = createWhooshSound;