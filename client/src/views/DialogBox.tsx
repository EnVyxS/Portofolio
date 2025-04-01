import React, { useState, useEffect } from 'react';
import DialogController from '../controllers/dialogController';
import { Button } from '@/components/ui/button';

interface DialogBoxProps {
  onDialogComplete?: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ onDialogComplete }) => {
  const [dialogText, setDialogText] = useState<string>('');
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(false);
  const [dialogController] = useState<DialogController>(DialogController.getInstance());
  
  useEffect(() => {
    // Start dialog when component mounts
    startDialog();
    
    return () => {
      // Cleanup typing on unmount
      dialogController.stopTyping();
    };
  }, []);
  
  const startDialog = () => {
    dialogController.startDialog((text, isComplete) => {
      setDialogText(text);
      setIsTypingComplete(isComplete);
    });
  };
  
  const handleNext = () => {
    // If still typing, skip to the end of current text
    if (!isTypingComplete) {
      dialogController.skipToFullText();
      return;
    }
    
    // Otherwise, go to next dialog
    dialogController.nextDialog((text, isComplete) => {
      setDialogText(text);
      setIsTypingComplete(isComplete);
      
      // If we've completed all dialog, call the complete callback
      if (isComplete && !text) {
        console.log('Dialog sequence completed');
        if (onDialogComplete) {
          onDialogComplete();
        }
      }
    });
  };
  
  const handlePrevious = () => {
    dialogController.previousDialog((text, isComplete) => {
      setDialogText(text);
      setIsTypingComplete(isComplete);
    });
  };
  
  return (
    <div className="absolute bottom-0 left-0 right-0 mx-auto mb-8 max-w-2xl px-4">
      <div 
        className="bg-black bg-opacity-80 border border-amber-900/50 p-5 rounded-md shadow-lg"
        style={{
          boxShadow: '0 0 20px rgba(255, 165, 0, 0.3)',
        }}
      >
        {/* Character name */}
        <div className="text-amber-500 font-semibold mb-2 text-lg">Geralt of Rivia</div>
        
        {/* Dialog text with typewriter effect */}
        <p className="text-gray-200 min-h-[80px]">{dialogText}</p>
        
        {/* Dialog controls */}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="text-amber-500 border-amber-900 hover:bg-amber-900/30 hover:text-amber-400"
          >
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="sm" 
            onClick={handleNext}
            className="text-amber-500 border-amber-900 hover:bg-amber-900/30 hover:text-amber-400"
          >
            {isTypingComplete ? 'Next' : 'Skip'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DialogBox;