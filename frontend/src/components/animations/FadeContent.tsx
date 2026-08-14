import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface FadeContentProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

export function FadeContent({ children, delay = 0, direction = 'up', className = '', style }: FadeContentProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const getInitialY = () => {
    if (direction === 'up') return 30;
    if (direction === 'down') return -30;
    return 0;
  };

  const getInitialX = () => {
    if (direction === 'left') return 30;
    if (direction === 'right') return -30;
    return 0;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: getInitialY(), x: getInitialX() }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
