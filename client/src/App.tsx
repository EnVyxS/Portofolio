import { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import GifBackground from './components/GifBackground';
import DialogBox from './views/DialogBox';
import GameContactCard from './views/GameContactCard';
import ElevenLabsSetup from './views/ElevenLabsSetup';
import ApproachScreen from './views/ApproachScreen';
import { AudioProvider, useAudio } from './context/AudioManager';
import IdleTimeoutController from './controllers/idleTimeoutController';
import DramaticEffects, { dramaticEffectsStyles } from './components/DramaticEffects';
import DifficultySelector from './components/DifficultySelector';

function MainApp() {
  const [showElevenLabsSetup, setShowElevenLabsSetup] = useState<boolean>(false);
  const [showContactCard, setShowContactCard] = useState<boolean>(false);
  const [approachClicked, setApproachClicked] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [dramaticEffect, setDramaticEffect] = useState<'throw' | 'punch' | 'none'>('none');
  const [wasReset, setWasReset] = useState<boolean>(false); // Untuk menandai jika user telah dilempar oleh Geralt
  const { isAudioPlaying, playAudio, pauseAudio, hasInteracted, setHasInteracted, setVolume } = useAudio();
  
  // Reference ke IdleTimeoutController
  const idleTimeoutControllerRef = useRef<IdleTimeoutController | null>(null);

  const handleDialogComplete = () => {
    setShowContactCard(true);
  };

  // Saat approach, naikkan volume musik secara bertahap
  useEffect(() => {
    if (approachClicked && isTransitioning) {
      // Mulai dari volume rendah dan naikkan secara bertahap
      let currentVolume = 0.15; // Volume awal (saat dari jauh)
      const targetVolume = 0.3; // Volume target (saat sudah dekat)
      const step = 0.01; // Kenaikan volume per langkah
      const interval = 50; // Interval waktu antara langkah (ms)
      
      const fadeInterval = setInterval(() => {
        if (currentVolume < targetVolume) {
          currentVolume += step;
          setVolume(currentVolume);
        } else {
          clearInterval(fadeInterval);
          setIsTransitioning(false);
        }
      }, interval);
      
      return () => {
        clearInterval(fadeInterval);
      };
    }
  }, [approachClicked, isTransitioning, setVolume]);

  const handleApproach = () => {
    setIsTransitioning(true);
    setApproachClicked(true);
    // setShowElevenLabsSetup akan dipanggil setelah transisi selesai
    
    // Delay menampilkan ElevenLabs setup agar bisa melihat transisi terlebih dahulu
    setTimeout(() => {
      setShowElevenLabsSetup(true);
    }, 1500);
  };

  const handleCloseElevenLabsSetup = () => {
    setShowElevenLabsSetup(false);
  };

  // Toggle audio play/pause
  const toggleAudio = () => {
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      // If we start audio, ensure hasInteracted is true
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      playAudio();
    }
  };
  
  // Handler untuk efek throw - ketika Geralt melempar user
  const handleThrowUser = useCallback(() => {
    setDramaticEffect('throw');
    // Reset semua state setelah beberapa detik
    setTimeout(() => {
      setDramaticEffect('none');
      setApproachClicked(false); // Kembali ke approach screen
      setWasReset(true); // Tandai bahwa user telah dilempar
    }, 2000);
  }, [setDramaticEffect, setApproachClicked, setWasReset]);
  
  // Handler untuk efek punch - ketika Geralt memukul user
  const handlePunchUser = useCallback(() => {
    setDramaticEffect('punch');
    // Setelah beberapa detik, redirect ke halaman kosong
    setTimeout(() => {
      window.location.href = "about:blank";
    }, 3000);
  }, [setDramaticEffect]);
  
  // Reset scene callback
  const resetSceneCallback = useCallback(() => {
    setApproachClicked(false); // Kembali ke approach screen
  }, [setApproachClicked]);
  
  // Inisialisasi IdleTimeoutController
  useEffect(() => {
    // Jika belum pernah membuat controller dan user sudah mengklik approach
    if (approachClicked && !idleTimeoutControllerRef.current) {
      console.log("Inisialisasi IdleTimeoutController");
      // Buat instance IdleTimeoutController
      idleTimeoutControllerRef.current = IdleTimeoutController.getInstance();
      
      // Set callback untuk efek dramatik
      idleTimeoutControllerRef.current.setThrowUserCallback(handleThrowUser);
      idleTimeoutControllerRef.current.setPunchUserCallback(handlePunchUser);
      idleTimeoutControllerRef.current.setResetSceneCallback(resetSceneCallback);
      
      // Mulai timer idle
      idleTimeoutControllerRef.current.startIdleTimer();
    }
  }, [approachClicked, handleThrowUser, handlePunchUser, resetSceneCallback]);
  
  // Effect terpisah untuk menangani kasus setelah reset
  useEffect(() => {
    // Reset timer jika user kembali dari approach screen setelah dilempar
    if (approachClicked && wasReset && idleTimeoutControllerRef.current) {
      console.log("Resetting idle timers after reset");
      idleTimeoutControllerRef.current.resetAll();
      
      // Mulai timer hover berlebihan
      setTimeout(() => {
        if (idleTimeoutControllerRef.current) {
          idleTimeoutControllerRef.current.startExcessiveHoverTimers();
        }
      }, 1500); // Tunggu 1.5 detik untuk memulai timer hover excessive
    }
  }, [approachClicked, wasReset]);
  
  // Handler untuk setiap interaksi user
  const handleUserInteraction = useCallback(() => {
    // Beritahu IdleTimeoutController bahwa user berinteraksi
    if (idleTimeoutControllerRef.current) {
      idleTimeoutControllerRef.current.handleUserInteraction();
    }
  }, []);

  // Event listener untuk mendeteksi user interaction
  useEffect(() => {
    // Hanya aktifkan event listener jika sudah approach
    if (approachClicked) {
      // List event yang dianggap sebagai interaksi
      const interactionEvents = [
        'mousemove', 'mousedown', 'click', 'touchstart', 'touchmove', 
        'keydown', 'scroll', 'wheel'
      ];
      
      // Tambahkan event listener
      interactionEvents.forEach(eventType => {
        document.addEventListener(eventType, handleUserInteraction);
      });
      
      // Cleanup
      return () => {
        interactionEvents.forEach(eventType => {
          document.removeEventListener(eventType, handleUserInteraction);
        });
      };
    }
  }, [approachClicked, handleUserInteraction]);
  
  // Update approach handler untuk kasus re-approach setelah dilempar
  const handlePostResetApproach = () => {
    // Selalu panggil handleApproach terlebih dahulu
    handleApproach();
    
    // Jika sudah pernah di-reset, panggil fungsi startExcessiveHoverTimers pada useEffect berikutnya
    // Ini mencegah dependensi yang tidak stabil ke idleTimeoutControllerRef.current
  };
  
  // If user hasn't approached yet, show the approach screen
  if (!approachClicked) {
    return <ApproachScreen onApproach={wasReset ? handlePostResetApproach : handleApproach} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <GifBackground>
        {/* Audio control button - always visible to allow user to enable audio */}
        <button
          onClick={toggleAudio}
          className="absolute top-4 right-4 z-40 bg-black bg-opacity-50 p-2 rounded-full text-amber-500 hover:text-amber-400 transition-colors"
          title={isAudioPlaying ? "Mute" : "Unmute"}
        >
          {isAudioPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
        
        {/* Contact card selalu ditampilkan, tidak bergantung pada showContactCard */}
        <GameContactCard />

        {/* Dialog box di bagian bawah layar, sekarang tidak memengaruhi keberadaan contact card */}
        {<DialogBox onDialogComplete={handleDialogComplete} />}
        
        {/* ElevenLabs setup modal */}
        {showElevenLabsSetup && <ElevenLabsSetup onClose={handleCloseElevenLabsSetup} />}
        
        {/* Dramatic effects for throw/punch animations */}
        <DramaticEffects
          effect={dramaticEffect}
          onEffectComplete={() => setDramaticEffect('none')}
        />
        
        {/* CSS for dramatic effects */}
        <style dangerouslySetInnerHTML={{ __html: dramaticEffectsStyles }} />
        
        {/* Difficulty selector - only shows when approached */}
        {approachClicked && <DifficultySelector />}
      </GifBackground>
    </div>
  );
}

function App() {
  return (
    <AudioProvider>
      <MainApp />
    </AudioProvider>
  );
}

export default App;