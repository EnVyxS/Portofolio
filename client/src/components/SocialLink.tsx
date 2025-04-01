import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface SocialLinkProps {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({
  name,
  url,
  icon,
  color,
  hoverColor
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center mb-2 transition-all duration-300 hover:translate-x-1 relative group",
        isHovered ? "glitch" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        color: isHovered ? hoverColor : color,
      }}
    >
      <div className="mr-2 text-lg">{icon}</div>
      
      <span className="relative text-sm">
        {name}
        
        {/* Horizontal line that extends on hover */}
        <span 
          className="absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
          style={{ backgroundColor: hoverColor }}
        />
      </span>
      
      {/* Glitch effect only appears on hover */}
      {isHovered && (
        <>
          <span 
            className="absolute top-0 left-0 w-full h-full"
            style={{
              textShadow: `1px 0 0 rgba(255,0,0,0.5), -1px 0 0 rgba(0,255,255,0.5)`,
              animation: 'glitch 0.3s infinite',
              opacity: 0.7,
            }}
          >
            <div className="mr-2 text-lg">{icon}</div>
            <span>{name}</span>
          </span>
        </>
      )}
      
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-1px, 1px);
          }
          40% {
            transform: translate(-1px, -1px);
          }
          60% {
            transform: translate(1px, 1px);
          }
          80% {
            transform: translate(1px, -1px);
          }
          100% {
            transform: translate(0);
          }
        }
        `
      }} />
    </a>
  );
};

export default SocialLink;