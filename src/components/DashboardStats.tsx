import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  ArrowRight,
  Sparkles,
  Activity
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
  accent?: 'primary' | 'success' | 'destructive';
}> = ({ icon, label, value, subValue, trend, delay = 0, accent = 'primary' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="glass-card p-5 group cursor-pointer relative overflow-hidden"
  >
    {/* Subtle gradient overlay */}
    <div className={cn(
      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
      accent === 'primary' && "bg-gradient-to-br from-primary/5 to-transparent",
      accent === 'success' && "bg-gradient-to-br from-success/5 to-transparent",
      accent === 'destructive' && "bg-gradient-to-br from-destructive/5 to-transparent"
    )} />
    
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-2.5 rounded-xl transition-colors",
          accent === 'primary' && "bg-primary/10 group-hover:bg-primary/20",
          accent === 'success' && "bg-success/10 group-hover:bg-success/20",
          accent === 'destructive' && "bg-destructive/10 group-hover:bg-destructive/20"
        )}>
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
    </div>
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

  // Calculate status distribution for visual
  const total = stats.totalShipments || 1;
  const inTransitPercent = (stats.inTransit / total) * 100;
  const deliveredPercent = (stats.delivered / total) * 100;
  const delayedPercent = (stats.delayed / total) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-success/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Live Overview</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">Shipment Operations</h2>
            <p className="text-sm text-muted-foreground">Real-time visibility across your logistics network</p>
          </div>
          
          {/* Mini Status Distribution */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <div className="text-xs text-muted-foreground mb-2">Status Distribution</div>
              <div className="flex h-2 w-48 rounded-full overflow-hidden bg-muted/30">
                <motion.div 
                  className="bg-primary h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${inTransitPercent}%` }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                />
                <motion.div 
                  className="bg-success h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${deliveredPercent}%` }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                />
                <motion.div 
                  className="bg-destructive h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${delayedPercent}%` }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                />
              </div>
              <div className="flex gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Transit
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-success" /> Delivered
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-destructive" /> Delayed
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-5 h-5 text-primary" />}
          label="Total Shipments"
          value={stats.totalShipments}
          delay={0}
          accent="primary"
        />
        <StatCard
          icon={<Truck className="w-5 h-5 text-primary" />}
          label="In Transit"
          value={stats.inTransit}
          subValue="+12%"
          trend="up"
          delay={0.1}
          accent="primary"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-success" />}
          label="Delivered"
          value={stats.delivered}
          subValue={`${stats.onTimeRate}% on-time`}
          trend="up"
          delay={0.2}
          accent="success"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
          label="Delayed"
          value={stats.delayed}
          subValue="-8%"
          trend="down"
          delay={0.3}
          accent="destructive"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 relative overflow-hidden group"
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Average Delivery Time
              </h3>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-end gap-2 mb-4">
              <motion.span 
                className="text-4xl font-bold text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {stats.averageDeliveryTime}
              </motion.span>
              <span className="text-sm text-muted-foreground mb-1.5">hours</span>
            </div>
            <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary via-primary to-success rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.averageDeliveryTime / 48) * 100, 100)}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Target: 48 hours</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 relative overflow-hidden group"
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-success/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                On-Time Delivery Rate
              </h3>
              <span className="text-xs text-success font-medium bg-success/10 px-2 py-1 rounded-full">+2.5%</span>
            </div>
            <div className="flex items-end gap-2 mb-4">
              <motion.span 
                className="text-4xl font-bold text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {stats.onTimeRate}%
              </motion.span>
              <span className="text-sm text-success mb-1.5">this month</span>
            </div>
            <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-success via-success to-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.onTimeRate}%` }}
                transition={{ delay: 0.7, duration: 0.8 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Industry avg: 85%</p>
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
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Recent Shipments
          </h3>
          <span className="text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full">
            {recentShipments.length} total
          </span>
        </div>
        
        <div className="space-y-2">
          {recentShipments.slice(0, 5).map((shipment, index) => (
            <motion.button
              key={shipment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.08 }}
              whileHover={{ x: 4, transition: { duration: 0.15 } }}
              onClick={() => onViewShipment(shipment)}
              className="w-full p-4 rounded-xl bg-muted/10 hover:bg-muted/30 border border-border/30 hover:border-primary/30 transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-colors",
                    shipment.status === 'delivered' && "bg-success/10 group-hover:bg-success/20",
                    shipment.status === 'in_transit' && "bg-primary/10 group-hover:bg-primary/20",
                    shipment.status === 'delayed' && "bg-destructive/10 group-hover:bg-destructive/20",
                    !['delivered', 'in_transit', 'delayed'].includes(shipment.status) && "bg-muted/20 group-hover:bg-muted/30"
                  )}>
                    {getStatusIcon(shipment.status)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                      {shipment.trackingNumber}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
