import { useState, useEffect } from "react";
import { AudioProvider } from "./context/AudioContext";
import DialogController from "./controllers/dialogController";
import ElevenLabsService from "./services/elevenlabsService";
import GifBackground from "./views/GifBackground";
import GameContactCard from "./views/GameContactCard";
import DialogBox from "./views/DialogBox";
import ElevenLabsSetup from "./views/ElevenLabsSetup";

function App() {
  const [loaded, setLoaded] = useState(false);
  const [showElevenLabsSetup, setShowElevenLabsSetup] = useState(false);
  const [showVoiceButton, setShowVoiceButton] = useState(false);

  useEffect(() => {
    // Set loaded to true after a short delay to allow for smoother initialization
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    // Check if ElevenLabs API key is set
    const elevenlabsService = ElevenLabsService.getInstance();
    if (!elevenlabsService.getApiKey()) {
      // Show voice setup button after a delay
      const setupTimer = setTimeout(() => {
        setShowVoiceButton(true);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(setupTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, []);

  const handleDialogComplete = () => {
    console.log("Dialog sequence completed");
  };

  return (
    <AudioProvider>
      <div className={`app-container ${loaded ? 'app-loaded' : ''}`}>
        <GifBackground>
          <div className="content-container">
            {/* Dialog Box */}
            <DialogBox onDialogComplete={handleDialogComplete} />
            
            {/* Contact Card / Character Menu */}
            <GameContactCard />
            
            {/* Voice Setup Button */}
            {showVoiceButton && (
              <button 
                className="voice-setup-button"
                onClick={() => setShowElevenLabsSetup(true)}
              >
                Enable Geralt's Voice
              </button>
            )}
            
            <footer className="footer">
              <p className="copyright-text">© 2025 Diva Juan Nur Taqarrub. All Rights Reserved.</p>
            </footer>
          </div>
        </GifBackground>
      </div>
      
      {/* ElevenLabs API Setup Modal */}
      {showElevenLabsSetup && (
        <ElevenLabsSetup onClose={() => setShowElevenLabsSetup(false)} />
      )}

      <style>{`
        .app-container {
          width: 100%;
          height: 100vh;
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
        }
        
        .app-loaded {
          opacity: 1;
        }
        
        .content-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
          position: relative;
          z-index: 20;
          justify-content: center;
          align-items: center;
        }
        
        .voice-setup-button {
          position: fixed;
          bottom: 80px;
          right: 20px;
          background-color: rgba(249, 115, 22, 0.2);
          color: #f97316;
          border: 1px solid rgba(249, 115, 22, 0.4);
          border-radius: 8px;
          padding: 0.6rem 1rem;
          font-family: 'VT323', monospace;
          font-size: 0.95rem;
          cursor: pointer;
          z-index: 100;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        .voice-setup-button:hover {
          background-color: rgba(249, 115, 22, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
        }
        
        .footer {
          width: 100%;
          padding: 0.85rem 0;
          display: flex;
          justify-content: center;
          margin-top: auto;
          position: fixed;
          bottom: 0;
          left: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(5px);
          z-index: 20;
          border-top: 1px solid rgba(249, 115, 22, 0.1);
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
        }
        
        .copyright-text {
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.875rem;
          font-weight: 400;
          letter-spacing: 0.025em;
          opacity: 0.9;
        }
      `}</style>
    </AudioProvider>
  );
}

export default App;
