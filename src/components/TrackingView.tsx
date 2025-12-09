import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertTriangle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Shipment, ShipmentEvent } from '@/types/shipment';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import MapView from './MapView';
import { cn } from '@/lib/utils';

interface TrackingViewProps {
  shipment: Shipment;
}

const TrackingView: React.FC<TrackingViewProps> = ({ shipment }) => {
  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(shipment.trackingNumber);
    toast({
      title: 'Copied!',
      description: 'Tracking number copied to clipboard',
    });
  };

  const getStatusIcon = (status: Shipment['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-primary animate-truck-move" />;
      case 'picked_up':
        return <Package className="w-5 h-5 text-info" />;
      case 'delayed':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Shipment['status']) => {
    switch (status) {
      case 'delivered': return 'bg-success';
      case 'in_transit':
      case 'out_for_delivery': return 'bg-primary';
      case 'picked_up': return 'bg-info';
      case 'delayed': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

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

  // Calculate progress percentage
  const statusOrder = ['quote', 'pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentStatusIndex = statusOrder.indexOf(shipment.status);
  const progressPercent = ((currentStatusIndex + 1) / statusOrder.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(shipment.status)}
              <span className={cn(
                'text-sm font-semibold px-3 py-1 rounded-full',
                shipment.status === 'delivered' && 'bg-success/20 text-success',
                shipment.status === 'in_transit' && 'bg-primary/20 text-primary',
                shipment.status === 'delayed' && 'bg-destructive/20 text-destructive',
                !['delivered', 'in_transit', 'delayed'].includes(shipment.status) && 'bg-muted/50 text-muted-foreground'
              )}>
                {shipment.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">
              Tracking: <span className="font-sans">{shipment.trackingNumber}</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Created {formatDate(shipment.createdAt)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyTrackingNumber}>
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <Button variant="subtle" size="sm">
              <ExternalLink className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Order Placed</span>
            <span>Delivered</span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                shipment.status === 'delayed' ? 'bg-destructive' : 'bg-gradient-to-r from-success via-primary to-primary'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[300px] md:h-[400px]">
        <MapView
          origin={{
            lat: shipment.origin.lat,
            lng: shipment.origin.lng,
            label: shipment.origin.city,
          }}
          destination={{
            lat: shipment.destination.lat,
            lng: shipment.destination.lng,
            label: shipment.destination.city,
          }}
          currentLocation={shipment.currentLocation}
          showRoute
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ETA Card */}
        <div className="glass-card p-6 glow-effect">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Estimated Arrival
          </h3>
          <div className="text-3xl font-bold tracking-tight text-foreground mb-2 font-sans">
            {formatDate(shipment.eta.estimatedArrival)}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {shipment.eta.durationHours.toFixed(1)} hours remaining
            </div>
            <span className={cn(
              'status-badge',
              shipment.eta.riskLevel === 'low' && 'status-low',
              shipment.eta.riskLevel === 'medium' && 'status-medium',
              shipment.eta.riskLevel === 'high' && 'status-high'
            )}>
              {shipment.eta.riskLevel} risk
            </span>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="text-xs text-muted-foreground mb-2">Delivery Window</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{formatTime(shipment.eta.confidenceWindow.earliest)}</span>
              <div className="flex-1 mx-3 h-1 bg-muted/30 rounded-full">
                <div className="h-full w-1/2 bg-primary rounded-full" />
              </div>
              <span className="text-foreground">{formatTime(shipment.eta.confidenceWindow.latest)}</span>
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Route Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Origin</div>
                <div className="text-sm font-medium text-foreground">{shipment.origin.address}</div>
                <div className="text-xs text-muted-foreground">
                  {shipment.origin.city}, {shipment.origin.state} {shipment.origin.zip}
                </div>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-dashed border-border h-8" />

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Destination</div>
                <div className="text-sm font-medium text-foreground">{shipment.destination.address}</div>
                <div className="text-xs text-muted-foreground">
                  {shipment.destination.city}, {shipment.destination.state} {shipment.destination.zip}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Timeline */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">Shipment History</h3>
        
        <div className="space-y-4">
          {shipment.events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  getStatusColor(event.status)
                )} />
                {index < shipment.events.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-2" />
                )}
              </div>
              
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {event.description}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {event.location}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(event.timestamp)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Sender</h4>
          <div className="text-sm font-medium text-foreground">{shipment.sender.name}</div>
          <div className="text-xs text-muted-foreground">{shipment.sender.email}</div>
        </div>
        <div className="glass-card p-5">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Receiver</h4>
          <div className="text-sm font-medium text-foreground">{shipment.receiver.name}</div>
          <div className="text-xs text-muted-foreground">{shipment.receiver.email}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrackingView;
