import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Plus, Truck, ArrowLeft, Menu, X, Clock, Radio, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import MapView from "@/components/MapView";
import AddressInput from "@/components/AddressInput";
import CarrierSelector from "@/components/CarrierSelector";
import ETADisplay from "@/components/ETADisplay";
import CheckoutForm, { CheckoutData } from "@/components/CheckoutForm";
import DashboardStats from "@/components/DashboardStats";
import TrackingView from "@/components/TrackingView";
import SuccessAnimation from "@/components/SuccessAnimation";
import AIAdvisor from "@/components/AIAdvisor";
import ETALoadingScreen from "@/components/ETALoadingScreen";
import { CarrierMode, Shipment, DashboardStats as DashboardStatsType } from "@/types/shipment";
import { calculateETA, calculateDistance, estimateBaseDuration } from "@/lib/eta-calculator";
import { api, mockStats, mockShipments } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { TrafficIncident } from "@/components/MapView";
import { Link, CloudCheck, Server, Network } from "lucide-react";

type View = "dashboard" | "quote" | "tracking";
type QuoteStep = "locations" | "carrier" | "eta" | "checkout";

const Index = () => {
  const [view, setView] = useState<View>("dashboard");
  const [quoteStep, setQuoteStep] = useState<QuoteStep>("locations");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quote state
  const [origin, setOrigin] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierMode | null>(null);
  const [eta, setEta] = useState<any>(null);
  const [distanceMiles, setDistanceMiles] = useState(0);

  // Shipment state
  const [shipments, setShipments] = useState<Shipment[]>(mockShipments);
  const [stats] = useState<DashboardStatsType>(mockStats);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newTrackingNumber, setNewTrackingNumber] = useState("");
  const [trafficIncidents, setTrafficIncidents] = useState<TrafficIncident[]>([]);

  // Loading screen state
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate ETA when carrier is selected
  useEffect(() => {
    if (origin && destination && selectedCarrier) {
      const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
      setDistanceMiles(distance);
      const baseDuration = estimateBaseDuration(distance);
      const calculatedEta = calculateETA(baseDuration, selectedCarrier, origin.lat, destination.lat);
      setEta(calculatedEta);
    }
  }, [origin, destination, selectedCarrier]);
  const handleNewQuote = () => {
    setView("quote");
    setQuoteStep("locations");
    setOrigin(null);
    setDestination(null);
    setSelectedCarrier(null);
    setEta(null);
  };
  const handleCheckout = async (data: CheckoutData) => {
    if (!origin || !destination || !selectedCarrier) return;
    setIsCreating(true);
    try {
      const newShipment = await api.createShipment({
        origin,
        destination,
        carrierMode: selectedCarrier,
        sender: {
          name: data.senderName,
          email: data.senderEmail,
        },
        receiver: {
          name: data.receiverName,
          email: data.receiverEmail,
        },
      });
      setShipments([newShipment, ...shipments]);
      setNewTrackingNumber(newShipment.trackingNumber);
      setShowSuccess(true);
      setSelectedShipment(newShipment);
    } finally {
      setIsCreating(false);
    }
  };
  const handleSuccessContinue = () => {
    setShowSuccess(false);
    setView("tracking");
  };
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "quote",
      label: "New Quote",
      icon: Plus,
    },
  ];
  // Handle Calculate ETA click
  const handleCalculateETA = () => {
    if (!origin || !destination || !selectedCarrier) return;

    // Show loading screen
    setShowLoadingScreen(true);

    // Calculate ETA in background
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    setDistanceMiles(distance);
    const baseDuration = estimateBaseDuration(distance);
    const calculatedEta = calculateETA(baseDuration, selectedCarrier, origin.lat, destination.lat);
    setEta(calculatedEta);
  };

  // Handle loading screen completion
  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
    setQuoteStep("eta");
  };

  // Format time and date
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Loading Screen Overlay */}
      <AnimatePresence>{showLoadingScreen && <ETALoadingScreen onComplete={handleLoadingComplete} />}</AnimatePresence>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && <SuccessAnimation trackingNumber={newTrackingNumber} onContinue={handleSuccessContinue} />}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">FreightFlow</h1>
              <p className="text-xs font-medium text-muted-foreground hidden sm:block tracking-wide uppercase">
                Enterprise Logistics
              </p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="hidden lg:flex items-center gap-2">
            {/* System Online */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal/10 rounded-full border border-teal/30">
              <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-[10px] font-semibold text-teal uppercase tracking-wide">System Online</span>
            </div>

            {/* Date & Time */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 
     bg-slate-500/10 border border-slate-500/30 
     rounded-full"
            >
              <div className="w-3 h-3 rounded-full bg-slate-400/40 flex items-center justify-center">
                <Clock className="w-2 h-2 text-slate-300" />
              </div>

              <span className="text-[10px] font-semibold text-slate-200 tracking-wide">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </span>
            </div>

            {/* API Services Online */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full ">
              <Server className="w-3 h-3 text-blue-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">API Connected</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={item.id === "quote" ? "hero" : view === item.id ? "default" : "ghost"}
                size="sm"
                className={item.id === "quote" ? "border border-primary/30" : ""}
                onClick={() => (item.id === "quote" ? handleNewQuote() : setView(item.id as View))}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="md:hidden border-t border-border/50 bg-background"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={item.id === "quote" ? "hero" : view === item.id ? "default" : "ghost"}
                    className={cn("justify-start", item.id === "quote" && "border border-primary/30")}
                    onClick={() => {
                      item.id === "quote" ? handleNewQuote() : setView(item.id as View);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {/* Dashboard View */}
            {view === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
                  <p className="text-muted-foreground font-medium">Overview of your shipments</p>
                </div>

                <DashboardStats
                  stats={stats}
                  recentShipments={shipments}
                  onViewShipment={(shipment) => {
                    setSelectedShipment(shipment);
                    setView("tracking");
                  }}
                />
              </motion.div>
            )}

            {/* Quote View */}
            {view === "quote" && (
              <motion.div
                key="quote"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                }}
              >
                <Button variant="ghost" size="sm" onClick={() => setView("dashboard")} className="mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Form */}
                  <div className="space-y-6">
                    <AnimatePresence mode="wait">
                      {(quoteStep === "locations" || quoteStep === "carrier") && (
                        <motion.div
                          key="quote-entry"
                          initial={{
                            opacity: 0,
                            x: -20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -20,
                          }}
                          className="glass-card p-6 px-[24px]"
                        >
                          <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">Get a Quote</h2>

                          <div className="space-y-4 mb-6">
                            <AddressInput
                              label="Origin"
                              placeholder="Enter pickup city (e.g., Los Angeles)"
                              value={origin}
                              onChange={setOrigin}
                              icon="origin"
                            />
                            <AddressInput
                              label="Destination"
                              placeholder="Enter delivery city (e.g., New York)"
                              value={destination}
                              onChange={setDestination}
                              icon="destination"
                            />
                          </div>

                          <AnimatePresence>
                            {origin && destination && (
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  height: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                  height: "auto",
                                }}
                                exit={{
                                  opacity: 0,
                                  height: 0,
                                }}
                                transition={{
                                  duration: 0.3,
                                }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 border-t border-border/30">
                                  <CarrierSelector
                                    selectedCarrier={selectedCarrier}
                                    onSelect={(carrier) => {
                                      setSelectedCarrier(carrier);
                                    }}
                                    compact
                                  />

                                  {selectedCarrier && (
                                    <motion.div
                                      initial={{
                                        opacity: 0,
                                        y: 10,
                                      }}
                                      animate={{
                                        opacity: 1,
                                        y: 0,
                                      }}
                                      className="mt-6"
                                    >
                                      <Button variant="hero" className="w-full" onClick={handleCalculateETA}>
                                        Calculate ETA
                                      </Button>
                                    </motion.div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}

                      {quoteStep === "eta" && eta && (
                        <motion.div
                          key="quote-eta"
                          initial={{
                            opacity: 0,
                            x: 20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -20,
                          }}
                          className="glass-card p-4"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQuoteStep("locations")}
                            className="mb-3 -ml-2"
                          >
                            <ArrowLeft className="w-4 h-4" /> Edit Route
                          </Button>
                          <ETADisplay
                            eta={eta}
                            distanceMiles={distanceMiles}
                            originCity={origin?.city || ""}
                            destinationCity={destination?.city || ""}
                            originLat={origin?.lat}
                            originLng={origin?.lng}
                            destLat={destination?.lat}
                            destLng={destination?.lng}
                            onTrafficIncidents={setTrafficIncidents}
                          />
                          <Button variant="hero" className="w-full mt-4" onClick={() => setQuoteStep("checkout")}>
                            Proceed to Checkout
                          </Button>
                        </motion.div>
                      )}

                      {quoteStep === "checkout" && (
                        <motion.div
                          key="quote-checkout"
                          initial={{
                            opacity: 0,
                            x: 20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -20,
                          }}
                          className="glass-card p-4"
                        >
                          <Button variant="ghost" size="sm" onClick={() => setQuoteStep("eta")} className="mb-3 -ml-2">
                            <ArrowLeft className="w-4 h-4" /> Back to ETA
                          </Button>
                          <CheckoutForm onSubmit={handleCheckout} isLoading={isCreating} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right: Map with AI Advisor */}
                  <div className="h-[350px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-24 relative">
                    <MapView
                      origin={
                        origin
                          ? {
                              lat: origin.lat,
                              lng: origin.lng,
                              label: origin.city,
                            }
                          : undefined
                      }
                      destination={
                        destination
                          ? {
                              lat: destination.lat,
                              lng: destination.lng,
                              label: destination.city,
                            }
                          : undefined
                      }
                      incidents={trafficIncidents}
                      showRoute={!!origin && !!destination}
                      showAlternativeRoute={quoteStep === "eta"}
                      alternativeRouteReason="Road Closure Ahead"
                    />
                    {/* AI Advisor Popup */}
                    {quoteStep === "eta" && eta && (
                      <AIAdvisor
                        eta={eta}
                        carrierMode={selectedCarrier}
                        onCarrierChange={(carrier) => setSelectedCarrier(carrier)}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tracking View */}
            {view === "tracking" && selectedShipment && (
              <motion.div
                key="tracking"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -20,
                }}
              >
                <Button variant="ghost" size="sm" onClick={() => setView("dashboard")} className="mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Button>
                <TrackingView shipment={selectedShipment} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
export default Index;
