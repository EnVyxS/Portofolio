import React, { useState } from "react";
import { motion } from "framer-motion";

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

  const triggerGlitch = () => {
    setIsGlitching(true);
    // Random timing for more realistic glitch effect
    const glitchDuration = 300 + Math.random() * 300; // Between 300-600ms
    setTimeout(() => setIsGlitching(false), glitchDuration);
  };
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (url.startsWith('mailto:')) {
      e.preventDefault();
      window.location.href = url;
    }
  };
  
  return (
    <motion.a
      href={url}
      target={url.startsWith('mailto:') ? '_self' : '_blank'}
      rel="noopener noreferrer"
      className="social-link"
      onClick={handleClick}
      onMouseEnter={triggerGlitch}
      onMouseLeave={triggerGlitch}
      onTouchStart={triggerGlitch} /* Support for touch devices */
      onTouchEnd={triggerGlitch} /* Support for touch devices */
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className={`icon-container ${isGlitching ? "glitch" : ""}`}>
        <div className="icon" style={{ color: hoverColor }}>
          {icon}
        </div>
      </div>
      <div className={`link-text ${isGlitching ? "glitch" : ""}`}>
        <span className="link-name">{name}</span>
        <motion.span
          className="link-arrow"
          animate={{ x: isGlitching ? [0, -2, 2, 0] : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          →
        </motion.span>
      </div>

      <style>{`
        @keyframes glitch {
          0% {
            text-shadow:
              2px 0 rgba(255, 0, 0, 0.75),
              -2px 0 rgba(0, 0, 255, 0.75);
            transform: skewX(0deg) scale(1);
            opacity: 1;
          }
          10% {
            text-shadow:
              -1.5px 0 rgba(255, 0, 0, 0.75),
              1.5px 0 rgba(0, 255, 255, 0.75);
            transform: skewX(2deg) scale(1.01);
            opacity: 0.9;
          }
          20% {
            text-shadow:
              1px 0 rgba(255, 0, 0, 0.75),
              -1px 0 rgba(0, 0, 255, 0.75);
            transform: skewX(-1.5deg) scale(0.99);
            opacity: 1;
          }
          30% {
            text-shadow:
              2.5px 0 rgba(0, 255, 0, 0.75),
              -2.5px 0 rgba(255, 0, 255, 0.75);
            transform: skewX(3deg) scale(1.02);
            opacity: 0.8;
          }
          40% {
            text-shadow:
              -1px 0 rgba(255, 0, 0, 0.75),
              1px 0 rgba(0, 0, 255, 0.75);
            transform: skewX(-2deg) scale(0.98);
            opacity: 1;
          }
          50% {
            text-shadow:
              3px 0 rgba(255, 0, 0, 0.6),
              -3px 0 rgba(0, 255, 255, 0.6);
            transform: skewX(5deg) scale(1.01);
            opacity: 0.9;
          }
          60% {
            text-shadow:
              -2px 0 rgba(255, 0, 0, 0.75),
              2px 0 rgba(0, 0, 255, 0.75);
            transform: skewX(-3deg) scale(1);
            opacity: 1;
          }
          70% {
            text-shadow:
              2px 0 rgba(0, 255, 0, 0.7),
              -2px 0 rgba(255, 0, 255, 0.7);
            transform: skewX(2deg) scale(1.02);
            opacity: 0.85;
          }
          80% {
            text-shadow:
              -1px 0 rgba(255, 0, 0, 0.75),
              1px 0 rgba(0, 0, 255, 0.75);
            transform: skewX(-1deg) scale(0.98);
            opacity: 1;
          }
          90% {
            text-shadow:
              1.5px 0 rgba(255, 0, 0, 0.75),
              -1.5px 0 rgba(0, 255, 255, 0.75);
            transform: skewX(1deg) scale(1.01);
            opacity: 0.9;
          }
          100% {
            text-shadow:
              2px 0 rgba(255, 0, 0, 0.75),
              -2px 0 rgba(0, 0, 255, 0.75);
            transform: skewX(0deg) scale(1);
            opacity: 1;
          }
        }

        .social-link {
          display: flex;
          align-items: center;
          padding: clamp(0.6rem, 2vw, 0.85rem) clamp(0.7rem, 3vw, 1rem); /* Responsive padding */
          border-radius: 10px;
          text-decoration: none;
          background-color: rgba(15, 23, 42, 0.5);
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.03);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          width: 100%;
          -webkit-tap-highlight-color: transparent; /* Remove default tap highlight on mobile */
          touch-action: manipulation; /* More responsive for touch */
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(32px, 6vw, 40px); /* Responsive icon size */
          height: clamp(32px, 6vw, 40px); /* Responsive icon size */
          border-radius: 8px;
          margin-right: clamp(0.8rem, 3vw, 1.2rem); /* Responsive margin */
          transition: all 0.3s ease;
        }

        .link-text {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-grow: 1;
          gap: clamp(1.5rem, 4vw, 2.5rem); /* Wider gap between name and arrow */
          font-size: clamp(0.9rem, 3vw, 1rem); /* Responsive font size */
        }

        .glitch {
          animation: glitch 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
          position: relative;
        }
        
        .glitch::before, .glitch::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.1;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        
        .glitch::before {
          background: linear-gradient(90deg, transparent 5%, rgba(255, 0, 0, 0.3) 5%, rgba(255, 0, 0, 0.3) 10%, transparent 10%);
          animation: glitch-stripe 0.3s ease-in-out infinite;
        }
        
        .glitch::after {
          background: linear-gradient(90deg, transparent 10%, rgba(0, 255, 255, 0.3) 10%, rgba(0, 255, 255, 0.3) 20%, transparent 20%);
          animation: glitch-stripe 0.3s ease-in-out infinite reverse;
        }
        
        @keyframes glitch-stripe {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 100% 0;
          }
        }
      `}</style>
    </motion.a>
  );
};

export default SocialLink;