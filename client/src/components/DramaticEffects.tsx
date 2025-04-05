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
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1.2, 1.5, 3],
            }}
            transition={{ 
              duration: 2.5,
              times: [0, 0.1, 0.2, 1],
              ease: "easeInOut" 
            }}
            exit={{ opacity: 0 }}
          >
            {/* Efek memukul yang lebih realistis */}
            <div className="punch-effect-inner">
              <motion.div 
                className="punch-impact"
                animate={{
                  scale: [1, 1.5, 2, 5],
                  opacity: [0.8, 1, 0.6, 0]
                }}
                transition={{ duration: 1.5, times: [0, 0.2, 0.5, 1] }}
              />
              <motion.div 
                className="screen-crack"
                animate={{
                  opacity: [0, 0.8, 1],
                  scale: [0.5, 1, 1.1]
                }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.2, 
                  ease: "easeOut"
                }}
              />
              {/* Efek pingsan dengan blackout yang lebih intensif */}
              <motion.div 
                className="screen-blackout"
                animate={{
                  opacity: [0, 0.3, 0.7, 1]
                }}
                transition={{ 
                  duration: 2,
                  delay: 0.5,
                  times: [0, 0.3, 0.6, 1],
                  ease: "easeIn"
                }}
              />
              {/* Tambahan efek blur untuk simulasi pingsan */}
              <motion.div 
                className="screen-blur"
                animate={{
                  opacity: [0, 0.6, 1],
                  filter: ["blur(0px)", "blur(5px)", "blur(15px)"],
                }}
                transition={{ 
                  duration: 1.5,
                  delay: 0.7,
                  times: [0, 0.5, 1],
                  ease: "easeIn"
                }}
              />
              {/* Efek stars untuk simulasi pusing setelah dipukul */}
              <motion.div 
                className="punch-stars"
                animate={{
                  opacity: [0, 0.8, 0],
                  y: [0, -20, -40],
                  rotate: [0, 20]
                }}
                transition={{ 
                  duration: 2,
                  delay: 0.3,
                  times: [0, 0.5, 1],
                  ease: "easeOut"
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