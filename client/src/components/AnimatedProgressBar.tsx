import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

interface AnimatedProgressBarProps {
  progress: number; // 0 to 1
  total: number;
  current: number;
  className?: string;
  showParticles?: boolean;
  height?: number;
  barColor?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  onComplete?: () => void;
  isAccessible?: boolean;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  total,
  current,
  className = '',
  showParticles = true,
  height = 10,
  barColor = 'linear-gradient(to right, rgba(255, 193, 7, 0.8), rgba(255, 215, 0, 1))',
  backgroundColor = 'rgba(30, 25, 15, 0.6)',
  showPercentage = true,
  onComplete,
  isAccessible = true
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [previousProgress, setPreviousProgress] = useState(progress);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const progressBarControls = useAnimationControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesEnabled = useRef(showParticles);
  const progressPercentage = Math.round(progress * 100);
  
  // For accessibility
  const progressText = `${current} out of ${total} achievements unlocked (${progressPercentage}% complete)`;

  useEffect(() => {
    // Detect if progress has increased
    if (progress > previousProgress) {
      // Trigger particle animation
      if (showParticles && containerRef.current) {
        generateParticles();
      }
      
      // Animate the progress bar
      setShouldAnimate(true);
      progressBarControls.start({
        width: `${progressPercentage}%`,
        transition: { duration: 1.2, ease: "easeOut" }
      });
      
      // Call onComplete if progress reached 100%
      if (progress === 1 && onComplete) {
        onComplete();
      }
    } else {
      // Just update the progress bar without animation
      progressBarControls.set({ width: `${progressPercentage}%` });
    }
    
    setPreviousProgress(progress);
  }, [progress, previousProgress, progressBarControls, onComplete, progressPercentage, showParticles]);

  // Generate celebration particles when progress increases
  const generateParticles = () => {
    if (!containerRef.current || !particlesEnabled.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    const particleCount = Math.min(Math.max(5, Math.floor(progress * 20)), 20); // 5-20 particles based on progress
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight
    }));
    
    setParticles(newParticles);
    
    // Clear particles after animation
    setTimeout(() => {
      setParticles([]);
    }, 1500);
  };

  return (
    <div 
      className={`animated-progress-container ${className}`}
      ref={containerRef}
      role={isAccessible ? "progressbar" : undefined}
      aria-valuenow={isAccessible ? progressPercentage : undefined}
      aria-valuemin={isAccessible ? 0 : undefined}
      aria-valuemax={isAccessible ? 100 : undefined}
      aria-label={isAccessible ? progressText : undefined}
    >
      {isAccessible && (
        <div className="sr-only">
          {progressText}
        </div>
      )}
      
      <div 
        className="progress-bar-labels"
        aria-hidden="true"
      >
        <span className="progress-title">Achievement Progress</span>
        <span className="progress-count">
          {current}/{total}
        </span>
      </div>
      
      <div 
        className="progress-bar-bg"
        style={{ 
          height: `${height}px`,
          background: backgroundColor
        }}
        aria-hidden="true"
      >
        <motion.div 
          className="progress-bar-fill"
          style={{ 
            background: barColor,
            height: '100%'
          }}
          initial={{ width: `${previousProgress * 100}%` }}
          animate={progressBarControls}
        >
          <div className="progress-shine"></div>
        </motion.div>
      </div>
      
      {showPercentage && (
        <div 
          className="progress-percentage"
          aria-hidden="true"
        >
          {progressPercentage}% Complete
        </div>
      )}
      
      {/* Particle effects */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="celebration-particle"
          initial={{ 
            x: particle.x,
            y: containerRef.current ? containerRef.current.offsetHeight / 2 : 0,
            scale: 0,
            opacity: 0.8
          }}
          animate={{
            y: [null, particle.y - 20, particle.y - 40],
            x: [null, particle.x - 10, particle.x + 10],
            scale: [0, 1, 0],
            opacity: [0.8, 1, 0],
          }}
          transition={{
            duration: 1 + Math.random() * 0.5,
            ease: "easeOut"
          }}
          aria-hidden="true"
        />
      ))}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .animated-progress-container {
          position: relative;
          width: 100%;
          overflow: visible;
          padding: 0 0 20px;
        }
        
        .progress-bar-labels {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        
        .progress-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 215, 0, 0.9);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .progress-count {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255, 215, 0, 0.8);
          background: linear-gradient(to bottom, rgba(255, 215, 0, 0.9), rgba(255, 180, 0, 0.7));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .progress-bar-bg {
          width: 100%;
          background: rgba(30, 25, 15, 0.6);
          border-radius: 5px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 215, 0, 0.3);
        }
        
        .progress-bar-fill {
          height: 100%;
          width: 0;
          border-radius: 5px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
        }
        
        .progress-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, 0.3) 50%, 
            rgba(255, 255, 255, 0) 100%
          );
          animation: progressShine 3s infinite;
        }
        
        @keyframes progressShine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .progress-percentage {
          text-align: center;
          font-size: 12px;
          color: rgba(255, 215, 0, 0.7);
          margin-top: 5px;
          font-weight: 500;
        }
        
        .celebration-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: radial-gradient(circle at center, rgba(255, 215, 0, 1), rgba(255, 165, 0, 0.8));
          border-radius: 50%;
          pointer-events: none;
          z-index: 10;
          box-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}} />
    </div>
  );
};

export default AnimatedProgressBar;