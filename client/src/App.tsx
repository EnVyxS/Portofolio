import { useState, useEffect } from 'react';
import './index.css';
import GifBackground from './components/GifBackground';
import DialogBox from './views/DialogBox';
import GameContactCard from './views/GameContactCard';
import ElevenLabsSetup from './views/ElevenLabsSetup';
import ApproachScreen from './views/ApproachScreen';
import { AudioProvider, useAudio } from './context/AudioContext';

function MainApp() {
  const [showElevenLabsSetup, setShowElevenLabsSetup] = useState<boolean>(false);
  const [showContactCard, setShowContactCard] = useState<boolean>(false);
  const [approachClicked, setApproachClicked] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const { isAudioPlaying, playAudio, pauseAudio, hasInteracted, setVolume } = useAudio();

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
      playAudio();
    }
  };

  // If user hasn't approached yet, show the approach screen
  if (!approachClicked) {
    return <ApproachScreen onApproach={handleApproach} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <GifBackground>
        {/* Audio control button */}
        {hasInteracted && (
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
        )}
        
        {/* Contact card selalu ditampilkan, tidak bergantung pada showContactCard */}
        <GameContactCard />

        {/* Dialog box di bagian bawah layar, sekarang tidak memengaruhi keberadaan contact card */}
        {<DialogBox onDialogComplete={handleDialogComplete} />}
        
        {/* ElevenLabs setup modal */}
        {showElevenLabsSetup && <ElevenLabsSetup onClose={handleCloseElevenLabsSetup} />}
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