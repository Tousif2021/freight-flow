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
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(var(--background)) 0%, hsl(var(--card)) 45%, hsl(var(--card)) 100%)",
          }}
        />

        {/* Primary wave */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[70%] opacity-[0.12]"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,120 C360,240 720,40 1080,140 C1260,200 1380,80 1440,120 L1440,400 L0,400 Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>

        {/* Secondary wave */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[55%] opacity-[0.06]"
          viewBox="0 0 1440 300"
          preserveAspectRatio="none"
        >
          <path
            d="M0,160 C480,80 960,220 1440,120 L1440,300 L0,300 Z"
            fill="currentColor"
            className="text-foreground"
          />
        </svg>

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px]"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ================= LEFT WATERMARKS ================= */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.06, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute -left-12 top-0"
          >
            <Package className="w-36 h-36 text-foreground" strokeWidth={0.8} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.08, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute left-10 top-40"
          >
            <MapPin className="w-28 h-28 text-foreground" strokeWidth={0.8} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.05, x: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="absolute left-2 -top-32"
          >
            <Box className="w-24 h-24 text-foreground" strokeWidth={0.8} />
          </motion.div>
        </div>
      </div>

      {/* ================= RIGHT WATERMARK ================= */}
      <div className="absolute right-0 bottom-1/4 pointer-events-none hidden xl:block">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 0.07, x: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <Truck className="w-52 h-52 text-foreground -rotate-6" strokeWidth={0.6} />
        </motion.div>
      </div>

      {/* ================= FOREGROUND CONTENT ================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl mx-auto px-6"
      >
        {/* Glass panel */}
        <div className="relative rounded-3xl border border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl shadow-black/20 px-10 py-16">
          {/* Inner highlight */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              boxShadow: "inset 0 0 0 1px hsl(var(--primary) / 0.05)",
            }}
          />

          {/* Heading */}
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">Track your shipment</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              See where your delivery is — and what’s affecting its arrival
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center bg-background border border-border/60 rounded-full p-2 shadow-xl focus-within:border-primary/60 transition">
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
        </div>
      </motion.div>
    </div>
  );
};

export default ShipmentSearch;
