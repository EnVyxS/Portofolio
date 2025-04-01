import React from 'react';
import { useAudio } from '../context/AudioContext';

interface ApproachScreenProps {
  onApproach: () => void;
}

const ApproachScreen: React.FC<ApproachScreenProps> = ({ onApproach }) => {
  const { setHasInteracted } = useAudio();

  const handleApproach = () => {
    setHasInteracted(true);
    onApproach();
  };

  return (
    <div 
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer w-full h-full"
      onClick={handleApproach}
    >
      <div className="text-center">
        <h1 
          className="text-3xl md:text-5xl text-amber-500 font-serif tracking-wider opacity-80 hover:opacity-100 transition-all duration-500"
          style={{ 
            textShadow: '0 0 10px rgba(255, 165, 0, 0.7)',
            animation: 'pulse 2s infinite'
          }}
        >
          Approach Him
        </h1>
        <p className="text-gray-500 mt-4 text-sm md:text-base italic">Click anywhere to continue</p>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse {
          0% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
        }
        `
      }} />
    </div>
  );
};

export default ApproachScreen;