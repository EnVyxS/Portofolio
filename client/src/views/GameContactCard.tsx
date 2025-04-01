import React from 'react';
import { FaGithub, FaLinkedin, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { 
  SiReact, SiNodedotjs, SiJavascript, SiTypescript, 
  SiMongodb, SiPostgresql, SiExpress, SiNestjs 
} from 'react-icons/si';
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
  // Social links data
  const socialLinks: SocialLink[] = [
    {
      id: 'github',
      name: 'GitHub',
      url: 'https://github.com/yourusername',
      icon: <FaGithub />,
      color: '#E2711D',
      hoverColor: '#FF5722',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/yourusername',
      icon: <FaLinkedin />,
      color: '#3282F6',
      hoverColor: '#60A5FA',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      url: 'https://wa.me/yourphonenumber',
      icon: <FaWhatsapp />,
      color: '#10B981',
      hoverColor: '#34D399',
    },
    {
      id: 'email',
      name: 'Email',
      url: 'mailto:your.email@example.com',
      icon: <FaEnvelope />,
      color: '#F43F5E',
      hoverColor: '#FB7185',
    },
  ];

  return (
    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="flex justify-center">
        <div className="flex flex-col items-center">
          {/* Social links positioned vertically in the center */}
          <div className="p-2 space-y-3">
            {socialLinks.map((link) => (
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
        </div>
      </div>
    </div>
  );
};

export default GameContactCard;