import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DramaticEffectsProps {
  effect: 'throw' | 'punch' | 'none';
  onEffectComplete?: () => void;
  intensity?: 'low' | 'medium' | 'high'; // Controls the intensity of the effect
}

const DramaticEffects: React.FC<DramaticEffectsProps> = ({ 
  effect, 
  onEffectComplete,
  intensity = 'medium' // Default intensity is medium
}) => {
  const [isEffectActive, setIsEffectActive] = useState<boolean>(effect !== 'none');
  const punchSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Preload the punch sound when component mounts
  useEffect(() => {
    // Preload the punch sound to make it available immediately
    if (effect === 'punch') {
      punchSoundRef.current = new Audio('/assets/sounds/punch_sfx.m4a');
      punchSoundRef.current.load(); // Preload the audio
      console.log("Punch sound preloaded");
    }
    
    return () => {
      // Clean up audio when component unmounts
      if (punchSoundRef.current) {
        punchSoundRef.current.pause();
        punchSoundRef.current = null;
      }
    };
  }, []);

  // Jalankan efek saat prop effect berubah
  useEffect(() => {
    setIsEffectActive(effect !== 'none');
    
    // Clean up effect atau panggil callback setelah efek selesai
    if (effect !== 'none') {
      const effectDuration = effect === 'throw' ? 1200 : 3000; // throw lebih cepat dari punch (reduced from 2000ms to 1200ms)
      
      // Play punch sound effect if punch effect is active
      if (effect === 'punch') {
        try {
          // If the sound was not preloaded, create it now
          if (!punchSoundRef.current) {
            punchSoundRef.current = new Audio('/assets/sounds/punch_sfx.m4a');
            console.log("Creating punch sound on-demand");
          }
          
          // Reset the audio to the beginning in case it was played before
          punchSoundRef.current.currentTime = 0;
          punchSoundRef.current.volume = 0.7; // Increased volume slightly
          
          // Play with user gesture handling
          const playPromise = punchSoundRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Punch sound playing successfully");
              })
              .catch(e => {
                console.error("Couldn't play punch sound:", e);
                
                // Try one more time with a slight delay (browser might need time)
                setTimeout(() => {
                  if (punchSoundRef.current) {
                    punchSoundRef.current.play()
                      .catch(e2 => console.error("Second attempt to play punch sound failed:", e2));
                  }
                }, 100);
              });
          }
        } catch (error) {
          console.error("Error setting up punch sound:", error);
        }
      }
      
      const timer = setTimeout(() => {
        setIsEffectActive(false);
        if (onEffectComplete) onEffectComplete();
      }, effectDuration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [effect, onEffectComplete]);
  
  // Render efek berbeda berdasarkan jenis efek
  const renderEffect = () => {
    switch (effect) {
      case 'throw':
        return (
          <motion.div 
            className="dramatic-effect-throw"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: 1, 
            }}
            transition={{ 
              duration: 0.2,
              ease: "easeIn" 
            }}
            exit={{ opacity: 0 }}
          >
            {/* Enhanced throwing effect with multiple layers */}
            <div className="throw-effect-inner">
              {/* Camera shake to simulate being grabbed and dragged out */}
              <motion.div 
                className="camera-shake-throw"
                animate={{
                  // Modifikasi: gerakan lebih fokus ke horizontal dan meningkat secara bertahap (efek diseret)
                  x: [0, 10, -15, 25, -45, -150, -350, -600, -1200], 
                  // Modifikasi: kurangi variasi vertikal untuk efek seret vs lemparan
                  y: [0, 5, -10, 15, -20, 15, 30, 60, 100],
                  // Modifikasi: putar ke kanan saja (efek ditarik dan diseret ke samping)
                  rotate: [0, 2, 4, 8, 12, 20, 30, 45, 60],
                  // Modifikasi: buat seolah-olah menjauhi lebih perlahan
                  scale: [1, 0.98, 0.95, 0.9, 0.85, 0.75, 0.6, 0.4, 0.2]
                }}
                transition={{ 
                  // Perlambat sedikit untuk efek tarikan/seretan
                  duration: 1.3,
                  // Penyesuaian timing untuk efek seretan bertahap
                  times: [0, 0.05, 0.1, 0.15, 0.25, 0.4, 0.6, 0.8, 1],
                  // Kurva Cubic Bezier untuk efek ditarik keluar yang lebih realistis
                  ease: [0.2, 0.8, 0.3, 1] 
                }}
              >
                <div className="screen-content"></div>
              </motion.div>
              
              {/* Dynamic spiral rotation during throw */}
              <motion.div 
                className="spiral-rotation-overlay"
                initial={{ opacity: 0, scale: 1, rotate: 0 }}
                animate={{
                  opacity: [0, 0.8, 0.6, 0],
                  scale: [1, 1.2, 1.5, 2],
                  rotate: [0, 90, 180, 360]
                }}
                transition={{
                  duration: 1,
                  times: [0, 0.2, 0.6, 1],
                  ease: "easeInOut"
                }}
              />
              
              {/* Improved impact lines */}
              <motion.div 
                className="impact-lines"
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{
                  opacity: [0, 0.9, 0],
                  scale: [0.2, 1.5, 3]
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  times: [0, 0.4, 1],
                  ease: "easeOut"
                }}
              />
              
              {/* Enhanced dust cloud explosion with particles */}
              <motion.div 
                className="dust-cloud"
                initial={{ opacity: 0, y: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                  y: [0, -80, -200],
                  scale: [0.5, 1.5, 3]
                }}
                transition={{
                  duration: 1,
                  delay: 0.4,
                  times: [0, 0.3, 1],
                  ease: "easeOut"
                }}
              />
              
              {/* Shockwave ripple effect for impact */}
              <motion.div
                className="shockwave-ripple"
                initial={{ opacity: 0, scale: 0.1 }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0.1, 2.5, 4]
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                  times: [0, 0.3, 1],
                  ease: "easeOut"
                }}
              />
              
              {/* Additional debris particles with more variety */}
              <div className="dust-particles-container">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={`dust-particle-${i}`}
                    className="dust-particle"
                    style={{
                      left: `${15 + Math.random() * 70}%`,
                      width: `${3 + Math.random() * 18}px`,
                      height: `${3 + Math.random() * 18}px`,
                      opacity: 0.75 + Math.random() * 0.25,
                      borderRadius: Math.random() > 0.6 ? '50%' : `${Math.random() * 40}%`,
                      background: Math.random() > 0.5 ? 
                        `rgba(${210 + Math.random() * 45}, ${180 + Math.random() * 65}, ${140 + Math.random() * 65}, ${0.8 + Math.random() * 0.2})` : 
                        `rgba(${120 + Math.random() * 60}, ${100 + Math.random() * 60}, ${80 + Math.random() * 60}, ${0.75 + Math.random() * 0.25})`,
                      boxShadow: `0 0 ${Math.random() * 8 + 3}px rgba(${200 + Math.random() * 55}, ${160 + Math.random() * 55}, ${100 + Math.random() * 55}, ${0.5 + Math.random() * 0.3})`
                    }}
                    initial={{ opacity: 0, y: 0, x: 0 }}
                    animate={{
                      opacity: [0, 0.95, 0],
                      y: [0, -120 - Math.random() * 400],
                      x: [0, (Math.random() - 0.5) * 600],
                      rotate: [0, Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1)],
                      scale: [1, 1.2 + Math.random() * 0.8, 0.6 + Math.random()]
                    }}
                    transition={{
                      duration: 0.8 + Math.random() * 0.6,
                      delay: 0.15 + Math.random() * 0.35,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
              
              {/* Enhanced wind streaks for dragging effect */}
              <motion.div
                className="wind-streaks"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.4, 0.7, 0.9, 0.7, 0.4, 0],
                  // Semakin miring untuk efek seretan yang kuat
                  skewX: ["-15deg", "-20deg", "-30deg", "-40deg", "-35deg", "-25deg", "-10deg"]
                }}
                transition={{
                  // Perlambat dan buat lebih bertahap untuk efek seretan
                  duration: 1.2,
                  delay: 0.1,
                  times: [0, 0.1, 0.25, 0.4, 0.6, 0.8, 1],
                  ease: "easeInOut"
                }}
              />
              
              {/* Enhanced screen rotation for dragging effect */}
              <motion.div
                className="perspective-container"
                animate={{
                  // Modifikasi: lebih fokus pada putaran horizontal (y-axis)
                  rotateX: [0, 15, 20, 15, 10],
                  // Modifikasi: fokus pada rotasi horizontal ke kanan (seperti ditarik)
                  rotateY: [0, -10, -25, -45, -65],
                  // Modifikasi: sedikit rotasi Z untuk efek yang lebih natural
                  rotateZ: [0, 5, 10, 15, 20],
                  // Modifikasi: efek kedalaman saat diseret
                  z: [0, -50, -100, -200, -350]
                }}
                transition={{
                  // Perlambat sedikit untuk efek seretan
                  duration: 1.2,
                  delay: 0.1,
                  // Timing disesuaikan untuk simulasi tarikan
                  times: [0, 0.2, 0.4, 0.7, 1],
                  ease: [0.3, 0.6, 0.3, 1]
                }}
              />
              
              {/* Enhanced flash effect on impact */}
              <motion.div
                className="impact-flash"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.95, 0]
                }}
                transition={{
                  duration: 0.3,
                  delay: 0.5,
                  ease: "easeOut"
                }}
              />
              
              {/* Enhanced horizontal motion blur untuk efek seretan */}
              <motion.div
                className="throw-blur-effect"
                animate={{
                  opacity: [0, 0.3, 0.6, 0.8, 0.7, 0.5, 0.2, 0],
                  filter: ["blur(0px)", "blur(5px) brightness(1.1)", "blur(15px) brightness(1.2)", 
                           "blur(25px) brightness(1.3)", "blur(20px) brightness(1.25)", 
                           "blur(15px) brightness(1.2)", "blur(10px) brightness(1.1)", "blur(5px)"]
                }}
                style={{
                  // Modifikasi: penambahan filter directionality untuk efek gerakan horizontal
                  backdropFilter: "blur(8px)",
                  background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)"
                }}
                transition={{
                  duration: 1.3,
                  delay: 0.2,
                  times: [0, 0.1, 0.25, 0.4, 0.6, 0.75, 0.9, 1],
                  ease: "easeInOut"
                }}
              />
              
              {/* Enhanced motion trail for dragging effect */}
              <motion.div
                className="motion-trail drag-trail"
                initial={{ opacity: 0, scale: 1, x: 0 }}
                animate={{
                  // Opacity dengan beberapa tahap untuk efek ghosting yang lebih kompleks
                  opacity: [0, 0.4, 0.7, 0.9, 0.7, 0.4, 0.2, 0],
                  // Scale yang meregang horizontal untuk kesan tertarik
                  scaleX: [1, 1.2, 1.5, 1.8, 1.6, 1.4, 1.2, 1],
                  // Skala vertikal tetap kecil untuk efek seretan
                  scaleY: [1, 0.95, 0.9, 0.85, 0.9, 0.92, 0.95, 1],
                  // Translasi horizontal untuk efek tertarik ke kanan
                  x: [0, 50, 120, 200, 260, 300, 320, 340],
                  // Translasi vertikal minimal (sedikit ke atas kemudian turun)
                  y: [0, -15, -25, -20, -10, 0, 10, 20],
                  // Sedikit rotasi untuk kesan dinamis
                  rotate: [0, 2, 5, 8, 10, 12, 10, 8]
                }}
                transition={{
                  // Perlambat untuk efek yang lebih substansial
                  duration: 1.3,
                  // Delay kecil untuk mundur setelah awal tarikan
                  delay: 0.1,
                  // Timing lebih detil untuk kontrol pergerakan
                  times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
                  // Kurva easing yang menekankan tarikan dan resistensi
                  ease: [0.2, 0.5, 0.35, 1]
                }}
                style={{
                  // Tambahan style untuk efek seretan
                  background: "linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0) 100%)",
                  boxShadow: "0 0 25px rgba(255, 255, 255, 0.2)"
                }}
              />
            </div>
          </motion.div>
        );
      
      case 'punch':
        return (
          <motion.div 
            className="dramatic-effect-punch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Efek memukul yang sangat realistis */}
            <div className="punch-effect-inner">
              {/* Flash putih awal saat kontak kepalan tangan */}
              <motion.div 
                className="punch-flash"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 0.15, // Más rápido (reducido de 0.3s a 0.15s)
                  times: [0, 0.1, 1],
                  ease: "easeOut" 
                }}
              />
              
              {/* Sacudida de cámara más violenta y rápida */}
              <motion.div 
                className="camera-shake"
                animate={{
                  x: [0, -25, 35, -20, 12, -5, 0], // Valores mayores para sacudidas más fuertes
                  y: [0, 15, -20, 8, -3, 0], // Valores mayores para sacudidas más fuertes
                  rotate: [0, -2, 3, -2.5, 1, 0] // Mayor rotación para efecto más dramático
                }}
                transition={{ 
                  duration: 0.5, // Más rápido (reducido de 0.8s a 0.5s)
                  ease: "easeOut",
                  times: [0, 0.05, 0.15, 0.3, 0.5, 1] // Tiempos ajustados para que todo sea más rápido al inicio
                }}
              >
                {/* Kontent ini akan bergetar bersama dengan layar */}
                <div className="screen-content"></div>
              </motion.div>
              
              {/* Efecto de hematoma/moretón más realista */}
              <motion.div 
                className="bruise-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                {/* Capa principal del moretón con degradado */}
                <motion.div 
                  className="bruise-overlay bruise-main"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{
                    opacity: [0, 0.8, 0.75],
                    scale: [0.7, 1.2, 1.1]
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.15,
                    ease: "easeOut" 
                  }}
                />
                
                {/* Contusión secundaria más pequeña */}
                <motion.div 
                  className="bruise-overlay bruise-secondary"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 0.9, 0.85],
                    scale: [0.5, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 0.7, 
                    delay: 0.2,
                    ease: "easeOut" 
                  }}
                />
                
                {/* Hinchazón alrededor del moretón */}
                <motion.div 
                  className="bruise-swelling"
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{
                    opacity: [0, 0.4, 0.35],
                    scale: [1.2, 1.5, 1.4]
                  }}
                  transition={{ 
                    duration: 1.1, 
                    delay: 0.3,
                    ease: "easeOut" 
                  }}
                />
              </motion.div>
              
              {/* Darah realistis dengan multiple elements */}
              <motion.div 
                className="blood-splatter-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.15 }}
              >
                {/* Efecto de explosión de sangre principal - más intenso y rápido */}
                <motion.div 
                  className="blood-splatter blood-splatter-main"
                  initial={{ opacity: 0, scale: 0.3, rotate: -5 }}
                  animate={{
                    opacity: [0, 0.95, 0.85],
                    scale: [0.3, 1.4, 1.3],
                    y: [0, 12, 20],
                    x: [0, -8, -12]
                  }}
                  transition={{ 
                    duration: 0.8, // Más rápido
                    delay: 0.1, // Menos retraso
                    ease: "easeOut",
                    times: [0, 0.3, 1] // Explosión más rápida al principio
                  }}
                />
                
                {/* Gotas pequeñas que se esparcen explosivamente */}
                <motion.div 
                  className="blood-splatter blood-splatter-drops"
                  initial={{ opacity: 0, scale: 0.2, rotate: -10 }}
                  animate={{
                    opacity: [0, 1, 0.8],
                    scale: [0.2, 1.2, 1.1],
                    y: [0, 25, 40],
                    x: [0, 15, 22]
                  }}
                  transition={{ 
                    duration: 0.7, // Más rápido 
                    delay: 0.1, // Casi simultáneo
                    ease: "easeOut",
                    times: [0, 0.4, 1] // Aceleración al principio
                  }}
                />
                
                {/* Segunda mancha de sangre en otra dirección */}
                <motion.div 
                  className="blood-splatter blood-splatter-extra"
                  initial={{ opacity: 0, scale: 0.3, rotate: 10 }}
                  animate={{
                    opacity: [0, 0.9, 0.8],
                    scale: [0.3, 1.1, 1],
                    y: [0, -15, -25],
                    x: [0, 10, 15]
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.15,
                    ease: "easeOut" 
                  }}
                />
                
                {/* Gotas que caen más rápidamente */}
                <motion.div 
                  className="blood-drip-effect blood-drip-main"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: [0, 0.95, 0.9],
                    height: [0, 30, 65]
                  }}
                  transition={{ 
                    duration: 1.2, // Más rápido 
                    delay: 0.3,
                    ease: "easeOut" 
                  }}
                />
                
                {/* Segunda gota de sangre */}
                <motion.div 
                  className="blood-drip-effect blood-drip-secondary"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: [0, 0.9, 0.85],
                    height: [0, 25, 55]
                  }}
                  transition={{ 
                    duration: 1.4, 
                    delay: 0.25,
                    ease: "easeOut" 
                  }}
                />
                
                {/* Pequeñas salpicaduras explosivas */}
                <motion.div 
                  className="blood-splatter blood-splatter-tiny"
                  initial={{ opacity: 0, scale: 0.2, rotate: 15 }}
                  animate={{
                    opacity: [0, 0.95, 0.75],
                    scale: [0.2, 1, 0.95],
                    y: [0, -12, -18],
                    x: [0, -18, -25]
                  }}
                  transition={{ 
                    duration: 0.5, // Mucho más rápido
                    delay: 0.1,
                    ease: "easeOut",
                    times: [0, 0.3, 1] // Explosión rápida
                  }}
                />
              </motion.div>
              
              {/* Retakan kaca yang lebih realistis */}
              <motion.div 
                className="screen-crack-realistic"
                animate={{
                  opacity: [0, 0.9, 1],
                }}
                transition={{ 
                  duration: 0.3,
                  delay: 0.1, 
                  ease: "easeOut"
                }}
              />
              
              {/* Efecto viñeta para simular pérdida de conciencia - más rápido */}
              <motion.div 
                className="vignette-effect"
                animate={{
                  opacity: [0, 0.6, 0.95] // Mayor opacidad final
                }}
                transition={{ 
                  duration: 0.7, // Reducido de 1.5s a 0.7s
                  delay: 0.3, // Reducido de 0.6s a 0.3s
                  ease: "easeIn"
                }}
              />
              
              {/* Nuevo efecto de "pingsan" (desmayo) con flash y pulsación antes del blackout */}
              <motion.div 
                className="knockout-effect"
                animate={{
                  opacity: [0, 0.5, 0.9, 0.7, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  delay: 0.2,
                  times: [0, 0.2, 0.4, 0.7, 1],
                  ease: "easeInOut"
                }}
              />
              
              {/* Efecto mejorado de "pingsan" (desmayo) con blackout más intenso */}
              <motion.div 
                className="screen-blackout"
                animate={{
                  opacity: [0, 0.4, 0.7, 0.9, 1]
                }}
                transition={{ 
                  duration: 1.8, // Aumentado de 0.8s a 1.8s para efecto más claro
                  delay: 0.3, // Ligeramente reducido para que empiece más pronto
                  times: [0, 0.2, 0.4, 0.6, 1],
                  ease: "easeIn"
                }}
              />
              
              {/* Efecto de visión borrosa más acelerado */}
              <motion.div 
                className="vision-blur"
                animate={{
                  opacity: [0, 0.5, 0.9, 1],
                  filter: ["blur(0px)", "blur(3px)", "blur(10px)", "blur(20px)"], // Más intenso
                }}
                transition={{ 
                  duration: 0.7, // Reducido de 1.8s a 0.7s
                  delay: 0.25, // Reducido de 0.5s a 0.25s
                  times: [0, 0.3, 0.6, 1],
                  ease: "easeIn"
                }}
              />
              
              {/* Efecto visión doble más rápido e intenso */}
              <motion.div 
                className="double-vision"
                animate={{
                  opacity: [0, 0.8, 0.4], // Mayor opacidad para un efecto más intenso
                  x: [0, 12, 6], // Mayor desplazamiento
                  y: [0, -4, -2] // Mayor desplazamiento
                }}
                transition={{ 
                  duration: 0.6, // Reducido de 1.2s a 0.6s
                  delay: 0.35, // Reducido de 0.7s a 0.35s
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <AnimatePresence>
      {isEffectActive && renderEffect()}
    </AnimatePresence>
  );
};

export default DramaticEffects;

// CSS untuk digunakan sebagai style
export const dramaticEffectsStyles = `
  /* Styling CSS untuk efek seretan (dragging) */
  .motion-trail.drag-trail {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    mix-blend-mode: screen;
    filter: blur(6px);
    opacity: 0;
    border-radius: 8px;
    transform-origin: left center;
  }
  
  .dramatic-effect-throw, .dramatic-effect-punch {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    overflow: hidden;
  }
  
  .throw-effect-inner, .punch-effect-inner {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  /* Camera shake for throw effect */
  .camera-shake-throw {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    perspective: 1200px;
  }
  
  /* Spiral rotation overlay for disorientation */
  .spiral-rotation-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: conic-gradient(
      from 0deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0) 25%,
      rgba(255, 255, 255, 0.08) 50%,
      rgba(255, 255, 255, 0) 75%,
      rgba(255, 255, 255, 0.05) 100%
    );
    opacity: 0;
    mix-blend-mode: overlay;
  }
  
  /* Impact lines with enhanced styling */
  .impact-lines {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(255,140,0,0.9) 0%, rgba(255,140,0,0) 70%);
    opacity: 0.9;
    box-shadow: 0 0 40px rgba(255, 160, 0, 0.6);
    filter: contrast(1.2);
  }
  
  /* Dust cloud with enhanced styling */
  .dust-cloud {
    position: absolute;
    bottom: 30%;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 250px;
    background: radial-gradient(ellipse, rgba(200,160,120,0.9) 0%, rgba(200,160,120,0) 70%);
    opacity: 0;
    filter: blur(4px);
  }
  
  /* Shockwave ripple effect */
  .shockwave-ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: transparent;
    border: 8px solid rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 0 60px rgba(255, 255, 255, 0.5) inset,
      0 0 30px rgba(255, 200, 100, 0.3);
    opacity: 0;
  }
  
  /* Individual dust particles */
  .dust-particles-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    overflow: hidden;
  }
  
  .dust-particle {
    position: absolute;
    bottom: 30%;
    background-color: #c9a775;
    border-radius: 50%;
    filter: blur(1.5px);
    box-shadow: 0 0 8px rgba(201, 167, 117, 0.75), 
                inset 0 0 4px rgba(255, 230, 190, 0.5);
    mix-blend-mode: screen;
    transform-origin: center center;
  }
  
  /* Wind streak effect when flying through air */
  .wind-streaks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255,255,255,0.05) 15%, 
      rgba(255,255,255,0.15) 35%, 
      rgba(255,255,255,0.15) 65%, 
      rgba(255,255,255,0.05) 85%, 
      transparent 100%
    ), repeating-linear-gradient(90deg,
      transparent 0%,
      transparent 5%,
      rgba(255,255,255,0.03) 5.1%,
      rgba(255,255,255,0.03) 7%,
      transparent 7.1%,
      transparent 10%
    );
    opacity: 0;
    transform: skewX(-25deg);
  }
  
  /* Motion trail effect */
  .motion-trail {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: linear-gradient(45deg,
      transparent 20%,
      rgba(255, 200, 100, 0.05) 30%,
      rgba(255, 200, 100, 0.1) 40%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 200, 100, 0.1) 60%,
      rgba(255, 200, 100, 0.05) 70%,
      transparent 80%
    );
    opacity: 0;
    transform: rotate(20deg) scale(1.5);
    mix-blend-mode: screen;
  }
  
  /* 3D perspective container */
  .perspective-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  
  /* Flash on impact */
  .impact-flash {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    opacity: 0;
  }
  
  /* Blur effect when thrown */
  .throw-blur-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, transparent 20%, rgba(0,0,0,0.7) 100%);
    opacity: 0;
    filter: blur(2px);
  }
  
  .punch-impact {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,0,0,0.7) 0%, rgba(255,0,0,0) 70%);
    border-radius: 50%;
  }
  
  .screen-crack {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='pattern1' patternUnits='userSpaceOnUse' width='500' height='500' patternTransform='scale(2) rotate(0)'%3E%3Cpath d='M250,250 L300,150 L350,180 L400,50 M250,250 L150,200 L100,250 L50,150 M250,250 L200,350 L250,400 L150,450 M250,250 L350,300 L400,280 L450,350' stroke='white' stroke-width='3' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23pattern1)' /%3E%3C/svg%3E");
    opacity: 0;
  }
  
  .screen-blackout {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
    opacity: 0;
  }
  
  /* New realistic punch effect styles */
  .punch-flash {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    opacity: 0;
    z-index: 10;
  }
  
  .camera-shake {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
  }
  
  .screen-content {
    width: 100%;
    height: 100%;
  }
  
  /* Contenedor para el efecto de hematoma */
  .bruise-container {
    position: absolute;
    top: 38%;
    left: 38%;
    width: 25%;
    height: 25%;
    z-index: 6;
  }

  /* Estilos base para el hematoma */
  .bruise-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    opacity: 0;
    z-index: 6;
  }
  
  /* Hematoma principal con color más intenso */
  .bruise-main {
    top: 0;
    left: 0;
    background: radial-gradient(ellipse, rgba(128,0,0,0.8) 0%, rgba(102,0,0,0.6) 40%, rgba(102,0,0,0) 80%);
    transform: rotate(-15deg);
    filter: blur(5px);
  }
  
  /* Hematoma secundario con color más púrpura */
  .bruise-secondary {
    top: 5%;
    left: -5%;
    width: 70%;
    height: 65%;
    background: radial-gradient(ellipse, rgba(102,0,51,0.7) 0%, rgba(77,0,38,0.6) 50%, rgba(77,0,38,0) 75%);
    transform: rotate(10deg);
    filter: blur(6px);
  }
  
  /* Efecto de hinchazón alrededor del hematoma */
  .bruise-swelling {
    top: -15%;
    left: -15%;
    width: 130%;
    height: 130%;
    background: radial-gradient(ellipse, rgba(153,51,51,0.1) 0%, rgba(153,51,51,0.3) 50%, rgba(153,51,51,0) 100%);
    border-radius: 40%;
    filter: blur(10px);
    opacity: 0;
    z-index: 5;
  }
  
  /* Blood effects container */
  .blood-splatter-container {
    position: absolute;
    top: 42%;
    left: 42%;
    width: 20%;
    height: 20%;
    z-index: 7;
  }
  
  /* Realistic blood splatter elements with different patterns */
  .blood-splatter {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    border-radius: 50%;
    z-index: 7;
  }
  
  .blood-splatter-main {
    top: 0;
    left: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cpath d='M30,30 Q40,10 50,25 T70,15 Q90,5 75,30 T95,40 Q105,25 115,45 T130,35' stroke='%23990000' stroke-width='3' fill='none'/%3E%3Ccircle cx='30' cy='25' r='8' fill='%23800000'/%3E%3Ccircle cx='50' cy='20' r='10' fill='%23660000'/%3E%3Ccircle cx='70' cy='30' r='12' fill='%23990000'/%3E%3Ccircle cx='50' cy='40' r='7' fill='%23800000'/%3E%3Ccircle cx='80' cy='25' r='9' fill='%23660000'/%3E%3Cpath d='M40,30 C45,25 55,25 60,30 S65,40 60,45 S45,45 40,40 S35,35 40,30' fill='%23800000'/%3E%3C/svg%3E");
    transform: rotate(-15deg);
    filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
  }
  
  .blood-splatter-drops {
    top: 5%;
    left: 10%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Ccircle cx='20' cy='20' r='3' fill='%23990000'/%3E%3Ccircle cx='30' cy='10' r='2' fill='%23800000'/%3E%3Ccircle cx='40' cy='25' r='4' fill='%23660000'/%3E%3Ccircle cx='50' cy='15' r='2.5' fill='%23800000'/%3E%3Ccircle cx='60' cy='30' r='3' fill='%23990000'/%3E%3Ccircle cx='70' cy='20' r='1.5' fill='%23660000'/%3E%3Ccircle cx='80' cy='25' r='3' fill='%23800000'/%3E%3Cpath d='M25,35 Q30,45 35,35' stroke='%23800000' stroke-width='2' fill='none'/%3E%3Cpath d='M45,30 Q55,45 65,35' stroke='%23990000' stroke-width='2.5' fill='none'/%3E%3C/svg%3E");
    filter: blur(0.5px);
  }
  
  .blood-splatter-tiny {
    top: -10%;
    left: -15%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Ccircle cx='30' cy='30' r='2' fill='%23800000'/%3E%3Ccircle cx='40' cy='20' r='1' fill='%23660000'/%3E%3Ccircle cx='25' cy='40' r='1.5' fill='%23990000'/%3E%3Ccircle cx='45' cy='35' r='1' fill='%23800000'/%3E%3Ccircle cx='15' cy='25' r='1.5' fill='%23660000'/%3E%3Cpath d='M30,50 C35,45 40,45 45,50' stroke='%23990000' stroke-width='1' fill='none'/%3E%3C/svg%3E");
    transform: scale(0.8) rotate(25deg);
  }
  
  /* Nueva mancha de sangre más explosiva */
  .blood-splatter-extra {
    top: 15%;
    left: -5%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cpath d='M20,20 Q35,10 40,25 T55,15 Q70,5 80,25 T95,35' stroke='%23990000' stroke-width='3.5' fill='none'/%3E%3Ccircle cx='25' cy='20' r='9' fill='%23990000'/%3E%3Ccircle cx='45' cy='15' r='7' fill='%23800000'/%3E%3Ccircle cx='65' cy='25' r='11' fill='%23660000'/%3E%3Ccircle cx='40' cy='35' r='8' fill='%23800000'/%3E%3Cpath d='M30,40 C35,30 50,30 55,40 S60,55 50,60 S30,55 25,45 S25,35 30,40' fill='%23990000'/%3E%3C/svg%3E");
    transform: scale(1.2) rotate(25deg);
    filter: drop-shadow(0 0 3px rgba(0,0,0,0.6));
  }
  
  /* Efectos de goteo de sangre */
  .blood-drip-effect {
    position: absolute;
    top: 60%;
    left: 40%;
    width: 20%;
    height: 0px;
    background: linear-gradient(to bottom, rgba(153,0,0,0.9) 0%, rgba(102,0,0,0.8) 50%, rgba(153,0,0,0) 100%);
    border-top-left-radius: 50%;
    border-top-right-radius: 40%;
    transform: skew(-10deg, 5deg);
    z-index: 7;
    filter: blur(1px);
  }
  
  /* Ajustes para los diferentes goteos */
  .blood-drip-main {
    left: 40%;
    width: 22%;
  }
  
  .blood-drip-secondary {
    left: 60%;
    width: 15%;
    transform: skew(5deg, 2deg);
  }
  
  .screen-crack-realistic {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' width='100%25' height='100%25'%3E%3Cpath d='M500,500 L450,350 L400,200 L320,100 M500,500 L550,320 L600,150 L650,50 M500,500 L380,450 L250,420 L100,400 M500,500 L600,480 L750,470 L900,450 M500,500 L450,550 L400,650 L350,800 M500,500 L550,600 L580,750 L600,900' stroke='white' stroke-width='2' fill='none'/%3E%3Cpath d='M500,500 L470,400 L460,300 M500,500 L530,380 L550,300 M500,500 L450,480 L350,450 M500,500 L550,480 L650,450 M500,500 L480,550 L460,650 M500,500 L520,580 L550,700' stroke='rgba(255,255,255,0.5)' stroke-width='1' fill='none'/%3E%3C/svg%3E");
    opacity: 0;
    z-index: 4;
  }
  
  .vignette-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%);
    opacity: 0;
    z-index: 8;
  }
  
  .knockout-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    opacity: 0;
    z-index: 11;
  }
  
  .vision-blur {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(0px);
    opacity: 0;
    z-index: 9;
  }
  
  .double-vision {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: inherit;
    opacity: 0;
    z-index: 3;
    mix-blend-mode: difference;
    filter: invert(10%);
  }
  
  .screen-blur {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(0px);
    opacity: 0;
  }
  
  .punch-stars {
    position: absolute;
    top: 40%;
    left: 0;
    width: 100%;
    height: 60px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cg%3E%3Cpath d='M80,15 L82,22 L89,22 L83,27 L85,34 L80,30 L75,34 L77,27 L71,22 L78,22 Z' fill='%23fff' /%3E%3Cpath d='M160,20 L162,27 L169,27 L163,32 L165,39 L160,35 L155,39 L157,32 L151,27 L158,27 Z' fill='%23fff' /%3E%3Cpath d='M240,20 L242,27 L249,27 L243,32 L245,39 L240,35 L235,39 L237,32 L231,27 L238,27 Z' fill='%23fff' /%3E%3Cpath d='M320,15 L322,22 L329,22 L323,27 L325,34 L320,30 L315,34 L317,27 L311,22 L318,22 Z' fill='%23fff' /%3E%3Cpath d='M400,25 L402,32 L409,32 L403,37 L405,44 L400,40 L395,44 L397,37 L391,32 L398,32 Z' fill='%23fff' /%3E%3C/g%3E%3C/svg%3E");
    opacity: 0;
    animation: starsFloat 2s ease-out 0.3s forwards;
  }
  
  @keyframes starsFloat {
    0% { opacity: 0; transform: translateY(0); }
    40% { opacity: 0.7; }
    100% { opacity: 0; transform: translateY(-40px) rotate(10deg); }
  }
  
  @keyframes pulseAndFade {
    0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
    30% { opacity: 0.8; }
    100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
  }
  
  @keyframes dustRise {
    0% { opacity: 0; transform: translateX(-50%) scale(0.3); }
    15% { opacity: 0.4; transform: translateX(-50%) translateY(-20px) scale(0.7); }
    40% { opacity: 0.9; transform: translateX(-50%) translateY(-60px) scale(1.2); }
    80% { opacity: 0.5; transform: translateX(-50%) translateY(-120px) scale(1.8); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-160px) scale(2.2); }
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    .impact-lines {
      width: 200px;
      height: 200px;
    }
    
    .dust-cloud {
      width: 300px;
      height: 150px;
    }
    
    .punch-impact {
      width: 150px;
      height: 150px;
    }
  }
  
  /* Extra small devices */
  @media (max-width: 480px) {
    .impact-lines {
      width: 150px;
      height: 150px;
    }
    
    .dust-cloud {
      width: 200px;
      height: 100px;
    }
    
    .punch-impact {
      width: 100px;
      height: 100px;
    }
    
    @keyframes dustRise {
      0% { opacity: 0; transform: translateX(-50%) scale(0.3); }
      20% { opacity: 0.5; transform: translateX(-50%) translateY(-15px) scale(0.6); }
      50% { opacity: 0.8; transform: translateX(-50%) translateY(-40px) scale(1.0); }
      80% { opacity: 0.4; transform: translateX(-50%) translateY(-60px) scale(1.3); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-80px) scale(1.5); }
    }
  }
  
  /* Landscape mode */
  @media (max-height: 500px) and (orientation: landscape) {
    .impact-lines {
      width: 120px;
      height: 120px;
    }
    
    .dust-cloud {
      width: 180px;
      height: 80px;
      bottom: 20%;
    }
    
    .punch-impact {
      width: 80px;
      height: 80px;
    }
    
    @keyframes pulseAndFade {
      0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
      30% { opacity: 0.7; }
      100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
    }
    
    @keyframes dustRise {
      0% { opacity: 0; transform: translateX(-50%) scale(0.3); }
      20% { opacity: 0.4; transform: translateX(-50%) translateY(-10px) scale(0.6); }
      50% { opacity: 0.7; transform: translateX(-50%) translateY(-25px) scale(0.9); }
      80% { opacity: 0.3; transform: translateX(-50%) translateY(-35px) scale(1.1); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-45px) scale(1.3); }
    }
  }
`;