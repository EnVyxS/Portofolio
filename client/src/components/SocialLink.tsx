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

  // Create a glitch effect on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    // Start glitch effect
    setIsGlitching(true);
    // Stop glitching after a short time
    setTimeout(() => {
      setIsGlitching(false);
    }, 300);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="social-link"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: isHovered ? hoverColor : 'rgba(0, 0, 0, 0.3)',
        border: `1px solid ${isHovered ? hoverColor : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: '8px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
        overflow: 'hidden',
        gap: '0.5rem',
        width: '100%',
        maxWidth: '90px',
        height: '90px',
      }}
    >
      {/* Glitch effect overlays */}
      {isGlitching && (
        <>
          <motion.div
            className="glitch-overlay glitch-overlay-1"
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 0.5, 0], 
              x: [-2, 1, -1, 2, 0], 
              y: [1, -1, 1, 0] 
            }}
            transition={{ duration: 0.3, times: [0, 0.2, 1] }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: color,
              mixBlendMode: 'overlay',
              filter: 'hue-rotate(90deg)',
              zIndex: 1,
              clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 60%)',
            }}
          />
          <motion.div
            className="glitch-overlay glitch-overlay-2"
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 0.5, 0], 
              x: [2, -1, 1, -2, 0], 
              y: [-1, 1, -1, 0] 
            }}
            transition={{ duration: 0.3, times: [0, 0.2, 1], delay: 0.05 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: color,
              mixBlendMode: 'color-dodge',
              filter: 'hue-rotate(-90deg)',
              zIndex: 2,
              clipPath: 'polygon(0 40%, 100% 70%, 100% 100%, 0 100%)',
            }}
          />
        </>
      )}
      
      {/* Icon */}
      <div
        className="icon-container"
        style={{
          fontSize: '1.5rem',
          color: isHovered ? '#ffffff' : color,
          transition: 'color 0.3s ease',
          zIndex: 5,
        }}
      >
        {icon}
      </div>
      
      {/* Name */}
      <div
        className="name-container"
        style={{
          fontSize: '0.8rem',
          fontWeight: 500,
          color: isHovered ? '#ffffff' : '#e2e8f0',
          transition: 'color 0.3s ease',
          zIndex: 5,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
        }}
      >
        {name}
      </div>
    </motion.a>
  );
};

export default SocialLink;