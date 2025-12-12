import React from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, Truck, MapPin, PackageCheck, Clock } from 'lucide-react';
import { TrackingEvent } from '@/types/tracking';

interface DeliveryTimelineProps {
  events: TrackingEvent[];
}

const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({ events }) => {
  const getIcon = (status: TrackingEvent['status'], completed: boolean, current?: boolean) => {
    const iconClass = `w-5 h-5 ${
      completed 
        ? current 
          ? 'text-primary' 
          : 'text-success' 
        : 'text-muted-foreground/50'
    }`;
    
    switch (status) {
      case 'packed':
        return <Package className={iconClass} />;
      case 'picked_up':
        return <CheckCircle2 className={iconClass} />;
      case 'in_transit':
        return <Truck className={iconClass} />;
      case 'near_destination':
        return <MapPin className={iconClass} />;
      case 'out_for_delivery':
        return <Clock className={iconClass} />;
      case 'delivered':
        return <PackageCheck className={iconClass} />;
      default:
        return <Package className={iconClass} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-5">Delivery Timeline</h3>
      
      <div className="relative">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + index * 0.08 }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {/* Timeline line */}
            {index < events.length - 1 && (
              <div className={`
                absolute left-[19px] top-10 w-0.5 h-[calc(100%-24px)]
                ${event.completed ? 'bg-success/40' : 'bg-border/30'}
              `} />
            )}
            
            {/* Icon */}
            <div className={`
              relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
              ${event.current 
                ? 'bg-primary/20 ring-2 ring-primary/50 ring-offset-2 ring-offset-card' 
                : event.completed 
                  ? 'bg-success/20' 
                  : 'bg-muted/30'
              }
              ${event.current ? 'animate-pulse' : ''}
            `}>
              {getIcon(event.status, event.completed, event.current)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`
                  font-medium
                  ${event.current 
                    ? 'text-primary' 
                    : event.completed 
                      ? 'text-foreground' 
                      : 'text-muted-foreground/60'
                  }
                `}>
                  {event.completed && !event.current && (
                    <span className="mr-1.5 text-success">✓</span>
                  )}
                  {event.current && (
                    <span className="mr-1.5">🚚</span>
                  )}
                  {!event.completed && (
                    <span className="mr-1.5 text-muted-foreground/40">○</span>
                  )}
                  {event.label}
                </span>
                
                {event.current && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/20 text-primary uppercase">
                    Current
                  </span>
                )}
              </div>
              
              {event.time && (
                <p className="text-sm text-muted-foreground mt-0.5 tabular-nums">
                  {event.time}
                  {event.location && (
                    <span className="ml-2 text-muted-foreground/70">• {event.location}</span>
                  )}
                </p>
              )}
              
              {!event.completed && !event.time && (
                <p className="text-sm text-muted-foreground/50 mt-0.5 italic">
                  Pending
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DeliveryTimeline;
