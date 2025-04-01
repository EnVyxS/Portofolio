import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import darksoulsGif from '../assets/darksouls.gif';

interface GifBackgroundProps {
  children: React.ReactNode;
}

interface Ember {
  id: number;
  size: number;
  positionX: number;
  duration: number;
  delay: number;
}

const GifBackground: React.FC<GifBackgroundProps> = ({ children }) => {
  const [embers, setEmbers] = useState<Ember[]>([]);

  // Generate random embers for fire effect
  useEffect(() => {
    const generateEmbers = () => {
      const numberOfEmbers = 15 + Math.floor(Math.random() * 10); // 15-25 embers
      const newEmbers: Ember[] = [];
      
      for (let i = 0; i < numberOfEmbers; i++) {
        newEmbers.push({
          id: i,
          size: 2 + Math.random() * 6, // 2-8px size
          positionX: Math.random() * 100, // 0-100% of container width
          duration: 3 + Math.random() * 7, // 3-10s duration
          delay: Math.random() * 5, // 0-5s delay
        });
      }
      
      setEmbers(newEmbers);
    };
    
    // Initial generation
    generateEmbers();
    
    // Regenerate embers periodically for continuous effect
    const interval = setInterval(() => {
      generateEmbers();
    }, 8000); // Every 8 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="gif-background"
      style={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      {/* Dark Souls Bonfire GIF */}
      <div 
        className="gif-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${darksoulsGif})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      
      {/* Dark overlay */}
      <div 
        className="overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 100%)',
          zIndex: 1,
        }}
      />
      
      {/* Animated embers */}
      <div 
        className="embers-container" 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {embers.map(ember => (
            <motion.div
              key={`ember-${ember.id}-${Date.now()}`} // Ensure unique keys
              initial={{ 
                opacity: 0.7, 
                y: '100vh', 
                x: `${ember.positionX}vw`,
                scale: 1,
              }}
              animate={{ 
                opacity: [0.7, 0.5, 0.2, 0], 
                y: ['100vh', '0vh'], 
                x: `${ember.positionX + (Math.random() * 10 - 5)}vw`, // Slight horizontal drift
                scale: [1, 0.8, 0.5, 0.2],
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: ember.duration, 
                delay: ember.delay,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                bottom: 0,
                width: `${ember.size}px`,
                height: `${ember.size}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle at center, 
                              rgba(255,165,0,0.8) 0%, 
                              rgba(255,100,0,0.6) 40%, 
                              rgba(255,50,0,0.4) 70%, 
                              rgba(255,0,0,0.2) 100%)`,
                boxShadow: '0 0 6px rgba(255,165,0,0.8)',
                zIndex: 2,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Campfire light effect */}
      <div 
        className="campfire-light"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          height: '50vh',
          background: 'radial-gradient(ellipse at center, rgba(255,165,0,0.2) 0%, rgba(255,165,0,0.1) 40%, rgba(255,165,0,0) 70%)',
          filter: 'blur(30px)',
          zIndex: 1,
          animation: 'flicker 5s infinite alternate',
        }}
      />
      
      {/* Content container */}
      <div 
        className="content-container" 
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          width: '100%',
        }}
      >
        {children}
      </div>
      
      {/* CSS for animation */}
      <style>
        {`
          @keyframes flicker {
            0%, 18%, 22%, 25%, 53%, 57%, 100% {
              opacity: 0.8;
            }
            20%, 24%, 55% {
              opacity: 0.6;
            }
          }
        `}
      </style>
    </div>
  );
};

export default GifBackground;