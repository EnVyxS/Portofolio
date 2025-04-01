import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaTwitter } from 'react-icons/fa';
import SocialLink from '../components/SocialLink';

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
  // Sample social links data
  const socialLinks: SocialLink[] = [
    { 
      id: 'github', 
      name: 'GitHub', 
      url: 'https://github.com/yourusername', 
      icon: <FaGithub size={20} />, 
      color: '#6e5494', 
      hoverColor: '#8a6ac2' 
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      url: 'https://linkedin.com/in/yourusername', 
      icon: <FaLinkedin size={20} />, 
      color: '#0077B5', 
      hoverColor: '#0099e5' 
    },
    { 
      id: 'email', 
      name: 'Email', 
      url: 'mailto:your@email.com', 
      icon: <FaEnvelope size={20} />, 
      color: '#d44638', 
      hoverColor: '#ea5b4c' 
    },
    { 
      id: 'twitter', 
      name: 'Twitter', 
      url: 'https://twitter.com/yourusername', 
      icon: <FaTwitter size={20} />, 
      color: '#1DA1F2', 
      hoverColor: '#4db5f5' 
    }
  ];

  return (
    <motion.div
      className="game-contact-card-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '500px',
        width: '90%',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        className="game-contact-card"
        style={{
          width: '100%',
          padding: '2rem',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          borderRadius: '8px',
          border: '1px solid rgba(249, 115, 22, 0.6)',
          boxShadow: '0 0 25px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div 
          className="card-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            className="avatar"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid rgba(249, 115, 22, 0.6)',
              boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {/* Character placeholder with flaming border effect */}
            <div 
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1e293b',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#f97316',
                fontSize: '2rem',
                fontWeight: 'bold',
                fontFamily: '"Cinzel", serif',
              }}
            >
              G
            </div>
            
            {/* Animated border effect */}
            <div
              className="flaming-border"
              style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                borderRadius: '50%',
                background: 'conic-gradient(rgba(249, 115, 22, 0.6), rgba(249, 115, 22, 0), rgba(249, 115, 22, 0.6))',
                filter: 'blur(3px)',
                animation: 'rotate 4s linear infinite',
                zIndex: -1,
              }}
            />
          </div>
          
          <div className="character-info">
            <h2 
              style={{
                margin: '0 0 0.25rem',
                color: '#f1f5f9',
                fontSize: 'clamp(1.5rem, 4vw, 1.8rem)',
                fontWeight: 'bold',
                letterSpacing: '1px',
                fontFamily: '"Cinzel", serif',
              }}
            >
              Geralt
            </h2>
            <p 
              style={{
                margin: 0,
                color: '#cbd5e1',
                fontSize: '0.9rem',
                fontStyle: 'italic',
              }}
            >
              Software Engineer of Rivia
            </p>
          </div>
        </div>
        
        <div 
          className="card-content"
          style={{
            marginBottom: '1.5rem',
          }}
        >
          <div 
            className="attributes"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div 
              className="attribute"
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '4px',
                backdropFilter: 'blur(5px)',
              }}
            >
              <div 
                className="attribute-name"
                style={{
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                }}
              >
                EXPERIENCE
              </div>
              <div 
                className="attribute-value"
                style={{
                  fontSize: '1.5rem',
                  color: '#f97316',
                  fontWeight: 'bold',
                  fontFamily: '"Cinzel", serif',
                }}
              >
                5 YRS
              </div>
            </div>
            
            <div 
              className="attribute"
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '4px',
                backdropFilter: 'blur(5px)',
              }}
            >
              <div 
                className="attribute-name"
                style={{
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                }}
              >
                PROJECTS
              </div>
              <div 
                className="attribute-value"
                style={{
                  fontSize: '1.5rem',
                  color: '#f97316',
                  fontWeight: 'bold',
                  fontFamily: '"Cinzel", serif',
                }}
              >
                42+
              </div>
            </div>
          </div>
          
          <div 
            className="bio"
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '4px',
              marginBottom: '1.5rem',
              backdropFilter: 'blur(5px)',
            }}
          >
            <p 
              style={{
                margin: 0,
                color: '#e2e8f0',
                lineHeight: 1.6,
                fontSize: '0.95rem',
              }}
            >
              Seasoned software engineer with a focus on web development. Specializes in React, TypeScript, and Node.js. Known for solving complex problems and delivering scalable solutions.
            </p>
          </div>
        </div>
        
        <div 
          className="social-links"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
          }}
        >
          {socialLinks.map(link => (
            <SocialLink
              key={link.id}
              name={link.name}
              url={link.url}
              icon={link.icon}
              color={link.color}
              hoverColor={link.hoverColor}
            />
          ))}
        </div>

        {/* Animated styles */}
        <style>
          {`
            @keyframes rotate {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    </motion.div>
  );
};

export default GameContactCard;