import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HoverDialogController, { HoverLinkType } from "../controllers/hoverDialogController";
import IdleTimeoutController from "../controllers/idleTimeoutController";
import AchievementController from "../controllers/achievementController";
import DialogController from "../controllers/dialogController";

interface SocialLinkProps {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  id: string; // ID yang bisa dipetakan ke HoverLinkType
}

const SocialLink: React.FC<SocialLinkProps> = ({ name, url, icon, color, hoverColor, id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const hoverController = HoverDialogController.getInstance();
  const dialogController = DialogController.getInstance();

  // Pemetaan id ke HoverLinkType
  const mapIdToLinkType = (id: string): HoverLinkType => {
    switch (id) {
      case 'whatsapp':
        return 'whatsapp';
      case 'email':
        return 'email';
      case 'linkedin':
        return 'linkedin';
      case 'github':
        return 'github';
      case 'tiktok':
        return 'tiktok';
      case 'youtube':
        return 'youtube';
      default:
        return 'none';
    }
  };

  // === 1. CONTACT CARD BEHAVIOR ===
  // Monitor dialog visibility to control contact card position
  useEffect(() => {
    const checkDialogVisibility = () => {
      try {
        // Check if any dialog is visible
        const isMainDialogActive = dialogController.isMainDialogActive();
        const isCurrentlyTyping = dialogController.isCurrentlyTyping();
        const hasActiveDialog = isMainDialogActive || isCurrentlyTyping;
        
        setIsDialogVisible(hasActiveDialog);
      } catch (error) {
        console.error("[SocialLink] Error checking dialog visibility:", error);
        setIsDialogVisible(false);
      }
    };

    // Check initially
    checkDialogVisibility();

    // Set up interval to monitor dialog state
    const interval = setInterval(checkDialogVisibility, 100);

    return () => clearInterval(interval);
  }, [dialogController]);

  const triggerGlitch = () => {
    setIsGlitching(true);
    // Random timing for more realistic glitch effect
    const glitchDuration = 300 + Math.random() * 300; // Between 300-600ms
    setTimeout(() => setIsGlitching(false), glitchDuration);
  };
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent default behavior for all links to handle redirection manually
    e.preventDefault();
    
    // Get the ElevenLabs service to check audio status
    const elevenlabsService = HoverDialogController.getInstance().getElevenLabsService();
    
    // Trigger the glitch effect immediately
    triggerGlitch();
    
    // Peta ID ke HoverLinkType
    const hoverType = mapIdToLinkType(id);
    
    // Notifikasi HoverDialogController bahwa link telah diklik
    // Ini baru, untuk menampilkan achievement dari hover dialog
    hoverController.handleLinkClick(hoverType);
    
    // Tampilkan dialog hover terakhir
    hoverController.handleHoverDialog(hoverType);
    
    // Check if audio is currently playing
    if (elevenlabsService.isCurrentlyPlaying()) {
      console.log("Audio is playing - waiting for completion before redirecting to:", url);
      
      // Display a message to user that we're waiting for audio to finish
      const redirectDelay = 2500; // 2.5 seconds 
      
      setTimeout(() => {
        console.log("Redirect delay completed, opening URL:", url);
        
        // Use window.open for external links, window.location for mailto
        if (url.startsWith('mailto:')) {
          window.location.href = url;
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }, redirectDelay);
    } else {
      // Tampilkan achievement success
      try {
        // Delay untuk melihat achievement
        const redirectDelay = 1500; // 1.5 seconds
        console.log("Showing success achievement before redirecting to:", url);
        
        setTimeout(() => {
          console.log("Achievement delay completed, opening URL:", url);
          
          if (url.startsWith('mailto:')) {
            window.location.href = url;
          } else {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        }, redirectDelay);
      } catch (error) {
        // If there's an error with achievement, still redirect
        console.error("Error with achievement handling:", error);
        console.log("Redirecting immediately to:", url);
        
        if (url.startsWith('mailto:')) {
          window.location.href = url;
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    }
  };

  const handleMouseEnter = () => {
    triggerGlitch();
    setIsHovered(true);
    
    // Reset timer pada IdleTimeoutController
    try {
      const idleController = IdleTimeoutController.getInstance();
      idleController.resetIdleTimer(); // Menggunakan method khusus untuk reset
      console.log("[SocialLink] Reset timer on hover");
    } catch (e) {
      console.error("[SocialLink] Error resetting timer on hover:", e);
    }
    
    // Trigger hover dialog
    hoverController.handleHoverDialog(mapIdToLinkType(id));
  };

  const handleMouseLeave = () => {
    triggerGlitch();
    setIsHovered(false);
    // Reset hover state to none when mouse leaves
    hoverController.handleHoverDialog('none');
  };
  
  return (
    <motion.a
      href={url}
      target={url.startsWith('mailto:') ? '_self' : '_blank'}
      rel="noopener noreferrer"
      className="social-link"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter} /* Support for touch devices */
      onTouchEnd={handleMouseLeave} /* Support for touch devices */
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        // Social links tidak bergerak berdasarkan dialog visibility
        y: 0, // Tidak ada pergerakan vertikal
        opacity: 1 // Opacity tetap penuh
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
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
          padding: clamp(0.35rem, 1.2vw, 0.5rem) clamp(0.4rem, 2vw, 0.6rem); /* Smaller padding */
          border-radius: 4px; /* Smaller border radius */
          text-decoration: none;
          background-color: rgba(15, 23, 42, 0.2); /* More transparent */
          transition: all 0.25s ease;
          border: 1px solid rgba(249, 115, 22, 0.12); /* Subtler border */
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); /* Lighter shadow */
          width: 100%;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          color: rgba(255, 255, 255, 0.85);
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(22px, 4vw, 28px); /* Smaller icon container */
          height: clamp(22px, 4vw, 28px); /* Smaller icon container */
          border-radius: 4px;
          margin-right: clamp(0.5rem, 2vw, 0.7rem); /* Smaller margin */
          transition: all 0.3s ease;
        }

        .link-text {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-grow: 1;
          gap: clamp(0.8rem, 2vw, 1.2rem); /* Smaller gap */
          font-size: clamp(0.7rem, 2.5vw, 0.85rem); /* Smaller font */
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