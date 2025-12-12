import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapView from '@/components/MapView';
import ArrivalSummary from '@/components/ArrivalSummary';
import RouteSegments from '@/components/RouteSegments';
import ETAComparison from '@/components/ETAComparison';
import WhyThisETA from '@/components/WhyThisETA';
import DeliveryTimeline from '@/components/DeliveryTimeline';
import { TrackedShipment } from '@/types/tracking';

interface OrderStatusPageProps {
  shipment: TrackedShipment;
  onBack: () => void;
}

const OrderStatusPage: React.FC<OrderStatusPageProps> = ({ shipment, onBack }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const handleSegmentClick = useCallback((segmentId: string) => {
    // Scroll map into view when clicking a segment
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // Get incidents for the map based on delayed segments
  const incidents = shipment.segments
    .filter(seg => seg.status === 'delayed')
    .map((seg, index) => ({
      id: `incident-${index}`,
      lat: (shipment.origin.lat + shipment.destination.lat) / 2 + (index * 0.1),
      lng: (shipment.origin.lng + shipment.destination.lng) / 2 + (index * 0.1),
      type: 'road_closure',
      severity: 'severe' as const,
      description: seg.reason || 'Delay detected',
      delay: (seg.delayMinutes?.min || 0) * 60,
    }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Search
      </Button>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Info */}
        <div className="space-y-6">
          {/* Section 1: Arrival Summary */}
          <ArrivalSummary shipment={shipment} />

          {/* Section 2: Route Segments */}
          <RouteSegments 
            segments={shipment.segments} 
            onSegmentClick={handleSegmentClick}
          />

          {/* Section 4: ETA Comparison */}
          <ETAComparison shipment={shipment} />

          {/* Section 5: Why This ETA */}
          <WhyThisETA impactFactors={shipment.impactFactors} />

          {/* Section 6: Delivery Timeline */}
          <DeliveryTimeline events={shipment.events} />
        </div>

        {/* Right Column - Map */}
        <div 
          ref={mapRef}
          className="h-[400px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-24"
        >
          <MapView
            origin={{
              lat: shipment.origin.lat,
              lng: shipment.origin.lng,
              label: `${shipment.origin.city}, ${shipment.origin.state}`,
            }}
            destination={{
              lat: shipment.destination.lat,
              lng: shipment.destination.lng,
              label: `${shipment.destination.city}, ${shipment.destination.state}`,
            }}
            currentLocation={shipment.currentLocation}
            incidents={incidents}
            showRoute={true}
            showAlternativeRoute={false}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default OrderStatusPage;
