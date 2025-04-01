import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const emberIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a new ember
  const createEmber = () => {
    // Only create embers if component is mounted and visible
    if (!containerRef.current) return;
    
    const containerId = Math.floor(Math.random() * 1000000);
    const size = Math.random() * 6 + 2; // Size between 2-8px
    const positionX = Math.random() * 100; // Position across the width (0-100%)
    const duration = Math.random() * 4 + 3; // Duration between 3-7 seconds
    const delay = Math.random() * 2; // Random delay up to 2 seconds
    
    const newEmber: Ember = {
      id: containerId,
      size,
      positionX,
      duration,
      delay
    };
    
    setEmbers(prev => [...prev, newEmber]);
    
    // Remove ember after it completes its animation (duration + delay + buffer)
    setTimeout(() => {
      setEmbers(prev => prev.filter(ember => ember.id !== containerId));
    }, (duration + delay + 1) * 1000);
  };

  // Setup ember generation interval
  useEffect(() => {
    // Create initial set of embers
    for (let i = 0; i < 10; i++) {
      createEmber();
    }
    
    // Continuously create new embers
    emberIntervalRef.current = setInterval(() => {
      createEmber();
    }, 300); // Create a new ember every 300ms
    
    return () => {
      if (emberIntervalRef.current) {
        clearInterval(emberIntervalRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="gif-background-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      {/* Dark Souls bonfire gif as background */}
      <div
        className="gif-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          backgroundImage: `url(${darksoulsGif})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.85,
        }}
      />
      
      {/* Overlay gradient for better visibility */}
      <div
        className="overlay-gradient"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
          zIndex: 1,
        }}
      />
      
      {/* Floating embers animation */}
      {embers.map(ember => (
        <motion.div
          key={ember.id}
          className="ember"
          initial={{ 
            x: `${ember.positionX}%`, 
            y: '100%', 
            opacity: 0.3,
            scale: 0.5,
          }}
          animate={{ 
            y: '-20%', 
            opacity: [0.3, 0.8, 0.1],
            scale: [0.5, 1, 0.2],
            x: `calc(${ember.positionX}% + ${Math.sin(ember.id) * 50}px)`,
          }}
          transition={{ 
            duration: ember.duration,
            delay: ember.delay,
            ease: 'easeOut',
            times: [0, 0.7, 1],
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            borderRadius: '50%',
            backgroundColor: ember.size > 5 ? 'rgba(255, 165, 0, 0.8)' : 'rgba(255, 120, 0, 0.7)',
            boxShadow: `0 0 ${ember.size}px ${ember.size / 2}px rgba(255, 165, 0, 0.5)`,
            zIndex: 2,
          }}
        />
      ))}
      
      {/* Main content */}
      <div 
        className="content-container"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default GifBackground;