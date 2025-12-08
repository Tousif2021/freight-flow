import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LivePulseIndicatorProps {
  className?: string;
  color?: 'primary' | 'success' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const LivePulseIndicator: React.FC<LivePulseIndicatorProps> = ({ 
  className,
  color = 'success',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: { dot: 'w-2 h-2', ring1: 'w-4 h-4', ring2: 'w-6 h-6' },
    md: { dot: 'w-2.5 h-2.5', ring1: 'w-5 h-5', ring2: 'w-7 h-7' },
    lg: { dot: 'w-3 h-3', ring1: 'w-6 h-6', ring2: 'w-9 h-9' },
  };

  const colorClasses = {
    primary: { dot: 'bg-primary', ring: 'border-primary' },
    success: { dot: 'bg-success', ring: 'border-success' },
    destructive: { dot: 'bg-red-500', ring: 'border-red-500' },
  };

  const sizes = sizeClasses[size];
  const colors = colorClasses[color];

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Center dot */}
      <motion.div
        className={cn("rounded-full z-10", sizes.dot, colors.dot)}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      
      {/* Inner pulse ring */}
      <motion.div
        className={cn("absolute rounded-full border-2 opacity-60", sizes.ring1, colors.ring)}
        animate={{ 
          scale: [0.8, 1.3, 0.8],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* Outer pulse ring */}
      <motion.div
        className={cn("absolute rounded-full border opacity-40", sizes.ring2, colors.ring)}
        animate={{ 
          scale: [0.8, 1.5, 0.8],
          opacity: [0.4, 0, 0.4]
        }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
    </div>
  );
};

export default LivePulseIndicator;