import React, { useEffect, useRef } from "react";
import { FaGithub, FaLinkedin, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import SocialLink from "../components/SocialLink";

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

  // Tidak ada animasi gerakan pada card lagi
  useEffect(() => {
    // Tidak perlu animasi, card tetap diam
    console.log("Contact card initialized without animations");
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
            boxShadow: "0 3px 10px rgba(249, 115, 22, 0.15)", // Subtle glow
            scale: 1.02, // Slight grow effect
            opacity: 0.35, // Increase opacity on hover for better visibility
          }}
          transition={{ duration: 0.4 }}
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
                  size: "clamp(14px, 3vw, 18px)" // Even smaller icons
                })}
                color={link.color}
                hoverColor={link.hoverColor}
              />
            ))}
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
          align-items: center;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          position: fixed;
          top: 1.5rem; /* Positioned at the top */
          right: 1.5rem; /* Position to the right side */
        }

        /* Unified card that contains all elements */
        .unified-card {
          background: rgba(15, 12, 10, 0.25); /* Sesuaikan warna dengan tema Souls-like */
          border: 1px solid rgba(150, 130, 100, 0.2); /* Border emas pudar seperti APPROACH HIM */
          backdrop-filter: blur(1px); /* Very light blur */
          opacity: 0.6; /* Tingkatkan opacity agar lebih terlihat */
          border-radius: 0; /* No rounded corners ala Souls-like */
          padding: clamp(0.5rem, 1.5vw, 0.8rem) clamp(0.5rem, 1.5vw, 0.8rem); /* Smaller padding */
          max-width: min(260px, 60%); /* Much smaller max width */
          width: 100%;
          box-shadow:
            0 8px 20px rgba(0, 0, 0, 0.2),
            0 0 15px rgba(150, 130, 100, 0.15); /* Shadow emas pudar */
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
          gap: 0.6rem; /* Even smaller spacing between links */
          width: 100%;
          margin-bottom: 0.5rem; /* Reduced bottom margin */
        }

        /* Media query with simpler clamp and consistent rem/vh usage */
        @media (max-width: 768px) {
          .content-wrapper {
            top: 1rem; /* Keep at top on tablets */
            right: 1rem; /* Consistent padding */
            max-width: 320px;
          }
          
          .unified-card {
            max-width: min(220px, 80%); /* Slightly wider on tablets but still small */
          }
        }

        @media (max-width: 640px) {
          .content-wrapper {
            top: 0.8rem; /* Stay at top on mobile */
            right: 0.8rem; /* Stay in corner */
          }
          
          .social-links {
            gap: clamp(0.4rem, 1.5vh, 0.8rem); /* Tighter spacing on mobile */
          }
          
          .unified-card {
            max-width: min(200px, 70%); /* Even smaller on mobile */
          }
        }

        /* Landscape mode on mobile devices */
        @media (max-height: 500px) and (orientation: landscape) {
          .content-wrapper {
            top: 0.5rem; /* Very close to top in landscape */
            right: 0.5rem;
          }

          .unified-card {
            padding: 0.5rem;
            max-width: 180px;
          }

          .social-links {
            gap: 0.4rem; /* Very compact in landscape */
          }
        }
      `}</style>
    </div>
  );
};

export default GameContactCard;