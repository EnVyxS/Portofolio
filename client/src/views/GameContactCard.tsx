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

  // GSAP animation for card movement - made more responsive with viewport height
  useEffect(() => {
    // Use relative values based on viewport height for consistent movement
    const setResponsiveAnimation = () => {
      if (!cardRef.current) return;
      
      // Simple floating animation using CSS
      cardRef.current.style.animation = "float 4s ease-in-out infinite alternate";
    };

    // Set initial animation
    setResponsiveAnimation();
    
    // Update animation when screen size changes
    window.addEventListener('resize', setResponsiveAnimation);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setResponsiveAnimation);
    };
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

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        delayChildren: 0.2,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  };

  return (
    <div className="layout-container">
      {/* Main container with proper structure */}
      <div className="content-wrapper">
        {/* Unified card component containing both header and links */}
        <motion.div
          ref={cardRef}
          className="unified-card"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          whileHover={{
            boxShadow: "0 10px 25px rgba(249, 115, 22, 0.2)", // Orange glow on hover
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Social links section */}
          <motion.div className="social-links" variants={itemVariants}>
            {socialLinks.map((link) => (
              <SocialLink
                key={link.id}
                name={link.name}
                url={link.url}
                icon={React.cloneElement(link.icon as React.ReactElement, { 
                  size: "clamp(18px, 5vw, 24px)" // Responsive icon size
                })}
                color={link.color}
                hoverColor={link.hoverColor}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-10px);
          }
        }
        
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
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          padding-top: 10vh; /* Positioned even lower to avoid RPG dialog box overlap */
        }

        /* Unified card that contains all elements */
        .unified-card {
          background: rgba(15, 23, 42, 0.5); /* Lebih transparan untuk menyatu dengan background */
          border: 1px solid rgba(249, 115, 22, 0.2); /* Border dengan aksen api */
          backdrop-filter: blur(5px);
          border-radius: 8px; /* Border radius lebih kecil untuk gaya game */
          padding: clamp(1.2rem, 3vw, 2rem) clamp(1.2rem, 3vw, 1.7rem); /* Responsive padding */
          max-width: min(400px, 90%); /* Responsive width, smaller on small screens */
          width: 100%;
          box-shadow:
            0 8px 20px rgba(0, 0, 0, 0.3),
            0 0 15px rgba(249, 115, 22, 0.2);
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
          background: linear-gradient(90deg, #f97316, #fb923c);
          z-index: 1;
          opacity: 0.9;
        }

        .social-links {
          display: flex;
          flex-direction: column;
          gap: 1.5rem; /* Increased spacing between links */
          width: 100%;
          margin-bottom: 1.2rem; /* Reduced bottom margin */
        }

        /* Media query with simpler clamp and consistent rem/vh usage */
        @media (max-width: 768px) {
          .content-wrapper {
            padding-top: clamp(30vh, 36vh, 40vh); /* Responsive based on viewport height */
          }
        }

        @media (max-width: 640px) {
          .social-links {
            gap: clamp(0.6rem, 2vh, 1rem); /* Adaptive spacing based on screen size */
          }
        }

        /* Landscape mode on mobile devices */
        @media (max-height: 500px) and (orientation: landscape) {
          .content-wrapper {
            padding-top: 20vh; /* Lower in landscape mode */
          }

          .unified-card {
            padding: clamp(0.8rem, 2vh, 1.2rem);
          }

          .social-links {
            gap: 0.5rem; /* More compact in landscape */
          }
        }
      `}</style>
    </div>
  );
};

export default GameContactCard;