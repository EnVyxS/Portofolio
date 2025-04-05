import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DramaticEffectsProps {
  effect: 'throw' | 'punch' | 'none';
  onEffectComplete?: () => void;
}

const DramaticEffects: React.FC<DramaticEffectsProps> = ({ 
  effect, 
  onEffectComplete 
}) => {
  const [isEffectActive, setIsEffectActive] = useState<boolean>(effect !== 'none');
  const punchSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Jalankan efek saat prop effect berubah
  useEffect(() => {
    setIsEffectActive(effect !== 'none');
    
    // Clean up effect atau panggil callback setelah efek selesai
    if (effect !== 'none') {
      const effectDuration = effect === 'throw' ? 2000 : 3000; // throw lebih cepat dari punch
      
      // Play punch sound effect if punch effect is active
      if (effect === 'punch') {
        try {
          // Create audio element for punch sound
          punchSoundRef.current = new Audio('/assets/sounds/punch_sfx.m4a');
          if (punchSoundRef.current) {
            punchSoundRef.current.volume = 0.6; // Set appropriate volume
            punchSoundRef.current.play()
              .catch(e => console.log("Couldn't play punch sound:", e));
          }
        } catch (error) {
          console.log("Error playing punch sound:", error);
        }
      }
      
      const timer = setTimeout(() => {
        setIsEffectActive(false);
        if (onEffectComplete) onEffectComplete();
      }, effectDuration);
      
      return () => {
        clearTimeout(timer);
        // Clean up audio when component unmounts
        if (punchSoundRef.current) {
          punchSoundRef.current.pause();
          punchSoundRef.current = null;
        }
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
              scale: [1, 5, 0],
              rotate: [0, 15, -15, 0],
              x: [0, -100, 100, 0],
              y: [0, -50, 200]
            }}
            transition={{ 
              duration: 1.5,
              times: [0, 0.3, 1],
              ease: "easeInOut" 
            }}
            exit={{ opacity: 0 }}
          >
            {/* Efek melempar */}
            <div className="throw-effect-inner">
              <div className="impact-lines"></div>
              <div className="dust-cloud"></div>
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
                  duration: 0.3, 
                  times: [0, 0.1, 1],
                  ease: "easeOut" 
                }}
              />
              
              {/* Getaran kamera dengan jitter acak */}
              <motion.div 
                className="camera-shake"
                animate={{
                  x: [0, -15, 25, -12, 8, -3, 0],
                  y: [0, 10, -15, 5, -2, 0],
                  rotate: [0, -1, 2, -1.5, 0.5, 0]
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeOut",
                  times: [0, 0.1, 0.2, 0.4, 0.6, 1] 
                }}
              >
                {/* Kontent ini akan bergetar bersama dengan layar */}
                <div className="screen-content"></div>
              </motion.div>
              
              {/* Luka/memar yang muncul */}
              <motion.div 
                className="bruise-overlay"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.7, 0.9]
                }}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.2,
                  ease: "easeOut" 
                }}
              />
              
              {/* Darah realistis */}
              <motion.div 
                className="blood-splatter"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0, 1, 0.8],
                  scale: [0.5, 1.2, 1],
                  y: [0, 10, 25]
                }}
                transition={{ 
                  duration: 1.2, 
                  delay: 0.3,
                  ease: "easeOut" 
                }}
              />
              
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
              
              {/* Efek vignette untuk simulasi hilang kesadaran */}
              <motion.div 
                className="vignette-effect"
                animate={{
                  opacity: [0, 0.4, 0.9]
                }}
                transition={{ 
                  duration: 1.5,
                  delay: 0.6,
                  ease: "easeIn"
                }}
              />
              
              {/* Efek pingsan dengan blackout yang lebih bertahap */}
              <motion.div 
                className="screen-blackout"
                animate={{
                  opacity: [0, 0.2, 0.5, 0.8, 1]
                }}
                transition={{ 
                  duration: 2,
                  delay: 1.0,
                  times: [0, 0.2, 0.4, 0.7, 1],
                  ease: "easeIn"
                }}
              />
              
              {/* Efek vision blur perlahan-lahan */}
              <motion.div 
                className="vision-blur"
                animate={{
                  opacity: [0, 0.4, 0.8, 1],
                  filter: ["blur(0px)", "blur(2px)", "blur(8px)", "blur(15px)"],
                }}
                transition={{ 
                  duration: 1.8,
                  delay: 0.5,
                  times: [0, 0.3, 0.6, 1],
                  ease: "easeIn"
                }}
              />
              
              {/* Efek double vision (penglihatan ganda) */}
              <motion.div 
                className="double-vision"
                animate={{
                  opacity: [0, 0.6, 0.3],
                  x: [0, 8, 4],
                  y: [0, -3, -1]
                }}
                transition={{ 
                  duration: 1.2,
                  delay: 0.7,
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
  }
  
  .throw-effect-inner, .punch-effect-inner {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .impact-lines {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,140,0,0.8) 0%, rgba(255,140,0,0) 70%);
    opacity: 0.8;
    animation: pulseAndFade 1s ease-out forwards;
  }
  
  .dust-cloud {
    position: absolute;
    bottom: 30%;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 200px;
    background: radial-gradient(ellipse, rgba(180,140,100,0.8) 0%, rgba(180,140,100,0) 70%);
    opacity: 0;
    animation: dustRise 1.5s ease-out 0.2s forwards;
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
  
  .bruise-overlay {
    position: absolute;
    top: 40%;
    left: 40%;
    width: 35%;
    height: 25%;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(128,0,0,0.7) 0%, rgba(128,0,0,0) 70%);
    transform: rotate(-15deg);
    opacity: 0;
    z-index: 6;
    filter: blur(5px);
  }
  
  .blood-splatter {
    position: absolute;
    top: 45%;
    left: 45%;
    width: 15%;
    height: 15%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cpath d='M10,10 Q15,5 20,10 T30,15 Q40,5 45,15 T55,20 Q60,15 65,25 T75,20' stroke='%23990000' stroke-width='3' fill='none'/%3E%3Ccircle cx='20' cy='15' r='5' fill='%23800000'/%3E%3Ccircle cx='40' cy='20' r='4' fill='%23800000'/%3E%3Ccircle cx='60' cy='15' r='6' fill='%23800000'/%3E%3Ccircle cx='30' cy='25' r='3' fill='%23800000'/%3E%3Ccircle cx='50' cy='10' r='4' fill='%23800000'/%3E%3C/svg%3E");
    opacity: 0;
    z-index: 7;
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
    0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
    30% { opacity: 0.7; }
    100% { opacity: 0; transform: translateX(-50%) translateY(-100px) scale(1.5); }
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
      0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
      30% { opacity: 0.6; }
      100% { opacity: 0; transform: translateX(-50%) translateY(-60px) scale(1.3); }
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
      0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
      30% { opacity: 0.5; }
      100% { opacity: 0; transform: translateX(-50%) translateY(-40px) scale(1.2); }
    }
  }
`;