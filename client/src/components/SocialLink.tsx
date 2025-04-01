import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SocialLinkProps {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ name, url, icon, color, hoverColor }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  
  // Trigger the glitch effect when hovering
  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsGlitching(true);
    
    // Reset glitch after a short time
    setTimeout(() => {
      setIsGlitching(false);
    }, 500);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="social-link"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        delay: 0.1
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        borderRadius: '8px',
        backgroundColor: isHovered ? `${hoverColor}22` : 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(5px)',
        border: `1px solid ${isHovered ? hoverColor : 'rgba(148, 163, 184, 0.2)'}`,
        color: isHovered ? hoverColor : color,
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '80px',
      }}
    >
      {/* Icon */}
      <div 
        className="social-icon" 
        style={{ 
          marginBottom: '0.5rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Normal icon */}
        <motion.div
          animate={{
            opacity: isGlitching ? [1, 0.5, 0.8, 0.2, 1] : 1,
            x: isGlitching ? [0, -3, 5, -2, 0] : 0,
            scale: isHovered ? 1.2 : 1
          }}
          transition={{
            duration: isGlitching ? 0.5 : 0.3,
            times: isGlitching ? [0, 0.2, 0.4, 0.6, 1] : undefined,
          }}
        >
          {icon}
        </motion.div>
        
        {/* Glitch effect - red channel */}
        {isGlitching && (
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              color: 'rgba(255,0,0,0.8)',
              mixBlendMode: 'screen',
              zIndex: 0,
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5, 0],
              x: [-2, 1, -1, 0],
              y: [1, -1, 1, 0]
            }}
            transition={{
              duration: 0.5,
              times: [0, 0.3, 0.6, 1],
            }}
          >
            {icon}
          </motion.div>
        )}
        
        {/* Glitch effect - blue channel */}
        {isGlitching && (
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              color: 'rgba(0,255,255,0.8)',
              mixBlendMode: 'screen',
              zIndex: 0,
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5, 0],
              x: [2, -1, 1, 0],
              y: [-1, 1, -1, 0]
            }}
            transition={{
              duration: 0.5,
              times: [0, 0.3, 0.6, 1],
            }}
          >
            {icon}
          </motion.div>
        )}
      </div>
      
      {/* Name */}
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: 500,
          transition: 'color 0.3s ease',
          zIndex: 1,
          position: 'relative'
        }}
      >
        {name}
      </span>
      
      {/* Glow effect on hover */}
      {isHovered && (
        <motion.div
          className="link-glow"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.8, scale: 1.5 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            background: `radial-gradient(circle at center, ${hoverColor}30 0%, ${hoverColor}00 70%)`,
            zIndex: 0,
          }}
        />
      )}
    </motion.a>
  );
};

export default SocialLink;