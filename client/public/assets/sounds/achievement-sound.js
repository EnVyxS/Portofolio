/**
 * Create achievement sound using Web Audio API
 * Inspired by PlayStation/Dark Souls style achievement sound
 *
 * This creates a rich, layered sound with:
 * - Multiple sparkling high notes
 * - A warm bass tone
 * - Subtle reverb effect
 * - Stereo imaging
 *
 * @returns {Function} Function to play the achievement sound
 */
function createAchievementSound() {
  // Initialize audio context
  let audioCtx;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.error("Web Audio API not supported in this browser", e);
    return () => {}; // Return empty function if not supported
  }

  // Master gain for overall volume
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.7; // 70% volume by default
  masterGain.connect(audioCtx.destination);

  // Function to play the achievement sound
  function playAchievementSound() {
    // If audio context is suspended (browser policy), resume it
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // ===== Sparkle Sound (High frequencies) =====
    createSparkle(now);
    createSparkle(now + 0.05);
    createSparkle(now + 0.08);
    createSparkle(now + 0.12);
    
    // ===== Bass Tone (Low frequencies) =====
    createBassTone(now);
    
    // ===== Reverb Effect =====
    const mainOsc = audioCtx.createOscillator();
    mainOsc.type = 'sine';
    mainOsc.frequency.setValueAtTime(440, now); // A4 note
    
    const mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(0.2, now);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    
    mainOsc.connect(mainGain);
    
    // Apply reverb
    createReverb(now, mainGain);
    
    // Start the main oscillator
    mainOsc.start(now);
    mainOsc.stop(now + 1.5);
  }

  // Creates a sparkling high-frequency sound
  function createSparkle(startTime) {
    // Random frequency between 2000 and 5000 Hz
    const freq = 2000 + Math.random() * 3000;
    
    // Create oscillator
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + 0.1);
    
    // Create gain node for envelope
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
    
    // Create stereo panner for spatial effect
    const panner = audioCtx.createStereoPanner();
    panner.pan.setValueAtTime(Math.random() * 1.6 - 0.8, startTime); // Random pan between -0.8 and 0.8
    
    // Connect nodes
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(masterGain);
    
    // Start and stop the oscillator
    osc.start(startTime);
    osc.stop(startTime + 0.3);
  }

  // Creates a warm bass tone
  function createBassTone(startTime) {
    // Create oscillator for bass tone
    const bassOsc = audioCtx.createOscillator();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(110, startTime); // A2 note
    
    // Create gain node for envelope
    const bassGain = audioCtx.createGain();
    bassGain.gain.setValueAtTime(0, startTime);
    bassGain.gain.linearRampToValueAtTime(0.4, startTime + 0.1);
    bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);
    
    // Connect nodes
    bassOsc.connect(bassGain);
    bassGain.connect(masterGain);
    
    // Start and stop the oscillator
    bassOsc.start(startTime);
    bassOsc.stop(startTime + 1.2);
  }

  // Simple reverb effect
  function createReverb(startTime, input) {
    // Create gain node for delay feedback
    const feedback = audioCtx.createGain();
    feedback.gain.setValueAtTime(0.3, startTime); // 30% feedback
    
    // Create delay node
    const delay = audioCtx.createDelay(1.0);
    delay.delayTime.setValueAtTime(0.2, startTime);
    
    // Connect for feedback loop
    input.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(masterGain);
  }

  // Return the function to play the sound
  return playAchievementSound;
}

// Expose the function globally so it can be called from anywhere
window.createAchievementSound = createAchievementSound;