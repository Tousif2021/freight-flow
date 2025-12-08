import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, MapPin, ChevronRight, Lightbulb, Zap } from 'lucide-react';
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
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Hero ETA Section */}
      <div className="glass-card p-5 glow-effect relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        
        <div className="relative">
          {/* Top row: Risk badge */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Estimated Arrival</span>
            <span className={cn(
              'status-badge text-xs',
              eta.riskLevel === 'low' && 'status-low',
              eta.riskLevel === 'medium' && 'status-medium',
              eta.riskLevel === 'high' && 'status-high'
            )}>
              <AlertTriangle className="w-3 h-3" />
              {eta.riskLevel.charAt(0).toUpperCase() + eta.riskLevel.slice(1)}
            </span>
          </div>

          {/* Main ETA display */}
          <div className="flex items-baseline gap-3 mb-3">
            <motion.div 
              className="text-3xl md:text-4xl font-bold text-primary"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
              {formatTime(eta.estimatedArrival)}
            </motion.div>
            <span className="text-sm text-muted-foreground">{formatDate(eta.estimatedArrival)}</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-border/30">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="text-sm font-semibold text-foreground">{eta.durationHours.toFixed(1)}h</div>
            </div>
            <div className="text-center border-x border-border/30">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="text-sm font-semibold text-foreground">{distanceMiles.toLocaleString()} mi</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatTime(eta.confidenceWindow.earliest)} - {formatTime(eta.confidenceWindow.latest)}
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs font-medium text-foreground truncate">{originCity}</span>
            <div className="flex-1 flex items-center">
              <div className="h-px flex-1 bg-gradient-to-r from-success to-primary" />
              <ChevronRight className="w-3 h-3 text-primary mx-1" />
              <div className="h-px flex-1 bg-gradient-to-r from-primary to-destructive" />
            </div>
            <span className="text-xs font-medium text-foreground truncate">{destinationCity}</span>
            <div className="w-2 h-2 rounded-full bg-destructive" />
          </div>
        </div>
      </div>

      {/* Compact Factors Grid */}
      <div className="grid grid-cols-2 gap-2">
        {eta.factors.slice(0, 4).map((factor, index) => (
          <motion.div
            key={factor.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className={cn(
              "glass-card p-3 border-l-2",
              factor.impact === 'positive' && 'border-l-success',
              factor.impact === 'negative' && 'border-l-destructive',
              factor.impact === 'neutral' && 'border-l-muted-foreground'
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-foreground truncate">{factor.name}</span>
              <span className={cn(
                'text-xs font-bold',
                factor.impact === 'positive' && 'text-success',
                factor.impact === 'negative' && 'text-destructive',
                factor.impact === 'neutral' && 'text-muted-foreground'
              )}>
                {factor.adjustment > 0 ? '+' : ''}{factor.adjustment.toFixed(1)}h
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground line-clamp-2">{factor.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Analysis & Recommendations Combined */}
      <div className="glass-card p-4 border-l-4 border-l-primary">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-foreground mb-1">AI Analysis</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {eta.explanation}
            </p>
            {eta.recommendations.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {eta.recommendations.slice(0, 2).map((rec, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-full"
                  >
                    <ChevronRight className="w-2.5 h-2.5" />
                    {rec.length > 30 ? rec.substring(0, 30) + '...' : rec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ETADisplay;
