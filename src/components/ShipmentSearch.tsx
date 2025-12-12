import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, MapPin, Truck, Box } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ShipmentSearchProps {
  onSearch: (trackingNumber: string) => void;
}

const ShipmentSearch: React.FC<ShipmentSearchProps> = ({ onSearch }) => {
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      onSearch(trackingNumber.trim());
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ================= FULL-PAGE SVG BACKGROUND ================= */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(var(--background)) 0%, hsl(var(--card)) 45%, hsl(var(--card)) 100%)",
          }}
        />

        {/* Top wave */}
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-[0.08]"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 L1440,0 L1440,200 C1200,280 720,120 360,200 C120,260 0,180 0,180 Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>

        {/* Primary wave - full page */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.10]"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <path
            d="M0,300 C240,450 480,200 720,350 C960,500 1200,250 1440,400 L1440,900 L0,900 Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>

        {/* Secondary wave - full page */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <path
            d="M0,500 C360,400 720,600 1080,450 C1260,380 1380,520 1440,480 L1440,900 L0,900 Z"
            fill="currentColor"
            className="text-foreground"
          />
        </svg>

        {/* Bottom accent wave */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[40%] opacity-[0.04]"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,100 C480,200 960,50 1440,150 L1440,400 L0,400 Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>

        {/* Central radial glow behind search */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px]"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* ================= ANIMATED TRUCK ================= */}
      <motion.div
        className="absolute top-[30%] pointer-events-none"
        initial={{ x: "-200px", opacity: 0 }}
        animate={{ 
          x: ["calc(-200px)", "calc(100vw + 200px)"],
          opacity: [0, 0.04, 0.04, 0]
        }}
        transition={{
          duration: 12,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 8,
          times: [0, 0.1, 0.9, 1]
        }}
      >
        <Truck className="w-40 h-40 text-foreground" strokeWidth={0.5} />
      </motion.div>

      {/* Secondary animated package */}
      <motion.div
        className="absolute top-[60%] pointer-events-none"
        initial={{ x: "calc(100vw + 100px)", opacity: 0 }}
        animate={{ 
          x: ["calc(100vw + 100px)", "-200px"],
          opacity: [0, 0.03, 0.03, 0]
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 12,
          delay: 5,
          times: [0, 0.1, 0.9, 1]
        }}
      >
        <Package className="w-28 h-28 text-foreground" strokeWidth={0.5} />
      </motion.div>

      {/* ================= LEFT WATERMARKS ================= */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.05, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute -left-16 top-0"
          >
            <Package className="w-40 h-40 text-foreground" strokeWidth={0.6} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.06, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute left-8 top-48"
          >
            <MapPin className="w-32 h-32 text-foreground" strokeWidth={0.6} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.04, x: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="absolute left-0 -top-40"
          >
            <Box className="w-28 h-28 text-foreground" strokeWidth={0.6} />
          </motion.div>
        </div>
      </div>

      {/* ================= RIGHT WATERMARK ================= */}
      <div className="absolute right-0 bottom-1/4 pointer-events-none hidden xl:block">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 0.05, x: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <Truck className="w-56 h-56 text-foreground -rotate-6" strokeWidth={0.5} />
        </motion.div>
      </div>

      {/* ================= FOREGROUND CONTENT (NO CARD) ================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl mx-auto px-6"
      >
        {/* Heading with text shadow */}
        <div className="text-center mb-14">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4"
            style={{
              textShadow: "0 2px 20px hsl(var(--background) / 0.5)"
            }}
          >
            Track your shipment
          </h1>
          <p 
            className="text-lg md:text-xl text-muted-foreground"
            style={{
              textShadow: "0 1px 10px hsl(var(--background) / 0.3)"
            }}
          >
            See where your delivery is — and what's affecting its arrival
          </p>
        </div>

        {/* Search with glow effect */}
        <form onSubmit={handleSubmit} className="relative">
          {/* Glow behind input */}
          <div 
            className="absolute inset-0 -m-4 rounded-full blur-2xl opacity-30"
            style={{
              background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.4) 0%, transparent 70%)"
            }}
          />
          
          <div className="relative flex items-center bg-background/80 backdrop-blur-sm border border-border/60 rounded-full p-2 shadow-2xl shadow-black/20 focus-within:border-primary/60 focus-within:shadow-primary/20 transition-all duration-300">
            <Input
              type="text"
              placeholder="Enter Shipment ID…"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 h-16 text-lg pl-6 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              type="submit"
              className="h-16 px-10 rounded-full bg-primary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Track
              <Search className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </form>

        {/* Trust + demo */}
        <div className="text-center mt-10 space-y-3">
          <p className="text-sm text-muted-foreground/70">
            Live updates based on traffic, incidents, and delivery history.
          </p>
          <div>
            <span className="text-sm text-muted-foreground/50">Try demo: </span>
            <button
              onClick={() => {
                setTrackingNumber("EPI20251216");
                onSearch("EPI20251216");
              }}
              className="text-sm text-primary font-medium hover:underline underline-offset-2"
            >
              EPI20251216
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShipmentSearch;
