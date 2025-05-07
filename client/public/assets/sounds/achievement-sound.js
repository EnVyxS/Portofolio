// Achievement Sound Generator
// Menciptakan suara achievement ala PlayStation/Dark Souls menggunakan Web Audio API

function createAchievementSound() {
  // Check if Web Audio API is supported
  if (!window.AudioContext && !window.webkitAudioContext) {
    console.error("Web Audio API is not supported in this browser");
    return null;
  }

  // Setup Audio Context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();
  
  // Master gain node untuk mengontrol volume keseluruhan
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.8; // Volume keseluruhan
  masterGain.connect(audioCtx.destination);
  
  // Function untuk memainkan achievement sound
  function playAchievementSound() {
    // Memastikan audio context dimulai (diperlukan sejak Chrome 66)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Timestamp untuk memulai (mulai sekarang)
    const startTime = audioCtx.currentTime;
    
    // Menciptakan efek sparkle (suara tinggi)
    function createSparkle(startTime) {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);
      
      // Mengatur parameter suara
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(1800, startTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(2000, startTime + 0.2);
      
      // Envelope untuk volume
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.3);
      
      // Mulai dan hentikan oscillator
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
      
      return { oscillator, gainNode };
    }
    
    // Menciptakan bass sound (suara rendah)
    function createBassTone(startTime) {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(masterGain);
      
      // Mengatur parameter suara
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(110, startTime);
      oscillator.frequency.linearRampToValueAtTime(220, startTime + 0.08);
      oscillator.frequency.setValueAtTime(220, startTime + 0.1);
      oscillator.frequency.linearRampToValueAtTime(440, startTime + 0.18);
      
      // Envelope untuk volume
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.7, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.4);
      
      // Mulai dan hentikan oscillator
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
      
      return { oscillator, gainNode };
    }
    
    // Menciptakan efek gema (reverb)
    function createReverb(startTime, input) {
      const convolver = audioCtx.createConvolver();
      const reverbGain = audioCtx.createGain();
      
      // Connect nodes
      input.connect(convolver);
      convolver.connect(reverbGain);
      reverbGain.connect(masterGain);
      
      // Set reverb level
      reverbGain.gain.setValueAtTime(0.3, startTime);
      
      // Buat impulse response
      const sampleRate = audioCtx.sampleRate;
      const length = sampleRate * 2; // 2 second buffer
      const impulse = audioCtx.createBuffer(2, length, sampleRate);
      
      // Fill both channels with decay
      for (let channel = 0; channel < 2; channel++) {
        const impulseData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          // Exponential decay
          impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 4);
        }
      }
      
      convolver.buffer = impulse;
      
      return { convolver, reverbGain };
    }
    
    // Mainkan bagian-bagian achievement sound
    const bassSound = createBassTone(startTime);
    const sparkle1 = createSparkle(startTime + 0.05);
    const sparkle2 = createSparkle(startTime + 0.1);
    const sparkle3 = createSparkle(startTime + 0.15);
    
    // Buat summing bus untuk reverb
    const reverbSend = audioCtx.createGain();
    reverbSend.gain.value = 1.0;
    
    // Connect oscillators to reverb send
    bassSound.gainNode.connect(reverbSend);
    sparkle1.gainNode.connect(reverbSend);
    sparkle2.gainNode.connect(reverbSend);
    sparkle3.gainNode.connect(reverbSend);
    
    // Add reverb effect
    createReverb(startTime, reverbSend);
  }
  
  return playAchievementSound;
}

// Ekspose fungsi ke global scope
window.createAchievementSound = createAchievementSound;