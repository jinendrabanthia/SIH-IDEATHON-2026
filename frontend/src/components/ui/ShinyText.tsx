import React from 'react';

interface ShinyTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export default function ShinyText({ text, speed = 3, className = '' }: ShinyTextProps) {
  return (
    <span
      className={`inline-block text-transparent bg-clip-text ${className}`}
      style={{
        backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animation: `shine ${speed}s linear infinite`,
      }}
    >
      <style>{`
        @keyframes shine {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <span className="bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 text-transparent bg-clip-text">
        {text}
      </span>
    </span>
  );
}
