import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, MapPin, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ShipmentSearchProps {
  onSearch: (trackingNumber: string) => void;
}

const ShipmentSearch: React.FC<ShipmentSearchProps> = ({ onSearch }) => {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      onSearch(trackingNumber.trim());
    }
  };

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Decorative Background Elements */}
      
      {/* Large curved wave SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M0,400 C200,300 400,500 600,400 C800,300 1000,450 1200,350 C1400,250 1440,400 1440,400 L1440,800 L0,800 Z"
          fill="currentColor"
          className="text-foreground"
        />
        <path
          d="M0,500 C300,400 500,600 800,450 C1100,300 1300,500 1440,450 L1440,800 L0,800 Z"
          fill="currentColor"
          className="text-foreground opacity-50"
        />
      </svg>

      {/* Logistics watermarks on left */}
      <div className="absolute left-8 top-1/4 opacity-[0.05] pointer-events-none">
        <Package className="w-24 h-24 text-foreground" strokeWidth={1} />
      </div>
      <div className="absolute left-16 bottom-1/4 opacity-[0.07] pointer-events-none">
        <MapPin className="w-20 h-20 text-foreground" strokeWidth={1} />
      </div>
      <div className="absolute left-4 top-1/2 opacity-[0.04] pointer-events-none">
        <Truck className="w-28 h-28 text-foreground" strokeWidth={1} />
      </div>

      {/* Yellow radial glow behind input */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.12) 0%, transparent 60%)',
        }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 w-full max-w-2xl mx-auto px-6"
      >
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight"
          >
            Track Your Shipment
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-muted-foreground"
          >
            Enter your shipment ID to get real-time updates
          </motion.p>
        </div>

        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="relative"
        >
          <div className="glass-card p-2 flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Enter Shipment ID..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="h-14 text-lg pl-5 pr-4 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              />
            </div>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="h-14 px-8 rounded-lg"
            >
              <Search className="w-5 h-5 mr-2" />
              Track
            </Button>
          </div>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          Try: <button 
            onClick={() => {
              setTrackingNumber('EPI20251216');
              onSearch('EPI20251216');
            }}
            className="text-primary hover:underline font-medium"
          >
            EPI20251216
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default ShipmentSearch;
