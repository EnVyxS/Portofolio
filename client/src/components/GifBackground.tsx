import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "../context/AudioContext";

interface GifBackgroundProps {
  children: React.ReactNode;
}

const GifBackground: React.FC<GifBackgroundProps> = ({ children }) => {
  // Definition of tones for voice modulation dialog
  const TONE = {
    BITTER: "bitter", // Bitter, slow and heavy
    ANGRY: "angry", // Angry, faster, broken
    TIRED: "tired", // Tired, very slow and interrupted
    DRUNK: "drunk", // Very drunk, inconsistent, slurring a lot
    NUMB: "numb", // Numb, monotone, flat
    SARCASTIC: "sarcastic", // Sarcastic, varying rhythm
    RESIGNED: "resigned", // Resigned, slower tempo
    HOLLOW: "hollow", // Empty, hollow, long pauses
    ANNOYED: "annoyed", // Annoyed, slightly faster tempo
    CONTEMPLATIVE: "contemplative", // Contemplative, many pauses
  };

  // Color palette for tone moods - subtle background shifts
  const TONE_COLORS = {
    [TONE.BITTER]: "rgba(50, 30, 40, 0.7)", // Dark reddish-purple (bitter)
    [TONE.ANGRY]: "rgba(70, 20, 20, 0.65)", // Dark red
    [TONE.TIRED]: "rgba(30, 30, 50, 0.7)", // Dark grayish-blue
    [TONE.DRUNK]: "rgba(40, 10, 40, 0.8)", // Dark purple
    [TONE.NUMB]: "rgba(30, 40, 50, 0.75)", // Dark grayish-blue
    [TONE.SARCASTIC]: "rgba(50, 40, 10, 0.7)", // Brownish-yellow
    [TONE.RESIGNED]: "rgba(40, 40, 45, 0.7)", // Gray
    [TONE.HOLLOW]: "rgba(20, 25, 35, 0.8)", // Dark blue
    [TONE.ANNOYED]: "rgba(60, 40, 35, 0.7)", // Dark brownish-orange
    [TONE.CONTEMPLATIVE]: "rgba(20, 40, 50, 0.7)", // Dark bluish-green
  };

  // List of messages with voice tone modulation - Geralt-like when depressed and drunk
  const [messages, setMessages] = useState([
    { text: "...Didn't ask for company,", tone: TONE.ANNOYED },
    { text: "Tch... Fire's warm. Always brings strays,", tone: TONE.BITTER },
    {
      text: "Haahhhh... You need something or are you just here to waste my time?",
      tone: TONE.ANNOYED,
    },
    { text: ".....", tone: TONE.DRUNK },
    { text: "Curiosity?... Hmph... Doesn't pay the bills...", tone: TONE.SARCASTIC },
    { text: ".....", tone: TONE.DRUNK },
    {
      text: "Pfftt... Waiting... Drinking... What else is there?,",
      tone: TONE.RESIGNED,
    },
    { text: ".....", tone: TONE.DRUNK },
    { text: "A job?.., A way out?.., Some miracle?..,", tone: TONE.HOLLOW },
    { text: ".....", tone: TONE.DRUNK },
    { text: "Heh... Yeah, real fucking hilarious, isn't it?,", tone: TONE.SARCASTIC },
    { text: "...You got a name?", tone: TONE.CONTEMPLATIVE },
    { text: ".....", tone: TONE.DRUNK },
    { text: "Hm. Not that it matters,", tone: TONE.NUMB },
    {
      text: "Diva Juan Nur Taqarrub , , Call me what you want. Doesn't do shit,",
      tone: TONE.BITTER,
    },
    { text: ".....", tone: TONE.DRUNK },
    { text: "Hmph... why am I even here?..", tone: TONE.CONTEMPLATIVE },
    { text: "Anything that keeps me breathing,", tone: TONE.NUMB },
    {
      text: "Hunting work's like hunting a ghost. No signs, no tracks, just hope and a headache,",
      tone: TONE.RESIGNED,
    },
    { text: ".....", tone: TONE.DRUNK },
    { text: "Graduated. Computer Science. 2024,", tone: TONE.HOLLOW },
    {
      text: "Yeah... Cum laude. Thought it'd mean something.. Turns out it's worth less than a stiff drink,",
      tone: TONE.BITTER,
    },
    { text: ".....", tone: TONE.DRUNK },
    {
      text: "Backend. Java. Databases. Know my way around. Not that anyone cares,",
      tone: TONE.RESIGNED,
    },
    {
      text: "Made a game for my thesis. Thought it'd mean something. It didn't,",
      tone: TONE.BITTER,
    },
    {
      text: "Editing too. Years of it. Doesn't put food on the table,",
      tone: TONE.TIRED,
    },
    {
      text: "Vegas Pro. After Effects. Cut, stitch, fix. Life's not that simple,",
      tone: TONE.HOLLOW,
    },
    {
      text: "SQL... PostgreSQL... MySQL... Data's just numbers. Like debts. Like failures,",
      tone: TONE.NUMB,
    },
    {
      text: "Used to like puzzles. Now? Just another thing that doesn't pay,",
      tone: TONE.RESIGNED,
    },
    { text: ".....", tone: TONE.DRUNK },
    { text: "...Leaving this place?", tone: TONE.SARCASTIC },
    { text: "Huhhhh... Like that's so easy,", tone: TONE.BITTER },
    { text: "Go where? With what? Got coin to spare?,", tone: TONE.ANGRY },
    { text: "Nothing's free. Not even dreams,", tone: TONE.HOLLOW },
    { text: ".....", tone: TONE.DRUNK },
    { text: "But if the pay's right… maybe,", tone: TONE.CONTEMPLATIVE },
    { text: ".....", tone: TONE.DRUNK },
    {
      text: "For now? I drink. Sit. Hope the fire lasts longer than the night,",
      tone: TONE.RESIGNED,
    },
    { text: ".....", tone: TONE.DRUNK },
    {
      text: "Hmph... You fight... you bleed... you try...,",
      tone: TONE.TIRED,
    },
    { text: "And in the end, still nothing,", tone: TONE.HOLLOW },
    { text: "...Enough about me", tone: TONE.ANNOYED },
    { text: "What do you want?..", tone: TONE.ANNOYED },
    { text: "Talk... You got a job, or just wasting my time?..", tone: TONE.ANNOYED },
  ]);

  // State for dialogue display
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleteMessage, setIsCompleteMessage] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isWaitingEndCycle, setIsWaitingEndCycle] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [dialogHidden, setDialogHidden] = useState(true); // Set to true initially so dialog is hidden on first load
  const [currentTone, setCurrentTone] = useState(TONE.RESIGNED); // Current tone for background color shifts
  const [voiceMuted, setVoiceMuted] = useState(false); // State for mute/unmute voice

  const { isAudioPlaying, playAudio } = useAudio();

  // References for intervals and timeouts
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endCycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null); // Reference for speech synthesis

  // Track user interaction (mouse move, touch, click) to start animation - support for all devices
  useEffect(() => {
    const handleInteraction = () => {
      // Update last interaction time
      setLastInteraction(Date.now());

      // Show dialog if it was hidden
      if (dialogHidden) {
        setDialogHidden(false);
      }

      if (!hasMouseMoved) {
        setHasMouseMoved(true); // Only set once when user first interacts
      }
    };

    // Add event listeners for desktop and mobile
    document.addEventListener("mousemove", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);
    document.addEventListener("click", handleInteraction);

    return () => {
      // Clean up interaction event listeners
      document.removeEventListener("mousemove", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("click", handleInteraction);
    };
  }, [hasMouseMoved, dialogHidden]);

  // Inactivity checker to hide dialog after 8 seconds of no interaction
  useEffect(() => {
    // Only start checking for inactivity after initial interaction and when message is complete
    if (!hasMouseMoved || !isCompleteMessage) return;

    // Function to check inactivity - will check every 1 second
    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteraction;

      // If 8 seconds of no interaction and dialog is being displayed and we are at the last message
      // Dialog will naturally disappear with fade out animation
      if (
        timeSinceLastInteraction > 8000 &&
        !dialogHidden &&
        isCompleteMessage &&
        currentMessageIndex === messages.length - 1
      ) {
        console.log("Dialog hiding due to 8 seconds of inactivity");
        setDialogHidden(true);
      }
    };

    // Check inactivity every second
    const intervalId = setInterval(checkInactivity, 1000);

    // Clean up interval when component unmounts or dependencies change
    return () => clearInterval(intervalId);
  }, [
    hasMouseMoved,
    lastInteraction,
    dialogHidden,
    isCompleteMessage,
    currentMessageIndex,
    messages.length,
  ]);

  // Effect to handle typing animation
  useEffect(() => {
    // Only start typing if hasMouseMoved is true (user interacted) and dialog is not hidden
    if (!hasMouseMoved || dialogHidden) return;

    // Function to type text with human-like delays
    const typeText = () => {
      const currentMessage = messages[currentMessageIndex].text;
      if (displayedText.length < currentMessage.length) {
        // Get next character
        const nextChar = currentMessage.charAt(displayedText.length);
        
        // Update displayed text with next character
        setDisplayedText(prevText => prevText + nextChar);
        
        // Set current tone based on the current message
        setCurrentTone(messages[currentMessageIndex].tone);
        
        // Determine delay for next character based on punctuation
        const isCommonPunctuation = ['.', ',', '!', '?'].includes(nextChar);
        const isPauseMark = ['...', '..'].some(mark => 
          currentMessage.slice(displayedText.length).startsWith(mark)
        );
        
        let delay;
        if (isPauseMark) {
          // Longer pause for ellipsis
          delay = 1000;
        } else if (isCommonPunctuation) {
          // Pause after punctuation
          delay = nextChar === '.' || nextChar === '!' || nextChar === '?' ? 700 : 400;
        } else {
          // Regular typing delay with natural variation
          delay = getTypeDelay();
        }
        
        // Schedule next character
        typingIntervalRef.current = setTimeout(typeText, delay);
      } else {
        // Message is complete
        setIsTyping(false);
        setIsCompleteMessage(true);
        
        // Wait before showing next message
        endCycleTimeoutRef.current = setTimeout(() => {
          setIsWaitingEndCycle(true);
          
          // Move to next message or cycle back to beginning
          const nextIndex = (currentMessageIndex + 1) % messages.length;
          setCurrentMessageIndex(nextIndex);
          setDisplayedText("");
          setIsCompleteMessage(false);
          setIsWaitingEndCycle(false);
          
          // Start typing next message
          setIsTyping(true);
        }, 3000); // Wait 3 seconds between messages
      }
    };
    
    // Start typing if not already typing
    if (!isTyping && !isCompleteMessage && !isWaitingEndCycle) {
      setIsTyping(true);
      typeText();
    }
    
    // Clean up function
    return () => {
      if (typingIntervalRef.current) clearTimeout(typingIntervalRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      if (endCycleTimeoutRef.current) clearTimeout(endCycleTimeoutRef.current);
    };
  }, [
    hasMouseMoved, 
    dialogHidden, 
    isTyping, 
    isCompleteMessage, 
    isWaitingEndCycle, 
    displayedText, 
    currentMessageIndex, 
    messages
  ]);

  // Function to generate typing speed based on RPG game dialog model
  const getTypeDelay = () => {
    // More human-like delay implementation
    let baseSpeed = 80 + Math.random() * 40; // Base delay 80-120ms

    // Add natural variation to simulate human typing
    const humanVariation = () => {
      // 30% chance for slower typing (thinking pause)
      if (Math.random() < 0.3) {
        return baseSpeed * (1.5 + Math.random());
      }
      // 20% chance for faster typing (familiar words)
      if (Math.random() < 0.2) {
        return baseSpeed * 0.7;
      }
      return baseSpeed;
    };
    return humanVariation();
  };

  // Function to create ember particles animation
  const createEmbers = () => {
    const embers = [];
    const emberCount = 20;
    
    for (let i = 0; i < emberCount; i++) {
      const size = Math.random() * 4 + 2;
      const xPos = Math.random() * 100;
      const delay = Math.random() * 3;
      const duration = Math.random() * 3 + 2;
      const opacity = Math.random() * 0.8 + 0.2;
      
      embers.push(
        <motion.div
          key={i}
          className="ember"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${xPos}%`,
            opacity: opacity,
            backgroundColor: `rgba(249, 115, 22, ${Math.random() * 0.7 + 0.3})`,
            boxShadow: `0 0 ${size}px rgba(249, 115, 22, 0.5)`,
            filter: 'blur(1px)'
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ 
            y: [0, -50 - Math.random() * 100],
            opacity: [opacity, 0]
          }}
          transition={{
            duration: duration,
            delay: delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      );
    }
    
    return embers;
  };

  return (
    <div className="gif-background-container">
      {/* Dark overlay for better text readability */}
      <div className="bg-overlay"></div>
      
      {/* Background image/gif */}
      <div className="bg-image">
        <img 
          src="/images/darksouls.gif" 
          alt="Dark Souls campfire scene" 
          className="campfire-gif"
        />
        {/* Ember animation container */}
        <div className="ember-container">
          {createEmbers()}
        </div>
      </div>
      
      {/* Dialog box */}
      <AnimatePresence>
        {!dialogHidden && (
          <motion.div 
            className="dialog-box"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div 
              className="dialog-content"
              style={{ 
                backgroundColor: currentTone ? TONE_COLORS[currentTone] : TONE_COLORS[TONE.RESIGNED]
              }}
            >
              <p className="dialog-text">{displayedText}</p>
              <span className={`dialog-cursor ${isTyping ? 'blink' : 'hidden'}`}>_</span>
            </div>
            <div className="dialog-arrow"></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Audio controls */}
      <div className="audio-controls">
        <button 
          className={`audio-button ${isAudioPlaying ? 'playing' : ''}`}
          onClick={playAudio}
          aria-label={isAudioPlaying ? "Mute background music" : "Play background music"}
        >
          <span className="audio-icon">
            {isAudioPlaying ? "🔊" : "🔇"}
          </span>
        </button>
      </div>
      
      {/* Main content */}
      <div className="content">
        {children}
      </div>
      
      <style>{`
        .gif-background-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background-color: #000;
        }
        
        .bg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%);
          z-index: 1;
        }
        
        .bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .campfire-gif {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        
        .ember-container {
          position: absolute;
          width: 100%;
          height: 100%;
          bottom: 30%;
          left: 0;
          pointer-events: none;
        }
        
        .ember {
          position: absolute;
          border-radius: 50%;
          bottom: 30%;
        }
        
        .dialog-box {
          position: absolute;
          top: 8%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          width: 90%;
          max-width: 500px;
        }
        
        .dialog-content {
          background-color: rgba(40, 40, 45, 0.7);
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(249, 115, 22, 0.1);
        }
        
        .dialog-text {
          font-family: 'VT323', monospace;
          font-size: clamp(1rem, 3vw, 1.2rem);
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          line-height: 1.4;
          letter-spacing: 0.5px;
        }
        
        .dialog-cursor {
          display: inline-block;
          margin-left: 4px;
          font-family: 'VT323', monospace;
          font-size: clamp(1rem, 3vw, 1.2rem);
          color: rgba(255, 255, 255, 0.9);
        }
        
        .blink {
          animation: blink 0.8s infinite;
        }
        
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        
        .hidden {
          opacity: 0;
        }
        
        .dialog-arrow {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid rgba(40, 40, 45, 0.7);
          margin: 0 auto;
        }
        
        .content {
          position: relative;
          z-index: 10;
          width: 100%;
          min-height: 100vh;
        }
        
        .audio-controls {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 100;
        }
        
        .audio-button {
          background-color: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }
        
        .audio-button:hover {
          background-color: rgba(30, 30, 30, 0.8);
          border-color: rgba(249, 115, 22, 0.4);
          transform: scale(1.05);
        }
        
        .audio-button.playing {
          border-color: rgba(249, 115, 22, 0.6);
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
        }
        
        .audio-icon {
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
};

export default GifBackground;
