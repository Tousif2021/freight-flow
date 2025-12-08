import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Clock, TrendingUp, AlertTriangle, X, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RouteSegment {
  id: string;
  name: string;
  shortName: string;
  status: 'clear' | 'moderate' | 'congested';
  width: number; // percentage
  delay: number; // hours
  density: number; // 0-100
  historicalAvg: number; // hours
  historicalP90: number; // hours
  currentSpeed: number; // mph
  incidents: number;
}

interface RouteTrafficBarProps {
  originCity: string;
  destinationCity: string;
  truckPosition?: number; // 0-100 percentage along route
  nextCheckpoint?: string;
  etaToCheckpoint?: string;
}

const RouteTrafficBar: React.FC<RouteTrafficBarProps> = ({
  originCity,
  destinationCity,
  truckPosition = 35,
  nextCheckpoint = "Midwest Hub",
  etaToCheckpoint = "4.2h"
}) => {
  const [selectedSegment, setSelectedSegment] = useState<RouteSegment | null>(null);

  const segments: RouteSegment[] = [
    {
      id: 'la',
      name: 'Los Angeles',
      shortName: 'LA',
      status: 'clear',
      width: 18,
      delay: 0,
      density: 25,
      historicalAvg: 0.2,
      historicalP90: 0.5,
      currentSpeed: 62,
      incidents: 0
    },
    {
      id: 'rockies',
      name: 'Rockies',
      shortName: 'RKY',
      status: 'clear',
      width: 22,
      delay: 0.3,
      density: 35,
      historicalAvg: 0.5,
      historicalP90: 1.2,
      currentSpeed: 58,
      incidents: 0
    },
    {
      id: 'midwest',
      name: 'Midwest',
      shortName: 'MID',
      status: 'moderate',
      width: 25,
      delay: 1.5,
      density: 55,
      historicalAvg: 1.0,
      historicalP90: 2.5,
      currentSpeed: 48,
      incidents: 1
    },
    {
      id: 'plains',
      name: 'Plains',
      shortName: 'PLN',
      status: 'moderate',
      width: 20,
      delay: 0.8,
      density: 45,
      historicalAvg: 0.6,
      historicalP90: 1.5,
      currentSpeed: 52,
      incidents: 0
    },
    {
      id: 'nyc',
      name: 'New York City',
      shortName: 'NYC',
      status: 'congested',
      width: 15,
      delay: 2.5,
      density: 85,
      historicalAvg: 2.0,
      historicalP90: 4.0,
      currentSpeed: 28,
      incidents: 2
    }
  ];

  const getSegmentColor = (status: RouteSegment['status']) => {
    switch (status) {
      case 'clear': return 'bg-teal';
      case 'moderate': return 'bg-amber';
      case 'congested': return 'bg-red-500';
    }
  };

  const getSegmentBorderColor = (status: RouteSegment['status']) => {
    switch (status) {
      case 'clear': return 'border-teal/50';
      case 'moderate': return 'border-amber/50';
      case 'congested': return 'border-red-500/50';
    }
  };

  const getStatusLabel = (status: RouteSegment['status']) => {
    switch (status) {
      case 'clear': return 'Clear Flow';
      case 'moderate': return 'Moderate';
      case 'congested': return 'Congested';
    }
  };

  // Calculate truck position within segments
  let accumulatedWidth = 0;
  let truckSegmentIndex = 0;
  for (let i = 0; i < segments.length; i++) {
    if (truckPosition <= accumulatedWidth + segments[i].width) {
      truckSegmentIndex = i;
      break;
    }
    accumulatedWidth += segments[i].width;
  }

  return (
    <div className="relative">
      {/* Route Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{originCity}</span>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/20 rounded-full">
            <Truck className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-semibold text-primary">Next: {nextCheckpoint}</span>
            <span className="text-[9px] font-bold text-primary">• {etaToCheckpoint}</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{destinationCity}</span>
      </div>

      {/* Main Traffic Bar */}
      <div className="relative h-8 rounded-lg overflow-hidden bg-muted/20 border border-border/30">
        <div className="absolute inset-0 flex">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.id}
              className={cn(
                "relative h-full cursor-pointer transition-all duration-200 border-r border-background/30 last:border-r-0",
                getSegmentColor(segment.status),
                selectedSegment?.id === segment.id && "ring-2 ring-white/50 z-10"
              )}
              style={{ width: `${segment.width}%` }}
              onClick={() => setSelectedSegment(selectedSegment?.id === segment.id ? null : segment)}
              whileHover={{ scale: 1.02, zIndex: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shimmer for clear segments */}
              {segment.status === 'clear' && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
              
              {/* Breathing for moderate segments */}
              {segment.status === 'moderate' && (
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  animate={{ opacity: [0, 0.15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              {/* Pulse for congested segments */}
              {segment.status === 'congested' && (
                <motion.div
                  className="absolute inset-0 bg-red-400/30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}

              {/* Segment Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-bold text-white/90 drop-shadow-md">
                  {segment.shortName}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Truck Indicator */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-20"
          style={{ left: `${truckPosition}%` }}
          animate={{ 
            x: [-2, 2, -2],
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              className="absolute -inset-2 bg-primary/40 rounded-full blur-md"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {/* Truck icon container */}
            <div className="relative w-7 h-7 bg-background border-2 border-primary rounded-full flex items-center justify-center shadow-lg">
              <Truck className="w-4 h-4 text-primary" />
            </div>
            {/* ETA badge */}
            <motion.div
              className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="px-2 py-0.5 bg-background/95 border border-primary/40 rounded-full shadow-lg">
                <span className="text-[8px] font-bold text-primary">{etaToCheckpoint} to {nextCheckpoint}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Traffic Density Rail */}
      <div className="relative h-1.5 mt-1 rounded-full overflow-hidden bg-muted/10">
        <div className="absolute inset-0 flex">
          {segments.map((segment) => (
            <div
              key={`density-${segment.id}`}
              className="h-full"
              style={{ width: `${segment.width}%` }}
            >
              <div
                className={cn(
                  "h-full transition-all",
                  segment.status === 'clear' && "bg-teal/40",
                  segment.status === 'moderate' && "bg-amber/40",
                  segment.status === 'congested' && "bg-red-500/40"
                )}
                style={{ width: `${segment.density}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-teal" />
          <span className="text-[8px] text-muted-foreground">Clear</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber" />
          <span className="text-[8px] text-muted-foreground">Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.div 
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-[8px] text-muted-foreground">Congested</span>
        </div>
      </div>

      {/* Segment Detail Popover */}
      <AnimatePresence>
        {selectedSegment && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={cn(
              "absolute left-0 right-0 mt-3 p-3 rounded-lg border shadow-xl z-30 bg-background/95 backdrop-blur-sm",
              getSegmentBorderColor(selectedSegment.status)
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  getSegmentColor(selectedSegment.status)
                )} />
                <span className="text-sm font-bold text-foreground">{selectedSegment.name}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                  selectedSegment.status === 'clear' && "bg-teal/20 text-teal",
                  selectedSegment.status === 'moderate' && "bg-amber/20 text-amber",
                  selectedSegment.status === 'congested' && "bg-red-500/20 text-red-400"
                )}>
                  {getStatusLabel(selectedSegment.status)}
                </span>
              </div>
              <button 
                onClick={() => setSelectedSegment(null)}
                className="p-1 rounded-full hover:bg-muted/30 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="p-2 rounded-lg bg-muted/20">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[8px] text-muted-foreground uppercase">Current Delay</span>
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  selectedSegment.delay > 1 ? "text-red-400" : selectedSegment.delay > 0.5 ? "text-amber" : "text-teal"
                )}>
                  +{selectedSegment.delay.toFixed(1)}h
                </span>
              </div>
              
              <div className="p-2 rounded-lg bg-muted/20">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[8px] text-muted-foreground uppercase">Avg Speed</span>
                </div>
                <span className="text-sm font-bold text-foreground">{selectedSegment.currentSpeed} mph</span>
              </div>
              
              <div className="p-2 rounded-lg bg-muted/20">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[8px] text-muted-foreground uppercase">Incidents</span>
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  selectedSegment.incidents > 0 ? "text-red-400" : "text-teal"
                )}>
                  {selectedSegment.incidents}
                </span>
              </div>
              
              <div className="p-2 rounded-lg bg-muted/20">
                <div className="flex items-center gap-1 mb-1">
                  <BarChart3 className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[8px] text-muted-foreground uppercase">Density</span>
                </div>
                <span className="text-sm font-bold text-foreground">{selectedSegment.density}%</span>
              </div>
            </div>

            {/* Historical Data */}
            <div className="p-2 rounded-lg bg-muted/10 border border-border/30">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart3 className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-foreground">Historical Data (90 days)</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[9px] text-muted-foreground">Avg Delay: </span>
                  <span className="text-[10px] font-bold text-foreground">+{selectedSegment.historicalAvg.toFixed(1)}h</span>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground">P90 Delay: </span>
                  <span className="text-[10px] font-bold text-amber">+{selectedSegment.historicalP90.toFixed(1)}h</span>
                </div>
                <div className="flex-1">
                  {/* Mini bar chart visualization */}
                  <div className="flex items-end gap-0.5 h-4">
                    {[0.3, 0.5, 0.8, 1.0, 0.7, 0.4, 0.6].map((val, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-primary/40 rounded-t-sm"
                        style={{ height: `${val * 100}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RouteTrafficBar;
