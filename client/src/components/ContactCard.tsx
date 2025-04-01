import React from "react";
import { motion } from "framer-motion";
import SocialLink from "./SocialLink";
import { FaGithub, FaLinkedin, FaWhatsapp, FaEnvelope } from "react-icons/fa";

const ContactCard: React.FC = () => {
  // List of social links with their respective icons and colors
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/EnVyxS",
      icon: <FaGithub size="1.5em" />,
      color: "#f97316",
      hoverColor: "#fb923c"
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/diva-juan-nur-taqarrub",
      icon: <FaLinkedin size="1.5em" />,
      color: "#0077B5",
      hoverColor: "#0A85C9"
    },
    {
      name: "WhatsApp",
      url: "https://wa.me/+62895380768824",
      icon: <FaWhatsapp size="1.5em" />,
      color: "#25D366",
      hoverColor: "#34E476"
    },
    {
      name: "Email",
      url: "mailto:111202012560@mhs.dinus.ac.id?subject=JOB",
      icon: <FaEnvelope size="1.5em" />,
      color: "#EA4335",
      hoverColor: "#FB5246"
    }
  ];

  // Animation variants for the card container
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        delay: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  // Animation variants for each social link
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      className="contact-card"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <div className="card-content">
        {/* Card header with orange accent line */}
        <div className="accent-line"></div>
        
        {/* Social links container */}
        <div className="social-links">
          {socialLinks.map((link, index) => (
            <motion.div key={link.name} variants={itemVariants}>
              <SocialLink 
                name={link.name}
                url={link.url}
                icon={link.icon}
                color={link.color}
                hoverColor={link.hoverColor}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .contact-card {
          width: 100%;
          max-width: 450px;
          margin: 0 auto;
          padding: 1rem;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .card-content {
          background-color: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          width: 100%;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .card-content:hover {
          box-shadow: 0 15px 30px rgba(249, 115, 22, 0.2);
        }
        
        .accent-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(to right, #f97316, #fb923c);
        }
        
        .social-links {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        
        @media (max-width: 640px) {
          .contact-card {
            padding: 0.5rem;
          }
          
          .card-content {
            padding: 1.25rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ContactCard;
