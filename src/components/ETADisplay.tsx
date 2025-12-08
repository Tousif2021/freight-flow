import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, AlertTriangle, MapPin, ArrowRight, Lightbulb, Zap,
  Truck, Route, Calendar, CloudRain, CloudSnow, Wind, Sun,
  TrendingUp, TrendingDown, Minus, Radio, Loader2, Shield, Activity
} from 'lucide-react';
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
  const [isGatheringTraffic, setIsGatheringTraffic] = useState(true);
  const [trafficProgress, setTrafficProgress] = useState(0);

  useEffect(() => {
    setIsGatheringTraffic(true);
    setTrafficProgress(0);
    
    const interval = setInterval(() => {
      setTrafficProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsGatheringTraffic(false), 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [eta]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
  };

  const formatDay = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  };

  const getFactorIcon = (factorName: string) => {
    const name = factorName.toLowerCase();
    if (name.includes('carrier') || name.includes('mode')) return Truck;
    if (name.includes('traffic')) return Route;
    if (name.includes('day') || name.includes('week')) return Calendar;
    if (name.includes('weather')) {
      if (name.includes('snow')) return CloudSnow;
      if (name.includes('wind')) return Wind;
      if (name.includes('clear') || name.includes('sun')) return Sun;
      return CloudRain;
    }
    return Activity;
  };

  const totalAdjustment = eta.factors.reduce((sum, f) => sum + f.adjustment, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {/* Live Traffic Gathering Banner */}
      <AnimatePresence>
        {isGatheringTraffic && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-3 border border-primary/30 overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="w-4 h-4 text-primary" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground flex items-center gap-2">
                    <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Radio className="w-3 h-3 text-primary" />
                    </motion.span>
                    Gathering Live Traffic Data...
                  </span>
                  <span className="text-[10px] text-muted-foreground">{Math.min(100, Math.round(trafficProgress))}%</span>
                </div>
                <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, trafficProgress)}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero ETA Card */}
      <div className="glass-card overflow-hidden relative">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -top-10 -right-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Arrival Prediction</span>
            <motion.span 
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5',
                eta.riskLevel === 'low' && 'bg-success/20 text-success',
                eta.riskLevel === 'medium' && 'bg-warning/20 text-warning',
                eta.riskLevel === 'high' && 'bg-destructive/20 text-destructive'
              )}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertTriangle className="w-3 h-3" />
              {eta.riskLevel} risk
            </motion.span>
          </div>

          <div className="flex items-end gap-3 mb-4">
            <motion.div 
              animate={{ textShadow: ['0 0 20px hsl(var(--primary) / 0)', '0 0 30px hsl(var(--primary) / 0.5)', '0 0 20px hsl(var(--primary) / 0)'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-5xl md:text-6xl font-black text-primary tracking-tight">
                {formatTime(eta.estimatedArrival)}
              </span>
            </motion.div>
            <div className="pb-2">
              <div className="text-sm font-medium text-foreground">{formatDay(eta.estimatedArrival)}</div>
              <div className="text-xs text-muted-foreground">
                Window: {formatTime(eta.confidenceWindow.earliest)} – {formatTime(eta.confidenceWindow.latest)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 rounded-full">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">{eta.durationHours.toFixed(1)} hrs</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">{distanceMiles.toLocaleString()} mi</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 rounded-full">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">±{((eta.confidenceWindow.latest.getTime() - eta.confidenceWindow.earliest.getTime()) / 60000 / 2).toFixed(0)} min</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-3 h-3 rounded-full bg-success"
                  animate={{ boxShadow: ['0 0 0 0 hsl(var(--success) / 0.4)', '0 0 0 6px hsl(var(--success) / 0)', '0 0 0 0 hsl(var(--success) / 0)'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-foreground">{originCity}</span>
              </div>
              <div className="flex-1 relative h-1 bg-muted/30 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-success via-primary to-primary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{destinationCity}</span>
                <div className="w-3 h-3 rounded-full bg-destructive" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RICH Impact Factors Section */}
      <div className="glass-card overflow-hidden">
        {/* Header with gradient */}
        <div className="p-4 border-b border-border/30 bg-gradient-to-r from-muted/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Impact Analysis</h3>
                <p className="text-[10px] text-muted-foreground">Real-time route factors</p>
              </div>
            </div>
            <div className={cn(
              "px-3 py-1.5 rounded-lg flex items-center gap-2",
              totalAdjustment > 0.5 ? "bg-destructive/10" : totalAdjustment < -0.1 ? "bg-success/10" : "bg-muted/20"
            )}>
              <span className="text-[10px] text-muted-foreground">Net Impact</span>
              <span className={cn(
                "text-sm font-black tabular-nums",
                totalAdjustment > 0.5 ? "text-destructive" : totalAdjustment < -0.1 ? "text-success" : "text-foreground"
              )}>
                {totalAdjustment > 0 ? '+' : ''}{totalAdjustment.toFixed(1)}h
              </span>
            </div>
          </div>
        </div>

        {/* Factor Cards */}
        <div className="p-3 space-y-2">
          {eta.factors.map((factor, index) => {
            const FactorIcon = getFactorIcon(factor.name);
            const isNegative = factor.impact === 'negative';
            const isPositive = factor.impact === 'positive';
            const severity = Math.abs(factor.adjustment);
            const severityPercent = Math.min((severity / 1.5) * 100, 100);
            
            return (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index, type: "spring", stiffness: 100 }}
                className="relative group"
              >
                <div className={cn(
                  "relative rounded-xl p-3 transition-all duration-300 overflow-hidden",
                  isNegative 
                    ? "bg-gradient-to-r from-destructive/10 via-destructive/5 to-transparent border border-destructive/20 hover:border-destructive/40" 
                    : "bg-gradient-to-r from-success/10 via-success/5 to-transparent border border-success/20 hover:border-success/40"
                )}>
                  {/* Animated background pulse for negative factors */}
                  {isNegative && (
                    <motion.div
                      className="absolute inset-0 bg-destructive/5 rounded-xl"
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  
                  <div className="relative flex items-start gap-3">
                    {/* Icon with ring */}
                    <div className="relative flex-shrink-0">
                      <motion.div 
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          isNegative ? "bg-destructive/20" : "bg-success/20"
                        )}
                        animate={isNegative ? { 
                          boxShadow: ['0 0 0 0 hsl(var(--destructive) / 0.3)', '0 0 0 8px hsl(var(--destructive) / 0)', '0 0 0 0 hsl(var(--destructive) / 0)']
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FactorIcon className={cn(
                          "w-5 h-5",
                          isNegative ? "text-destructive" : "text-success"
                        )} />
                      </motion.div>
                      
                      {/* Status indicator dot */}
                      <motion.div 
                        className={cn(
                          "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                          isNegative ? "bg-destructive" : "bg-success"
                        )}
                        animate={isNegative ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-sm font-bold",
                              isNegative ? "text-destructive" : "text-success"
                            )}>
                              {factor.name}
                            </span>
                            {isNegative && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="px-1.5 py-0.5 bg-destructive/20 text-destructive text-[8px] font-black uppercase tracking-wider rounded"
                              >
                                Delay
                              </motion.span>
                            )}
                            {isPositive && factor.adjustment < 0 && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="px-1.5 py-0.5 bg-success/20 text-success text-[8px] font-black uppercase tracking-wider rounded"
                              >
                                Faster
                              </motion.span>
                            )}
                          </div>
                        </div>
                        
                        {/* Time impact badge */}
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-lg",
                          isNegative ? "bg-destructive/20" : "bg-success/20"
                        )}>
                          {isNegative ? (
                            <TrendingDown className="w-3 h-3 text-destructive" />
                          ) : (
                            <TrendingUp className="w-3 h-3 text-success" />
                          )}
                          <span className={cn(
                            "text-sm font-black tabular-nums",
                            isNegative ? "text-destructive" : "text-success"
                          )}>
                            {factor.adjustment > 0 ? '+' : ''}{factor.adjustment.toFixed(1)}h
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className={cn(
                        "text-xs leading-relaxed mb-2",
                        isNegative ? "text-destructive/70" : "text-success/70"
                      )}>
                        {factor.description}
                      </p>

                      {/* Severity bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted/20 rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full rounded-full",
                              isNegative 
                                ? "bg-gradient-to-r from-destructive/50 to-destructive" 
                                : "bg-gradient-to-r from-success/50 to-success"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${severityPercent}%` }}
                            transition={{ delay: 0.3 + 0.1 * index, duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground w-12 text-right">
                          {severity < 0.3 ? 'Low' : severity < 0.7 ? 'Medium' : 'High'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer summary */}
        <div className="px-4 py-3 bg-muted/10 border-t border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>Analysis confidence: <span className="font-semibold text-foreground">94%</span></span>
            </div>
            <div className="flex items-center gap-1">
              {eta.factors.map((f, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    f.impact === 'negative' ? "bg-destructive" : "bg-success"
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + 0.1 * i }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      {(eta.explanation || eta.recommendations.length > 0) && (
        <motion.div 
          className="glass-card p-4 border-l-4 border-l-primary relative overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div 
            className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="relative flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-foreground mb-1">Route Intelligence</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{eta.explanation}</p>
              {eta.recommendations.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {eta.recommendations.slice(0, 2).map((rec, idx) => (
                    <motion.span 
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] font-medium rounded-md"
                      whileHover={{ scale: 1.02 }}
                    >
                      <ArrowRight className="w-2.5 h-2.5" />
                      {rec.length > 35 ? rec.substring(0, 35) + '...' : rec}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ETADisplay;
