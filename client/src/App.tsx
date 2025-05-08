import { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";
import GifBackground from "./components/GifBackground";
import DialogBox from "./views/DialogBox";
import GameContactCard from "./views/GameContactCard";
import ElevenLabsSetup from "./views/ElevenLabsSetup";
import ApproachScreen from "./views/ApproachScreen";
import { AudioProvider, useAudio } from "./context/AudioManager";
import IdleTimeoutController from "./controllers/idleTimeoutController";
import DialogController from "./controllers/dialogController";
import HoverDialogController from "./controllers/hoverDialogController";
import DramaticEffects, {
  dramaticEffectsStyles,
} from "./components/DramaticEffects";
import { useIsMobile } from "./hooks/use-mobile";
import ContractCard from "./components/ContractCard";
import AchievementDisplay from "./components/AchievementDisplay";
import AchievementController from "./controllers/achievementController";
import AccessibleAchievementNotification from "./components/AccessibleAchievementNotification";
import { AchievementType } from "./constants/achievementConstants";

// Cookie functions for nightmare trap
function getCookie(name: string) {
  const cname = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(cname) === 0) {
      return c.substring(cname.length, c.length);
    }
  }
  return "";
}

function MainApp() {
  const [showElevenLabsSetup, setShowElevenLabsSetup] =
    useState<boolean>(false);
  const [showContactCard, setShowContactCard] = useState<boolean>(false);
  const [approachClicked, setApproachClicked] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [dramaticEffect, setDramaticEffect] = useState<
    "throw" | "punch" | "none"
  >("none");
  const [wasReset, setWasReset] = useState<boolean>(false); // Untuk menandai jika user telah dilempar oleh DIVA JUAN
  const [newAchievements, setNewAchievements] = useState<AchievementType[]>([]); // Track new achievements for notifications
  const {
    isAudioPlaying,
    playAudio,
    pauseAudio,
    hasInteracted,
    setHasInteracted,
    setVolume,
  } = useAudio();
  const isMobile = useIsMobile(); // Hook untuk deteksi mobile

  // Reference ke IdleTimeoutController
  const idleTimeoutControllerRef = useRef<IdleTimeoutController | null>(null);

  // Check if user is trapped in nightmare
  useEffect(() => {
    // Check if user is trapped in nightmare
    if (
      getCookie("nightmareTrapped") === "true" &&
      getCookie("nightmareEscaped") !== "true"
    ) {
      // Redirect to dream.html if trapped
      console.log("User is trapped in nightmare, redirecting to dream.html");
      window.location.href = "/dream.html";
    }
  }, []);

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

  // Function untuk menutup ElevenLabs setup
  const handleElevenLabsSetupClose = useCallback(() => {
    console.log("[App] Closing ElevenLabs setup");
    setShowElevenLabsSetup(false);
  }, []);

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

  // Handler untuk efek throw - ketika DIVA JUAN melempar user
  const handleThrowUser = useCallback(() => {
    setDramaticEffect("throw");
    // Reset semua state setelah animasi throw selesai (durasi lebih pendek untuk debugging)
    setTimeout(() => {
      setDramaticEffect("none");
      setApproachClicked(false); // Kembali ke approach screen
      setWasReset(true); // Tandai bahwa user telah dilempar
    }, 1200); // Reduced from 2000ms to 1200ms to match our enhanced animation
  }, [setDramaticEffect, setApproachClicked, setWasReset]);

  // Handler untuk efek punch - ketika DIVA JUAN memukul user
  const handlePunchUser = useCallback(() => {
    setDramaticEffect("punch");
    // Redirect ke halaman kosong akan ditangani oleh IdleTimeoutController
    // dengan delay yang sudah diatur untuk memberikan waktu untuk efek visual
  }, [setDramaticEffect]);

  // Reset scene callback
  const resetSceneCallback = useCallback(() => {
    setApproachClicked(false); // Kembali ke approach screen
  }, [setApproachClicked]);

  // Inisialisasi IdleTimeoutController
  useEffect(() => {
    // Jika belum pernah membuat controller dan user sudah mengklik approach
    if (approachClicked && !idleTimeoutControllerRef.current) {
      // Inisialisasi IdleTimeoutController
      // Buat instance IdleTimeoutController
      idleTimeoutControllerRef.current = IdleTimeoutController.getInstance();

      // Set callback untuk efek dramatik
      idleTimeoutControllerRef.current.setThrowUserCallback(handleThrowUser);
      idleTimeoutControllerRef.current.setPunchUserCallback(handlePunchUser);
      idleTimeoutControllerRef.current.setResetSceneCallback(
        resetSceneCallback,
      );

      // Mulai timer idle
      idleTimeoutControllerRef.current.startIdleTimer();
    }
  }, [approachClicked, handleThrowUser, handlePunchUser, resetSceneCallback]);

  // Effect terpisah untuk menangani kasus setelah reset
  useEffect(() => {
    // Reset timer jika user kembali dari approach screen setelah dilempar
    if (approachClicked && wasReset && idleTimeoutControllerRef.current) {
      // Reset idle timers after reset
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
        "mousemove",
        "mousedown",
        "click",
        "touchstart",
        "touchmove",
        "keydown",
        "scroll",
        "wheel",
      ];

      // Tambahkan event listener
      interactionEvents.forEach((eventType) => {
        document.addEventListener(eventType, handleUserInteraction);
      });

      // Cleanup
      return () => {
        interactionEvents.forEach((eventType) => {
          document.removeEventListener(eventType, handleUserInteraction);
        });
      };
    }
  }, [approachClicked, handleUserInteraction]);

  // Update approach handler untuk kasus re-approach setelah dilempar
  const handlePostResetApproach = () => {
    // Siapkan proses yang akan terjadi setelah ElevenLabs setup ditutup
    const setupReturnDialog = () => {
      console.log("[App] Post-reset approach triggered. Setting up return dialog sequence...");
      const dialogController = DialogController.getInstance();
      
      if (dialogController) {
        console.log("[App] Preparing to show return dialog, resetting dialog controller state...");
        
        // Reset HoverDialogController
        try {
          const hoverDialogController = HoverDialogController.getInstance();
          if (hoverDialogController) {
            hoverDialogController.setIdleTimeoutOccurred(false);
            hoverDialogController.setHasInteractedWithHover(false);
            console.log("[App] Reset HoverDialogController flags to false");
          }
        } catch (e) {
          console.error("[App] Failed to reset hover controller:", e);
        }
        
        // Reset dialog flags
        try {
          // @ts-ignore
          window.__forceShowIdleWarning = false;
          // @ts-ignore
          if (window.__dialogBoxIsFinishedSetter) {
            // @ts-ignore
            window.__dialogBoxIsFinishedSetter(false);
          }
        } catch (e) {
          console.error("[App] Error resetting dialog display flags:", e);
        }
        
        // Buat reference untuk callback
        const returnDialogCallback = (text: string, isComplete: boolean) => {
          console.log("[App] Return dialog being displayed:", text, "isComplete:", isComplete);
          
          // Unlock achievement for returning after punishment
          if (isComplete) {
            try {
              const achievementController = AchievementController.getInstance();
              achievementController.unlockAchievement('return');
              console.log("[App] Unlocked 'return' achievement for returning after being thrown");
            } catch (error) {
              console.error("Failed to unlock return achievement:", error);
            }
          }
        };
        
        // Force reset dialog state before showing return dialog
        dialogController.resetDialogState();
        
        // Show return dialog with a small delay to ensure all components are ready
        setTimeout(() => {
          console.log("[App] Now showing return dialog...");
          dialogController.showReturnDialog(returnDialogCallback);
        }, 500);
      }
    };

    // Panggil handleApproach terlebih dahulu
    handleApproach();
    
    // Tunggu sebentar untuk memastikan setup screen sudah muncul
    setTimeout(() => {
      // Setup callback yang akan dipanggil saat ElevenLabs setup ditutup
      const onSetupClosed = () => {
        console.log("[App] ElevenLabs setup closed, triggering return dialog");
        setupReturnDialog();
      };
      
      // Buat listener untuk deteksi saat setup ditutup
      const checkInterval = setInterval(() => {
        if (!showElevenLabsSetup) {
          clearInterval(checkInterval);
          onSetupClosed();
        }
      }, 500); // Check setiap 500ms
      
      // Fallback jika setup tidak ditutup dalam 5 detik
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log("[App] ElevenLabs setup timeout - forcing return dialog sequence");
        setupReturnDialog();
      }, 5000);
    }, 1500); // Berikan waktu yang cukup untuk handleApproach menampilkan setup
  };

  // If user hasn't approached yet, show the approach screen
  if (!approachClicked) {
    return (
      <ApproachScreen
        onApproach={wasReset ? handlePostResetApproach : handleApproach}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <GifBackground>
        {/* Audio control button - always visible to allow user to enable audio */}
        <button
          onClick={toggleAudio}
          className="absolute z-50 top-4 right-4 bg-black bg-opacity-50 rounded-full text-amber-500 hover:text-amber-400 transition-colors p-2"
          title={isAudioPlaying ? "Mute" : "Unmute"}
          aria-label={isAudioPlaying ? "Mute Audio" : "Unmute Audio"}
        >
          {isAudioPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={isMobile ? "28" : "24"}
              height={isMobile ? "28" : "24"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={isMobile ? "28" : "24"}
              height={isMobile ? "28" : "24"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>

        {/* Contact card selalu ditampilkan, tidak bergantung pada showContactCard */}
        <GameContactCard />

        {/* Contract Card untuk menampilkan dokumen sertifikat */}
        <ContractCard />

        {/* Dialog box di bagian bawah layar, sekarang tidak memengaruhi keberadaan contact card */}
        {<DialogBox onDialogComplete={handleDialogComplete} />}

        {/* ElevenLabs setup modal */}
        {showElevenLabsSetup && (
          <ElevenLabsSetup onClose={handleElevenLabsSetupClose} />
        )}

        {/* Dramatic effects for throw/punch animations */}
        <DramaticEffects
          effect={dramaticEffect}
          onEffectComplete={() => setDramaticEffect("none")}
        />

        {/* CSS for dramatic effects */}
        <style dangerouslySetInnerHTML={{ __html: dramaticEffectsStyles }} />
      </GifBackground>
    </div>
  );
}

// Monitor untuk achievement baru
function useMonitorAchievements() {
  const [newAchievements, setNewAchievements] = useState<AchievementType[]>([]);
  
  useEffect(() => {
    // Listener untuk event achievement baru
    const handleNewAchievement = (event: CustomEvent) => {
      const achievement = event.detail?.achievement as AchievementType;
      if (achievement) {
        console.log(`[AchievementMonitor] New achievement unlocked: ${achievement}`);
        setNewAchievements(prev => [...prev, achievement]);
      }
    };

    // Register listener untuk custom event
    window.addEventListener('achievementUnlocked', handleNewAchievement as EventListener);
    
    // Clean up listener
    return () => {
      window.removeEventListener('achievementUnlocked', handleNewAchievement as EventListener);
    };
  }, []);

  // Handler untuk acknowledge achievement
  const handleAcknowledge = (achievement: AchievementType) => {
    console.log(`[AchievementMonitor] User acknowledged achievement: ${achievement}`);
    setNewAchievements(prev => prev.filter(a => a !== achievement));
  };

  return { newAchievements, handleAcknowledge };
}

function App() {
  const { newAchievements, handleAcknowledge } = useMonitorAchievements();
  
  return (
    <AudioProvider>
      <MainApp />
      <AchievementDisplay />
      
      {/* Accessible achievement notifications */}
      <AccessibleAchievementNotification 
        achievements={newAchievements}
        onAcknowledge={handleAcknowledge}
        autoHideDuration={10000}
      />
      
      {/* Test buttons for achievement functionality - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 flex gap-2 z-50">
          <button 
            className="bg-black/50 text-amber-400 px-3 py-1 rounded border border-amber-500 text-xs"
            onClick={() => {
              const ac = AchievementController.getInstance();
              ac.unlockAchievement('patience');
            }}
          >
            Test Achievement
          </button>
          
          <button 
            className="bg-black/50 text-amber-400 px-3 py-1 rounded border border-amber-500 text-xs"
            onClick={() => {
              const ac = AchievementController.getInstance();
              ac.unlockAchievement('escape');
            }}
          >
            Test Another
          </button>
        </div>
      )}
    </AudioProvider>
  );
}

export default App;
