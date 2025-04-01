import { useState, useEffect } from "react";
import GifBackground from "./components/GifBackground";
import ContactCard from "./components/ContactCard";
import { AudioProvider } from "./context/AudioContext";

function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Set loaded to true after a short delay to allow for smoother initialization
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AudioProvider>
      <div className={`app-container ${loaded ? 'app-loaded' : ''}`}>
        <GifBackground>
          <div className="content-container">
            <ContactCard />
            <footer className="footer">
              <p className="copyright-text">© 2025 Diva Juan Nur Taqarrub. All Rights Reserved.</p>
            </footer>
          </div>
        </GifBackground>
      </div>

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
