import React, { useEffect, useRef, useState } from "react";
import { FaGithub, FaLinkedin, FaWhatsapp, FaEnvelope, FaTiktok, FaYoutube } from "react-icons/fa";
import { motion } from "framer-motion";
import SocialLink from "../components/SocialLink";
import ShareButton from "../components/ShareButton";
import DialogController from "../controllers/dialogController";
import HoverDialogController from "../controllers/hoverDialogController";
import IdleTimeoutController from "../controllers/idleTimeoutController";

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

interface Skill {
  id: string;
  name: string;
  level: number; // 1-100
  icon: React.ReactNode;
  category: 'frontend' | 'backend' | 'database' | 'other';
  color: string;
}

const GameContactCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [hasActiveDialog, setHasActiveDialog] = useState(false);

  // Monitor dialog visibility to adjust positioning
  useEffect(() => {
    const checkDialogVisibility = () => {
      try {
        // Check global dialog flag set by DialogBox component
        const globalDialogFlag = (window as any).__dialogBoxVisible;
        
        // Check if dialog box elements are visible in DOM
        const dialogBoxElements = document.querySelectorAll('.dialog-box-container');
        const hasVisibleDialogBox = Array.from(dialogBoxElements).some(element => {
          const htmlElement = element as HTMLElement;
          const computedStyle = window.getComputedStyle(htmlElement);
          return computedStyle.display !== 'none' && 
                 computedStyle.visibility !== 'hidden' && 
                 computedStyle.opacity !== '0' &&
                 htmlElement.offsetHeight > 0;
        });

        // Also check for any dialog with text content
        const dialogBoxTextElements = document.querySelectorAll('.dialog-text');
        const hasDialogWithText = Array.from(dialogBoxTextElements).some(element => {
          const textContent = element.textContent?.trim();
          return textContent && textContent.length > 0;
        });

        const dialogVisible = globalDialogFlag || hasVisibleDialogBox || hasDialogWithText;
        setHasActiveDialog(dialogVisible);
      } catch (error) {
        console.error("Error checking dialog visibility:", error);
        setHasActiveDialog(false);
      }
    };

    // Check immediately
    checkDialogVisibility();

    // Set up interval to check dialog visibility more frequently
    const interval = setInterval(checkDialogVisibility, 150);

    return () => clearInterval(interval);
  }, []);

  // Social media links data
  const socialLinks: SocialLink[] = [
    {
      id: "github",
      name: "GitHub",
      url: "https://github.com/EnVyxS",
      icon: <FaGithub size={24} />,
      color: "#333",
      hoverColor: "#f97316", // Orange color to match the GIF fire
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/diva-juan-nur-taqarrub",
      icon: <FaLinkedin size={24} />,
      color: "#0077B5",
      hoverColor: "#0ea5e9", // Restored to blue color
    },
    {
      id: "tiktok",
      name: "TikTok",
      url: "https://www.tiktok.com/@_divajuan",
      icon: <FaTiktok size={24} />,
      color: "#000000",
      hoverColor: "#ff0050", // TikTok pink color
    },
    {
      id: "youtube",
      name: "YouTube",
      url: "https://www.youtube.com/@progr3s790",
      icon: <FaYoutube size={24} />,
      color: "#FF0000",
      hoverColor: "#FF0000", // YouTube red color
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      url: "https://wa.me/+62895380768824",
      icon: <FaWhatsapp size={24} />,
      color: "#25D366",
      hoverColor: "#25D366", // Proper WhatsApp green color
    },
    {
      id: "email",
      name: "Email",
      url: "mailto:divajuannurtaqarrub@gmail.com?subject=JOB",
      icon: <FaEnvelope size={24} />,
      color: "#EA4335", // Gmail primary red color
      hoverColor: "#EA4335", // Same color on hover for Gmail
    },
  ];

  // Framer Motion variants - lebih halus dan minimal
  const containerVariants = {
    hidden: { opacity: 0, y: 5 }, // Minimal y movement
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "tween", // Use tween instead of spring for smoother motion
        duration: 1.5, // Longer duration for more gentle appearance
        ease: "easeOut",
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 3, opacity: 0 }, // Minimal movement
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: "tween", 
        duration: 0.8, 
        ease: "easeOut" 
      },
    },
  };

  return (
    <div className="layout-container">
      {/* Main container with proper structure */}
      <div className={`content-wrapper ${hasActiveDialog ? 'dialog-active' : ''}`}>
        {/* Unified card component containing links */}
        <motion.div
          ref={cardRef}
          className="unified-card"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          whileHover={{
            boxShadow: "0 0 15px rgba(156, 136, 114, 0.4)", // Stronger glow
            scale: 1.03, // Slightly larger grow effect
            opacity: 0.8, // More opaque on hover for better visibility
            borderColor: "rgba(156, 136, 114, 0.7)", // Highlight border
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Orange accent corner for design element */}
          <div className="card-accent-corner"></div>
          
          {/* Social links section */}
          <motion.div className="social-links" variants={itemVariants}>
            {socialLinks.map((link) => (
              <SocialLink
                key={link.id}
                id={link.id}
                name={link.name}
                url={link.url}
                icon={React.cloneElement(link.icon as React.ReactElement, { 
                  size: "clamp(10px, 2vw, 14px)" // Ikon sangat kecil untuk menyesuaikan kartu yang lebih kecil
                })}
                color={link.color}
                hoverColor={link.hoverColor}
              />
            ))}
          </motion.div>
          
          {/* Share Button beneath social links */}
          <motion.div 
            className="share-button-container"
            variants={itemVariants}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <ShareButton 
              className="card-share-button"
              title="DIVA JUAN | Interactive Portfolio"
              text="Check out this immersive interactive portfolio by DIVA JUAN - an experience you won't forget!"
            />
          </motion.div>
          
          {/* Card corner decorations for Dark Souls aesthetic */}
          <div className="card-corner top-left"></div>
          <div className="card-corner top-right"></div>
          <div className="card-corner bottom-left"></div>
          <div className="card-corner bottom-right"></div>
        </motion.div>
      </div>

      <style>{`
        .layout-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100%;
          z-index: 30;
          position: relative;
        }

        .content-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          width: 100%;
          max-width: 320px;
          margin: 0;
          position: fixed;
          top: 20px;
          right: 20px;
          transform: none;
          z-index: 20;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Dynamic positioning and scaling when dialog is active */
        .content-wrapper.dialog-active {
          top: 10px;
          right: 10px;
          transform: scale(0.8);
        }
        
        .content-wrapper.dialog-active .unified-card {
          transform: scale(0.9);
          opacity: 0.6;
          filter: blur(0.3px);
        }

        /* Unified card that contains all elements */
        .unified-card {
          background: rgba(20, 16, 14, 0.85);
          border: 1px solid rgba(150, 130, 100, 0.6);
          backdrop-filter: blur(3px);
          opacity: 0.9;
          border-radius: 4px;
          padding: 1rem 0.8rem;
          width: 100%;
          max-width: 280px;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 16px rgba(150, 130, 100, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          z-index: 30;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          min-height: 320px;
        }

        .unified-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, rgba(180, 160, 120, 0.6), rgba(150, 130, 100, 0.3)); /* Gradien emas pudar */
          z-index: 1;
          opacity: 0.8;
        }

        /* Dark Souls style corner elements */
        .card-corner {
          position: absolute;
          width: 8px;
          height: 8px;
          border: 1px solid rgba(150, 130, 100, 0.5); /* Sesuaikan dengan warna emas pudar */
          z-index: 2;
        }
        
        .top-left {
          top: 3px;
          left: 3px;
          border-right: none;
          border-bottom: none;
        }
        
        .top-right {
          top: 3px;
          right: 3px;
          border-left: none;
          border-bottom: none;
        }
        
        .bottom-left {
          bottom: 3px;
          left: 3px;
          border-right: none;
          border-top: none;
        }
        
        .bottom-right {
          bottom: 3px;
          right: 3px;
          border-left: none;
          border-top: none;
        }
        
        /* Accent corner - sesuaikan dengan emas pudar */
        .card-accent-corner {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, transparent 50%, rgba(150, 130, 100, 0.25) 50%);
          z-index: 2;
        }
        
        .social-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem; /* Perfect spacing between links */
          width: 100%;
          flex: 1; /* Take available space */
          justify-content: space-evenly; /* Evenly distribute social links */
          padding: 0.3rem 0; /* Minimal padding for optimal use of space */
          transform: translateY(-30px); /* Naik lebih tinggi agar posisi lebih ke atas */
        }
        
        .share-button-container {
          width: 100%;
          margin-top: 0; /* Remove auto margin */
          flex-shrink: 0; /* Prevent shrinking */
        }
        
        .card-share-button {
          width: 100%;
          font-size: 0.6rem !important;
          padding: 4px 8px !important;
          background: rgba(30, 25, 20, 0.7) !important;
          border: 1px solid rgba(150, 130, 100, 0.4) !important;
          color: rgba(150, 130, 100, 0.9) !important;
          border-radius: 0 !important;
          justify-content: center;
          box-shadow: none !important;
          transition: all 0.3s ease;
        }
        
        .card-share-button:hover {
          background: rgba(40, 35, 30, 0.8) !important;
          border-color: rgba(180, 160, 120, 0.6) !important;
          color: rgba(200, 175, 130, 1) !important;
        }
        
        .card-share-button svg {
          width: 14px !important;
          height: 14px !important;
        }

        /* Tablet devices (maintain position on right side) */
        @media (max-width: 768px) {
          .content-wrapper {
            top: 120px; /* Default position turun 60px (60px + 60px = 120px) */
            right: 20px; /* Closer to edge on tablets */
            max-width: 320px;
            z-index: 10; /* Ensure it's above other elements */
            align-items: flex-end; /* Keep right alignment */
          }
          
          .content-wrapper.dialog-active {
            top: 40px; /* Naik lebih tinggi saat dialog aktif di tablet */
          }
          
          .content-wrapper.dialog-active .unified-card {
            transform: scale(0.7); /* Mengecil lebih banyak saat dialog aktif di tablet */
            opacity: 0.35; /* Lebih transparan saat dialog aktif */
            filter: blur(0.5px); /* Subtle blur effect */
          }
          
          .unified-card {
            max-width: min(220px, 70%); /* Larger on tablets */
            opacity: 0.65; /* Subtle visibility on tablets */
            transform: scale(0.9); /* Consistent with desktop */
            min-height: 260px; /* Adjusted for tablet */
            transition: all 0.4s ease; /* Smooth transitions untuk tablet */
          }
          
          .social-links {
            gap: 0.6rem; /* Better spacing between links */
            padding-top: 0.4rem; /* Space from top */
          }
          
          .skill-row {
            margin-bottom: 0.3rem;
          }
          
          .skill-name {
            font-size: 0.6rem;
          }
        }

        /* Tablet devices */
        @media (max-width: 1024px) and (min-width: 769px) {
          .content-wrapper {
            top: 15px;
            right: 15px;
            max-width: 260px;
          }
          
          .content-wrapper.dialog-active {
            top: 10px;
            right: 10px;
            transform: scale(0.9);
          }
          
          .content-wrapper.dialog-active .unified-card {
            transform: scale(0.95);
            opacity: 0.8;
          }
          
          .unified-card {
            max-width: 240px;
            min-height: 280px;
            padding: 0.9rem 0.7rem;
          }
        }

        /* Mobile devices */
        @media (max-width: 768px) {
          .content-wrapper {
            position: fixed;
            top: 50%;
            left: 50%;
            right: auto;
            transform: translate(-50%, -60%);
            width: 90vw;
            max-width: 300px;
            height: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 25;
          }
          
          .content-wrapper.dialog-active {
            top: 30%;
            transform: translate(-50%, -50%) scale(0.85);
          }
          
          .content-wrapper.dialog-active .unified-card {
            transform: scale(0.9);
            opacity: 0.7;
          }
          
          .social-links {
            gap: 0.6rem; /* Better spacing on mobile */
            width: 100%; /* Use full width */
            padding-top: 0.4rem; /* Space from top */
            margin-bottom: 1.2rem; /* More space from share button */
          }
          
          .unified-card {
            max-width: 100%;
            width: 100%;
            padding: 1rem 0.8rem;
            margin: 0;
            min-height: 280px;
          }
          
          .card-corner {
            width: 6px;
            height: 6px;
          }
        }
        
        /* Extra small devices */
        @media (max-width: 480px) {
          .content-wrapper {
            top: 45%;
            width: 95vw;
            max-width: 280px;
          }
          
          .content-wrapper.dialog-active {
            top: 25%;
            transform: translate(-50%, -50%) scale(0.8);
          }
          
          .unified-card {
            padding: 0.8rem 0.6rem;
            min-height: 260px;
          }
          
          .social-links {
            gap: 0.6rem; /* Consistent spacing for touch */
            padding-top: 0.4rem; /* Space from top */
            margin-bottom: 1.2rem; /* Space from share button */
          }
          
          .skill-name {
            font-size: 0.6rem;
          }
          
          .card-content {
            gap: 0.5rem; /* More spacing between sections */
          }
          
          .skill-level {
            height: 3px;
          }
        }

        /* Landscape mode on mobile devices */
        @media (max-height: 500px) and (orientation: landscape) {
          .content-wrapper {
            position: fixed;
            top: 10px;
            right: 10px;
            left: auto;
            transform: none;
            width: auto;
            max-width: 200px;
            height: auto;
            align-items: flex-end;
            justify-content: flex-start;
          }
          
          .content-wrapper.dialog-active {
            top: 5px;
            right: 5px;
            transform: scale(0.9);
          }

          .unified-card {
            padding: 0.5rem 0.4rem;
            max-width: 180px;
            min-height: 200px;
          }

          .social-links {
            gap: 0.3rem;
          }
          
          .card-corner {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default GameContactCard;