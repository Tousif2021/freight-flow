import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { RouteSegment } from '@/types/tracking';

interface RouteSegmentsProps {
  segments: RouteSegment[];
  onSegmentClick?: (segmentId: string) => void;
}

const RouteSegments: React.FC<RouteSegmentsProps> = ({ segments, onSegmentClick }) => {
  const getStatusIcon = (status: RouteSegment['status']) => {
    switch (status) {
      case 'clear':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'delayed':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusColor = (status: RouteSegment['status']) => {
    switch (status) {
      case 'clear':
        return 'border-success/30 bg-success/5';
      case 'delayed':
        return 'border-destructive/30 bg-destructive/5';
      case 'warning':
        return 'border-warning/30 bg-warning/5';
    }
  };

  const getStatusLabel = (status: RouteSegment['status']) => {
    switch (status) {
      case 'clear':
        return 'Clear';
      case 'delayed':
        return 'Delay detected';
      case 'warning':
        return 'Minor delay';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-5">Route Overview</h3>
      
      <div className="space-y-3">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
            onClick={() => onSegmentClick?.(segment.id)}
            className={`
              relative p-4 rounded-xl border-2 cursor-pointer
              transition-all duration-200 hover:scale-[1.01]
              ${getStatusColor(segment.status)}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {getStatusIcon(segment.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{segment.from}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium text-foreground">{segment.to}</span>
                </div>
                
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <span className={`
                    text-sm font-medium
                    ${segment.status === 'clear' ? 'text-success' : ''}
                    ${segment.status === 'delayed' ? 'text-destructive' : ''}
                    ${segment.status === 'warning' ? 'text-warning' : ''}
                  `}>
                    {getStatusLabel(segment.status)}
                  </span>
                  <span className="text-sm text-muted-foreground">—</span>
                  <span className="text-sm text-muted-foreground">{segment.reason}</span>
                </div>
                
                {segment.delayMinutes && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/20"
                  >
                    <Clock className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-sm font-semibold text-destructive tabular-nums">
                      +{segment.delayMinutes.min}–{segment.delayMinutes.max} min
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Connector line */}
            {index < segments.length - 1 && (
              <div className="absolute left-[1.65rem] top-full h-3 w-0.5 bg-border/50" />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RouteSegments;
