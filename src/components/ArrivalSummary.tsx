import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { TrackedShipment } from '@/types/tracking';

interface ArrivalSummaryProps {
  shipment: TrackedShipment;
}

const ArrivalSummary: React.FC<ArrivalSummaryProps> = ({ shipment }) => {
  const { predictedETA } = shipment;
  
  // Get today's date formatted
  const today = new Date();
  const isToday = true; // For demo purposes
  
  const dateLabel = isToday ? 'today' : today.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Clock className="w-7 h-7 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight"
          >
            Arriving {dateLabel}:{' '}
            <span className="text-primary tabular-nums">
              {predictedETA.earliest} – {predictedETA.latest}
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-2 text-muted-foreground text-sm md:text-base"
          >
            Updated live using traffic, incidents, and historical patterns
          </motion.p>
        </div>
      </div>

      {/* Route summary badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-6 flex flex-wrap items-center gap-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border/50">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {shipment.origin.city}, {shipment.origin.state}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="text-sm font-medium text-foreground">
            {shipment.destination.city}, {shipment.destination.state}
          </span>
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            {shipment.trackingNumber}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ArrivalSummary;
