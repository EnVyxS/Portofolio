import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaWhatsapp, FaEnvelope, FaHeart } from "react-icons/fa";
import { GiMagicSwirl, GiBrain, GiServerRack } from "react-icons/gi";

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
  const [selectedMenu, setSelectedMenu] = useState<'social' | 'skills' | 'stats'>('social');
  const [activeSkillCategory, setActiveSkillCategory] = useState<string>('all');
  
  // Social links data
  const socialLinks: SocialLink[] = [
    {
      id: "github",
      name: "GitHub",
      url: "https://github.com/EnVyxS",
      icon: <FaGithub size="1.5em" />,
      color: "#f97316",
      hoverColor: "#fb923c"
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/diva-juan-nur-taqarrub",
      icon: <FaLinkedin size="1.5em" />,
      color: "#0077B5",
      hoverColor: "#0A85C9"
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      url: "https://wa.me/+62895380768824",
      icon: <FaWhatsapp size="1.5em" />,
      color: "#25D366",
      hoverColor: "#34E476"
    },
    {
      id: "email",
      name: "Email",
      url: "mailto:111202012560@mhs.dinus.ac.id?subject=JOB",
      icon: <FaEnvelope size="1.5em" />,
      color: "#EA4335",
      hoverColor: "#FB5246"
    }
  ];

  // Skills data
  const skills: Skill[] = [
    {
      id: "react",
      name: "React",
      level: 85,
      icon: <GiMagicSwirl />,
      category: 'frontend',
      color: "#61DAFB"
    },
    {
      id: "javascript",
      name: "JavaScript",
      level: 90,
      icon: <GiBrain />,
      category: 'frontend',
      color: "#F7DF1E"
    },
    {
      id: "typescript",
      name: "TypeScript",
      level: 80,
      icon: <GiBrain />,
      category: 'frontend',
      color: "#3178C6"
    },
    {
      id: "node",
      name: "Node.js",
      level: 75,
      icon: <GiServerRack />,
      category: 'backend',
      color: "#339933"
    },
    {
      id: "express",
      name: "Express",
      level: 78,
      icon: <GiServerRack />,
      category: 'backend',
      color: "#000000"
    },
    {
      id: "mongodb",
      name: "MongoDB",
      level: 70,
      icon: <GiServerRack />,
      category: 'database',
      color: "#47A248"
    },
    {
      id: "postgres",
      name: "PostgreSQL",
      level: 65,
      icon: <GiServerRack />,
      category: 'database',
      color: "#336791"
    }
  ];

  // Stats data
  const stats = {
    strength: 80,
    intelligence: 85,
    dexterity: 75,
    vitality: 70,
    experience: 65000,
    level: 15
  };

  // Filter skills based on selected category
  const filteredSkills = activeSkillCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === activeSkillCategory);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, delay: 0.3 }
    }
  };

  const menuItemVariants = {
    inactive: { 
      backgroundColor: "rgba(15, 23, 42, 0.5)",
      color: "rgba(255, 255, 255, 0.7)"
    },
    active: { 
      backgroundColor: "rgba(249, 115, 22, 0.2)",
      color: "#f97316",
      transition: { duration: 0.2 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  // XP progress calculation
  const calculateLevelProgress = () => {
    const baseXp = 10000;
    const xpForCurrentLevel = baseXp * stats.level;
    const xpForNextLevel = baseXp * (stats.level + 1);
    const currentLevelXp = stats.experience - xpForCurrentLevel;
    const requiredXp = xpForNextLevel - xpForCurrentLevel;
    return (currentLevelXp / requiredXp) * 100;
  };

  return (
    <motion.div 
      className="game-contact-card"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      {/* Character header */}
      <div className="character-header">
        <div className="character-info">
          <h2 className="character-name">Diva Juan</h2>
          <div className="character-title">Level {stats.level} Full Stack Developer</div>
          
          <div className="health-bar-container">
            <div className="health-icon"><FaHeart /></div>
            <div className="health-bar">
              <div className="health-bar-fill" style={{ width: `${stats.vitality}%` }}></div>
            </div>
            <div className="health-text">{stats.vitality}/100</div>
          </div>
          
          <div className="level-bar-container">
            <div className="level-bar">
              <div className="level-bar-fill" style={{ width: `${calculateLevelProgress()}%` }}></div>
            </div>
            <div className="level-text">
              XP: {stats.experience.toLocaleString()} / {((stats.level + 1) * 10000).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Menu tabs */}
      <div className="menu-tabs">
        <motion.button 
          className={`menu-tab ${selectedMenu === 'social' ? 'active' : ''}`}
          variants={menuItemVariants}
          animate={selectedMenu === 'social' ? 'active' : 'inactive'}
          onClick={() => setSelectedMenu('social')}
        >
          CONTACT
        </motion.button>
        
        <motion.button 
          className={`menu-tab ${selectedMenu === 'skills' ? 'active' : ''}`}
          variants={menuItemVariants}
          animate={selectedMenu === 'skills' ? 'active' : 'inactive'}
          onClick={() => setSelectedMenu('skills')}
        >
          SKILLS
        </motion.button>
        
        <motion.button 
          className={`menu-tab ${selectedMenu === 'stats' ? 'active' : ''}`}
          variants={menuItemVariants}
          animate={selectedMenu === 'stats' ? 'active' : 'inactive'}
          onClick={() => setSelectedMenu('stats')}
        >
          STATS
        </motion.button>
      </div>

      {/* Content area */}
      <div className="card-content">
        {/* Social Links */}
        {selectedMenu === 'social' && (
          <motion.div 
            className="social-links"
            initial="hidden"
            animate="visible"
            variants={contentVariants}
          >
            <div className="content-header">
              <h3>Contact Portals</h3>
              <div className="content-description">Select a magical portal to connect</div>
            </div>
            
            {socialLinks.map((link) => (
              <motion.a 
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-item"
                whileHover={{ 
                  backgroundColor: "rgba(30, 30, 35, 0.9)",
                  x: 5,
                  transition: { duration: 0.2 }
                }}
                style={{
                  borderLeft: `3px solid ${link.color}`
                }}
              >
                <div className="social-icon" style={{ color: link.color }}>
                  {link.icon}
                </div>
                <div className="social-name">{link.name}</div>
                <div className="social-arrow">→</div>
              </motion.a>
            ))}
          </motion.div>
        )}

        {/* Skills */}
        {selectedMenu === 'skills' && (
          <motion.div 
            className="skills-section"
            initial="hidden"
            animate="visible"
            variants={contentVariants}
          >
            <div className="content-header">
              <h3>Developer Skills</h3>
              <div className="content-description">Abilities earned through quests</div>
            </div>
            
            <div className="skill-filters">
              <button 
                className={`skill-filter ${activeSkillCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveSkillCategory('all')}
              >
                All
              </button>
              <button 
                className={`skill-filter ${activeSkillCategory === 'frontend' ? 'active' : ''}`}
                onClick={() => setActiveSkillCategory('frontend')}
              >
                Frontend
              </button>
              <button 
                className={`skill-filter ${activeSkillCategory === 'backend' ? 'active' : ''}`}
                onClick={() => setActiveSkillCategory('backend')}
              >
                Backend
              </button>
              <button 
                className={`skill-filter ${activeSkillCategory === 'database' ? 'active' : ''}`}
                onClick={() => setActiveSkillCategory('database')}
              >
                Database
              </button>
            </div>
            
            <div className="skills-grid">
              {filteredSkills.map((skill) => (
                <div key={skill.id} className="skill-item">
                  <div className="skill-header">
                    <div className="skill-icon" style={{ color: skill.color }}>{skill.icon}</div>
                    <div className="skill-name">{skill.name}</div>
                    <div className="skill-level">Lv.{Math.floor(skill.level / 10)}</div>
                  </div>
                  <div className="skill-bar-container">
                    <div className="skill-bar">
                      <div 
                        className="skill-bar-fill" 
                        style={{ 
                          width: `${skill.level}%`,
                          backgroundColor: skill.color
                        }}
                      ></div>
                    </div>
                    <div className="skill-value">{skill.level}/100</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        {selectedMenu === 'stats' && (
          <motion.div 
            className="stats-section"
            initial="hidden"
            animate="visible"
            variants={contentVariants}
          >
            <div className="content-header">
              <h3>Character Stats</h3>
              <div className="content-description">Core attributes and abilities</div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-name">Strength</div>
                <div className="stat-bar-container">
                  <div className="stat-bar">
                    <div 
                      className="stat-bar-fill" 
                      style={{ 
                        width: `${stats.strength}%`,
                        backgroundColor: "#e11d48"
                      }}
                    ></div>
                  </div>
                  <div className="stat-value">{stats.strength}</div>
                </div>
                <div className="stat-description">Problem-solving power</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-name">Intelligence</div>
                <div className="stat-bar-container">
                  <div className="stat-bar">
                    <div 
                      className="stat-bar-fill" 
                      style={{ 
                        width: `${stats.intelligence}%`,
                        backgroundColor: "#3b82f6"
                      }}
                    ></div>
                  </div>
                  <div className="stat-value">{stats.intelligence}</div>
                </div>
                <div className="stat-description">Learning and memory</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-name">Dexterity</div>
                <div className="stat-bar-container">
                  <div className="stat-bar">
                    <div 
                      className="stat-bar-fill" 
                      style={{ 
                        width: `${stats.dexterity}%`,
                        backgroundColor: "#22c55e"
                      }}
                    ></div>
                  </div>
                  <div className="stat-value">{stats.dexterity}</div>
                </div>
                <div className="stat-description">Coding speed and accuracy</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-name">Vitality</div>
                <div className="stat-bar-container">
                  <div className="stat-bar">
                    <div 
                      className="stat-bar-fill" 
                      style={{ 
                        width: `${stats.vitality}%`,
                        backgroundColor: "#f59e0b"
                      }}
                    ></div>
                  </div>
                  <div className="stat-value">{stats.vitality}</div>
                </div>
                <div className="stat-description">Project endurance</div>
              </div>
            </div>
            
            <div className="character-achievements">
              <h4 className="achievements-header">Achievements</h4>
              <ul className="achievements-list">
                <li className="achievement-item">
                  <span className="achievement-icon">🏆</span>
                  <span className="achievement-name">Master of React</span>
                </li>
                <li className="achievement-item">
                  <span className="achievement-icon">🏆</span>
                  <span className="achievement-name">CSS Wizard</span>
                </li>
                <li className="achievement-item">
                  <span className="achievement-icon">🏆</span>
                  <span className="achievement-name">Database Conqueror</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        .game-contact-card {
          width: 100%;
          max-width: 500px;
          margin: 2rem auto;
          z-index: 20;
        }
        
        .character-header {
          background-color: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(10px);
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          padding: 1.25rem;
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-bottom: 2px solid #f97316;
        }
        
        .character-name {
          color: #f97316;
          font-family: 'VT323', monospace;
          font-size: 1.75rem;
          margin: 0 0 0.3rem 0;
          text-shadow: 0 0 5px rgba(249, 115, 22, 0.5);
          letter-spacing: 1px;
        }
        
        .character-title {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        
        .health-bar-container, .level-bar-container {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .health-icon {
          color: #ef4444;
          margin-right: 0.5rem;
          font-size: 1.2rem;
        }
        
        .health-bar, .level-bar {
          height: 8px;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          flex-grow: 1;
          overflow: hidden;
          margin-right: 0.5rem;
        }
        
        .health-bar-fill {
          height: 100%;
          background-color: #ef4444;
          border-radius: 4px;
        }
        
        .level-bar-fill {
          height: 100%;
          background-color: #f97316;
          border-radius: 4px;
        }
        
        .health-text, .level-text {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .menu-tabs {
          display: flex;
          background-color: rgba(15, 23, 42, 0.7);
        }
        
        .menu-tab {
          flex: 1;
          padding: 0.75rem 0;
          font-family: 'VT323', monospace;
          background: none;
          border: none;
          font-size: 0.9rem;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(249, 115, 22, 0.2);
          color: rgba(255, 255, 255, 0.7);
        }
        
        .menu-tab.active {
          background-color: rgba(249, 115, 22, 0.2);
          color: #f97316;
          border-bottom: 2px solid #f97316;
        }
        
        .card-content {
          background-color: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(10px);
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          padding: 1.25rem;
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-top: none;
          min-height: 300px;
        }
        
        .content-header {
          margin-bottom: 1.25rem;
        }
        
        .content-header h3 {
          color: #f97316;
          font-family: 'VT323', monospace;
          margin: 0 0 0.3rem 0;
          font-size: 1.25rem;
          text-shadow: 0 0 5px rgba(249, 115, 22, 0.3);
        }
        
        .content-description {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        /* Social Links Styles */
        .social-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .social-link-item {
          display: flex;
          align-items: center;
          padding: 0.85rem 1rem;
          background-color: rgba(20, 20, 25, 0.5);
          border-radius: 4px;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .social-icon {
          margin-right: 1rem;
        }
        
        .social-name {
          flex-grow: 1;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
        }
        
        .social-arrow {
          color: rgba(255, 255, 255, 0.5);
          font-size: 1.1rem;
        }
        
        /* Skills Styles */
        .skill-filters {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        
        .skill-filter {
          padding: 0.4rem 0.75rem;
          background-color: rgba(20, 20, 25, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .skill-filter.active {
          background-color: rgba(249, 115, 22, 0.2);
          color: #f97316;
          border-color: rgba(249, 115, 22, 0.3);
        }
        
        .skills-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        
        .skill-item {
          background-color: rgba(20, 20, 25, 0.5);
          border-radius: 4px;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .skill-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .skill-icon {
          margin-right: 0.75rem;
          font-size: 1.1rem;
        }
        
        .skill-name {
          flex-grow: 1;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
        }
        
        .skill-level {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          background-color: rgba(0, 0, 0, 0.2);
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
        }
        
        .skill-bar-container {
          display: flex;
          align-items: center;
        }
        
        .skill-bar {
          height: 6px;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
          flex-grow: 1;
          overflow: hidden;
          margin-right: 0.5rem;
        }
        
        .skill-bar-fill {
          height: 100%;
          border-radius: 3px;
        }
        
        .skill-value {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }
        
        /* Stats Styles */
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
          margin-bottom: 1.5rem;
        }
        
        .stat-item {
          background-color: rgba(20, 20, 25, 0.5);
          border-radius: 4px;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .stat-name {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          margin-bottom: 0.4rem;
        }
        
        .stat-bar-container {
          display: flex;
          align-items: center;
          margin-bottom: 0.4rem;
        }
        
        .stat-bar {
          height: 6px;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
          flex-grow: 1;
          overflow: hidden;
          margin-right: 0.5rem;
        }
        
        .stat-bar-fill {
          height: 100%;
          border-radius: 3px;
        }
        
        .stat-value {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .stat-description {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .character-achievements {
          background-color: rgba(20, 20, 25, 0.5);
          border-radius: 4px;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .achievements-header {
          color: #f97316;
          font-size: 1rem;
          margin: 0 0 0.6rem 0;
        }
        
        .achievements-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .achievement-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.4rem;
        }
        
        .achievement-icon {
          margin-right: 0.6rem;
        }
        
        .achievement-name {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
        }
        
        @media (max-width: 640px) {
          .game-contact-card {
            margin: 1.5rem auto;
          }
          
          .character-header,
          .card-content {
            padding: 1rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default GameContactCard;