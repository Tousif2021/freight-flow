import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, AlertTriangle, MapPin, ChevronRight, Lightbulb, Info } from 'lucide-react';
import { ETAPrediction } from '@/types/shipment';
import { cn } from '@/lib/utils';

interface ETADisplayProps {
  eta: ETAPrediction;
  distanceMiles: number;
  originCity: string;
  destinationCity: string;
}

const ETADisplay: React.FC<ETADisplayProps> = ({
  eta,
  distanceMiles,
  originCity,
  destinationCity,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Main ETA Card */}
      <div className="glass-card p-6 glow-effect">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Predicted Arrival</span>
          <span className={cn(
            'status-badge',
            eta.riskLevel === 'low' && 'status-low',
            eta.riskLevel === 'medium' && 'status-medium',
            eta.riskLevel === 'high' && 'status-high'
          )}>
            <AlertTriangle className="w-3 h-3" />
            {eta.riskLevel.charAt(0).toUpperCase() + eta.riskLevel.slice(1)} Risk
          </span>
        </div>

        <motion.div 
          className="text-4xl md:text-5xl font-bold text-foreground mb-2"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {formatDate(eta.estimatedArrival)}
        </motion.div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{eta.durationHours.toFixed(1)} hours</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{distanceMiles.toLocaleString()} miles</span>
          </div>
        </div>

        {/* Route indicator */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
          <span className="text-sm font-medium text-foreground">{originCity}</span>
          <div className="flex-1 flex items-center gap-1">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-success to-primary rounded" />
            <ChevronRight className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">{destinationCity}</span>
        </div>
      </div>

      {/* Confidence Window */}
      <div className="glass-card p-5">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Delivery Window
        </h4>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Earliest</div>
            <div className="text-sm font-medium text-foreground">
              {formatTime(eta.confidenceWindow.earliest)}
            </div>
          </div>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-success via-primary to-warning rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Latest</div>
            <div className="text-sm font-medium text-foreground">
              {formatTime(eta.confidenceWindow.latest)}
            </div>
          </div>
        </div>
      </div>

      {/* ETA Factors */}
      <div className="glass-card p-5">
        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          ETA Factors
        </h4>
        <div className="space-y-3">
          {eta.factors.map((factor, index) => (
            <motion.div
              key={factor.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  factor.impact === 'positive' && 'bg-success',
                  factor.impact === 'negative' && 'bg-destructive',
                  factor.impact === 'neutral' && 'bg-muted-foreground'
                )} />
                <div>
                  <div className="text-sm font-medium text-foreground">{factor.name}</div>
                  <div className="text-xs text-muted-foreground">{factor.description}</div>
                </div>
              </div>
              <div className={cn(
                'text-sm font-medium',
                factor.impact === 'positive' && 'text-success',
                factor.impact === 'negative' && 'text-destructive',
                factor.impact === 'neutral' && 'text-muted-foreground'
              )}>
                {factor.adjustment > 0 ? '+' : ''}{factor.adjustment.toFixed(1)}h
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Explanation Panel */}
      <div className="glass-card p-5 border-l-4 border-l-primary">
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          Analysis Summary
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {eta.explanation}
        </p>
      </div>

      {/* Recommendations */}
      {eta.recommendations.length > 0 && (
        <div className="glass-card p-5">
          <h4 className="text-sm font-semibold text-foreground mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {eta.recommendations.map((rec, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {rec}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default ETADisplay;
