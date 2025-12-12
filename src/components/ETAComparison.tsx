import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp } from 'lucide-react';
import { TrackedShipment } from '@/types/tracking';

interface ETAComparisonProps {
  shipment: TrackedShipment;
}

const ETAComparison: React.FC<ETAComparisonProps> = ({ shipment }) => {
  const { baseETA, predictedETA } = shipment;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-5">ETA Comparison</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Base ETA */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-card/50 border border-border/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Base ETA</span>
          </div>
          
          <div className="text-2xl font-bold text-foreground tabular-nums mb-1">
            {baseETA.time}
          </div>
          <p className="text-sm text-muted-foreground">
            {baseETA.description}
          </p>
        </motion.div>

        {/* Adjusted ETA */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-primary/10 border-2 border-primary/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">Adjusted ETA</span>
          </div>
          
          <div className="text-2xl font-bold text-foreground tabular-nums mb-1">
            {predictedETA.earliest} – {predictedETA.latest}
          </div>
          <p className="text-sm text-muted-foreground">
            {predictedETA.description}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ETAComparison;
