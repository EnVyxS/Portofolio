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

  // Monitor dialog activity to adjust positioning
  useEffect(() => {
    const checkDialogActivity = () => {
      try {
        const dialogController = DialogController.getInstance();
        const hoverDialogController = HoverDialogController.getInstance();
        const idleTimeoutController = IdleTimeoutController.getInstance();

        // Check if any dialog is currently active
        const isMainDialogTyping = typeof dialogController.isCurrentlyTyping === "function" 
          ? dialogController.isCurrentlyTyping() : false;
        const isHoverDialogActive = hoverDialogController.isTypingHoverDialog();
        const isIdleDialogActive = idleTimeoutController.isTypingIdle;

        const dialogActive = isMainDialogTyping || isHoverDialogActive || isIdleDialogActive;
        setHasActiveDialog(dialogActive);
      } catch (error) {
        console.error("Error checking dialog activity:", error);
        setHasActiveDialog(false);
      }
    };

    // Check immediately
    checkDialogActivity();

    // Set up interval to check dialog activity
    const interval = setInterval(checkDialogActivity, 500);

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
      url: "https://www.tiktok.com/@envyxs",
      icon: <FaTiktok size={24} />,
      color: "#000000",
      hoverColor: "#ff0050", // TikTok pink color
    },
    {
      id: "youtube",
      name: "YouTube",
      url: "https://www.youtube.com/@envyxs",
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
      url: "mailto:111202012560@mhs.dinus.ac.id?subject=JOB",
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
      <div className="content-wrapper">
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
          align-items: flex-end; /* Align to the right */
          width: 100%;
          max-width: 500px;
          margin: 0;
          position: absolute;
          top: 30px; /* Lebih tinggi di layar (untuk menghindari dialog box) */
          right: 40px; /* Sedikit lebih jauh ke kanan */
          transform: none; /* No vertical centering for desktop */
          z-index: 20; /* Pastikan selalu di atas elemen lain */
        }

        /* Unified card that contains all elements */
        .unified-card {
          background: rgba(20, 16, 14, 0.5); /* Lebih gelap dan lebih terlihat */
          border: 1px solid rgba(150, 130, 100, 0.4); /* Border emas lebih terlihat */
          backdrop-filter: blur(2px); /* Sedikit lebih blur */
          opacity: 0.6; /* Kurangi opacity sedikit */
          border-radius: 0; /* No rounded corners ala Souls-like */
          padding: clamp(0.3rem, 0.8vw, 0.5rem) clamp(0.3rem, 0.8vw, 0.5rem); /* Padding lebih compact */
          max-width: min(180px, 40%); /* Ukuran maksimum lebih kecil */
          width: 100%;
          box-shadow:
            0 5px 15px rgba(0, 0, 0, 0.15),
            0 0 12px rgba(150, 130, 100, 0.15); /* Shadow emas pudar */
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          margin: 0 auto;
          z-index: 30;
          touch-action: manipulation; /* More responsive touch */
          -webkit-tap-highlight-color: transparent; /* Remove default browser mobile highlight */
          transform: scale(0.85); /* Ukuran lebih kecil */
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
          gap: 0.4rem; /* Minimal spacing between links */
          width: 100%;
          margin-bottom: 0.4rem; /* Minimal bottom margin */
        }
        
        .share-button-container {
          width: 100%;
          margin-top: 0.5rem;
          margin-bottom: 0.3rem;
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
            top: 60px; /* Fixed distance from top */
            right: 20px; /* Closer to edge on tablets */
            max-width: 320px;
            z-index: 10; /* Ensure it's above other elements */
            align-items: flex-end; /* Keep right alignment */
          }
          
          .unified-card {
            max-width: min(200px, 70%); /* Smaller on tablets */
            opacity: 0.65; /* Subtle visibility on tablets */
            transform: scale(0.85); /* Slightly smaller */
          }
          
          .social-links {
            gap: 0.4rem; /* Tighter spacing between links */
          }
          
          .skill-row {
            margin-bottom: 0.3rem;
          }
          
          .skill-name {
            font-size: 0.6rem;
          }
        }

        /* Mobile devices (center alignment) */
        @media (max-width: 640px) {
          .content-wrapper {
            top: 0; /* Reset top position */
            right: 0; /* Reset right position */
            left: 0; /* Set left to 0 for center alignment */
            height: 100vh; /* Full height of viewport */
            margin: 0 auto; /* Center horizontally */
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center; /* Center vertically */
            align-items: center; /* Center horizontally */
            z-index: 20; /* Higher z-index to ensure visibility */
            transform: none; /* No transform */
            padding-bottom: 100px; /* Push up slightly from center */
          }
          
          .social-links {
            gap: 0.4rem; /* Tighter spacing on mobile */
            width: 100%; /* Use full width */
          }
          
          .unified-card {
            max-width: min(180px, 65%); /* Smaller for mobile */
            opacity: 0.6; /* Less visible on mobile */
            padding: 0.4rem; /* Smaller padding */
            transform: scale(0.85); /* Slightly smaller */
            margin: 0 auto; /* Center the card */
          }
          
          .card-corner {
            width: 6px;
            height: 6px;
          }
        }
        
        /* Extra small devices */
        @media (max-width: 480px) {
          .content-wrapper {
            padding-bottom: 120px; /* Push up more from center */
          }
          
          .unified-card {
            max-width: min(160px, 60%); /* Much narrower on tiny screens */
            padding: 0.4rem; /* Compact padding */
            opacity: 0.6; /* Less visible on small devices */
            transform: scale(0.8); /* Even smaller */
          }
          
          .social-links {
            gap: 0.4rem; /* More spacing for touch */
            padding: 0.3rem 0; /* Vertical padding */
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
            top: 10px; /* Posisi tepat di bagian atas */
            right: 10px; /* Menempel di sisi kanan */
            height: auto; /* Reset height */
            transform: none; /* No transform */
            align-items: flex-end; /* Align to right */
            justify-content: flex-start; /* Align to top */
          }

          .unified-card {
            padding: 0.3rem; /* Padding lebih kecil */
            max-width: 140px; /* Jauh lebih kecil di landscape */
            opacity: 0.5; /* Lebih transparan di landscape */
            transform: scale(0.75); /* Ukuran lebih kecil */
          }

          .social-links {
            gap: 0.2rem; /* Jarak sangat minimal di landscape */
          }
          
          /* Hide decorative elements in landscape to save space */
          .card-accent-corner, .card-corner {
            display: none; /* Sembunyikan semua elemen dekoratif */
          }
          
          .skill-level {
            height: 2px;
            margin-top: 1px;
            margin-bottom: 1px;
          }
        }
      `}</style>
    </div>
  );
};

export default GameContactCard;