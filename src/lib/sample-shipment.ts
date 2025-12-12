import { TrackedShipment } from '@/types/tracking';

export const sampleShipment: TrackedShipment = {
  id: 'ship-sample-1',
  trackingNumber: 'EPI20251216',
  origin: {
    city: 'Chicago',
    state: 'IL',
    lat: 41.8781,
    lng: -87.6298,
  },
  destination: {
    city: 'Columbus',
    state: 'OH',
    lat: 39.9612,
    lng: -82.9988,
  },
  status: 'in_transit',
  segments: [
    {
      id: 'seg-1',
      from: 'Chicago, IL',
      to: 'Gary, IN',
      status: 'clear',
      reason: 'No delays',
    },
    {
      id: 'seg-2',
      from: 'Gary, IN',
      to: 'Toledo, OH',
      status: 'delayed',
      reason: 'Road closure due to accident',
      delayMinutes: { min: 18, max: 25 },
    },
    {
      id: 'seg-3',
      from: 'Toledo, OH',
      to: 'Columbus, OH',
      status: 'clear',
      reason: 'Normal traffic',
    },
  ],
  events: [
    {
      id: 'evt-1',
      status: 'packed',
      label: 'Order packed',
      time: 'Dec 11, 2025 • 08:30 AM',
      location: 'Chicago, IL',
      completed: true,
    },
    {
      id: 'evt-2',
      status: 'picked_up',
      label: 'Picked up',
      time: 'Dec 11, 2025 • 10:15 AM',
      location: 'Chicago, IL',
      completed: true,
    },
    {
      id: 'evt-3',
      status: 'in_transit',
      label: 'In transit',
      time: 'Dec 12, 2025 • 02:45 PM',
      location: 'Near Gary, IN',
      completed: true,
      current: true,
    },
    {
      id: 'evt-4',
      status: 'near_destination',
      label: 'Near destination',
      completed: false,
    },
    {
      id: 'evt-5',
      status: 'out_for_delivery',
      label: 'Out for delivery',
      completed: false,
    },
    {
      id: 'evt-6',
      status: 'delivered',
      label: 'Delivered',
      completed: false,
    },
  ],
  baseETA: {
    time: '16:10',
    description: 'Based on distance and historical averages',
  },
  predictedETA: {
    earliest: '16:42',
    latest: '17:05',
    description: 'Adjusted due to current conditions',
  },
  impactFactors: {
    traffic: {
      description: 'Road closure causing delay near Gary, IN',
      hasImpact: true,
    },
    weather: {
      description: 'Clear conditions — no impact',
      hasImpact: false,
    },
    incidents: {
      description: 'Accident reported on I-80',
      hasImpact: true,
    },
    historical: {
      description: 'This route usually slows during peak hours',
      hasImpact: false,
    },
  },
  currentLocation: {
    lat: 41.5934,
    lng: -87.3464,
  },
  distanceMiles: 355,
  baseDurationHours: 5.7,
  weatherDelay: {
    delayMinutes: 0,
    condition: 'Clear skies',
    hasImpact: false,
  },
};

export const findShipment = (trackingNumber: string): TrackedShipment | null => {
  // For demo, always return the sample shipment for any valid-looking ID
  if (trackingNumber && trackingNumber.length >= 3) {
    return {
      ...sampleShipment,
      trackingNumber: trackingNumber.toUpperCase(),
    };
  }
  return null;
};
