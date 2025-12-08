import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  MapPin 
} from 'lucide-react';
import { DashboardStats, Shipment } from '@/types/shipment';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  stats: DashboardStats;
  recentShipments: Shipment[];
  onViewShipment: (shipment: Shipment) => void;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}> = ({ icon, label, value, subValue, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="glass-card p-5 group cursor-pointer"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      {trend && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
          trend === 'up' && 'text-success bg-success/10',
          trend === 'down' && 'text-destructive bg-destructive/10',
          trend === 'neutral' && 'text-muted-foreground bg-muted/30'
        )}>
          <TrendingUp className={cn(
            'w-3 h-3',
            trend === 'down' && 'rotate-180'
          )} />
          {subValue}
        </div>
      )}
    </div>
    <motion.div 
      className="text-3xl font-bold text-foreground mb-1"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
    >
      {value}
    </motion.div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </motion.div>
);

const DashboardStatsComponent: React.FC<DashboardStatsProps> = ({ 
  stats, 
  recentShipments,
  onViewShipment 
}) => {
  const getStatusIcon = (status: Shipment['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="w-4 h-4 text-primary animate-truck-move" />;
      case 'delayed':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <Package className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: Shipment['status']) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-5 h-5 text-primary" />}
          label="Total Shipments"
          value={stats.totalShipments}
          delay={0}
        />
        <StatCard
          icon={<Truck className="w-5 h-5 text-primary" />}
          label="In Transit"
          value={stats.inTransit}
          subValue="+12%"
          trend="up"
          delay={0.1}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-success" />}
          label="Delivered"
          value={stats.delivered}
          subValue={`${stats.onTimeRate}% on-time`}
          trend="up"
          delay={0.2}
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
          label="Delayed"
          value={stats.delayed}
          subValue="-8%"
          trend="down"
          delay={0.3}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Average Delivery Time
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{stats.averageDeliveryTime}</span>
            <span className="text-sm text-muted-foreground mb-1">hours</span>
          </div>
          <div className="mt-3 h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-success rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.averageDeliveryTime / 48) * 100, 100)}%` }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            On-Time Delivery Rate
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{stats.onTimeRate}%</span>
            <span className="text-sm text-success mb-1">+2.5% this month</span>
          </div>
          <div className="mt-3 h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-success to-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.onTimeRate}%` }}
              transition={{ delay: 0.7, duration: 0.8 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Shipments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-5"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Shipments</h3>
        
        <div className="space-y-3">
          {recentShipments.slice(0, 5).map((shipment, index) => (
            <motion.button
              key={shipment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ x: 4, transition: { duration: 0.15 } }}
              onClick={() => onViewShipment(shipment)}
              className="w-full p-4 rounded-xl bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-primary/20 transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-background/50 group-hover:bg-primary/10 transition-colors">
                    {getStatusIcon(shipment.status)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {shipment.trackingNumber}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {shipment.origin.city} → {shipment.destination.city}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full text-center min-w-[80px]',
                    shipment.status === 'delivered' && 'bg-success/20 text-success',
                    shipment.status === 'in_transit' && 'bg-primary/20 text-primary',
                    shipment.status === 'delayed' && 'bg-destructive/20 text-destructive',
                    !['delivered', 'in_transit', 'delayed'].includes(shipment.status) && 'bg-muted/50 text-muted-foreground'
                  )}>
                    {getStatusLabel(shipment.status)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ETA: {formatDate(shipment.eta.estimatedArrival)}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardStatsComponent;
