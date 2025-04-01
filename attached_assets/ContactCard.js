import React, { useEffect, useRef } from "react";
import SocialLink from "./SocialLink";
import { FaGithub, FaLinkedin, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import { gsap } from "gsap";

const ContactCard = () => {
  const cardRef = useRef(null);
  const headerRef = useRef(null);

  // GSAP animation for card movement - dibuat lebih responsif dengan viewport height
  useEffect(() => {
    // Gunakan nilai relatif berdasarkan tinggi viewport untuk pergerakan yang konsisten
    const setResponsiveAnimation = () => {
      const vhUnit = window.innerHeight / 100; // 1vh dalam pixel
      const cardMovement = Math.min(5, vhUnit * 0.5); // Maksimal 5px atau 0.5vh
      
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          y: cardMovement, // Pergerakan responsif
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
  
      // Separate animation for header
      if (headerRef.current) {
        gsap.to(headerRef.current, {
          y: cardMovement * 0.6, // Lebih halus, sekitar 60% dari pergerakan card
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.5, // Offset dari animasi card
        });
      }
    };

    // Set animasi awal
    setResponsiveAnimation();
    
    // Perbarui animasi saat ukuran layar berubah
    window.addEventListener('resize', setResponsiveAnimation);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setResponsiveAnimation);
    };
  }, []);

  // Social media links data
  const socialLinks = [
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

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 12,
        delay: 0.1,
      },
    },
  };

  return (
    <div className="layout-container">
      {/* Main container with proper structure */}
      <div className="content-wrapper">
        {/* Profile header component */}
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
                icon={React.cloneElement(link.icon, { 
                  size: "clamp(18px, 5vw, 24px)" // Ukuran icon responsif
                })}
                color={link.color}
                hoverColor={link.hoverColor}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
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
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(8px);
          border-radius: 15px;
          padding: clamp(1.2rem, 3vw, 2rem) clamp(1.2rem, 3vw, 1.7rem); /* Padding responsif */
          max-width: min(400px, 90%); /* Width responsif, lebih kecil pada layar kecil */
          width: 100%;
          box-shadow:
            0 8px 20px rgba(0, 0, 0, 0.5),
            0 0 15px rgba(249, 115, 22, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          margin: 0 auto;
          z-index: 30;
          touch-action: manipulation; /* Sentuhan yang lebih responsif */
          -webkit-tap-highlight-color: transparent; /* Menghilangkan highlight default browser mobile */
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

        /* Header section within the card */
        .card-header {
          text-align: center;
          width: 100%;
          margin-bottom: 1.5rem;
        }

        /* Divider between header and social links */
        .card-divider {
          width: 85%;
          height: 1px;
          background: linear-gradient(
            90deg,
            rgba(249, 115, 22, 0.1),
            rgba(249, 115, 22, 0.4),
            rgba(249, 115, 22, 0.1)
          );
          margin: 0.5rem 0 1.5rem 0;
        }

        .name {
          font-size: 2.2rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(90deg, #f97316, #fb923c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .title {
          color: #f1f5f9;
          font-size: 1.1rem;
          margin-top: 0.5rem;
          font-weight: 400;
          opacity: 0.9;
        }

        .social-links {
          display: flex;
          flex-direction: column;
          gap: 1.5rem; /* Increased spacing between links */
          width: 100%;
          margin-bottom: 1.2rem; /* Reduced bottom margin */
        }

        .copyright {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          margin-top: 1rem;
          width: 100%;
        }

        /* Media query lebih sederhana dengan penggunaan clamp dan rem/vh yang konsisten */
        @media (max-width: 768px) {
          .content-wrapper {
            padding-top: clamp(30vh, 36vh, 40vh); /* Responsif berbasis viewport height */
          }
        }

        @media (max-width: 640px) {
          .social-links {
            gap: clamp(0.6rem, 2vh, 1rem); /* Jarak adaptif berdasarkan ukuran layar */
          }
        }

        /* Mode landscape di perangkat mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .content-wrapper {
            padding-top: 20vh; /* Lebih rendah di mode landscape */
          }

          .unified-card {
            padding: clamp(0.8rem, 2vh, 1.2rem);
          }

          .social-links {
            gap: 0.5rem; /* Lebih compact di landscape */
          }
        }
      `}</style>
    </div>
  );
};

export default ContactCard;
