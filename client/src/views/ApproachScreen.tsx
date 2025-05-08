import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../context/AudioManager';
import AchievementController from '../controllers/achievementController';
import AchievementProgress from '../components/AchievementProgress';
import gifPath from '/assets/darksouls.gif';

interface ApproachScreenProps {
  onApproach: () => void;
}

const ApproachScreen: React.FC<ApproachScreenProps> = ({ onApproach }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const { isAudioPlaying, playAudio, pauseAudio, setHasInteracted, hasInteracted } = useAudio();
  const [isVisible, setIsVisible] = useState(false);
  const bonfireSoundRef = useRef<HTMLAudioElement | null>(null);
  const menuSoundRef = useRef<HTMLAudioElement | null>(null);
  const itemSoundRef = useRef<HTMLAudioElement | null>(null);
  const hoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const footstepsSoundRef = useRef<HTMLAudioElement | null>(null);

  // Efek fade-in untuk komponen setelah load
  useEffect(() => {
    // Preload sounds
    bonfireSoundRef.current = new Audio('/assets/sounds/souls-bonfire.mp3');
    menuSoundRef.current = new Audio('/assets/sounds/souls-menu.mp3');
    itemSoundRef.current = new Audio('/assets/sounds/souls-item.mp3');
    hoverSoundRef.current = new Audio('/assets/sounds/souls-menu.mp3'); // Menggunakan menu sound juga untuk hover
    footstepsSoundRef.current = new Audio('/audio/effects/footsteps.m4a'); // Menggunakan file langkah kaki yang benar
    
    // Set volume untuk sound effects (ditingkatkan untuk perangkat mobile)
    if (bonfireSoundRef.current) bonfireSoundRef.current.volume = 0.7; // Meningkatkan dari 0.3 menjadi 0.7
    if (menuSoundRef.current) menuSoundRef.current.volume = 0.8; // Meningkatkan dari 0.4 menjadi 0.8
    if (itemSoundRef.current) itemSoundRef.current.volume = 0.8; // Meningkatkan dari 0.4 menjadi 0.8
    if (hoverSoundRef.current) hoverSoundRef.current.volume = 0.5; // Meningkatkan dari 0.2 menjadi 0.5
    
    // Konfigurasi khusus untuk footsteps sound
    if (footstepsSoundRef.current) {
      // Set volume to 0 initially as we'll increase it when actually playing
      footstepsSoundRef.current.volume = 0;
      // Loop true agar suara langkah kaki berulang selama proses berjalan
      footstepsSoundRef.current.loop = true;
      // Normal speed for realistic footsteps
      footstepsSoundRef.current.playbackRate = 1.0;
      // Preload the audio to ensure it's ready
      footstepsSoundRef.current.preload = 'auto';
    }
    
    setIsVisible(true);
    
    // Cleanup
    return () => {
      if (bonfireSoundRef.current) {
        bonfireSoundRef.current.pause();
        bonfireSoundRef.current = null;
      }
      if (menuSoundRef.current) {
        menuSoundRef.current.pause();
        menuSoundRef.current = null;
      }
      if (itemSoundRef.current) {
        itemSoundRef.current.pause();
        itemSoundRef.current = null;
      }
      if (hoverSoundRef.current) {
        hoverSoundRef.current.pause();
        hoverSoundRef.current = null;
      }
      if (footstepsSoundRef.current) {
        footstepsSoundRef.current.pause();
        footstepsSoundRef.current = null;
      }
    };
  }, []);

  // Fungsi untuk memainkan efek suara
  const playSoulsSound = () => {
    try {
      // Play menu sound first (short select sound)
      if (menuSoundRef.current) {
        menuSoundRef.current.currentTime = 0;
        menuSoundRef.current.play()
          .then(() => {
            // After menu sound, play item pickup sound
            setTimeout(() => {
              if (itemSoundRef.current) {
                itemSoundRef.current.currentTime = 0;
                itemSoundRef.current.play()
                  .then(() => {
                    // Putar bonfire sound setelah item pickup (tanpa menunggu footsteps)
                    // Bonfire sound sebagai indikasi karakter yang menunggu di depan bonfire
                    setTimeout(() => {
                      if (bonfireSoundRef.current) {
                        bonfireSoundRef.current.currentTime = 0;
                        bonfireSoundRef.current.volume = 0.9; // Meningkatkan dari 0.4 menjadi 0.9 untuk mobile
                        bonfireSoundRef.current.play().catch(e => console.log("Couldn't play bonfire sound:", e));
                      }
                    }, 300);
                  })
                  .catch(e => console.log("Couldn't play item sound:", e));
              }
            }, 200);
          })
          .catch(e => console.log("Couldn't play menu sound:", e));
      }
    } catch (error) {
      console.log("Error playing souls sounds:", error);
    }
  };

  const handleApproach = () => {
    setIsClicked(true);
    setHasInteracted(true); // Trigger audio to play with volume full
    
    // Mainkan efek suara souls-like
    playSoulsSound();
    
    // REMOVED: We no longer unlock achievement immediately
    // Instead we'll unlock it after the transition completes
    
    // Memulai langkah kaki dengan jeda 1.5 detik setelah klik
    setTimeout(() => {
      console.log("Starting footsteps after 1.5 second delay");
      if (footstepsSoundRef.current) {
        footstepsSoundRef.current.currentTime = 0;
        footstepsSoundRef.current.volume = 0.9; // Increased volume for clearer footsteps
        footstepsSoundRef.current.playbackRate = 1.0; // Normal speed for realistic footsteps
        // Try to play the footsteps sound multiple times if it fails
        const playFootsteps = () => {
          footstepsSoundRef.current?.play()
            .catch(e => {
              console.log("Couldn't play footsteps, retrying:", e);
              // Retry once after a short delay
              setTimeout(() => {
                footstepsSoundRef.current?.play()
                  .catch(e2 => console.log("Failed to play footsteps after retry:", e2));
              }, 100);
            });
        };
        playFootsteps();
        
        // Output to console that we're playing footsteps
        console.log("🔊 Playing footsteps sound at volume:", footstepsSoundRef.current.volume);
      }

      // Mulai zoom in effect pada background
      startZoomEffect();
    }, 1500); // Delay 1.5 detik sebelum memulai langkah kaki
    
    // Transition total waktu 5 detik
    // (1.5 detik jeda + 3.5 detik berjalan)
    setTimeout(() => {
      // Stop langkah kaki sebelum transition dengan fade out yang lebih lambat dan halus
      if (footstepsSoundRef.current) {
        console.log("Starting smooth fade-out of footsteps sound");
        // Get starting volume for smoother fade-out calculation
        const startVolume = footstepsSoundRef.current.volume;
        // Create a smoother fade-out using more steps and exponential decay
        const fadeOutSteps = 25; // More steps for smoother fade
        let currentStep = 0;
        
        // Fade out effect untuk suara langkah kaki
        const fadeOutInterval = setInterval(() => {
          if (footstepsSoundRef.current && currentStep < fadeOutSteps) {
            // Calculate fade using exponential curve for more natural sound fade
            // This creates a curve where volume drops more gradually at first
            const fadeProgress = currentStep / fadeOutSteps;
            const newVolume = startVolume * Math.cos(fadeProgress * Math.PI/2);
            footstepsSoundRef.current.volume = Math.max(0.01, newVolume);
            currentStep++;
          } else {
            if (footstepsSoundRef.current) {
              console.log("Footsteps fade-out complete");
              footstepsSoundRef.current.pause();
            }
            clearInterval(fadeOutInterval);
            
            // Lakukan transisi setelah suara langkah kaki fade out
            // Pertama, mulai transisi ke scene berikutnya
            onApproach();
            
            // Langsung unlock achievement saat percakapan dimulai, tanpa delay
            setTimeout(() => {
              try {
                // Unlock achievement 'approach' tanpa delay
                const achievementController = AchievementController.getInstance();
                achievementController.unlockAchievement('approach');
                console.log("Approach achievement unlocked immediately after conversation started");
              } catch (error) {
                console.error("Failed to unlock achievement:", error);
              }
            }, 0); // Tanpa delay setelah transisi scene
          }
        }, 65); // Slightly faster interval for smoother fade
      } else {
        // Jika tidak ada footsteps sound, tetap lakukan transisi
        onApproach();
        
        // Langsung unlock achievement saat percakapan dimulai, tanpa delay
        setTimeout(() => {
          try {
            // Unlock achievement 'approach' tanpa delay
            const achievementController = AchievementController.getInstance();
            achievementController.unlockAchievement('approach');
            console.log("Approach achievement unlocked immediately after conversation started");
          } catch (error) {
            console.error("Failed to unlock achievement:", error);
          }
        }, 0); // Tanpa delay setelah transisi scene
      }
    }, 5000); // Total waktu: 5 detik (1.5 detik jeda + 3.5 detik berjalan)
  };
  
  // Fungsi untuk membuat efek zoom in yang halus dan realistis
  const startZoomEffect = () => {
    // Dapatkan elemen background
    const bgElement = document.querySelector('.distant-background') as HTMLElement;
    if (!bgElement) return;
    
    // Posisi awal
    const startScale = 0.8;
    // Posisi akhir (zoom lebih kecil agar tidak terlalu dekat dengan DIVA JUAN)
    const endScale = 0.95;
    
    // Variabel untuk efek pergerakan kamera dan parallax
    const startPositionY = -50; // Posisi awal di tengah
    const endPositionY = -49.5; // Sedikit pergeseran ke bawah untuk simulasi mendekati
    const startPositionX = -50; // Posisi awal di tengah
    // Random offset untuk efek tidak sempurna seperti gerakan manusia
    const randomOffsetX = (Math.random() * 0.4) - 0.2; // -0.2 sampai +0.2
    const endPositionX = -50 + randomOffsetX;
    
    // Durasi total efek dalam ms (diperlambat untuk efek yang lebih terasa)
    const duration = 5800; // Ditingkatkan dari 5000ms menjadi 5800ms untuk animasi lebih terlihat
    // Interval animasi
    const interval = 16; // 60fps untuk animasi yang lebih halus
    // Jumlah langkah
    const steps = duration / interval;
    
    // Variabel untuk tracking state animasi
    let currentScale = startScale;
    let currentPositionX = startPositionX;
    let currentPositionY = startPositionY;
    let currentStep = 0;
    
    // Matikan animasi breathe selama zoom in
    bgElement.style.animation = 'none';
    
    // Fungsi untuk easing cubic yang lebih halus
    function cubicEaseInOut(p: number): number {
      return p < 0.5
        ? 4 * p * p * p
        : 1 - Math.pow(-2 * p + 2, 3) / 2;
    }
    
    // Fungsi easing untuk transisi yang lembut
    function customEaseOut(p: number): number {
      // Kombinasi antara ease-out-quint dan ease-out-cubic
      // Sangat lambat di awal dan secara halus meningkat kecepatan
      const p2 = 1 - p;
      return 1 - (p2 * p2 * p2 * p2 * p2 * 0.5 + p2 * p2 * p2 * 0.5);
    }
    
    // Fungsi untuk membuat efek bobbing (gerakan naik-turun seperti langkah kaki)
    function getBobbingOffset(progress: number): number {
      // Frekuensi langkah kaki (meningkatkan menjadi 12 langkah selama durasi untuk gerakan yang lebih realistis)
      const frequency = 12; // Ditingkatkan dari 8 menjadi 12 untuk langkah yang lebih realistis
      // Amplitudo efek bobbing (seberapa tinggi/rendah)
      const amplitude = 0.35; // Ditingkatkan dari 0.2 menjadi 0.35 untuk gerakan lebih terlihat
      
      // Membuat amplitude berubah mengikuti kecepatan berjalan
      // Multiplier untuk membuat amplitude lebih besar saat tengah gerakan (saat berjalan lebih cepat)
      const speedCurve = Math.sin(progress * Math.PI); // Perubahan kecepatan: lambat->cepat->lambat
      const amplitudeMultiplier = speedCurve * 0.7 + 0.3; // Memberikan range 0.3-1.0
      
      // Perubahan fase untuk membuat gerakan lebih alamiah (gerakan manusia tidak sempurna)
      const phaseShift = progress * 0.3; // Memberikan perubahan fase progresif
      
      // Sinusoidal function untuk gerakan naik-turun dengan amplitude yang bervariasi
      return Math.sin((progress + phaseShift) * Math.PI * frequency) * amplitude * amplitudeMultiplier;
    }
    
    // Variabel waktu untuk animasi frame-based
    let lastTime = performance.now();
    let elapsedTime = 0;
    
    // Fungsi animasi dengan easings yang lebih halus dan gerakan kamera realistis
    const animate = (currentTime: number) => {
      // Hitung delta time untuk animasi yang konsisten
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Update elapsed time
      elapsedTime += deltaTime;
      
      // Normalize progress (0 sampai 1)
      const progress = Math.min(elapsedTime / duration, 1);
      
      if (progress < 1) {
        // Gunakan cubic easing untuk pergerakan halus
        const easedProgress = cubicEaseInOut(progress);
          
        // Efek parallax: Scale meningkat (zoom in)
        currentScale = startScale + (endScale - startScale) * easedProgress;
        
        // Efek parallax: Posisi X dan Y bergerak sesuai arah gerakan
        currentPositionX = startPositionX + (endPositionX - startPositionX) * easedProgress;
        currentPositionY = startPositionY + (endPositionY - startPositionY) * easedProgress;
        
        // Efek bobbing (gerakan naik-turun) hanya mulai setelah 10% progress
        const bobOffset = progress > 0.1 ? getBobbingOffset(progress) : 0;
        
        // Gunakan custom easing untuk efek blur yang lebih halus
        const blurEasedProgress = customEaseOut(easedProgress);
        
        // Gunakan nilai minimum blur 1.4px untuk tetap mempertahankan kesan jarak
        const blurValue = Math.max(1.4, 2 - (blurEasedProgress * 0.6));
        
        // Transisi brightness yang sangat halus dengan sine easing
        const brightnessBase = 0.6;
        const brightnessMaxVal = 0.68;
        const brightnessProgress = 0.5 - Math.cos(easedProgress * Math.PI) / 2;
        const brightnessValue = brightnessBase + 
                              (brightnessProgress * (brightnessMaxVal - brightnessBase));
        
        // Tambahkan efek swaying horizontal yang lebih realistis untuk gerakan seperti berjalan
        // Gerakan horizontal yang lebih kecil dibanding vertikal dengan fase yang berbeda
        // Frequency ditingkatkan untuk menyelaraskan dengan efek bobbing yang sudah ditingkatkan
        const swayFrequency = 12; // Diselaraskan dengan frequensi bobbing
        const swayAmplitude = 0.20; // Ditingkatkan dari 0.1 menjadi 0.20 untuk lebih terlihat
        
        // Perubahan fase dengan pengaturan tertentu untuk membuat gerakan horizontal/vertikal sesuai langkah kaki manusia
        // Otak manusia mendeteksi pola saat berjalan: naik turun dan sway kiri kanan harus selaras
        const phaseShift = Math.PI/3; // Shifting fase untuk membuat gerakan lebih natural
        
        // Variasi kecepatan seperti pada bobbing
        const speedCurve = Math.sin(progress * Math.PI); // Perubahan kecepatan: lambat->cepat->lambat
        const swayMultiplier = speedCurve * 0.7 + 0.3; // Range 0.3-1.0
        
        // Menambahkan sedikit randomisasi untuk kesan lebih manusiawi
        const noiseAmplitude = 0.03; // Amplitudo noise kecil
        const noise = Math.sin(progress * 100) * noiseAmplitude; // High-frequency noise
        
        // Efek swaying dimulai setelah 10% progress seperti efek bobbing
        const swayOffset = progress > 0.1 ? 
                         Math.sin(progress * Math.PI * swayFrequency * 0.5 + phaseShift) * 
                         swayAmplitude * swayMultiplier + noise : 0;
        
        // Terapkan semua efek transform dan filter
        bgElement.style.transform = `translate(${currentPositionX + swayOffset}%, ${currentPositionY + bobOffset}%) scale(${currentScale})`;
        bgElement.style.filter = `blur(${blurValue}px) brightness(${brightnessValue})`;
        
        // Lanjutkan animasi
        requestAnimationFrame(animate);
      } else {
        // Saat animasi selesai, terapkan posisi akhir dengan presisi tepat
        // untuk menghindari pembulatan yang bisa membuat posisi sedikit bergeser
        bgElement.style.transform = `translate(${endPositionX}%, ${endPositionY}%) scale(${endScale})`;
        
        // Konstanta untuk nilai akhir filter
        const brightnessBase = 0.6;
        const brightnessMaxVal = 0.68;
        
        // Terapkan nilai akhir filter
        const finalBlurValue = Math.max(1.4, 2 - (1 * 0.6)); // fullProgress = 1
        const finalBrightnessValue = brightnessBase + (brightnessMaxVal - brightnessBase);
        bgElement.style.filter = `blur(${finalBlurValue}px) brightness(${finalBrightnessValue})`;
      }
    };
    
    // Mulai animasi dengan timestamp saat ini
    requestAnimationFrame(animate);
  };
  
  // Toggle audio play/pause
  const toggleAudio = useCallback(() => {
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      // Set hasInteracted to true when playing audio
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      playAudio();
    }
  }, [isAudioPlaying, playAudio, pauseAudio, hasInteracted, setHasInteracted]);

  return (
    <div className="approach-screen">
      {/* Background dari kejauhan dengan efek zoom */}
      <div className="distant-background"></div>
      
      {/* Audio control button - visible from approach screen */}
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
      
      <motion.div 
        className="approach-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
      >
        <motion.button
          className={`approach-button ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`}
          onMouseEnter={() => {
            if (!isClicked && hoverSoundRef.current) {
              hoverSoundRef.current.currentTime = 0;
              hoverSoundRef.current.play().catch(e => console.log("Couldn't play hover sound:", e));
            }
            setIsHovered(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleApproach}
          disabled={isClicked}
          initial={{ scale: 1 }}
          whileHover={{ 
            scale: 1.05,
            textShadow: "0 0 8px rgba(200, 180, 120, 0.8)"
          }}
          whileTap={{ scale: 0.95 }}
          animate={isClicked ? { 
            scale: [1, 1.2, 0], 
            opacity: [1, 1, 0]
          } : {}}
          transition={isClicked ? { 
            duration: 0.8, 
            times: [0, 0.4, 1] 
          } : {}}
        >
          {/* Ornamen dekoratif kiri dan kanan ala Souls */}
          <span className="ornament left">•</span>
          {isClicked ? "APPROACHING..." : "APPROACH HIM"}
          <span className="ornament right">•</span>
        </motion.button>
      </motion.div>

      {/* Achievement Progress Indicator */}
      <AchievementProgress />
      
      <style>{`
        .approach-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          background: rgba(0, 0, 0, 0.45); /* Background lebih transparan agar terlihat api */
          overflow: hidden;
        }

        .distant-background {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.8); /* Tampilkan background lebih besar agar lebih jelas */
          width: 100%;
          height: 100%;
          background-image: url(${gifPath});
          background-size: cover;
          background-position: center;
          opacity: 0.6; /* Lebih jelas terlihat */
          filter: blur(2px) brightness(0.6); /* Kurangi blur agar lebih jelas */
          z-index: -1;
          animation: breathe 10s infinite ease-in-out; /* Efek nafas api dari jauh */
        }

        @keyframes breathe {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.8);
            filter: blur(2px) brightness(0.6);
          }
          50% {
            transform: translate(-50%, -50%) scale(0.83);
            filter: blur(1.5px) brightness(0.65);
          }
        }

        .approach-container {
          text-align: center;
          position: relative;
          z-index: 5;
        }

        .approach-button {
          padding: 1.2rem 2.5rem;
          font-family: 'Trajan Pro', 'Cinzel', 'Garamond', serif;
          font-size: clamp(1.2rem, 4vw, 2rem);
          font-weight: 600;
          color: #d4c9a8; /* Warna emas pudar khas Souls */
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(150, 125, 80, 0.6); /* Border gold pudar */
          border-radius: 0; /* Souls-like tidak menggunakan rounded corners */
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 4px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          text-shadow: 0 0 5px rgba(100, 80, 40, 0.8); /* Text shadow gelap */
          box-shadow: 0 0 25px rgba(100, 80, 40, 0.4), inset 0 0 15px rgba(80, 60, 30, 0.3);
          backdrop-filter: blur(3px);
        }

        .approach-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(180, 160, 120, 0.15), /* Warna cahaya emas pudar khas Souls */
            transparent
          );
          transition: all 0.4s ease;
        }

        /* Efek dekorasi ala Souls-like */
        .approach-button::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(180, 160, 120, 0.6), 
            transparent
          );
        }

        .approach-button.hovered::before {
          left: 100%;
          transition: all 0.8s ease;
        }

        .approach-button:hover {
          background: rgba(20, 15, 10, 0.7);
          border-color: rgba(180, 160, 100, 0.8);
          color: #e8debc; /* Warna emas yang lebih terang */
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(100, 80, 40, 0.6), inset 0 0 15px rgba(80, 60, 40, 0.4);
          text-shadow: 0 0 8px rgba(180, 160, 120, 0.8);
        }

        .approach-button:disabled {
          cursor: default;
        }

        .approach-button.clicked {
          border-color: rgba(200, 180, 120, 0.9);
          color: #f0e6c9; /* Warna emas lebih cerah */
          background: rgba(40, 30, 20, 0.8);
          box-shadow: 0 0 35px rgba(150, 130, 80, 0.7), inset 0 0 20px rgba(120, 100, 60, 0.5);
          letter-spacing: 6px; /* Memperbesar jarak huruf saat diklik */
        }

        /* Styling untuk ornamen dekoratif */
        .ornament {
          display: inline-block;
          color: rgba(180, 160, 100, 0.6);
          font-size: 1.5rem;
          margin: 0 12px;
          position: relative;
          top: -1px;
          transform: translateY(2px);
          text-shadow: 0 0 6px rgba(150, 130, 80, 0.4);
          transition: all 0.3s ease;
        }
        
        .ornament.left {
          margin-right: 18px;
        }
        
        .ornament.right {
          margin-left: 18px;
        }
        
        .approach-button:hover .ornament {
          color: rgba(220, 200, 150, 0.8);
          text-shadow: 0 0 10px rgba(200, 180, 120, 0.6);
        }
        
        .approach-button.clicked .ornament {
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s ease;
        }

        @media (max-width: 640px) {
          .approach-button {
            padding: 1rem 2rem;
            font-size: 1.2rem;
            letter-spacing: 2px;
          }
          
          .ornament {
            font-size: 1.2rem;
            margin: 0 8px;
          }
          
          .ornament.left {
            margin-right: 12px;
          }
          
          .ornament.right {
            margin-left: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ApproachScreen;