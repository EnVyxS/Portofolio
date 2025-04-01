import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SocialLink from '../components/SocialLink';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaGlobe } from 'react-icons/fa';
import { SiReplit } from 'react-icons/si';

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
  const [activeTab, setActiveTab] = useState<'social' | 'skills'>('social');

  // Example social links
  const socialLinks: SocialLink[] = [
    {
      id: 'github',
      name: 'GitHub',
      url: 'https://github.com/yourusername',
      icon: <FaGithub />,
      color: '#f5f5f5',
      hoverColor: '#2d333b'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/yourusername',
      icon: <FaLinkedin />,
      color: '#0a66c2',
      hoverColor: '#004182'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      url: 'https://twitter.com/yourusername',
      icon: <FaTwitter />,
      color: '#1da1f2',
      hoverColor: '#0d8fd9'
    },
    {
      id: 'email',
      name: 'Email',
      url: 'mailto:your.email@example.com',
      icon: <FaEnvelope />,
      color: '#ea4335',
      hoverColor: '#c5221f'
    },
    {
      id: 'website',
      name: 'Website',
      url: 'https://yourwebsite.com',
      icon: <FaGlobe />,
      color: '#f97316',
      hoverColor: '#c2580f'
    },
    {
      id: 'replit',
      name: 'Replit',
      url: 'https://replit.com/@yourusername',
      icon: <SiReplit />,
      color: '#f26207',
      hoverColor: '#b94c06'
    }
  ];

  return (
    <motion.div
      className="game-contact-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1]
      }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '550px',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 165, 0, 0.3)',
        border: '1px solid rgba(255, 165, 0, 0.2)',
        background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(10, 15, 30, 0.95))',
        backdropFilter: 'blur(10px)',
        zIndex: 50,
      }}
    >
      {/* Header section */}
      <div 
        className="header"
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 165, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="title-area">
          <h2 
            style={{
              margin: 0,
              color: '#f1f5f9',
              fontSize: '1.5rem',
              fontWeight: 600,
              fontFamily: '"Cinzel", serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Witcher's Contact
          </h2>
          <p 
            style={{
              margin: '0.5rem 0 0',
              color: '#94a3b8',
              fontSize: '0.9rem',
            }}
          >
            Summon me for your software quests
          </p>
        </div>
        
        <div 
          className="character-level"
          style={{
            background: 'rgba(255, 165, 0, 0.2)',
            color: '#f97316',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          Senior Developer
        </div>
      </div>
      
      {/* Tabs navigation */}
      <div 
        className="tabs-navigation"
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 165, 0, 0.2)',
        }}
      >
        <button
          onClick={() => setActiveTab('social')}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            padding: '1rem',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'social' ? 600 : 400,
            color: activeTab === 'social' ? '#f97316' : '#94a3b8',
            cursor: 'pointer',
            position: 'relative',
            transition: 'color 0.3s ease',
          }}
        >
          Social Links
          {activeTab === 'social' && (
            <motion.div 
              layoutId="tab-indicator"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: '#f97316',
              }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            padding: '1rem',
            fontSize: '0.9rem',
            fontWeight: activeTab === 'skills' ? 600 : 400,
            color: activeTab === 'skills' ? '#f97316' : '#94a3b8',
            cursor: 'pointer',
            position: 'relative',
            transition: 'color 0.3s ease',
          }}
        >
          Skills & Abilities
          {activeTab === 'skills' && (
            <motion.div 
              layoutId="tab-indicator"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: '#f97316',
              }}
            />
          )}
        </button>
      </div>
      
      {/* Content area */}
      <div 
        className="content-area"
        style={{
          padding: '1.5rem',
        }}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'social' && (
            <motion.div
              key="social-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 
                style={{
                  margin: '0 0 1rem',
                  color: '#f1f5f9',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Connect with me
              </h3>
              
              <div 
                className="social-links-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                  gap: '1rem',
                  margin: '1.5rem 0',
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
              
              <div 
                className="quest-note"
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 165, 0, 0.1)',
                  border: '1px solid rgba(255, 165, 0, 0.2)',
                  borderRadius: '5px',
                  fontSize: '0.9rem',
                  color: '#d1d5db',
                  lineHeight: 1.6,
                }}
              >
                <p style={{ margin: 0 }}>
                  <span style={{ color: '#f97316', fontWeight: 600 }}>Quest Note:</span> I'm currently available for hire for your software development quests. Whether you need a full-stack witcher or specialized monster hunter, I'm ready to tackle your project challenges.
                </p>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'skills' && (
            <motion.div
              key="skills-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 
                style={{
                  margin: '0 0 1rem',
                  color: '#f1f5f9',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                My Witcher Skills
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Frontend Combat</h4>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  <SkillBar name="React & TypeScript" level={90} color="#61dafb" />
                  <SkillBar name="CSS & Animation" level={85} color="#e84c88" />
                  <SkillBar name="UI/UX Design" level={80} color="#a855f7" />
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Backend Alchemy</h4>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  <SkillBar name="Node.js & Express" level={85} color="#43853d" />
                  <SkillBar name="API Design" level={90} color="#0ea5e9" />
                  <SkillBar name="Authentication" level={75} color="#f97316" />
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Special Signs</h4>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  <SkillBar name="Testing & QA" level={70} color="#22c55e" />
                  <SkillBar name="Performance Optimization" level={75} color="#eab308" />
                  <SkillBar name="Git & DevOps" level={80} color="#e11d48" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer section */}
      <div 
        className="footer"
        style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 165, 0, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#94a3b8',
          fontSize: '0.8rem',
        }}
      >
        <span>Powered by React & Dark Souls</span>
        <span>© {new Date().getFullYear()} Your Name</span>
      </div>
    </motion.div>
  );
};

// Helper component for skill bars
const SkillBar: React.FC<{ name: string; level: number; color: string }> = ({ name, level, color }) => {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>{name}</span>
        <span style={{ color, fontSize: '0.85rem', fontWeight: 600 }}>{level}/100</span>
      </div>
      <div 
        style={{ 
          width: '100%', 
          height: '6px', 
          backgroundColor: 'rgba(30, 41, 59, 0.7)', 
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          style={{ 
            height: '100%', 
            backgroundColor: color,
            borderRadius: '3px',
          }}
        />
      </div>
    </div>
  );
};

export default GameContactCard;