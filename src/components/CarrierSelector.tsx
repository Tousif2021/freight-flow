import React from "react";
import { motion } from "framer-motion";
import { Truck, Package, Thermometer, Layers, Check } from "lucide-react";
import { CarrierMode, CarrierOption } from "@/types/shipment";
import { cn } from "@/lib/utils";

const CARRIER_OPTIONS: CarrierOption[] = [
  {
    id: "tl-dry",
    name: "TL Dry",
    description: "Fast | Direct | Full truck",
    icon: "truck",
    baseMultiplier: 1.0,
    riskProfile: "low",
    features: ["Direct", "Lowest risk"],
  },
  {
    id: "ltl",
    name: "LTL",
    description: "Shared load | Lower cost",
    icon: "package",
    baseMultiplier: 1.35,
    riskProfile: "medium",
    features: ["Multi-stop", "Budget"],
  },
  {
    id: "flatbed",
    name: "Flatbed",
    description: "Oversized loads",
    icon: "layers",
    baseMultiplier: 1.15,
    riskProfile: "medium",
    features: ["Heavy", "Open deck"],
  },
  {
    id: "refrigerated",
    name: "Reefer",
    description: "Cold-chain protected",
    icon: "thermometer",
    baseMultiplier: 1.2,
    riskProfile: "medium",
    features: ["Cold chain", "Perishables"],
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
  compact?: boolean;
}

const CarrierSelector: React.FC<CarrierSelectorProps> = ({ selectedCarrier, onSelect, compact = false }) => {
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Carrier Mode</h4>
          <span className="text-xs text-muted-foreground">Select one</span>
        </div>
        <div className="grid grid-cols-4 gap-2 py-3">
          {CARRIER_OPTIONS.map((option, index) => {
            const Icon = IconMap[option.icon as keyof typeof IconMap];
            const isSelected = selectedCarrier === option.id;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: isSelected ? 1.05 : 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                onClick={() => onSelect(option.id)}
                className={cn(
                  "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300",
                  "hover:border-primary/50 hover:bg-primary/5",
                  isSelected ? "border-primary bg-primary/10 shadow-glow" : "border-border/50 bg-muted/20",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg mb-2 transition-colors duration-300",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold transition-colors",
                    isSelected ? "text-primary" : "text-foreground",
                  )}
                >
                  {option.name}
                </span>
                <span className="text-[10px] text-muted-foreground text-center mt-0.5 line-clamp-1">
                  {option.description}
                </span>

                {isSelected && (
                  <motion.div
                    layoutId="carrier-check-compact"
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg"
                    initial={false}
                  >
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Select Carrier Mode</h3>
        <span className="text-xs text-muted-foreground">Choose based on your cargo needs</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CARRIER_OPTIONS.map((option, index) => {
          const Icon = IconMap[option.icon as keyof typeof IconMap];
          const isSelected = selectedCarrier === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3, ease: "easeOut" }}
              onClick={() => onSelect(option.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all duration-300",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected ? "border-primary bg-primary/10 shadow-glow" : "border-border/50 bg-muted/20",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "p-2.5 rounded-lg transition-colors duration-300",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-foreground text-sm">{option.name}</h4>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        option.riskProfile === "low" && "bg-success/20 text-success",
                        option.riskProfile === "medium" && "bg-warning/20 text-warning",
                        option.riskProfile === "high" && "bg-destructive/20 text-destructive",
                      )}
                    >
                      {option.riskProfile}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{option.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {option.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {isSelected && (
                <motion.div layoutId="carrier-selected-indicator" className="absolute top-2 right-2" initial={false}>
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CarrierSelector;
