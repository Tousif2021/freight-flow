import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, Thermometer, Layers } from 'lucide-react';
import { CarrierMode, CarrierOption } from '@/types/shipment';
import { cn } from '@/lib/utils';

const CARRIER_OPTIONS: CarrierOption[] = [
  {
    id: 'tl-dry',
    name: 'TL Dry Van',
    description: 'Full truckload, direct route. Fastest & most reliable.',
    icon: 'truck',
    baseMultiplier: 1.0,
    riskProfile: 'low',
    features: ['Direct route', 'Lowest delay risk', 'Best for time-sensitive'],
  },
  {
    id: 'ltl',
    name: 'LTL Freight',
    description: 'Shared capacity with multiple stops. Cost-effective.',
    icon: 'package',
    baseMultiplier: 1.35,
    riskProfile: 'medium',
    features: ['Multiple stops', 'Cost-effective', 'Variable transit'],
  },
  {
    id: 'flatbed',
    name: 'Flatbed',
    description: 'Open deck for oversized or heavy loads.',
    icon: 'layers',
    baseMultiplier: 1.15,
    riskProfile: 'medium',
    features: ['Oversized loads', 'Route restrictions', 'Weather dependent'],
  },
  {
    id: 'refrigerated',
    name: 'Refrigerated',
    description: 'Temperature-controlled for perishables.',
    icon: 'thermometer',
    baseMultiplier: 1.2,
    riskProfile: 'medium',
    features: ['Temperature control', 'Strict timelines', 'Specialized handling'],
  },
];

const IconMap = {
  truck: Truck,
  package: Package,
  layers: Layers,
  thermometer: Thermometer,
};

interface CarrierSelectorProps {
  selectedCarrier: CarrierMode | null;
  onSelect: (carrier: CarrierMode) => void;
}

const CarrierSelector: React.FC<CarrierSelectorProps> = ({ selectedCarrier, onSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Select Carrier Mode</h3>
        <span className="text-xs text-muted-foreground">Choose based on your cargo needs</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CARRIER_OPTIONS.map((option, index) => {
          const Icon = IconMap[option.icon as keyof typeof IconMap];
          const isSelected = selectedCarrier === option.id;
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <button
                onClick={() => onSelect(option.id)}
                className={cn(
                  'carrier-card w-full text-left',
                  isSelected && 'selected'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'p-3 rounded-lg transition-colors duration-300',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground">{option.name}</h4>
                      <span className={cn(
                        'status-badge',
                        option.riskProfile === 'low' && 'status-low',
                        option.riskProfile === 'medium' && 'status-medium',
                        option.riskProfile === 'high' && 'status-high'
                      )}>
                        {option.riskProfile} risk
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {option.features.map((feature) => (
                        <span 
                          key={feature}
                          className="text-xs px-2 py-1 rounded-md bg-muted/30 text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {isSelected && (
                  <motion.div
                    layoutId="carrier-selected-indicator"
                    className="absolute top-3 right-3"
                    initial={false}
                  >
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CarrierSelector;
