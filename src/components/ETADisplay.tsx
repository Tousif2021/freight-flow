import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, AlertTriangle, MapPin, ArrowRight, Lightbulb, Zap,
  Truck, Route, Calendar, CloudRain, CloudSnow, Wind, Sun, Cloud,
  TrendingUp, TrendingDown, Radio, Loader2, Shield, Activity, Satellite
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
  const [trafficStatus, setTrafficStatus] = useState<'loading' | 'done'>('loading');
  const [weatherStatus, setWeatherStatus] = useState<'loading' | 'done'>('loading');
  const [trafficProgress, setTrafficProgress] = useState(0);
  const [weatherProgress, setWeatherProgress] = useState(0);

  useEffect(() => {
    setTrafficStatus('loading');
    setWeatherStatus('loading');
    setTrafficProgress(0);
    setWeatherProgress(0);
    
    // Traffic API simulation
    const trafficInterval = setInterval(() => {
      setTrafficProgress(prev => {
        if (prev >= 100) {
          clearInterval(trafficInterval);
          setTimeout(() => setTrafficStatus('done'), 300);
          return 100;
        }
        return prev + Math.random() * 20 + 10;
      });
    }, 150);

    // Weather API simulation (slightly delayed)
    const weatherInterval = setInterval(() => {
      setWeatherProgress(prev => {
        if (prev >= 100) {
          clearInterval(weatherInterval);
          setTimeout(() => setWeatherStatus('done'), 300);
          return 100;
        }
        return prev + Math.random() * 18 + 8;
      });
    }, 180);

    return () => {
      clearInterval(trafficInterval);
      clearInterval(weatherInterval);
    };
  }, [eta]);

  const formatTime = (date: Date) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
  const formatDay = (date: Date) => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);

  const getFactorIcon = (factorName: string) => {
    const name = factorName.toLowerCase();
    if (name.includes('carrier') || name.includes('mode')) return Truck;
    if (name.includes('traffic')) return Route;
    if (name.includes('day') || name.includes('week')) return Calendar;
    if (name.includes('weather')) {
      if (name.includes('snow')) return CloudSnow;
      if (name.includes('wind')) return Wind;
      if (name.includes('clear') || name.includes('sun')) return Sun;
      return Cloud;
    }
    return Activity;
  };

  const totalAdjustment = eta.factors.reduce((sum, f) => sum + f.adjustment, 0);
  const isDataLoading = trafficStatus === 'loading' || weatherStatus === 'loading';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-2">
      {/* Live Data Fetching Status */}
      <AnimatePresence>
        {isDataLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-2.5 border border-primary/20"
          >
            <div className="grid grid-cols-2 gap-2">
              {/* Traffic API */}
              <div className={cn(
                "p-2 rounded-lg border transition-all",
                trafficStatus === 'done' ? "bg-success/10 border-success/30" : "bg-muted/10 border-border/30"
              )}>
                <div className="flex items-center gap-2 mb-1.5">
                  {trafficStatus === 'loading' ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Loader2 className="w-3 h-3 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Route className="w-3 h-3 text-success" />
                    </motion.div>
                  )}
                  <span className="text-[10px] font-semibold text-foreground">Traffic API</span>
                  {trafficStatus === 'done' && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[8px] text-success font-bold ml-auto">LIVE</motion.span>
                  )}
                </div>
                <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div 
                    className={cn("h-full rounded-full", trafficStatus === 'done' ? "bg-success" : "bg-primary")}
                    style={{ width: `${Math.min(100, trafficProgress)}%` }}
                  />
                </div>
              </div>

              {/* Weather API */}
              <div className={cn(
                "p-2 rounded-lg border transition-all",
                weatherStatus === 'done' ? "bg-success/10 border-success/30" : "bg-muted/10 border-border/30"
              )}>
                <div className="flex items-center gap-2 mb-1.5">
                  {weatherStatus === 'loading' ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                      <Loader2 className="w-3 h-3 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Satellite className="w-3 h-3 text-success" />
                    </motion.div>
                  )}
                  <span className="text-[10px] font-semibold text-foreground">Weather API</span>
                  {weatherStatus === 'done' && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[8px] text-success font-bold ml-auto">LIVE</motion.span>
                  )}
                </div>
                <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div 
                    className={cn("h-full rounded-full", weatherStatus === 'done' ? "bg-success" : "bg-primary")}
                    style={{ width: `${Math.min(100, weatherProgress)}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero ETA Card - More Compact */}
      <div className="glass-card overflow-hidden relative">
        <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/30 rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />

        <div className="relative p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Arrival Prediction</span>
            <motion.span className={cn(
              'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide flex items-center gap-1',
              eta.riskLevel === 'low' && 'bg-success/20 text-success',
              eta.riskLevel === 'medium' && 'bg-warning/20 text-warning',
              eta.riskLevel === 'high' && 'bg-destructive/20 text-destructive'
            )} animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <AlertTriangle className="w-2.5 h-2.5" />
              {eta.riskLevel}
            </motion.span>
          </div>

          <div className="flex items-end gap-2 mb-3">
            <motion.span className="text-4xl font-black text-primary tracking-tight" animate={{ textShadow: ['0 0 15px hsl(var(--primary) / 0)', '0 0 25px hsl(var(--primary) / 0.4)', '0 0 15px hsl(var(--primary) / 0)'] }} transition={{ duration: 2, repeat: Infinity }}>
              {formatTime(eta.estimatedArrival)}
            </motion.span>
            <div className="pb-1">
              <div className="text-xs font-medium text-foreground">{formatDay(eta.estimatedArrival)}</div>
              <div className="text-[10px] text-muted-foreground">{formatTime(eta.confidenceWindow.earliest)} – {formatTime(eta.confidenceWindow.latest)}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-muted/30 rounded-full">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">{eta.durationHours.toFixed(1)}h</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-muted/30 rounded-full">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">{distanceMiles.toLocaleString()}mi</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-muted/30 rounded-full">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">±{((eta.confidenceWindow.latest.getTime() - eta.confidenceWindow.earliest.getTime()) / 60000 / 2).toFixed(0)}m</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-border/30">
            <motion.div className="w-2 h-2 rounded-full bg-success" animate={{ boxShadow: ['0 0 0 0 hsl(var(--success) / 0.4)', '0 0 0 4px hsl(var(--success) / 0)'] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-[10px] font-medium text-foreground truncate">{originCity}</span>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-success via-primary to-primary rounded-full" />
            <span className="text-[10px] font-medium text-foreground truncate">{destinationCity}</span>
            <div className="w-2 h-2 rounded-full bg-destructive" />
          </div>
        </div>
      </div>

      {/* Compact Impact Factors */}
      <div className="glass-card overflow-hidden">
        <div className="px-3 py-2 border-b border-border/30 bg-gradient-to-r from-muted/20 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">Impact Analysis</span>
          </div>
          <div className={cn(
            "px-2 py-0.5 rounded flex items-center gap-1",
            totalAdjustment > 0.3 ? "bg-red-500/20" : "bg-success/20"
          )}>
            <span className={cn("text-xs font-black tabular-nums", totalAdjustment > 0.3 ? "text-red-400" : "text-success")}>
              {totalAdjustment > 0 ? '+' : ''}{totalAdjustment.toFixed(1)}h
            </span>
          </div>
        </div>

        <div className="p-2 space-y-1.5">
          {eta.factors.map((factor, index) => {
            const FactorIcon = getFactorIcon(factor.name);
            const isNegative = factor.impact === 'negative';
            const severity = Math.abs(factor.adjustment);
            const severityPercent = Math.min((severity / 1.5) * 100, 100);
            
            return (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className={cn(
                  "relative rounded-lg p-2 border",
                  isNegative 
                    ? "bg-red-500/10 border-red-500/30" 
                    : "bg-success/10 border-success/30"
                )}
              >
                {isNegative && (
                  <motion.div className="absolute inset-0 bg-red-500/5 rounded-lg" animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                )}
                
                <div className="relative flex items-center gap-2">
                  <motion.div 
                    className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", isNegative ? "bg-red-500/20" : "bg-success/20")}
                    animate={isNegative ? { boxShadow: ['0 0 0 0 rgba(239,68,68,0.3)', '0 0 0 6px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0)'] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FactorIcon className={cn("w-3.5 h-3.5", isNegative ? "text-red-400" : "text-success")} />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-[11px] font-bold", isNegative ? "text-red-400" : "text-success")}>{factor.name}</span>
                        {isNegative && (
                          <span className="px-1 py-0.5 bg-red-500/30 text-red-300 text-[7px] font-black uppercase rounded">Delay</span>
                        )}
                      </div>
                      <div className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded", isNegative ? "bg-red-500/20" : "bg-success/20")}>
                        {isNegative ? <TrendingDown className="w-2.5 h-2.5 text-red-400" /> : <TrendingUp className="w-2.5 h-2.5 text-success" />}
                        <span className={cn("text-[10px] font-black tabular-nums", isNegative ? "text-red-400" : "text-success")}>
                          {factor.adjustment > 0 ? '+' : ''}{factor.adjustment.toFixed(1)}h
                        </span>
                      </div>
                    </div>
                    <p className={cn("text-[9px] leading-tight mb-1", isNegative ? "text-red-300/70" : "text-success/70")}>{factor.description}</p>
                    <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", isNegative ? "bg-gradient-to-r from-red-500/50 to-red-500" : "bg-gradient-to-r from-success/50 to-success")}
                        initial={{ width: 0 }}
                        animate={{ width: `${severityPercent}%` }}
                        transition={{ delay: 0.2 + 0.05 * index, duration: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="px-3 py-2 bg-muted/10 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Confidence: <span className="font-bold text-foreground">94%</span></span>
          </div>
          <div className="flex items-center gap-0.5">
            {eta.factors.map((f, i) => (
              <motion.div key={i} className={cn("w-1.5 h-1.5 rounded-full", f.impact === 'negative' ? "bg-red-400" : "bg-success")} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + 0.08 * i }} />
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight - Compact */}
      {(eta.explanation || eta.recommendations.length > 0) && (
        <motion.div className="glass-card p-3 border-l-2 border-l-primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="flex gap-2">
            <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground leading-relaxed mb-1.5">{eta.explanation}</p>
              {eta.recommendations.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {eta.recommendations.slice(0, 2).map((rec, idx) => (
                    <span key={idx} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-medium rounded">
                      <ArrowRight className="w-2 h-2" />
                      {rec.length > 30 ? rec.substring(0, 30) + '...' : rec}
                    </span>
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
