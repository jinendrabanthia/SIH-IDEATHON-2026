import React, { useState, useEffect } from 'react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export function SplitText({ text, className = '', delay = 0, style }: SplitTextProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay * 1000 + 100);
    return () => clearTimeout(timer);
  }, [delay]);

  const words = text.split(' ');

  return (
    <span className={className} style={style} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(16px)',
            transition: `opacity 0.45s ease ${delay + i * 0.06}s, transform 0.45s ease ${delay + i * 0.06}s`,
            marginRight: i < words.length - 1 ? '0.25em' : 0,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
