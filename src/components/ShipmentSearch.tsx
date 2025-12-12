import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, MapPin, Truck, Box } from 'lucide-react';
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
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient band - inspired by PostNord's hero section */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 50%, hsl(var(--card)) 100%)',
          }}
        />
        
        {/* Curved wave overlay */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[60%] opacity-[0.08]"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,100 C360,200 720,0 1080,100 C1260,150 1380,50 1440,100 L1440,400 L0,400 Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>

        {/* Secondary wave */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[40%] opacity-[0.05]"
          viewBox="0 0 1440 300"
          preserveAspectRatio="none"
        >
          <path
            d="M0,150 C480,50 960,200 1440,100 L1440,300 L0,300 Z"
            fill="currentColor"
            className="text-foreground"
          />
        </svg>

        {/* Soft radial glow behind search */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Left decorative elements - logistics themed watermarks */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
        <div className="relative">
          {/* Package icon */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.06, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute -left-8 top-0"
          >
            <Package className="w-32 h-32 text-foreground" strokeWidth={0.8} />
          </motion.div>
          
          {/* Location pin */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.08, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute left-12 top-32"
          >
            <MapPin className="w-24 h-24 text-foreground" strokeWidth={0.8} />
          </motion.div>

          {/* Box icon */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.05, x: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="absolute left-4 -top-24"
          >
            <Box className="w-20 h-20 text-foreground" strokeWidth={0.8} />
          </motion.div>
        </div>
      </div>

      {/* Right decorative element - truck illustration */}
      <div className="absolute right-0 bottom-1/4 pointer-events-none hidden xl:block">
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 0.07, x: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <Truck className="w-48 h-48 text-foreground -rotate-6" strokeWidth={0.6} />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 w-full max-w-3xl mx-auto px-6"
      >
        {/* Heading - Large and prominent like PostNord */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight leading-tight"
          >
            Track your shipment.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground font-light"
          >
            Enter your shipment ID for real-time updates
          </motion.p>
        </div>

        {/* Search Form - Clean and prominent */}
        <motion.form
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="relative"
        >
          {/* Search Container - Wide input with button */}
          <div className="flex items-center gap-0 bg-background border-2 border-border/60 rounded-full p-1.5 shadow-xl shadow-black/10 focus-within:border-primary/50 transition-colors">
            <Input
              type="text"
              placeholder="Enter Shipment ID…"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 h-14 text-lg pl-6 pr-4 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
            />
            <Button
              type="submit"
              className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Track
              <Search className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.form>

        {/* Trust Microcopy + Demo Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-8 space-y-3"
        >
          <p className="text-sm text-muted-foreground/60">
            Live updates based on traffic, incidents, and delivery history.
          </p>
          <div>
            <span className="text-sm text-muted-foreground/50">Try: </span>
            <button 
              onClick={() => {
                setTrackingNumber('EPI20251216');
                onSearch('EPI20251216');
              }}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors hover:underline underline-offset-2"
            >
              EPI20251216
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ShipmentSearch;
