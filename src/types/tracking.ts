export interface RouteSegment {
  id: string;
  from: string;
  to: string;
  status: 'clear' | 'delayed' | 'warning';
  reason?: string;
  delayMinutes?: { min: number; max: number };
}

export interface TrackingEvent {
  id: string;
  status: 'packed' | 'picked_up' | 'in_transit' | 'near_destination' | 'out_for_delivery' | 'delivered';
  label: string;
  time?: string;
  location?: string;
  completed: boolean;
  current?: boolean;
}

export interface TrackedShipment {
  id: string;
  trackingNumber: string;
  origin: {
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  destination: {
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  status: 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed';
  segments: RouteSegment[];
  events: TrackingEvent[];
  baseETA: {
    time: string;
    description: string;
  };
  predictedETA: {
    earliest: string;
    latest: string;
    description: string;
  };
  impactFactors: {
    traffic: { description: string; hasImpact: boolean };
    weather: { description: string; hasImpact: boolean };
    incidents: { description: string; hasImpact: boolean };
    historical: { description: string; hasImpact: boolean };
  };
  currentLocation?: {
    lat: number;
    lng: number;
  };
}
