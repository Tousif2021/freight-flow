import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Plus, 
  Truck, 
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapView from '@/components/MapView';
import AddressInput from '@/components/AddressInput';
import CarrierSelector from '@/components/CarrierSelector';
import ETADisplay from '@/components/ETADisplay';
import CheckoutForm, { CheckoutData } from '@/components/CheckoutForm';
import DashboardStats from '@/components/DashboardStats';
import TrackingView from '@/components/TrackingView';
import SuccessAnimation from '@/components/SuccessAnimation';
import { CarrierMode, Shipment, DashboardStats as DashboardStatsType } from '@/types/shipment';
import { calculateETA, calculateDistance, estimateBaseDuration } from '@/lib/eta-calculator';
import { api, mockStats, mockShipments } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type View = 'dashboard' | 'quote' | 'tracking';
type QuoteStep = 'locations' | 'carrier' | 'eta' | 'checkout';

const Index = () => {
  const [view, setView] = useState<View>('dashboard');
  const [quoteStep, setQuoteStep] = useState<QuoteStep>('locations');
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
  const [newTrackingNumber, setNewTrackingNumber] = useState('');

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
    setView('quote');
    setQuoteStep('locations');
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
        sender: { name: data.senderName, email: data.senderEmail },
        receiver: { name: data.receiverName, email: data.receiverEmail },
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
    setView('tracking');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quote', label: 'New Quote', icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessAnimation 
            trackingNumber={newTrackingNumber} 
            onContinue={handleSuccessContinue} 
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">FreightFlow</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Enterprise Logistics</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={view === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => item.id === 'quote' ? handleNewQuote() : setView(item.id as View)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 bg-background"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={view === item.id ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => {
                      item.id === 'quote' ? handleNewQuote() : setView(item.id as View);
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
            {view === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
                    <p className="text-muted-foreground">Overview of your shipments</p>
                  </div>
                  <Button variant="hero" onClick={handleNewQuote}>
                    <Plus className="w-4 h-4" /> New Quote
                  </Button>
                </div>

                <DashboardStats
                  stats={stats}
                  recentShipments={shipments}
                  onViewShipment={(shipment) => {
                    setSelectedShipment(shipment);
                    setView('tracking');
                  }}
                />
              </motion.div>
            )}

            {/* Quote View */}
            {view === 'quote' && (
              <motion.div
                key="quote"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Button variant="ghost" size="sm" onClick={() => setView('dashboard')} className="mb-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Form */}
                  <div className="space-y-6">
                    <AnimatePresence mode="wait">
                      {(quoteStep === 'locations' || quoteStep === 'carrier') && (
                        <motion.div
                          key="quote-entry"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="glass-card p-6"
                        >
                          <h2 className="text-xl font-bold text-foreground mb-6">Get a Quote</h2>
                          
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
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
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
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="mt-6"
                                    >
                                      <Button 
                                        variant="hero" 
                                        className="w-full" 
                                        onClick={() => setQuoteStep('eta')}
                                      >
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

                      {quoteStep === 'eta' && eta && (
                        <motion.div
                          key="quote-eta"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="glass-card p-6"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQuoteStep('locations')}
                            className="mb-4 -ml-2"
                          >
                            <ArrowLeft className="w-4 h-4" /> Edit Route
                          </Button>
                          <ETADisplay
                            eta={eta}
                            distanceMiles={distanceMiles}
                            originCity={origin?.city || ''}
                            destinationCity={destination?.city || ''}
                          />
                          <Button variant="hero" className="w-full mt-6" onClick={() => setQuoteStep('checkout')}>
                            Proceed to Checkout
                          </Button>
                        </motion.div>
                      )}

                      {quoteStep === 'checkout' && (
                        <motion.div
                          key="quote-checkout"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="glass-card p-6"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQuoteStep('eta')}
                            className="mb-4 -ml-2"
                          >
                            <ArrowLeft className="w-4 h-4" /> Back to ETA
                          </Button>
                          <CheckoutForm onSubmit={handleCheckout} isLoading={isCreating} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right: Map */}
                  <div className="h-[400px] lg:h-[600px] lg:sticky lg:top-24">
                    <MapView
                      origin={origin ? { lat: origin.lat, lng: origin.lng, label: origin.city } : undefined}
                      destination={destination ? { lat: destination.lat, lng: destination.lng, label: destination.city } : undefined}
                      showRoute={!!origin && !!destination && !!selectedCarrier}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tracking View */}
            {view === 'tracking' && selectedShipment && (
              <motion.div
                key="tracking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Button variant="ghost" size="sm" onClick={() => setView('dashboard')} className="mb-4">
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
