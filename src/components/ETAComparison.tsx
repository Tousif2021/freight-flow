import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Route, Timer, CloudSun, Check, AlertTriangle } from 'lucide-react';
import { TrackedShipment } from '@/types/tracking';

interface ETAComparisonProps {
  shipment: TrackedShipment;
}

const ETAComparison: React.FC<ETAComparisonProps> = ({ shipment }) => {
  const { baseETA, predictedETA, distanceMiles, baseDurationHours, weatherDelay } = shipment;

  // Format duration from hours to "Xh Ym"
  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const statCards = [
    {
      icon: Route,
      value: distanceMiles,
      unit: 'mi',
      label: 'Total Distance',
      description: 'Route distance',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: Timer,
      value: formatDuration(baseDurationHours),
      unit: '',
      label: 'Base Time',
      description: 'No traffic delays',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    },
    {
      icon: CloudSun,
      value: weatherDelay.delayMinutes > 0 ? `+${weatherDelay.delayMinutes}` : '0',
      unit: 'm',
      label: 'Weather Delay',
      description: weatherDelay.condition,
      color: weatherDelay.hasImpact ? 'text-amber-400' : 'text-emerald-400',
      bgColor: weatherDelay.hasImpact ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      borderColor: weatherDelay.hasImpact ? 'border-amber-500/30' : 'border-emerald-500/30',
      hasImpact: weatherDelay.hasImpact,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-5">ETA Comparison</h3>
      
      {/* Stats Grid - 3 columns */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`relative p-4 rounded-xl ${stat.bgColor} border ${stat.borderColor} overflow-hidden`}
          >
            {/* Icon */}
            <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            
            {/* Value */}
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-sm font-medium text-muted-foreground">{stat.unit}</span>
              )}
            </div>
            
            {/* Label */}
            <p className="text-xs font-medium text-muted-foreground mt-1">{stat.label}</p>
            
            {/* Status indicator for weather */}
            {stat.label === 'Weather Delay' && (
              <div className="absolute top-3 right-3">
                {stat.hasImpact ? (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-medium text-amber-400">DELAY</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-medium text-emerald-400">CLEAR</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Description */}
            <p className="text-[10px] text-muted-foreground/70 mt-2">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* ETA Cards - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Base ETA */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
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
          transition={{ delay: 0.7 }}
          className="p-4 rounded-xl bg-primary/10 border-2 border-primary/30 relative overflow-hidden"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Adjusted ETA</span>
              <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20">
                <div className="relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-primary animate-ping opacity-50" />
                </div>
                <span className="text-[10px] font-semibold text-primary">LIVE</span>
              </div>
            </div>
            
            <div className="text-2xl font-bold text-foreground tabular-nums mb-1">
              {predictedETA.earliest} – {predictedETA.latest}
            </div>
            <p className="text-sm text-muted-foreground">
              {predictedETA.description}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ETAComparison;
