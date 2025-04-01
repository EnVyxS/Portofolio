import React, { useState, useEffect } from 'react';
// Gunakan path relatif
import gifPath from '/assets/darksouls.gif';

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
  const [isZoomingIn, setIsZoomingIn] = useState(true);
  
  // Efek zoom in saat pertama kali masuk ke halaman
  useEffect(() => {
    setIsZoomingIn(true);
    // Setelah animasi selesai, atur zoomingIn ke false
    const timer = setTimeout(() => {
      setIsZoomingIn(false);
    }, 1500); // Durasi zoom in dalam milidetik
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Create floating embers effect
    const generateEmbers = () => {
      const newEmbers: Ember[] = [];
      const emberCount = 15; // Number of embers
      
      for (let i = 0; i < emberCount; i++) {
        newEmbers.push({
          id: i,
          size: Math.random() * 4 + 2, // 2-6px
          positionX: Math.random() * 100, // 0-100%
          duration: Math.random() * 5 + 5, // 5-10s
          delay: Math.random() * 5 // 0-5s
        });
      }
      
      setEmbers(newEmbers);
    };
    
    generateEmbers();
    
    // Regenerate embers every 10 seconds
    const interval = setInterval(generateEmbers, 10000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Dark background with gif overlay */}
      <div 
        className={`absolute inset-0 z-0 bg-black transition-transform ${isZoomingIn ? 'zoom-in-effect' : ''}`}
        style={{
          backgroundImage: `url(${gifPath})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.6) contrast(1.2)'
        }}
      />
      
      {/* Animated embers/particles */}
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute bottom-0 rounded-full z-10 opacity-70"
          style={{
            left: `${ember.positionX}%`,
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            backgroundColor: `rgba(${255}, ${165 + Math.random() * 30}, ${50 + Math.random() * 30}, ${0.7 + Math.random() * 0.3})`,
            boxShadow: `0 0 ${ember.size * 2}px rgba(255, 165, 0, 0.8)`,
            animation: `float ${ember.duration}s ease-in infinite ${ember.delay}s`,
          }}
        />
      ))}
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0 z-20"
        style={{
          background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.7) 100%)',
          pointerEvents: 'none'
        }}
      />
      
      {/* Transition overlay yang akan menghilang */}
      <div className={`absolute inset-0 z-25 transition-opacity ${isZoomingIn ? 'transition-overlay' : 'opacity-0'}`} />
      
      {/* Content */}
      <div className="relative z-30 w-full h-full">
        {children}
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-80vh);
            opacity: 0;
          }
        }
        
        .zoom-in-effect {
          animation: zoomIn 1.5s ease-out forwards;
        }
        
        @keyframes zoomIn {
          0% {
            transform: scale(0.6);
            filter: brightness(0.3) contrast(1) blur(4px);
          }
          100% {
            transform: scale(1);
            filter: brightness(0.6) contrast(1.2) blur(0px);
          }
        }
        
        .transition-overlay {
          background-color: black;
          opacity: 1;
          animation: fadeOut 1.5s ease-out forwards;
        }
        
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          30% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
          }
        }
        `
      }} />
    </div>
  );
};

export default GifBackground;