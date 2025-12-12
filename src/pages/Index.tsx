import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShipmentSearch from "@/components/ShipmentSearch";
import OrderStatusPage from "@/components/OrderStatusPage";
import { TrackedShipment } from "@/types/tracking";
import { findShipment } from "@/lib/sample-shipment";
type View = "search" | "tracking";
const Index = () => {
  const [view, setView] = useState<View>("search");
  const [trackedShipment, setTrackedShipment] = useState<TrackedShipment | null>(null);

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const handleSearch = (trackingNumber: string) => {
    const shipment = findShipment(trackingNumber);
    if (shipment) {
      setTrackedShipment(shipment);
      setView("tracking");
    }
  };
  const handleBack = () => {
    setView("search");
    setTrackedShipment(null);
  };

  // Format time and date
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img alt="FreightFlow" src="/lovable-uploads/27136723-d33d-47dc-820c-d4c1bb0980ed.png" className="h-10 w-auto object-contain border-0 shadow-sm" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">FreightFlow</h1>
              <p className="text-xs font-medium text-muted-foreground hidden sm:block tracking-wide uppercase">
                Shipment Tracking
              </p>
            </div>
          </div>

          {/* Subtle Status Indicators */}
          <div className="hidden md:flex items-center gap-3 text-muted-foreground/50">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal/70" />
              <span className="text-[10px] font-medium uppercase tracking-wide">Online</span>
            </div>
            <span className="text-[11px] tabular-nums">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-0 py-0">
          <AnimatePresence mode="wait">
            {/* Search View */}
            {view === "search" && <motion.div key="search" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }}>
                <ShipmentSearch onSearch={handleSearch} />
              </motion.div>}

            {/* Tracking View */}
            {view === "tracking" && trackedShipment && <motion.div key="tracking" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }}>
                <OrderStatusPage shipment={trackedShipment} onBack={handleBack} />
              </motion.div>}
          </AnimatePresence>
        </div>
      </main>
    </div>;
};
export default Index;