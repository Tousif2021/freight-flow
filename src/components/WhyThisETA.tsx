import React from 'react';
import { motion } from 'framer-motion';
import { Car, Cloud, AlertTriangle, BarChart3 } from 'lucide-react';
import { TrackedShipment } from '@/types/tracking';

interface WhyThisETAProps {
  impactFactors: TrackedShipment['impactFactors'];
}

const WhyThisETA: React.FC<WhyThisETAProps> = ({ impactFactors }) => {
  const factors = [
    {
      id: 'traffic',
      icon: Car,
      label: 'Traffic',
      ...impactFactors.traffic,
    },
    {
      id: 'weather',
      icon: Cloud,
      label: 'Weather',
      ...impactFactors.weather,
    },
    {
      id: 'incidents',
      icon: AlertTriangle,
      label: 'Incidents',
      ...impactFactors.incidents,
    },
    {
      id: 'historical',
      icon: BarChart3,
      label: 'Historical',
      ...impactFactors.historical,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-5">Why this ETA?</h3>
      
      <div className="space-y-3">
        {factors.map((factor, index) => (
          <motion.div
            key={factor.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + index * 0.08 }}
            className={`
              flex items-start gap-3 p-3 rounded-xl
              ${factor.hasImpact ? 'bg-destructive/5 border border-destructive/20' : 'bg-card/30 border border-border/20'}
            `}
          >
            <div className={`
              w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
              ${factor.hasImpact ? 'bg-destructive/20' : 'bg-success/20'}
            `}>
              <factor.icon className={`w-4.5 h-4.5 ${factor.hasImpact ? 'text-destructive' : 'text-success'}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{factor.label}</span>
                {factor.hasImpact && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-destructive/20 text-destructive uppercase">
                    Impact
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {factor.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WhyThisETA;
