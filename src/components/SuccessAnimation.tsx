import React from 'react';
import { motion } from 'framer-motion';
import { Truck, CheckCircle, Sparkles } from 'lucide-react';

const SuccessAnimation: React.FC<{
  trackingNumber: string;
  onContinue: () => void;
}> = ({ trackingNumber, onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <div className="text-center px-6 max-w-md">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 15,
            delay: 0.2 
          }}
          className="relative w-32 h-32 mx-auto mb-8"
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-50px)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.1 
                }}
              />
            ))}
          </motion.div>
          
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-success to-primary flex items-center justify-center shadow-glow-lg">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-14 h-14 text-primary-foreground" />
            </motion.div>
          </div>

          {/* Sparkles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0.5, 1, 0.5],
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.3 
              }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          ))}
        </motion.div>

        {/* Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-foreground mb-2"
        >
          Shipment Created!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-6"
        >
          Your freight is on its way. Tracking details have been sent to the receiver.
        </motion.p>

        {/* Tracking Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-4 mb-6 glow-effect"
        >
          <div className="text-xs text-muted-foreground mb-1">Tracking Number</div>
          <div className="text-xl font-mono font-bold text-primary">{trackingNumber}</div>
        </motion.div>

        {/* Animated Truck */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Truck className="w-6 h-6 text-primary" />
          </motion.div>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={onContinue}
          className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
        >
          View Tracking
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SuccessAnimation;
