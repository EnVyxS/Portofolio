import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import darksoulsGif from '../assets/darksouls.gif';
import { useAudio } from '../context/AudioContext';

interface ApproachScreenProps {
  onApproach: () => void;
}

const ApproachScreen: React.FC<ApproachScreenProps> = ({ onApproach }) => {
  const [isHovering, setIsHovering] = useState(false);
  const { setHasInteracted } = useAudio();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [buttonFlickering, setButtonFlickering] = useState(false);

  // Add subtle flickering effect to the button
  useEffect(() => {
    const flickerInterval = setInterval(() => {
      setButtonFlickering(prev => !prev);
    }, Math.random() * 2000 + 1000); // Random interval between 1-3 seconds
    
    return () => clearInterval(flickerInterval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleApproach = () => {
    setHasInteracted(true); // Tell AudioContext that user has interacted
    onApproach();
  };

  // Calculate distance from button to mouse for light effect
  const calculateLightIntensity = () => {
    if (!buttonRef.current || !isHovering) return 0;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const buttonCenter = {
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2
    };
    
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - buttonCenter.x, 2) + 
      Math.pow(mousePosition.y - buttonCenter.y, 2)
    );
    
    // The closer the mouse, the stronger the light
    const maxDistance = 300;
    return Math.max(0, 1 - distance / maxDistance);
  };
  
  const lightIntensity = calculateLightIntensity();

  return (
    <div 
      className="approach-screen"
      onMouseMove={handleMouseMove}
      style={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        backgroundImage: `url(${darksoulsGif})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div 
        className="overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 100%)',
          zIndex: 1,
        }}
      />
      
      <motion.button
        ref={buttonRef}
        onClick={handleApproach}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: buttonFlickering ? 0.85 : 1, 
          scale: isHovering ? 1.05 : 1,
          textShadow: isHovering 
            ? `0 0 10px rgba(255,165,0,${0.7 + lightIntensity * 0.3}), 0 0 20px rgba(255,165,0,${0.5 + lightIntensity * 0.5})` 
            : '0 0 5px rgba(255,165,0,0.5)',
          boxShadow: isHovering 
            ? `0 0 15px rgba(255,165,0,${0.5 + lightIntensity * 0.5}), 0 0 30px rgba(255,165,0,${0.3 + lightIntensity * 0.3})` 
            : '0 0 10px rgba(255,165,0,0.3)'
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 20,
          opacity: { duration: buttonFlickering ? 0.3 : 0.1 }
        }}
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'transparent',
          border: '2px solid rgba(255,165,0,0.5)',
          borderRadius: '4px',
          padding: '1rem 2rem',
          fontSize: 'clamp(1.2rem, 5vw, 1.8rem)',
          color: '#f1f5f9',
          cursor: 'pointer',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          fontFamily: '"Cinzel", serif',
          overflow: 'hidden',
        }}
      >
        {/* Bonfire glow effect */}
        {isHovering && (
          <motion.div
            className="glow-effect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 + lightIntensity * 0.3 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at center, rgba(255,165,0,0.3) 0%, transparent 70%)',
              filter: 'blur(8px)',
              zIndex: -1,
            }}
          />
        )}
        
        {/* Text with glitch effect on hover */}
        <span
          className="approach-text"
          style={{
            position: 'relative',
            display: 'inline-block',
          }}
        >
          {isHovering && (
            <>
              <motion.span
                className="glitch-effect-1"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: [0, 0.3, 0], x: [-1, 1, -1, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.5, 
                  repeatType: 'loop',
                  times: [0, 0.2, 0.4, 1]
                }}
                style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '0',
                  color: 'rgba(255,0,0,0.8)',
                  clipPath: 'inset(0 0 50% 0)',
                  transform: 'skewX(5deg)',
                  whiteSpace: 'nowrap',
                  zIndex: -1,
                }}
              >
                APPROACH HIM
              </motion.span>
              <motion.span
                className="glitch-effect-2"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: [0, 0.3, 0], x: [1, -1, 1, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.5, 
                  repeatType: 'loop',
                  times: [0, 0.2, 0.4, 1],
                  delay: 0.1
                }}
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '0',
                  color: 'rgba(0,255,255,0.8)',
                  clipPath: 'inset(50% 0 0 0)',
                  transform: 'skewX(-5deg)',
                  whiteSpace: 'nowrap',
                  zIndex: -1,
                }}
              >
                APPROACH HIM
              </motion.span>
            </>
          )}
          
          APPROACH HIM
        </span>
      </motion.button>
    </div>
  );
};

export default ApproachScreen;