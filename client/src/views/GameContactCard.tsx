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
        {/* Unified card component containing both header and links */}
        <motion.div
          ref={cardRef}
          className="unified-card"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          whileHover={{
            boxShadow: "0 5px 15px rgba(249, 115, 22, 0.1)", // Efek glow lebih minimal
            scale: 1.01, // Sangat sedikit membesar
          }}
          transition={{ duration: 0.6 }}
        >
          {/* Social links section */}
          <motion.div className="social-links" variants={itemVariants}>
            {socialLinks.map((link) => (
              <SocialLink
                key={link.id}
                name={link.name}
                url={link.url}
                icon={React.cloneElement(link.icon as React.ReactElement, { 
                  size: "clamp(16px, 4vw, 20px)" // Ukuran ikon lebih kecil
                })}
                color={link.color}
                hoverColor={link.hoverColor}
              />
            ))}
          </motion.div>
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
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          padding-top: 10vh; /* Positioned even lower to avoid RPG dialog box overlap */
        }

        /* Unified card that contains all elements */
        .unified-card {
          background: rgba(15, 23, 42, 0.2); /* Sangat transparan untuk menampilkan background */
          border: 1px solid rgba(249, 115, 22, 0.1); /* Border sangat halus dengan aksen api */
          backdrop-filter: blur(2px); /* Blur lebih halus */
          opacity: 0.2; /* Opacity sangat rendah seperti diminta */
          border-radius: 8px; /* Border radius lebih kecil untuk gaya game */
          padding: clamp(0.8rem, 2vw, 1.5rem) clamp(0.8rem, 2vw, 1.2rem); /* Responsive padding dikurangi */
          max-width: min(350px, 85%); /* Ukuran maksimal lebih kecil */
          width: 100%;
          box-shadow:
            0 8px 20px rgba(0, 0, 0, 0.15),
            0 0 15px rgba(249, 115, 22, 0.1);
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
          gap: 0.8rem; /* Spacing antara link dikurangi */
          width: 100%;
          margin-bottom: 0.8rem; /* Bottom margin dikurangi */
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