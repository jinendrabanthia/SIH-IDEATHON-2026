import React, { useState, useEffect } from 'react';

export interface PixelSwapProps {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  pixelSize?: number;
  gap?: number;
  pixelRadius?: number;
  pixelSpin?: number;
  pixelScale?: number;
  duration?: number;
  pixelDuration?: number;
  pattern?: string;
  randomness?: number;
  fade?: boolean;
  trigger?: 'click' | 'hover' | 'auto';
  onSwapComplete?: () => void;
}

export default function PixelSwap({
  firstContent,
  secondContent,
  duration = 1400,
  trigger = 'click',
  onSwapComplete,
}: PixelSwapProps) {
  const [swapped, setSwapped] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (trigger === 'auto' && !swapped && !animating) {
      handleSwap();
    }
  }, [trigger]);

  const handleSwap = () => {
    if (animating || swapped) return;
    setAnimating(true);
    
    // Simulate the duration of the pixel swap animation
    setTimeout(() => {
      setSwapped(true);
      setAnimating(false);
      if (onSwapComplete) {
        onSwapComplete();
      }
    }, duration);
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center cursor-pointer overflow-hidden"
      onClick={trigger === 'click' ? handleSwap : undefined}
      onMouseEnter={trigger === 'hover' ? handleSwap : undefined}
    >
      {/* 
        This is a CSS-based mock of the PixelSwap effect. 
        It uses a CSS blur and scale transition to simulate a distortion swap.
      */}
      <div 
        className="absolute inset-0 flex items-center justify-center transition-all ease-in-out"
        style={{
          transitionDuration: `${duration}ms`,
          opacity: swapped ? 0 : 1,
          filter: animating ? 'blur(20px) contrast(200%)' : 'blur(0px) contrast(100%)',
          transform: animating ? 'scale(1.2)' : 'scale(1)',
          zIndex: swapped ? 0 : 10,
        }}
      >
        {firstContent}
      </div>

      <div 
        className="absolute inset-0 flex items-center justify-center transition-all ease-in-out"
        style={{
          transitionDuration: `${duration}ms`,
          opacity: swapped ? 1 : 0,
          filter: (!swapped && animating) ? 'blur(20px) contrast(200%)' : 'blur(0px) contrast(100%)',
          transform: (!swapped && animating) ? 'scale(0.8)' : 'scale(1)',
          zIndex: swapped ? 10 : 0,
        }}
      >
        {secondContent}
      </div>
    </div>
  );
}
