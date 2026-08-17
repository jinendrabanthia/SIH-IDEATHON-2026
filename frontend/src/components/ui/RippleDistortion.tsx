import React, { useState } from 'react';

export interface RippleDistortionProps {
  src: string;
  brushSize?: number;
  strength?: number;
  swirl?: number;
  rings?: number;
  grayscale?: boolean;
}

export default function RippleDistortion({
  src,
  brushSize = 150,
  strength = 0.2,
  swirl = 1,
  rings = 4,
  grayscale = false,
}: RippleDistortionProps) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // This is a simplified CSS-based mock of the WebGL RippleDistortion effect.
  // It uses mask-image and filters to simulate a distortion/ripple around the cursor.
  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-300 ease-out"
        style={{
          backgroundImage: `url(${src})`,
          filter: `${grayscale ? 'grayscale(100%)' : ''} contrast(110%) brightness(0.8)`,
          transform: `scale(1.05) translate(${(50 - mousePos.x) * strength}px, ${(50 - mousePos.y) * strength}px)`,
        }}
      />
      
      {/* Ripple/Swirl Mock overlay */}
      <div 
        className="absolute w-[300px] h-[300px] rounded-full pointer-events-none mix-blend-overlay opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
          left: `calc(${mousePos.x}% - 150px)`,
          top: `calc(${mousePos.y}% - 150px)`,
          transition: 'all 0.1s ease-out',
        }}
      />
    </div>
  );
}
