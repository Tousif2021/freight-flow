export type CarrierMode = 'ltl' | 'tl-dry' | 'flatbed' | 'refrigerated';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ShipmentStatus = 
  | 'quote'
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'delayed';

export interface Location {
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
}

export interface ETAPrediction {
  estimatedArrival: Date;
  durationHours: number;
  riskLevel: RiskLevel;
  confidenceWindow: {
    earliest: Date;
    latest: Date;
  };
  factors: ETAFactor[];
  explanation: string;
  recommendations: string[];
}

export interface ETAFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  adjustment: number; // in hours, can be negative
}

export interface WeatherCondition {
  condition: 'clear' | 'rain' | 'snow' | 'wind' | 'fog';
  severity: 'light' | 'moderate' | 'severe';
  location: string;
}

export interface CarrierOption {
  id: CarrierMode;
  name: string;
  description: string;
  icon: string;
  baseMultiplier: number;
  riskProfile: RiskLevel;
  features: string[];
}

export interface Quote {
  id: string;
  origin: Location;
  destination: Location;
  carrierMode: CarrierMode;
  distanceMiles: number;
  eta: ETAPrediction;
  createdAt: Date;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: Location;
  destination: Location;
  carrierMode: CarrierMode;
  sender: {
    name: string;
    email: string;
  };
  receiver: {
    name: string;
    email: string;
  };
  eta: ETAPrediction;
  currentLocation?: {
    lat: number;
    lng: number;
    updatedAt: Date;
  };
  events: ShipmentEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentEvent {
  id: string;
  status: ShipmentStatus;
  location: string;
  description: string;
  timestamp: Date;
}

export interface DashboardStats {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  delayed: number;
  averageDeliveryTime: number;
  onTimeRate: number;
}
