import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ElevenLabsService from '../services/elevenlabsService';

// Definisi tone untuk voice modulation dialog
const TONE = {
  BITTER: "bitter", // Pahit, getir, lambat dan berat
  ANGRY: "angry", // Marah, lebih cepat, terputus-putus
  TIRED: "tired", // Lelah, sangat lambat dan terputus
  DRUNK: "drunk", // Mabuk berat, tidak konsisten, slurring banyak
  NUMB: "numb", // Mati rasa, monoton, datar
  SARCASTIC: "sarcastic", // Sarkastik, ritme bervariasi
  RESIGNED: "resigned", // Pasrah, tempo lebih lambat
  HOLLOW: "hollow", // Kosong, hampa, jeda panjang
  ANNOYED: "annoyed", // Terganggu, tempo sedikit lebih cepat
  CONTEMPLATIVE: "contemplative", // Termenung, banyak jeda
};

// Palet warna untuk tone moods - subtle background shifts
const TONE_COLORS = {
  [TONE.BITTER]: "rgba(50, 30, 40, 0.7)", // Merah tua keunguan (getir)
  [TONE.ANGRY]: "rgba(70, 20, 20, 0.65)", // Merah gelap
  [TONE.TIRED]: "rgba(30, 30, 50, 0.7)", // Biru keabu-abuan gelap
  [TONE.DRUNK]: "rgba(40, 10, 40, 0.8)", // Ungu gelap
  [TONE.NUMB]: "rgba(30, 40, 50, 0.75)", // Biru tua keabu-abuan
  [TONE.SARCASTIC]: "rgba(50, 40, 10, 0.7)", // Kuning kecoklatan
  [TONE.RESIGNED]: "rgba(40, 40, 45, 0.7)", // Abu-abu
  [TONE.HOLLOW]: "rgba(20, 25, 35, 0.8)", // Biru kehitaman
  [TONE.ANNOYED]: "rgba(60, 40, 35, 0.7)", // Oranye kecoklatan gelap
  [TONE.CONTEMPLATIVE]: "rgba(20, 40, 50, 0.7)", // Biru kehijauan gelap
};

interface DialogBoxProps {
  onDialogComplete?: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ onDialogComplete }) => {
  // List of messages with voice tone modulation - Geralt-like when depressed and drunk
  const [messages, setMessages] = useState([
    { id: 1, text: "...Didn't ask for company,", character: "Geralt", tone: TONE.ANNOYED, voiceId: "geralt" },
    { id: 2, text: "Tch... Fire's warm. Always brings strays,", character: "Geralt", tone: TONE.BITTER, voiceId: "geralt" },
    { id: 3, text: "Haahhhh... You need something or are you just here to waste my time?", character: "Geralt", tone: TONE.ANNOYED, voiceId: "geralt" },
    { id: 4, text: ".....", character: "Geralt", tone: TONE.DRUNK, voiceId: "geralt" },
    { id: 5, text: "Curiosity?... Hmph... Doesn't pay the bills...", character: "Geralt", tone: TONE.SARCASTIC, voiceId: "geralt" },
    { id: 6, text: ".....", character: "Geralt", tone: TONE.DRUNK, voiceId: "geralt" },
    { id: 7, text: "Pfftt... Waiting... Drinking... What else is there?,", character: "Geralt", tone: TONE.RESIGNED, voiceId: "geralt" },
    { id: 8, text: ".....", character: "Geralt", tone: TONE.DRUNK, voiceId: "geralt" },
    { id: 9, text: "A job?.., A way out?.., Some miracle?..,", character: "Geralt", tone: TONE.HOLLOW, voiceId: "geralt" },
    { id: 10, text: ".....", character: "Geralt", tone: TONE.DRUNK, voiceId: "geralt" },
    { id: 11, text: "Heh... Yeah, real fucking hilarious, isn't it?,", character: "Geralt", tone: TONE.SARCASTIC, voiceId: "geralt" },
    { id: 12, text: "...You got a name?", character: "Geralt", tone: TONE.CONTEMPLATIVE, voiceId: "geralt" },
    { id: 13, text: ".....", character: "Geralt", tone: TONE.DRUNK, voiceId: "geralt" },
    { id: 14, text: "Hm. Not that it matters,", character: "Geralt", tone: TONE.NUMB, voiceId: "geralt" },
    { id: 15, text: "John Doe, Software Engineer. Call me what you want. Doesn't do shit,", character: "Geralt", tone: TONE.BITTER, voiceId: "geralt" },
    { id: 16, text: ".....", character: "Geralt", tone: TONE.DRUNK, voiceId: "geralt" },
    { id: 17, text: "Hmph... why am I even here?..", character: "Geralt", tone: TONE.CONTEMPLATIVE, voiceId: "geralt" },
    { id: 18, text: "Anything that keeps me breathing,", character: "Geralt", tone: TONE.NUMB, voiceId: "geralt" },
    { id: 19, text: "Hunting work's like hunting a ghost. No signs, no tracks, just hope and a headache,", character: "Geralt", tone: TONE.RESIGNED, voiceId: "geralt" },
    { id: 20, text: ".....", character: "Geralt", tone: TONE.DRUNK, voiceId: "geralt" },
    { id: 21, text: "Graduated. Computer Science. 2024,", character: "Geralt", tone: TONE.HOLLOW, voiceId: "geralt" },
    { id: 22, text: "Yeah... Cum laude. Thought it'd mean something.. Turns out it's worth less than a stiff drink,", character: "Geralt", tone: TONE.BITTER, voiceId: "geralt" },
    { id: 23, text: ".....", character: "Geralt", tone: TONE.DRUNK, voiceId: "geralt" },
    { id: 24, text: "Frontend. React. TypeScript. Know my way around. Not that anyone cares,", character: "Geralt", tone: TONE.RESIGNED, voiceId: "geralt" },
    { id: 25, text: "Made a project for my portfolio. Thought it'd mean something. It didn't,", character: "Geralt", tone: TONE.BITTER, voiceId: "geralt" },
    { id: 26, text: "What do you want?..", character: "Geralt", tone: TONE.ANNOYED, voiceId: "geralt" },
    { id: 27, text: "Talk... You got a job, or just wasting my time?..", character: "Geralt", tone: TONE.ANNOYED, voiceId: "geralt" }
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
  const [dialogHidden, setDialogHidden] = useState(true);
  const [currentTone, setCurrentTone] = useState(TONE.RESIGNED);
  const [voiceMuted, setVoiceMuted] = useState(false);

  // References for intervals and timeouts
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const endCycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const elevenlabsService = ElevenLabsService.getInstance();

  // Track user interaction (mouse move, touch, click) untuk memulai animasi - support semua perangkat
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

    // Tambah event listeners untuk desktop dan mobile
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

  // Function to generate typing speed berdasarkan model RPG game dialog
  const getTypeDelay = () => {
    // Implementasi delay ketikan yang lebih manusiawi
    let baseSpeed = 80 + Math.random() * 40;

    // Tambahkan variasi natural untuk simulasi ketikan manusia
    const humanVariation = () => {
      // 30% chance untuk ketikan lebih lambat (thinking pause)
      if (Math.random() < 0.3) {
        return baseSpeed * (1.5 + Math.random());
      }
      // 20% chance untuk ketikan lebih cepat (familiar words)
      if (Math.random() < 0.2) {
        return baseSpeed * 0.7;
      }
      return baseSpeed;
    };
    return humanVariation();
  };

  // Function to determine pause duration setelah tanda baca - dengan voice tone modulation
  const getPauseDuration = (char: string) => {
    // Get current message tone
    const currentMessage = messages[currentMessageIndex];
    const messageTone = currentMessage ? currentMessage.tone : TONE.RESIGNED;

    // Faktor modifikasi jeda berdasarkan tone
    let toneModifier = 1.0; // Default faktor 1.0 (tidak berubah)

    // Base pause duration berdasarkan karakter
    let baseDuration;

    if (char === ".") {
      // Pause setelah kalimat selesai - ultra-pendek untuk model game modern
      if (Math.random() < 0.3) {
        // 30% kesempatan jeda sedikit lebih panjang
        baseDuration = 150 + Math.random() * 100; // 150-250ms - jeda sedang (game modern)
      } else {
        baseDuration = 100 + Math.random() * 75; // 100-175ms - jeda singkat (game modern)
      }
    } else if (char === "?") {
      // Pause setelah pertanyaan - tetap pendek ala game
      baseDuration = 120 + Math.random() * 80; // 120-200ms - kebingungan minimal
    } else if (char === "!") {
      // Teriakan frustrasi atau kemarahan - tetap cepat
      baseDuration = 80 + Math.random() * 70; // 80-150ms - hampir tidak ada jeda
    } else if (char === "*") {
      // Bergumam (*hmm*) dan mendesah (*sigh*) - tetap pendek
      baseDuration = 110 + Math.random() * 90; // 110-200ms - gumaman
    } else if (char === "…") {
      // Trailing off - tetap pendek untuk game modern
      baseDuration = 130 + Math.random() * 100; // 130-230ms - jeda minimal
    } else {
      // Koma dan jeda lainnya - hampir tidak terasa
      baseDuration = 60 + Math.random() * 60; // 60-120ms - jeda sangat singkat
    }

    // Terapkan tone modifier pada base duration
    return baseDuration * toneModifier * (0.8 + Math.random()*0.4); // Tambahkan variasi natural
  };

  // Schedule the next message or handle end of cycle
  const scheduleNextMessage = useCallback(() => {
    // Clear any existing timeouts
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Set display duration ultra-cepat (model game RPG modern)
    const messageLength = messages[currentMessageIndex].text.length;
    const displayDuration = Math.max(1000, messageLength * 15); // 15ms per karakter, min 1s

    pauseTimeoutRef.current = setTimeout(() => {
      // Check if we're at the last message
      if (currentMessageIndex === messages.length - 1) {
        setIsWaitingEndCycle(true);

        // Wait 3 seconds before starting over (ultra-cepat seperti game)
        endCycleTimeoutRef.current = setTimeout(() => {
          setIsWaitingEndCycle(false);
          setCurrentMessageIndex(0);
          if (onDialogComplete) {
            onDialogComplete();
          }
        }, 3000); // 3 detik pause di akhir siklus (ultra-cepat)
      } else {
        // Move to next message
        setCurrentMessageIndex((prevIndex) => prevIndex + 1);
      }
    }, displayDuration);
  }, [currentMessageIndex, messages.length, onDialogComplete]);

  // Typewriter effect - human-like typing dengan cadence yang sesuai tone
  const typeMessage = useCallback(() => {
    // Verifikasi bahwa ada pesan yang valid
    if (!messages || !messages[currentMessageIndex]) {
      console.error("Invalid message or message index:", currentMessageIndex);
      return;
    }

    const messageObj = messages[currentMessageIndex];
    const currentMessage = messageObj.text; // Mengambil text dari objek pesan
    const messageTone = messageObj.tone; // Mengambil tone dari objek pesan

    // Update tone untuk perubahan warna background
    setCurrentTone(messageTone);

    // Reset typing state all at once to avoid race conditions
    setIsTyping(true);
    setIsCompleteMessage(false);
    setIsPaused(false);
    setDisplayedText(""); // Clear the displayed text

    let charIndex = 0;

    // Clear any existing intervals and timeouts to prevent conflicts
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    // Speak with ElevenLabs if API key is set
    if (elevenlabsService.getApiKey()) {
      elevenlabsService.speakText(currentMessage, messageObj.voiceId);
    }

    // Start typing character by character dengan delay yang sangat pendek
    setTimeout(() => {
      const processNextChar = () => {
        if (charIndex < currentMessage.length) {
          // Make sure we append the correct character
          const nextChar = currentMessage.charAt(charIndex);
          setDisplayedText((prev) => prev + nextChar);
          charIndex++;

          // Simulasi ketikan berdasarkan tone modulasi
          let skipCount = 0;

          // Probabilitas slurring berdasarkan tone
          let slurProbability = 0.2; // Default probabilitas
          let maxSkipBase = 3; // Default maksimum karakter slurring

          // Sesuaikan probabilitas slurring berdasarkan tone modulasi
          const toneConfig: Record<string, { probability: number; maxSkip: number }> = {
            [TONE.DRUNK]: { probability: 0.45, maxSkip: 4 }, // Mabuk: banyak slurring, sangat tidak konsisten
            [TONE.ANGRY]: { probability: 0.25, maxSkip: 2 }, // Marah: lebih cepat, terputus-putus
            [TONE.TIRED]: { probability: 0.08, maxSkip: 1 }, // Lelah: lambat, hampir tidak ada slurring
            [TONE.BITTER]: { probability: 0.22, maxSkip: 3 }, // Getir: emosi tertahan
            [TONE.SARCASTIC]: { probability: 0.3, maxSkip: 2 }, // Sarkasme: tidak terprediksi
            [TONE.RESIGNED]: { probability: 0.15, maxSkip: 2 }, // Pasrah: lebih stabil
            [TONE.ANNOYED]: { probability: 0.2, maxSkip: 2 }, // Kesal: lebih cepat
            [TONE.HOLLOW]: { probability: 0.1, maxSkip: 1 }, // Hampa: lambat dan terpisah
            [TONE.NUMB]: { probability: 0.05, maxSkip: 1 }, // Mati rasa: sangat konsisten
            [TONE.CONTEMPLATIVE]: { probability: 0.12, maxSkip: 1 }, // Merenungkan: memikirkan kata
          };

          // Gunakan konfigurasi berdasarkan tone saat ini, atau default jika tidak ada
          const config = toneConfig[messageTone] || {
            probability: 0.2,
            maxSkip: 2,
          };
          slurProbability = config.probability;
          maxSkipBase = config.maxSkip;

          // Implementasi slurring berdasarkan probabilitas
          if (Math.random() < slurProbability) {
            // Jumlah karakter yang di-slur
            const maxSkip = Math.floor(Math.random() * maxSkipBase) + 1;

            while (
              skipCount < maxSkip && // Batasi maksimum slurring berdasarkan tone
              charIndex < currentMessage.length &&
              !/[,\.?*\-…!]/.test(currentMessage.charAt(charIndex)) && // Stop di tanda baca
              currentMessage.charAt(charIndex) !== " " // Hindari skip spasi
            ) {
              const additionalChar = currentMessage.charAt(charIndex);
              setDisplayedText((prev) => prev + additionalChar);
              charIndex++;
              skipCount++;
            }
          }

          // Handle various punctuation and special cases 
          const lastChar = currentMessage.charAt(charIndex - 1);
          // Check for more punctuation to create speech patterns
          if (
            lastChar === "," ||
            lastChar === "." ||
            lastChar === "?" ||
            lastChar === "*" ||
            lastChar === "-" ||
            lastChar === "…" ||
            lastChar === "!"
          ) {
            clearInterval(typingIntervalRef.current as NodeJS.Timeout);
            setIsPaused(true);

            // Get appropriate pause duration
            const pauseDuration = getPauseDuration(lastChar);

            pauseTimeoutRef.current = setTimeout(() => {
              setIsPaused(false);
              typingIntervalRef.current = setInterval(
                processNextChar,
                getTypeDelay(),
              );
            }, pauseDuration);
          }
        } else {
          // Finished typing the message
          clearInterval(typingIntervalRef.current as NodeJS.Timeout);
          setIsTyping(false);
          setIsCompleteMessage(true);

          // Schedule next message or end of cycle pause
          scheduleNextMessage();
        }
      };

      // Start the typing interval
      typingIntervalRef.current = setInterval(processNextChar, getTypeDelay());
    }, 10); // Delay awal sangat singkat
  }, [currentMessageIndex, messages, scheduleNextMessage]);

  // Start typing when current message changes
  useEffect(() => {
    if (messages.length > 0 && !isWaitingEndCycle) {
      typeMessage();
    }

    // Cleanup function to clear timeouts and intervals
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (endCycleTimeoutRef.current) {
        clearTimeout(endCycleTimeoutRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [currentMessageIndex, messages.length, isWaitingEndCycle, typeMessage]);

  // Function to handle skipping or continuing
  const handleContinue = () => {
    if (isTyping) {
      // We're still typing, so skip to the end of the current message
      setIsTyping(false);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }

      // Immediately display the full message
      const fullMessage = messages[currentMessageIndex].text;
      setDisplayedText(fullMessage);
      setIsCompleteMessage(true);

      // Stop ElevenLabs speech if it's playing
      elevenlabsService.stopSpeaking();

      // Schedule next message
      scheduleNextMessage();
    } else {
      // We've finished typing, so move to the next message immediately
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      
      // Check if we're at the end
      if (currentMessageIndex === messages.length - 1) {
        if (onDialogComplete) {
          onDialogComplete();
        }
      } else {
        // Move to next message immediately
        setCurrentMessageIndex(prevIndex => prevIndex + 1);
      }
    }
  };

  // Don't render anything if dialogHidden is true
  if (dialogHidden && !hasMouseMoved) {
    return null;
  }

  const currentMessage = messages[currentMessageIndex];
  const backgroundColorStyle = currentMessage ? TONE_COLORS[currentMessage.tone] || TONE_COLORS[TONE.RESIGNED] : TONE_COLORS[TONE.RESIGNED];

  return (
    <AnimatePresence>
      {!dialogHidden && (
        <motion.div
          className="dialog-box-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed",
            bottom: "2rem",
            left: 0,
            width: "100%", 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
            padding: "0 1rem",
          }}
        >
          <div
            className="dialog-box"
            style={{
              background: backgroundColorStyle,
              padding: "1.5rem",
              borderRadius: "0.5rem",
              maxWidth: "800px", 
              width: "100%",
              boxShadow: "0 4px 25px rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              position: "relative",
            }}
          >
            {currentMessage && (
              <>
                <div
                  className="character-name"
                  style={{
                    position: "absolute",
                    top: "-1.8rem",
                    left: 0, 
                    background: "rgba(249, 115, 22, 0.9)",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px 4px 0 0",
                    fontWeight: 600,
                    color: "#fff",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontSize: "0.9rem",
                  }}
                >
                  {currentMessage.character}
                </div>
                <div
                  className="dialog-text"
                  style={{
                    color: "#f1f5f9",
                    fontSize: "clamp(1rem, 2.5vw, 1.1rem)",
                    lineHeight: 1.6,
                    marginBottom: "1rem",
                    minHeight: "5rem",
                  }}
                >
                  {displayedText}
                  {isTyping && !isPaused && (
                    <span
                      className="cursor-blink"
                      style={{
                        display: "inline-block",
                        width: "0.5em",
                        height: "1.2em",
                        backgroundColor: "rgba(255,255,255,0.7)",
                        marginLeft: "0.2em",
                        verticalAlign: "middle",
                        animation: "blink 0.8s infinite",
                      }}
                    ></span>
                  )}
                </div>
                <div
                  className="dialog-actions"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="dialog-continue"
                    onClick={handleContinue}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.8)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isTyping ? "Skip" : "Next"}
                    <span
                      className="continue-indicator"
                      style={{
                        fontSize: "0.8rem",
                        animation: "pulse 1.5s infinite",
                      }}
                    >
                      {isTyping ? "▶" : "▼"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DialogBox;