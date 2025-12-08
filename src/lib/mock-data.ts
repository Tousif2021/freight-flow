import { Shipment, DashboardStats, ShipmentStatus, CarrierMode } from '@/types/shipment';
import { calculateETA, calculateDistance, estimateBaseDuration } from '@/lib/eta-calculator';

// Mock data generator
const generateTrackingNumber = () => {
  const prefix = 'FRT';
  const numbers = Math.random().toString().slice(2, 12);
  return `${prefix}${numbers}`;
};

const generateMockEvent = (status: ShipmentStatus, index: number, originCity: string, destCity: string) => {
  const now = new Date();
  const hoursAgo = (4 - index) * 6; // Events spaced 6 hours apart
  
  const locations: Record<ShipmentStatus, string> = {
    quote: originCity,
    pending: originCity,
    picked_up: originCity,
    in_transit: 'En Route',
    out_for_delivery: destCity,
    delivered: destCity,
    delayed: 'En Route',
  };

  const descriptions: Record<ShipmentStatus, string> = {
    quote: 'Quote requested',
    pending: 'Shipment confirmed',
    picked_up: 'Package picked up from sender',
    in_transit: 'In transit to destination',
    out_for_delivery: 'Out for delivery',
    delivered: 'Package delivered',
    delayed: 'Shipment delayed due to weather',
  };

  return {
    id: `evt-${index}`,
    status,
    location: locations[status],
    description: descriptions[status],
    timestamp: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
  };
};

const MOCK_ROUTES: Array<{
  origin: { address: string; city: string; state: string; zip: string; lat: number; lng: number };
  destination: { address: string; city: string; state: string; zip: string; lat: number; lng: number };
}> = [
  {
    origin: { address: '123 Main St', city: 'Los Angeles', state: 'CA', zip: '90001', lat: 34.0522, lng: -118.2437 },
    destination: { address: '456 Broadway', city: 'New York', state: 'NY', zip: '10001', lat: 40.7128, lng: -74.0060 },
  },
  {
    origin: { address: '789 Oak Ave', city: 'Chicago', state: 'IL', zip: '60601', lat: 41.8781, lng: -87.6298 },
    destination: { address: '321 Pine St', city: 'Miami', state: 'FL', zip: '33101', lat: 25.7617, lng: -80.1918 },
  },
  {
    origin: { address: '555 Market St', city: 'Seattle', state: 'WA', zip: '98101', lat: 47.6062, lng: -122.3321 },
    destination: { address: '222 Elm St', city: 'Denver', state: 'CO', zip: '80202', lat: 39.7392, lng: -104.9903 },
  },
  {
    origin: { address: '100 Tech Blvd', city: 'Houston', state: 'TX', zip: '77001', lat: 29.7604, lng: -95.3698 },
    destination: { address: '200 Innovation Dr', city: 'Atlanta', state: 'GA', zip: '30308', lat: 33.7490, lng: -84.3880 },
  },
];

const CARRIER_MODES: CarrierMode[] = ['ltl', 'tl-dry', 'flatbed', 'refrigerated'];

const generateMockShipment = (index: number): Shipment => {
  const route = MOCK_ROUTES[index % MOCK_ROUTES.length];
  const carrierMode = CARRIER_MODES[index % CARRIER_MODES.length];
  const statuses: ShipmentStatus[] = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'delayed'];
  const status = statuses[index % statuses.length];
  
  const distance = calculateDistance(
    route.origin.lat, route.origin.lng,
    route.destination.lat, route.destination.lng
  );
  const baseDuration = estimateBaseDuration(distance);
  const eta = calculateETA(baseDuration, carrierMode, route.origin.lat, route.destination.lat);

  const eventStatuses: ShipmentStatus[] = ['pending', 'picked_up'];
  if (status === 'in_transit' || status === 'out_for_delivery' || status === 'delivered') {
    eventStatuses.push('in_transit');
  }
  if (status === 'out_for_delivery' || status === 'delivered') {
    eventStatuses.push('out_for_delivery');
  }
  if (status === 'delivered') {
    eventStatuses.push('delivered');
  }
  if (status === 'delayed') {
    eventStatuses.push('delayed');
  }

  // Calculate current location for in-transit shipments
  let currentLocation;
  if (status === 'in_transit') {
    const progress = 0.3 + Math.random() * 0.4;
    currentLocation = {
      lat: route.origin.lat + (route.destination.lat - route.origin.lat) * progress,
      lng: route.origin.lng + (route.destination.lng - route.origin.lng) * progress,
      updatedAt: new Date(),
    };
  }

  return {
    id: `ship-${index}`,
    trackingNumber: generateTrackingNumber(),
    status,
    origin: route.origin,
    destination: route.destination,
    carrierMode,
    sender: {
      name: 'John Smith',
      email: 'john.smith@company.com',
    },
    receiver: {
      name: 'Jane Doe',
      email: 'jane.doe@business.com',
    },
    eta,
    currentLocation,
    events: eventStatuses.map((s, i) => 
      generateMockEvent(s, i, route.origin.city, route.destination.city)
    ),
    createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  };
};

// Generate mock shipments
export const mockShipments: Shipment[] = Array.from({ length: 10 }, (_, i) => generateMockShipment(i));

export const mockStats: DashboardStats = {
  totalShipments: 156,
  inTransit: 23,
  delivered: 128,
  delayed: 5,
  averageDeliveryTime: 32.5,
  onTimeRate: 94.2,
};

// Simulate API calls
export const api = {
  getShipments: async (): Promise<Shipment[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockShipments;
  },

  getShipment: async (id: string): Promise<Shipment | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockShipments.find(s => s.id === id || s.trackingNumber === id) || null;
  },

  getStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStats;
  },

  createShipment: async (data: {
    origin: Shipment['origin'];
    destination: Shipment['destination'];
    carrierMode: CarrierMode;
    sender: Shipment['sender'];
    receiver: Shipment['receiver'];
  }): Promise<Shipment> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const distance = calculateDistance(
      data.origin.lat, data.origin.lng,
      data.destination.lat, data.destination.lng
    );
    const baseDuration = estimateBaseDuration(distance);
    const eta = calculateETA(baseDuration, data.carrierMode, data.origin.lat, data.destination.lat);

    const newShipment: Shipment = {
      id: `ship-new-${Date.now()}`,
      trackingNumber: generateTrackingNumber(),
      status: 'pending',
      origin: data.origin,
      destination: data.destination,
      carrierMode: data.carrierMode,
      sender: data.sender,
      receiver: data.receiver,
      eta,
      events: [
        generateMockEvent('pending', 0, data.origin.city, data.destination.city),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockShipments.unshift(newShipment);
    return newShipment;
  },
};
