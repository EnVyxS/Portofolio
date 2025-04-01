import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GifBackground = ({ children }) => {
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

  // List of messages with voice tone modulation - Geralt-like when depressed and drunk
  // Menggunakan state agar bisa bergerak
  const [messages, setMessages] = useState([
    { text: "...Didn't ask for company,", tone: TONE.ANNOYED },
    { text: "Tch... Fire's warm. Always brings strays,", tone: TONE.BITTER },
    {
      text: "Haahhhh... You need something or are you just here to waste my time?",
      tone: TONE.ANNOYED,
    },
    { text: ".....", tone: TONE.DRUNK },
    { text: "Curiosity?... Hmph... Doesn’t pay the bills...", tone: TONE.SARCASTIC },
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
      text: "Yeah... Cum laude. Thought it'd  mean something.. Turns out it's worth less than a stiff drink,",
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
  const [voiceMuted, setVoiceMuted] = useState(false); // State untuk mute/unmute suara

  // References for intervals and timeouts
  const typingIntervalRef = useRef(null);
  const pauseTimeoutRef = useRef(null);
  const endCycleTimeoutRef = useRef(null);
  const inactivityTimeoutRef = useRef(null);
  const audioRef = useRef(null);
  const speechSynthRef = useRef(null); // Reference for speech synthesis

  // Automatically play audio when user interacts with the page - support for semua perangkat termasuk mobile
  const handleUserInteraction = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.15; // Lower volume
      audioRef.current
        .play()
        .then(() => {
          localStorage.setItem("isAudioPlaying", "true");
          // Hapus semua event listener interaksi
          document.removeEventListener("mousemove", handleUserInteraction);
          document.removeEventListener("touchstart", handleUserInteraction);
          document.removeEventListener("click", handleUserInteraction);
        })
        .catch((error) => console.error("Audio play failed:", error));
    }
  }, []);

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

  // Inactivity checker to hide dialog after 8 seconds of no interaction
  useEffect(() => {
    // Only start checking for inactivity after initial interaction and when message is complete
    if (!hasMouseMoved || !isCompleteMessage) return;

    // Function to check inactivity - akan memeriksa setiap 1 detik
    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteraction;

      // Jika 8 detik tidak ada interaksi dan dialog sedang ditampilkan dan kita berada di pesan terakhir
      // Dialog akan menghilang secara natural dengan animasi fade out
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

  // Separate effect for audio initialization to avoid dependency array issues
  useEffect(() => {
    // Setup audio autoplay jika sudah ada preferensi
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("isAudioPlaying") === "true"
    ) {
      // Coba autoplay jika browser mengizinkan
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.volume = 0.15;
          audioRef.current.play().catch(() => {
            // Jika autoplay gagal, tunggu interaksi user
            document.addEventListener("mousemove", handleUserInteraction);
            document.addEventListener("touchstart", handleUserInteraction);
            document.addEventListener("click", handleUserInteraction);
          });
        }
      }, 1000);
    } else {
      // Tunggu interaksi user untuk memainkan audio
      document.addEventListener("mousemove", handleUserInteraction);
      document.addEventListener("touchstart", handleUserInteraction);
      document.addEventListener("click", handleUserInteraction);
    }

    return () => {
      // Clean up audio event listeners
      document.removeEventListener("mousemove", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("click", handleUserInteraction);
    };
  }, [handleUserInteraction]);

  // Function to generate typing speed berdasarkan model RPG game dialog
  const getTypeDelay = () => {
    // Implementasi delay ketikan yang lebih manusiawi
    let baseSpeed;

    // Base delay yang lebih natural (80-120ms)
    baseSpeed = 80 + Math.random() * 40;

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
const getPauseDuration = (char) => {
    // Implementasi jeda yang lebih natural
    const naturalPause = () => {
      // Base pause 300-500ms
      const basePause = 300 + Math.random() * 200;

      // 25% chance untuk jeda lebih panjang (contemplating)
      if (Math.random() < 0.25) {
        return basePause * (1.5 + Math.random());
      }
      return basePause;
    };

    // Get current message tone
    const currentTone = messages[currentMessageIndex].tone;

    // Faktor modifikasi jeda berdasarkan tone
    let toneModifier = 1.0; // Default faktor 1.0 (tidak berubah)

    // Sesuaikan durasi jeda berdasarkan tone vokal
    switch (currentTone) {
      case TONE.ANGRY:
        // Angry: Jeda lebih pendek - cepat dan terputus-putus karena emosi
        toneModifier = 0.1; // 30% lebih cepat
        break;

      case TONE.TIRED:
        // Tired: Jeda sangat panjang - hampir tertidur
        toneModifier = 0.1; // 50% lebih lama
        break;

      case TONE.DRUNK:
        // Drunk: Sangat tidak konsisten - kadang cepat, kadang sangat lambat
        toneModifier = 0.1;
        break;

      case TONE.NUMB:
        // Numb: Monoton, jeda konsisten
        toneModifier = 0.1; 
        break;

      case TONE.BITTER:
        // Bitter: Emosi tertahan, jeda yang lebih panjang saat mencoba menahan amarah
        toneModifier = 0.1;
        break;

      case TONE.SARCASTIC:
        // Sarcastic: Pola yang tidak terprediksi dengan penekanan berbeda
        toneModifier = 0.1;
        break;

      case TONE.RESIGNED:
        // Resigned: Pasrah, jeda lebih konsisten
        toneModifier = 0.1;
        break;

      case TONE.HOLLOW:
        // Hollow: Hampa, jeda sangat panjang
        toneModifier = 0.1;
        break;

      case TONE.ANNOYED:
        // Annoyed: Kesal, jeda lebih pendek dengan tanda baca
        toneModifier = 0.1;
        break;

      case TONE.CONTEMPLATIVE:
        // Contemplative: Merenungkan, jeda sangat panjang
        toneModifier = 0.1;
        break;

      default:
        toneModifier = 0.1; // Tidak ada modifikasi
        break;
    }

    // Base pause duration berdasarkan karakter
    // Durasi sangat pendek untuk model game RPG modern
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
        }, 3000); // 3 detik pause di akhir siklus (ultra-cepat)
      } else {
        // Move to next message
        setCurrentMessageIndex((prevIndex) => prevIndex + 1);
      }
    }, displayDuration);
  }, [currentMessageIndex, messages.length]);

  // Human-like typing effect with Geralt's depressed drunk cadence
  // Disesuaikan dengan voice tone modulation
  const typeMessage = useCallback(() => {
    // Verifikasi bahwa ada pesan yang valid
    if (!messages || !messages[currentMessageIndex]) {
      console.error("Invalid message or message index:", currentMessageIndex);
      return;
    }

    const messageObj = messages[currentMessageIndex];
    const currentMessage = messageObj.text; // Mengambil text dari objek pesan
    const messageTone = messageObj.tone; // Mengambil tone dari objek pesan

    // Debug info to console
    console.log(
      `Typing message [${currentMessageIndex}]: "${currentMessage.substring(0, 20)}..." with tone: ${messageTone}`,
    );

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

    // Start typing character by character dengan delay yang sangat pendek (10ms)
    setTimeout(() => {
      const processNextChar = () => {
        if (charIndex < currentMessage.length) {
          // Make sure we append the correct character
          const nextChar = currentMessage.charAt(charIndex);
          setDisplayedText((prev) => prev + nextChar);
          charIndex++;

          // Simulasi ketikan berdasarkan tone modulasi
          // Karakter muncul dengan cara berbeda berdasarkan emosi tone
          let skipCount = 0;

          // Probabilitas dan jumlah slurring bervariasi berdasarkan tone modulasi
          let slurProbability = 0.2; // Default probabilitas
          let maxSkipBase = 3; // Default maksimum karakter slurring

          // Sesuaikan probabilitas slurring berdasarkan tone modulasi
          const toneConfig = {
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

          // Implementasi slurring berdasarkan probabilitas yang sudah disesuaikan
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
          // Catatan: ketika tidak ada slurring, kecepatan ketikan tetap diatur oleh getTypeDelay()
          // Ini sudah disesuaikan dengan tone

          // Handle various punctuation and special cases like Geralt would
          const lastChar = currentMessage.charAt(charIndex - 1);
          // Check for more punctuation to create Geralt-like speech patterns
          if (
            lastChar === "," ||
            lastChar === "." ||
            lastChar === "?" ||
            lastChar === "*" ||
            lastChar === "-" ||
            lastChar === "…" ||
            lastChar === "!"
          ) {
            clearInterval(typingIntervalRef.current);
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
          clearInterval(typingIntervalRef.current);
          setIsTyping(false);
          setIsCompleteMessage(true);

          // Schedule next message or end of cycle pause
          scheduleNextMessage();
        }
      };

      // Start the typing interval dengan initial interval yang lebih pendek
      typingIntervalRef.current = setInterval(processNextChar, getTypeDelay());
    }, 10); // Delay awal sangat singkat (ultra-cepat)
    
  }, [currentMessageIndex, scheduleNextMessage]);

  // Fungsi helper untuk mengkonfigurasi Web Speech API berdasarkan tone
  const configureSpeechSynthesisForTone = (utterance, tone) => {
    // Default Geralt voice characteristics lebih mendalam dan kasar
    utterance.pitch = 0.4; // Much deeper voice untuk Geralt yang autentik
    utterance.rate = 0.75; // Slower, lebih sesuai dengan karakter Geralt yang berat dan terkesan lelah
    utterance.volume = 0.9; // Slightly louder untuk efek suara yang lebih jelas

    // Tone-specific modulasi dengan suara yang lebih mirip Geralt dari Witcher
    switch (tone) {
      case TONE.ANGRY:
        utterance.pitch = 0.5; // Lebih dalam saat marah, tapi terdengar geram
        utterance.rate = 0.85; // Geralt bicara lebih tajam tapi masih terkontrol saat marah
        utterance.volume = 1.0; // Lebih keras saat marah
        break;

      case TONE.TIRED:
        utterance.pitch = 0.35; // Sangat dalam saat lelah, nyaris berbisik
        utterance.rate = 0.6; // Sangat lambat saat lelah
        utterance.volume = 0.65; // Volume rendah
        break;

      case TONE.DRUNK:
        utterance.pitch = 0.4; // Suara dalam namun tidak stabil
        utterance.rate = 0.65 + Math.random() * 0.2; // Kecepatan tidak konsisten saat mabuk
        utterance.volume = 0.8; // Kencang seringkali saat mabuk
        break;

      case TONE.NUMB:
        utterance.pitch = 0.4; // Datar dan kosong
        utterance.rate = 0.7; // Lambat dan monoton
        utterance.volume = 0.75; // Volume sedang
        break;

      case TONE.BITTER:
        utterance.pitch = 0.45; // Masih dalam tapi sedikit naik karena emosi
        utterance.rate = 0.75; // Sedikit lebih lambat
        utterance.volume = 0.85; // Volume sedang-tinggi
        break;

      case TONE.SARCASTIC:
        utterance.pitch = 0.4; // Sedikit lebih tinggi untuk sarkasme, tapi tetap dalam
        utterance.rate = 0.75 + Math.random() * 0.15; // Variasi kecepatan untuk penekanan
        utterance.volume = 0.9; // Sedikit lebih keras
        break;

      case TONE.RESIGNED:
        utterance.pitch = 0.4; // Dalam, pasrah
        utterance.rate = 0.7; // Lambat
        utterance.volume = 0.7; // Volume sedang-rendah
        break;

      case TONE.HOLLOW:
        utterance.pitch = 0.35; // Sangat dalam, hampa
        utterance.rate = 0.65; // Sangat lambat
        utterance.volume = 0.6; // Pelan
        break;

      case TONE.ANNOYED:
        utterance.pitch = 0.45; // Sedikit lebih tinggi tapi masih dalam
        utterance.rate = 0.85; // Sedikit lebih cepat
        utterance.volume = 0.85; // Sedikit lebih keras
        break;

      case TONE.CONTEMPLATIVE:
        utterance.pitch = 0.4; // Dalam, merenung
        utterance.rate = 0.7; // Lambat dan berhati-hati
        utterance.volume = 0.8; // Volume sedang
        break;

      default:
        // Default Geralt settings remain
        break;
    }
  };

  // Voice tone modulasi untuk Geralt
  // ElevenLabs API untuk suara yang lebih natural dan manusiawi
  const speakWithGeraltVoice = useCallback(
    async (text, tone) => {
      // Skip kosong, dots (...), atau jika audio dimute
      if (!text || voiceMuted) return;

      // Cek jika teks hanya berisi ellipsis (...) dengan berbagai jumlah titik
      const cleanedText = text.replace(/\*/g, "").trim();
      // Gunakan regex untuk mendeteksi teks yang hanya berisi titik (...)
      // dengan jumlah berapapun (minimal 3)
      if (/^\.{3,}$/.test(cleanedText)) {
        console.log("Skipping TTS for ellipsis-only text (Geralt listening)");
        return;
      }

      // Hentikan audio yang sedang berjalan jika ada
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Jika ada audio yang sedang diputar, stop dulu
      const existingAudio = document.getElementById("geralt-audio");
      if (existingAudio) {
        existingAudio.pause();
        existingAudio.remove();
      }

      // Modifikasi text untuk menambahkan nuansa Geralt
      let cleanText = text.replace(/[*]/g, ""); // Hapus karakter asterisk

      // Transformasi teks untuk lebih mirip gaya bicara Geralt
      // Ganti 'hmm' menjadi lebih panjang seperti Geralt
      cleanText = cleanText.replace(/\bhmm\b/gi, "hmmmm");

      // Tambahkan jeda pada beberapa kata khas seperti "Fuck" untuk efek Geralt
      cleanText = cleanText.replace(/\bfuck\b/gi, "f...uck");
      cleanText = cleanText.replace(/\bdamn\b/gi, "d...amn");

      // Tambahkan gaya bicara Geralt dengan jeda
      cleanText = cleanText.replace(/\bcome on\b/gi, "come... on");
      cleanText = cleanText.replace(/\bwhat now\b/gi, "what... now");

      // Geralt terkenal dengan kata-kata pendek seperti "well" dan "fine"
      if (cleanText.length < 12 && Math.random() > 0.6) {
        if (
          tone === TONE.TIRED ||
          tone === TONE.DRUNK ||
          tone === TONE.RESIGNED
        ) {
          cleanText += "...";
        }
      }

      try {
        // ElevenLabs API integration
        // Nama API route yang akan kita buat
        const apiRoute = "/api/elevenlabs-tts";

        // Voice settings untuk Geralt berdasarkan tone - Optimize untuk karakter Geralt yang dalam dan serak
        let voiceSettings = {
          stability: 0.35, // Nilai rendah untuk efek suara yang lebih variatif
          similarity_boost: 0.75, // Nilai lebih tinggi untuk mempertahankan karakter Geralt
          style: 0.2, // Sedikit ditingkatkan untuk ekspresivitas yang lebih baik
          model_id: "eleven_turbo_v2", // Model terbaik untuk kualitas suara
        };

        // Konfigurasi spesifik untuk berbagai tone emosional Geralt
        switch (tone) {
          case TONE.ANGRY:
            voiceSettings = {
              stability: 0.25, // Nilai rendah untuk growling effect saat marah
              similarity_boost: 0.65, // Sedikit lebih rendah untuk perubahan tone lebih jelas
              style: 0.25, // Lebih ekspresif untuk kemarahan
              model_id: "eleven_turbo_v2",
            };
            break;

          case TONE.TIRED:
            voiceSettings = {
              stability: 0.55, // Lebih stabil untuk efek lelah
              similarity_boost: 0.8, // Lebih tinggi untuk tone yang lebih konsisten
              style: 0.1, // Kurang ekspresif karena lelah
              model_id: "eleven_turbo_v2",
            };
            break;

          case TONE.DRUNK:
            voiceSettings = {
              stability: 0.15, // Sangat tidak stabil untuk efek mabuk
              similarity_boost: 0.6, // Nilai rendah untuk tone yang lebih berubah-ubah
              style: 0.4, // Sangat ekspresif untuk efek mabuk
              model_id: "eleven_turbo_v2",
            };
            break;

          case TONE.NUMB:
            voiceSettings = {
              stability: 0.65, // Sangat stabil karena mati rasa
              similarity_boost: 0.7, // Konsisten
              style: 0.05, // Minimal ekspresivitas
              model_id: "eleven_turbo_v2", // Konsisten menggunakan model terbaik
            };
            break;

          case TONE.BITTER:
            voiceSettings = {
              stability: 0.35, // Cukup bervariasi untuk efek getir
              similarity_boost: 0.7, // Sedikit lebih rendah untuk lebih ekspresif
              style: 0.25, // Lebih ekspresif untuk efek getir
              model_id: "eleven_turbo_v2", // Model terbaru
            };
            break;

          case TONE.SARCASTIC:
            voiceSettings = {
              stability: 0.3, // Nilai rendah untuk variasi suara
              similarity_boost: 0.65, // Sedikit lebih rendah untuk kebebasan ekspresi
              style: 0.3, // Lebih ekspresif untuk efek sarkasme
              model_id: "eleven_turbo_v2", // Model terbaru
            };
            break;

          case TONE.RESIGNED:
            voiceSettings = {
              stability: 0.5, // Cukup stabil, tapi ada variasi
              similarity_boost: 0.7, // Konsisten dengan karakter Geralt
              style: 0.15, // Cukup ekspresif untuk menunjukkan kepasrahan
              model_id: "eleven_turbo_v2", // Model terbaru
            };
            break;

          case TONE.HOLLOW:
            voiceSettings = {
              stability: 0.6, // Cukup stabil untuk kesan hampa
              similarity_boost: 0.6, // Masih konsisten tapi dengan variasi
              style: 0.1, // Minimal ekspresif untuk efek hampa
              model_id: "eleven_turbo_v2", // Model terbaru
            };
            break;

          case TONE.ANNOYED:
            voiceSettings = {
              stability: 0.25, // Nilai rendah untuk variasi emosi
              similarity_boost: 0.65, // Cukup rendah untuk ekspresivitas
              style: 0.25, // Lebih ekspresif untuk efek kesal
              model_id: "eleven_turbo_v2", // Model terbaru
            };
            break;

          case TONE.CONTEMPLATIVE:
            voiceSettings = {
              stability: 0.45, // Cukup bervariasi untuk mendukung ekspresi
              similarity_boost: 0.65, // Konsisten dengan karakter Geralt
              style: 0.15, // Cukup ekspresif untuk kesan merenung
              model_id: "eleven_turbo_v2", // Model terbaru
            };
            break;
        }

        // Voice ID untuk Geralt dari Rivia - menggunakan voice kustom yang dibuat pengguna
        // Voice ID ini diambil dari ElevenLabs Voice Lab milik pengguna
        const GERALT_VOICE_ID = "b2FFMFMuLlPlyWk5NuQW";

        // Tidak lagi menambahkan efek suara berlebihan
        // Karena voice ID kustom sudah memiliki karakter Geralt
        let enhancedText = cleanText;

        // Tidak perlu menambahkan "hmm", "sigh", dan jeda berlebihan lagi
        // Voice ID kustom sudah memiliki karakteristik Geralt yang diinginkan

        // Tetap gunakan voice parameters berbeda untuk setiap tone emosi
        // tapi tidak perlu modifikasi teks lagi

        // Kurangi kecepatan keseluruhan untuk memberi waktu ketikan mengejar suara
        voiceSettings.stability = Math.min(voiceSettings.stability + 0.1, 0.8);

        const response = await fetch(apiRoute, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: enhancedText,
            voice_id: GERALT_VOICE_ID,
            voice_settings: voiceSettings,
            tone: tone,
          }),
        });

        if (!response.ok) {
          // Coba parse response JSON untuk mendapatkan informasi fallback
          const errorData = await response.json().catch(() => ({}));

          console.log(
            `ElevenLabs API error: ${response.statusText}, using fallback Web Speech API`,
          );

          // Langsung fallback ke Web Speech API tanpa throw error
          if (window.speechSynthesis && !voiceMuted) {
            console.log("Falling back to Web Speech API");

            const utterance = new SpeechSynthesisUtterance(cleanText);

            // Cari suara pria yang lebih cocok untuk Geralt
            const voices = window.speechSynthesis.getVoices();

            // Prioritas suara untuk Geralt dari yang paling cocok
            const geraltVoiceOptions = [
              voices.find(
                (voice) =>
                  voice.name.includes("English") &&
                  voice.name.includes("Male") &&
                  voice.name.includes("Deep"),
              ),
              voices.find(
                (voice) =>
                  voice.name.includes("UK") && voice.name.includes("Male"),
              ),
              voices.find(
                (voice) =>
                  voice.name.includes("Male") && voice.name.includes("US"),
              ),
              voices.find((voice) => voice.name.includes("Male")),
              voices.find((voice) => voice.lang.includes("en-GB")),
              voices.find((voice) => voice.lang.includes("en-US")),
              voices.find((voice) => voice.lang.includes("en")),
            ];

            // Pilih suara yang tersedia pertama dari prioritas
            const geraltVoice = geraltVoiceOptions.find(
              (voice) => voice !== undefined,
            );

            if (geraltVoice) {
              utterance.voice = geraltVoice;
            }

            // Gunakan tone-specific settings
            configureSpeechSynthesisForTone(utterance, tone);

            // Speak it!
            window.speechSynthesis.speak(utterance);

            // Store reference
            speechSynthRef.current = utterance;
          }

          // Return dari fungsi untuk menghindari melanjutkan eksekusi
          return;
        }

        // Periksa header untuk mengetahui apakah file dari cache
        const isCached = response.headers.get("x-cached") === "true";
        console.log(
          `TTS response ${isCached ? "from cache" : "newly generated"} for text: "${enhancedText.substring(0, 20)}${enhancedText.length > 20 ? "..." : ""}"`,
        );

        // Baik dari cache atau baru, prosesnya sama: ambil blob dan putar
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Buat dan mainkan audio
        const audioElement = new Audio(audioUrl);
        audioElement.id = "geralt-audio";
        audioElement.volume = 0.9; // Volume lebih tinggi untuk suara Geralt

        // Tambahkan ke DOM untuk tracking
        document.body.appendChild(audioElement);

        // Mainkan audio
        await audioElement.play();

        // Cleanup setelah selesai
        audioElement.onended = () => {
          URL.revokeObjectURL(audioUrl);
          audioElement.remove();
        };
      } catch (error) {
        console.error("ElevenLabs API error:", error);

        // Fallback ke Web Speech API jika ElevenLabs gagal
        if (window.speechSynthesis && !voiceMuted) {
          console.log("Falling back to Web Speech API");

          const utterance = new SpeechSynthesisUtterance(cleanText);

          // Cari suara pria yang lebih cocok untuk Geralt
          const voices = window.speechSynthesis.getVoices();

          // Prioritas suara untuk Geralt dari yang paling cocok
          const geraltVoiceOptions = [
            // Voice options yang paling cocok untuk Geralt
            voices.find(
              (voice) =>
                voice.name.includes("English") &&
                voice.name.includes("Male") &&
                voice.name.includes("Deep"),
            ),
            voices.find(
              (voice) =>
                voice.name.includes("UK") && voice.name.includes("Male"),
            ),
            voices.find(
              (voice) =>
                voice.name.includes("Male") && voice.name.includes("US"),
            ),
            voices.find((voice) => voice.name.includes("Male")),
            voices.find((voice) => voice.lang.includes("en-GB")),
            voices.find((voice) => voice.lang.includes("en-US")),
            voices.find((voice) => voice.lang.includes("en")),
          ];

          // Pilih suara yang tersedia pertama dari prioritas
          const geraltVoice = geraltVoiceOptions.find(
            (voice) => voice !== undefined,
          );

          if (geraltVoice) {
            utterance.voice = geraltVoice;
          }

          // Gunakan fungsi helper
          configureSpeechSynthesisForTone(utterance, tone);

          // Speak it!
          window.speechSynthesis.speak(utterance);

          // Store reference
          speechSynthRef.current = utterance;
        }
      }
    },
    [voiceMuted],
  );

  // Initialize Speech Synthesis
  useEffect(() => {
    // Check if speech synthesis is available
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Force load voices
      window.speechSynthesis.getVoices();
    }

    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Effect to manage typing when message index changes or after end cycle wait
  useEffect(() => {
    if (!hasMouseMoved) return; // Don't start until mouse has moved

    // Don't start typing if we're waiting at the end of a cycle
    if (isWaitingEndCycle) return;

    // Get current message
    const messageObj = messages[currentMessageIndex];

    // Speak with Geralt's voice when the message changes BEFORE typing begins
    if (messageObj && messageObj.text) {
      speakWithGeraltVoice(messageObj.text, messageObj.tone);
    }

    // Delay ketikan agar suara Geralt yang lambat dan berat mulai dulu
    // Karena suara Geralt sekarang jauh lebih lambat, kita perlu delay ketikan lebih lama
    // Model dialog sesuai game seperti The Witcher, tapi dengan karakter Geralt yang benar
    let initialDelay = 500; // Delay lebih panjang (500ms) - untuk memberi waktu suara Geralt yang lambat dan berat

    // Sesuaikan delay berdasarkan tone untuk lebih sinkron dengan suara
    // Karena kita memperlambat speaking_rate Geralt menjadi 0.75, teks perlu delay lebih lama
    if (messageObj && messageObj.tone) {
      switch (messageObj.tone) {
        case TONE.DRUNK:
          initialDelay = 700; // Jauh lebih lambat untuk kondisi mabuk (700ms)
          break;
        case TONE.TIRED:
        case TONE.HOLLOW:
          initialDelay = 650; // Jauh lebih lambat untuk kondisi lelah (650ms)
          break;
        case TONE.RESIGNED:
        case TONE.CONTEMPLATIVE:
          initialDelay = 600; // Lebih lambat untuk kondisi merenung (600ms)
          break;
        case TONE.BITTER:
        case TONE.NUMB:
          initialDelay = 550; // Lambat untuk tone yang stabil (550ms)
          break;
        case TONE.ANGRY:
        case TONE.ANNOYED:
          initialDelay = 450; // Sedikit lebih cepat untuk kondisi marah (450ms)
          break;
        case TONE.SARCASTIC:
          initialDelay = 500; // Standar untuk sarkasme (500ms)
          break;
        default:
          initialDelay = 500; // Default delay yang lebih lambat (500ms) - sesuai dengan suara Geralt yang lambat
      }
    }

    // Delay ketikan agar suara mulai dulu dengan delay yang tepat berdasarkan tone
    const startTypingTimeout = setTimeout(() => {
      typeMessage();
    }, initialDelay);

    return () => {
      clearTimeout(startTypingTimeout);
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      if (endCycleTimeoutRef.current) clearTimeout(endCycleTimeoutRef.current);

      // Cancel any ongoing speech when component changes
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [
    currentMessageIndex,
    hasMouseMoved,
    isWaitingEndCycle,
    typeMessage,
    speakWithGeraltVoice,
    messages,
  ]);

  return (
    <div className="background-container">
      {/* Background Music */}
      <audio ref={audioRef} src="/Darksouls-Chill.m4a" loop />
      {/* Background GIF */}
      <div className="gif-background"></div>

      {/* RPG Dialog Box - dengan animasi responsif */}
      <motion.div
        className="rpg-dialog-box"
        initial={{ y: 0, opacity: 0.85 }}
        animate={{
          // Saat dialogHidden aktif (setelah 8 detik tidak ada interaksi):
          // - Dialog bergerak ke bawah sedikit (10px) sebagai bagian dari animasi fade out
          // - Opacity berkurang ke 0 untuk efek menghilang secara natural
          // - Scale mengecil sedikit untuk efek menghilang lebih natural
          y: dialogHidden ? 10 : ["-0.5vh", "0.5vh", "-0.5vh"], // Floating animation when visible
          opacity: dialogHidden ? 0 : 0.9, // Fade out when inactive
          scale: dialogHidden ? 0.95 : 1, // Slight shrink when fading out
        }}
        whileTap={{ scale: 0.98 }} // Feedback sentuhan untuk perangkat mobile
        transition={{
          // Pengaturan animasi yang berbeda berdasarkan status dialog:
          // - Saat tampil: floating animation terus-menerus selama 5 detik per siklus
          // - Saat menghilang: animasi turun dan mengecil selama 0.7 detik (lebih natural)
          y: {
            repeat: dialogHidden ? 0 : Infinity, // Stop repeating when hidden
            duration: dialogHidden ? 0.7 : 5, // Faster transition when hiding
            ease: "easeInOut",
          },
          opacity: {
            duration: 0.7, // Fade out takes 0.7 seconds
          },
          scale: {
            duration: dialogHidden ? 0.7 : 0.2, // Slower for hiding, faster for touch feedback
          },
        }}
      >
        <div className="dialog-box-inner">
          <div className="dialog-corner top-left"></div>
          <div className="dialog-corner top-right"></div>
          <div className="dialog-corner bottom-left"></div>
          <div className="dialog-corner bottom-right"></div>

          {/* Voice control button */}
          <button
            className={`voice-control-btn ${voiceMuted ? "voice-muted" : "voice-active"}`}
            onClick={() => {
              // Toggle mute status
              setVoiceMuted(!voiceMuted);

              // Cancel any active speech if muting
              if (!voiceMuted && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            aria-label={
              voiceMuted ? "Unmute Geralt's voice" : "Mute Geralt's voice"
            }
            title={voiceMuted ? "Unmute Geralt's voice" : "Mute Geralt's voice"}
          >
            {voiceMuted ? "🔇" : "🔊"}
          </button>

          {/* Message Content */}
          {hasMouseMoved && (
            <AnimatePresence mode="wait">
              <motion.div
                className="message-content"
                key={currentMessageIndex}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  scale: isVisible ? 1 : 0.98,
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                }}
              >
                {isWaitingEndCycle ? (
                  <span className="typing-indicator">...</span>
                ) : (
                  displayedText
                )}
                {isPaused && <span className="cursor">|</span>}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Dialog Box Tail/Pointer */}
          <div className="dialog-tail"></div>
        </div>
      </motion.div>

      {/* Content Layer */}
      <div className="content-layer">{children}</div>

      {/* Styles */}
      <style jsx>{`
        .background-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
        }

        .gif-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("/darksouls.gif");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 1;
          animation: subtlePulse 30s ease-in-out infinite;
        }

        .content-layer {
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 10;
        }

        /* Subtle animation for the background */
        @keyframes subtlePulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Add a dark overlay for better text readability */
        .gif-background::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 2;
        }

        /* RPG Dialog Box Styles */
        :global(.rpg-dialog-box) {
          position: fixed; /* Fixed position untuk konsistensi di semua perangkat */
          top: 17%; /* Positioned higher on screen */
          left: 40%; /* Moved to the left (40% instead of 50%) */
          transform: translateX(-50%); /* Center alignment using transform */
          z-index: 5;
          width: min(
            320px,
            80vw
          ); /* Responsive width yang tidak terlalu besar di layar kecil */
          max-width: 95vw; /* Batasi lebar maksimum pada viewport kecil */
          overflow: visible;
        }

        .dialog-box-inner {
          position: relative;
          /* Background color berdasarkan tone mood saat ini */
          background: ${TONE_COLORS[currentTone] || "rgba(20, 24, 40, 0.8)"};
          border: 3px solid #39496e; /* Border color */
          border-radius: 8px;
          padding: clamp(
            10px,
            3vw,
            16px
          ); /* Padding responsif berdasarkan ukuran viewport */
          box-shadow:
            0 5px 20px rgba(0, 0, 0, 0.4),
            inset 0 0 10px rgba(110, 140, 255, 0.15);
          backdrop-filter: blur(3px);
          animation: pulseBorder 3s infinite ease-in-out;
          width: 100%; /* Pastikan box mengisi parent container sepenuhnya */
          transition: background 0.8s ease-in-out; /* Transisi smooth untuk perubahan warna */
        }

        @keyframes pulseBorder {
          0% {
            box-shadow:
              0 5px 20px rgba(0, 0, 0, 0.4),
              inset 0 0 10px rgba(110, 140, 255, 0.15);
          }
          50% {
            box-shadow:
              0 5px 25px rgba(0, 0, 0, 0.5),
              inset 0 0 15px rgba(110, 140, 255, 0.3);
          }
          100% {
            box-shadow:
              0 5px 20px rgba(0, 0, 0, 0.4),
              inset 0 0 10px rgba(110, 140, 255, 0.15);
          }
        }

        /* Pixelated corners for RPG style */
        .dialog-corner {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: rgba(110, 140, 255, 0.7);
          z-index: 2;
        }

        .top-left {
          top: -2px;
          left: -2px;
          border-top-left-radius: 3px;
        }

        .top-right {
          top: -2px;
          right: -2px;
          border-top-right-radius: 3px;
        }

        .bottom-left {
          bottom: -2px;
          left: -2px;
          border-bottom-left-radius: 3px;
        }

        .bottom-right {
          bottom: -2px;
          right: -2px;
          border-bottom-right-radius: 3px;
        }

        /* Voice control button styling */
        .voice-control-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 24px;
          height: 24px;
          border: none;
          background: rgba(20, 30, 60, 0.6);
          color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          font-size: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          z-index: 10;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        }

        .voice-control-btn:hover {
          transform: scale(1.1);
          background: rgba(30, 40, 70, 0.8);
        }

        .voice-control-btn:active {
          transform: scale(0.95);
        }

        .voice-muted {
          background: rgba(60, 20, 20, 0.6);
        }

        .voice-active {
          background: rgba(20, 50, 70, 0.6);
        }

        .dialog-tail {
          position: absolute;
          bottom: -16px;
          left: 50%; /* Tengah dialog box */
          transform: translateX(-50%); /* Pusat sempurna */
          width: 0;
          height: 0;
          border-left: min(10px, 3vw) solid transparent; /* Responsif berdasarkan viewport */
          border-right: min(10px, 3vw) solid transparent;
          border-top: min(16px, 4vw) solid #39496e; /* Border color sama dengan dialog box */
          filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3));
        }

        /* Dialog tail inner untuk warna background */
        .dialog-tail::before {
          content: "";
          position: absolute;
          top: -16px; /* Sama dengan negatif border-top-width */
          left: -10px; /* Sama dengan negatif border-left-width */
          border-left: min(10px, 3vw) solid transparent;
          border-right: min(10px, 3vw) solid transparent;
          border-top: min(15px, 3.8vw) solid
            ${TONE_COLORS[currentTone] || "rgba(20, 24, 40, 0.8)"};
          transition: border-top-color 0.8s ease-in-out; /* Transisi smooth untuk perubahan warna */
        }

        :global(.message-content) {
          font-family: "VT323", monospace;
          font-size: clamp(1.1rem, 2vw, 1.3rem); /* Font size responsif */
          color: rgba(255, 255, 255, 0.92);
          text-align: center;
          line-height: 1.4;
          margin: 0;
          padding: 0;
          min-height: min(
            48px,
            10vh
          ); /* Responsif berdasarkan tinggi viewport juga */
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0.03em;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          word-wrap: break-word; /* Pastikan teks panjang terbungkus dengan benar */
          overflow-wrap: break-word;
          hyphens: auto; /* Bantu pemisahan suku kata jika perlu */
        }

        .typing-indicator {
          animation: blink 1s infinite;
          font-size: clamp(
            1.3rem,
            4vw,
            1.8rem
          ); /* Ukuran responsif untuk indikator typing */
          letter-spacing: 0.2em;
        }

        .cursor {
          display: inline-block;
          margin-left: 2px;
          width: min(0.5em, 4px); /* Lebar kursor responsif */
          animation: blink 0.7s infinite;
          font-weight: bold;
          color: rgba(110, 140, 255, 0.9);
        }

        @keyframes blink {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }

        /* Media queries for responsive design - lebih konsisten di semua perangkat */
        @media (max-width: 768px) {
          :global(.rpg-dialog-box) {
            top: 15%; /* Konsisten dengan desktop namun sedikit lebih tinggi */
            left: 40%; /* Maintain leftward position */
          }

          :global(.message-content) {
            font-size: clamp(
              1rem,
              3.5vw,
              1.25rem
            ); /* Font size responsif berdasarkan viewport */
            min-height: 42px;
            letter-spacing: 0.02em; /* Sedikit mengurangi letter spacing di layar kecil */
          }
        }

        @media (max-width: 480px) {
          :global(.rpg-dialog-box) {
            top: 12%; /* Sedikit lebih tinggi di layar sangat kecil */
            left: 45%; /* Slightly more centered on very small screens */
          }

          .dialog-tail {
            bottom: -12px; /* Ekor dialog box lebih kecil di layar kecil */
            border-top-width: 12px; /* Ukuran ekor lebih kecil */
          }

          .dialog-corner {
            width: 6px;
            height: 6px;
          }
        }

        /* Orientasi landscape di perangkat mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          :global(.rpg-dialog-box) {
            top: 20%; /* Menempatkan dialog box lebih tinggi di mode landscape */
            left: 40%; /* Keep consistent with other views */
            width: min(320px, 50vw); /* Lebar lebih kecil di landscape */
          }

          :global(.message-content) {
            min-height: 36px; /* Mengurangi tinggi minimal konten */
            font-size: 1rem; /* Font lebih kecil di landscape */
          }
        }
      `}</style>
    </div>
  );
};

export default GifBackground;
