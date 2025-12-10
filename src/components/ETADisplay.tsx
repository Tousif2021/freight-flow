import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  MapPin,
  Truck,
  Route,
  Calendar,
  CloudSnow,
  CloudRain,
  Cloud,
  Sun,
  Loader2,
  Shield,
  Activity,
  Satellite,
  ChevronsUpDown,
  Check,
  Radio,
} from "lucide-react";
import { ETAPrediction } from "@/types/shipment";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import LivePulseIndicator from "./LivePulseIndicator";
import RouteTrafficBar from "./RouteTrafficBar";
import TomTomTrafficBar, { TrafficData } from "./TomTomTrafficBar";
import { TrafficIncident } from "./MapView";

interface WeatherData {
  condition: string;
  description: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  severity: "clear" | "mild" | "moderate" | "severe";
}

interface WeatherResponse {
  origin: WeatherData;
  destination: WeatherData;
  routeImpact: {
    delayFactor: number;
    riskLevel: "low" | "medium" | "high";
    warnings: string[];
  };
}

interface ETADisplayProps {
  eta: ETAPrediction;
  distanceMiles: number;
  originCity: string;
  destinationCity: string;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  onTrafficIncidents?: (incidents: TrafficIncident[]) => void;
}

const ETADisplay: React.FC<ETADisplayProps> = ({ eta, distanceMiles, originCity, destinationCity, originLat, originLng, destLat, destLng, onTrafficIncidents }) => {
  const [trafficStatus, setTrafficStatus] = useState<"loading" | "done">("loading");
  const [weatherStatus, setWeatherStatus] = useState<"loading" | "done">("loading");
  const [trafficProgress, setTrafficProgress] = useState(0);
  const [weatherProgress, setWeatherProgress] = useState(0);
  const [liveTrafficData, setLiveTrafficData] = useState<TrafficData | null>(null);
  const [liveWeatherData, setLiveWeatherData] = useState<WeatherResponse | null>(null);

  // Fetch live traffic data from TomTom
  const fetchTrafficData = useCallback(async () => {
    if (!originLat || !originLng || !destLat || !destLng) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("get-traffic", {
        body: { originLat, originLng, destLat, destLng },
      });
      if (!error && data) {
        setLiveTrafficData(data);
        // Pass incidents to parent for map display
        if (data.incidents && onTrafficIncidents) {
          onTrafficIncidents(data.incidents);
        }
      }
    } catch (err) {
      console.error("Traffic fetch error:", err);
    }
  }, [originLat, originLng, destLat, destLng, onTrafficIncidents]);

  // Fetch live weather data from OpenWeather
  const fetchWeatherData = useCallback(async () => {
    if (!originLat || !originLng || !destLat || !destLng) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("get-weather", {
        body: { originLat, originLng, destLat, destLng },
      });
      if (!error && data) {
        setLiveWeatherData(data);
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
    }
  }, [originLat, originLng, destLat, destLng]);

  // Fetch traffic data on mount and set up refresh
  useEffect(() => {
    fetchTrafficData();
    fetchWeatherData();
    const refreshInterval = setInterval(fetchTrafficData, 60000);
    return () => clearInterval(refreshInterval);
  }, [fetchTrafficData, fetchWeatherData]);

  useEffect(() => {
    setTrafficStatus("loading");
    setWeatherStatus("loading");
    setTrafficProgress(0);
    setWeatherProgress(0);
    const trafficInterval = setInterval(() => {
      setTrafficProgress((prev) => {
        if (prev >= 100) {
          clearInterval(trafficInterval);
          setTimeout(() => setTrafficStatus("done"), 300);
          return 100;
        }
        return prev + Math.random() * 20 + 10;
      });
    }, 150);
    const weatherInterval = setInterval(() => {
      setWeatherProgress((prev) => {
        if (prev >= 100) {
          clearInterval(weatherInterval);
          setTimeout(() => setWeatherStatus("done"), 300);
          return 100;
        }
        return prev + Math.random() * 18 + 8;
      });
    }, 180);
    return () => {
      clearInterval(trafficInterval);
      clearInterval(weatherInterval);
    };
  }, [eta]);

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  const formatDay = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  const totalAdjustment = eta.factors.reduce((sum, f) => sum + f.adjustment, 0);
  const isDataLoading = trafficStatus === "loading" || weatherStatus === "loading";
  const variabilityHours =
    (eta.confidenceWindow.latest.getTime() - eta.confidenceWindow.earliest.getTime()) / 3600000 / 2;

  // Get specific factor data
  const carrierFactor = eta.factors.find(
    (f) => f.name.toLowerCase().includes("carrier") || f.name.toLowerCase().includes("mode"),
  );
  const trafficFactor = eta.factors.find((f) => f.name.toLowerCase().includes("traffic"));
  const dayFactor = eta.factors.find(
    (f) => f.name.toLowerCase().includes("day") || f.name.toLowerCase().includes("week"),
  );
  const weatherFactor = eta.factors.find((f) => f.name.toLowerCase().includes("weather"));

  // Dynamic traffic impact based on live TomTom data
  const getTrafficImpactLevel = () => {
    if (!liveTrafficData) return { level: "moderate", color: "amber" };
    switch (liveTrafficData.status) {
      case "green": return { level: "low", color: "teal" };
      case "yellow": return { level: "moderate", color: "amber" };
      case "red": return { level: "high", color: "red" };
      default: return { level: "moderate", color: "amber" };
    }
  };

  const getTrafficDescription = () => {
    if (!liveTrafficData) return `Traffic conditions to ${destinationCity}`;
    switch (liveTrafficData.status) {
      case "green": return `Light traffic on route to ${destinationCity}`;
      case "yellow": return `Moderate congestion approaching ${destinationCity}`;
      case "red": return `Heavy traffic / delays near ${destinationCity}`;
      default: return `Traffic conditions to ${destinationCity}`;
    }
  };

  const trafficImpact = getTrafficImpactLevel();

  // Dynamic weather impact based on live OpenWeather data
  const getWeatherImpactLevel = () => {
    if (!liveWeatherData) return { level: "moderate", color: "amber" };
    switch (liveWeatherData.routeImpact.riskLevel) {
      case "low": return { level: "low", color: "teal" };
      case "medium": return { level: "moderate", color: "amber" };
      case "high": return { level: "high", color: "red" };
      default: return { level: "moderate", color: "amber" };
    }
  };

  const getWeatherDescription = () => {
    if (!liveWeatherData) return `Weather conditions along route`;
    const dest = liveWeatherData.destination;
    const warnings = liveWeatherData.routeImpact.warnings;
    if (warnings.length > 0) {
      return warnings[0];
    }
    return `${dest.description} at ${destinationCity.split(",")[0]} (${Math.round(dest.temperature)}°F)`;
  };

  const getWeatherIcon = () => {
    if (!liveWeatherData) return CloudSnow;
    const condition = liveWeatherData.destination.condition;
    switch (condition) {
      case "rain": return CloudRain;
      case "snow": return CloudSnow;
      case "clear": return Sun;
      default: return Cloud;
    }
  };

  const weatherImpact = getWeatherImpactLevel();
  const WeatherIcon = getWeatherIcon();
  const weatherDelayHours = liveWeatherData ? liveWeatherData.routeImpact.delayFactor * (weatherFactor?.adjustment || 0.5) : (weatherFactor?.adjustment || 0.5);

  // Card hover animation variants
  const cardHoverVariants = {
    rest: {
      scale: 1,
      y: 0,
    },
    hover: {
      scale: 1.02,
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };
  const iconHoverVariants = {
    rest: {
      rotate: 0,
    },
    hover: {
      rotate: [0, -10, 10, 0],
      transition: {
        duration: 0.4,
      },
    },
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.3,
      }}
      className="space-y-2"
    >
      {/* Live Data Fetching Status */}
      <AnimatePresence>
        {isDataLoading && (
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
            className="glass-card p-2 border border-primary/20"
          >
            <div className="grid grid-cols-2 gap-2">
              {/* Traffic API */}
              <div
                className={cn(
                  "p-2 rounded-lg border transition-all",
                  trafficStatus === "done" ? "bg-teal/10 border-teal/30" : "bg-muted/10 border-border/30",
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {trafficStatus === "loading" ? (
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="w-3 h-3 text-primary" />
                    </motion.div>
                  ) : (
                    <Route className="w-3 h-3 text-teal" />
                  )}
                  <span className="text-[10px] font-semibold text-foreground">Traffic</span>
                  {trafficStatus === "done" && <LivePulseIndicator size="sm" color="success" className="ml-auto" />}
                </div>
                <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", trafficStatus === "done" ? "bg-teal" : "bg-primary")}
                    style={{
                      width: `${Math.min(100, trafficProgress)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Weather API */}
              <div
                className={cn(
                  "p-2 rounded-lg border transition-all",
                  weatherStatus === "done" ? "bg-teal/10 border-teal/30" : "bg-muted/10 border-border/30",
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {weatherStatus === "loading" ? (
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 className="w-3 h-3 text-primary" />
                    </motion.div>
                  ) : (
                    <Satellite className="w-3 h-3 text-teal" />
                  )}
                  <span className="text-[10px] font-semibold text-foreground">Weather</span>
                  {weatherStatus === "done" && <LivePulseIndicator size="sm" color="success" className="ml-auto" />}
                </div>
                <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", weatherStatus === "done" ? "bg-teal" : "bg-primary")}
                    style={{
                      width: `${Math.min(100, weatherProgress)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero ETA Card */}
      <div className="glass-card overflow-visible relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute -top-8 -right-8 w-24 h-24 bg-primary/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />

        <div className="relative p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
              Arrival Prediction
            </span>
            {/* Enhanced Risk Badge with pulsing border */}
            <motion.span
              className={cn(
                "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide flex items-center gap-1.5 border",
                eta.riskLevel === "low" && "bg-teal/20 text-teal border-teal/40",
                eta.riskLevel === "medium" && "bg-amber/20 text-amber border-amber/40",
                eta.riskLevel === "high" && "bg-red-600/30 text-red-300 border-red-500/40",
              )}
              animate={
                eta.riskLevel === "high"
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(239,68,68,0.3)",
                        "0 0 8px 2px rgba(239,68,68,0.4)",
                        "0 0 0 0 rgba(239,68,68,0.3)",
                      ],
                    }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <AlertTriangle className="w-3 h-3" />
              <Clock className="w-2.5 h-2.5" />
              {eta.riskLevel === "high" ? "HIGH DELAY RISK" : eta.riskLevel === "medium" ? "MODERATE RISK" : "LOW RISK"}
            </motion.span>
          </div>

          {/* Time + Date row with realistic window */}
          <div className="flex items-end gap-2 mb-3">
            <motion.span
              animate={{
                textShadow: [
                  "0 0 15px hsl(var(--primary) / 0)",
                  "0 0 25px hsl(var(--primary) / 0.4)",
                  "0 0 15px hsl(var(--primary) / 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="text-primary tracking-tight font-sans text-center text-5xl font-extrabold"
            >
              {formatTime(eta.estimatedArrival)}
            </motion.span>
            <div className="pb-1">
              <div className="text-xs font-medium text-foreground">{formatDay(eta.estimatedArrival)}</div>
              <div className="text-[10px] text-muted-foreground">
                Likely window: {formatTime(eta.confidenceWindow.earliest)} – {formatTime(eta.confidenceWindow.latest)}
              </div>
            </div>
          </div>

          {/* Enhanced Metric Pills */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-muted/30 rounded-full">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">
                Transit: {eta.durationHours.toFixed(1)} h
              </span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-muted/30 rounded-full">
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">
                Distance: {distanceMiles.toLocaleString()} mi
              </span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-muted/30 rounded-full">
              <ChevronsUpDown className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">
                Variability: ± {variabilityHours.toFixed(1)} h
              </span>
            </div>
          </div>

          {/* TomTom Traffic Visibility Bar */}
          {originLat && originLng && destLat && destLng && (
            <TomTomTrafficBar
              originLat={originLat}
              originLng={originLng}
              destLat={destLat}
              destLng={destLng}
              originCity={originCity}
              destinationCity={destinationCity}
              trafficData={liveTrafficData}
              onTrafficDataChange={setLiveTrafficData}
              className="mt-3 border-t border-border/30 pt-2"
            />
          )}
        </div>
      </div>

      {/* Impact Analysis Section */}
      <div className="glass-card relative overflow-visible">
        <div className="px-3 py-2 border-b border-border/30 bg-gradient-to-r from-muted/20 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">Impact Analysis</span>
          </div>
          {/* Amber total impact pill */}
          <div className="px-2 py-0.5 rounded flex items-center gap-1 bg-amber/20">
            <span className="text-xs font-black tabular-nums text-amber">
              Total Impact: {totalAdjustment > 0 ? "+" : ""}
              {totalAdjustment.toFixed(1)}h
            </span>
          </div>
        </div>

        <div className="p-2 space-y-1.5">
          {/* Carrier Mode Card - Check for zero impact */}
          {carrierFactor && (
            <motion.div
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              variants={cardHoverVariants}
              whileHover="hover"
              transition={{
                delay: 0.05,
              }}
              className={cn(
                "relative rounded-lg p-3 border-2 cursor-pointer group",
                carrierFactor.adjustment === 0 
                  ? "bg-teal/10 border-teal/60"
                  : carrierFactor.adjustment <= 3.0
                    ? "bg-amber/10 border-amber/60"
                    : "bg-slate-700/50 border-red-500/60"
              )}
            >
              <motion.div className={cn(
                "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                carrierFactor.adjustment === 0 ? "bg-teal/5" : carrierFactor.adjustment <= 3.0 ? "bg-amber/5" : "bg-red-500/5"
              )} />
              <div className="relative flex items-center gap-2">
                <motion.div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    carrierFactor.adjustment === 0 ? "bg-teal/20" : carrierFactor.adjustment <= 3.0 ? "bg-amber/20" : "bg-red-500/20"
                  )}
                  variants={iconHoverVariants}
                >
                  <Truck className={cn(
                    "w-4 h-4 group-hover:scale-110 transition-transform",
                    carrierFactor.adjustment === 0 ? "text-teal" : carrierFactor.adjustment <= 3.0 ? "text-amber" : "text-red-400"
                  )} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={cn(
                      "text-[11px] font-bold",
                      carrierFactor.adjustment === 0 ? "text-teal" : carrierFactor.adjustment <= 3.0 ? "text-amber" : "text-red-400"
                    )}>Carrier Mode</span>
                    <span className={cn(
                      "px-1.5 py-0.5 text-[8px] font-black uppercase rounded",
                      carrierFactor.adjustment === 0 
                        ? "bg-teal/30 text-teal" 
                        : carrierFactor.adjustment <= 3.0
                          ? "bg-amber/30 text-amber"
                          : "bg-red-500/30 text-red-300"
                    )}>
                      {carrierFactor.adjustment === 0 ? "NO IMPACT" : carrierFactor.adjustment <= 3.0 ? "MODERATE" : "HIGH IMPACT"}
                    </span>
                  </div>
                  <p className={cn(
                    "text-[9px]",
                    carrierFactor.adjustment === 0 ? "text-teal/70" : carrierFactor.adjustment <= 3.0 ? "text-amber/70" : "text-red-300/70"
                  )}>{carrierFactor.adjustment === 0 ? "No measurable impact on transit time" : carrierFactor.description}</p>
                </div>
                <motion.div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded transition-colors",
                    carrierFactor.adjustment === 0 
                      ? "bg-teal/20 group-hover:bg-teal/30" 
                      : carrierFactor.adjustment <= 3.0
                        ? "bg-amber/20 group-hover:bg-amber/30"
                        : "bg-red-500/20 group-hover:bg-red-500/30"
                  )}
                  whileHover={{
                    scale: 1.05,
                  }}
                >
                  {carrierFactor.adjustment === 0 ? (
                    <Check className="w-3 h-3 text-teal" />
                  ) : (
                    <Truck className={cn("w-3 h-3", carrierFactor.adjustment <= 3.0 ? "text-amber" : "text-red-400")} />
                  )}
                  <span className={cn(
                    "text-[10px] font-black",
                    carrierFactor.adjustment === 0 ? "text-teal" : carrierFactor.adjustment <= 3.0 ? "text-amber" : "text-red-400"
                  )}>
                    {carrierFactor.adjustment === 0 ? "± 0.0h" : `+${carrierFactor.adjustment.toFixed(1)}h`}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Traffic Conditions Card - Dynamic based on TomTom data */}
          {trafficFactor && (
            <motion.div
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              variants={cardHoverVariants}
              whileHover="hover"
              transition={{
                delay: 0.1,
              }}
              className={cn(
                "relative rounded-lg p-3 border-2 cursor-pointer group",
                trafficImpact.color === "teal" && "bg-teal/10 border-teal/60",
                trafficImpact.color === "amber" && "bg-amber/10 border-amber/60",
                trafficImpact.color === "red" && "bg-slate-800/50 border-red-500/60"
              )}
            >
              <motion.div 
                className={cn(
                  "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  trafficImpact.color === "teal" && "bg-teal/5",
                  trafficImpact.color === "amber" && "bg-amber/5",
                  trafficImpact.color === "red" && "bg-red-500/5"
                )} 
              />
              <div className="relative flex items-center gap-2">
                <motion.div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    trafficImpact.color === "teal" && "bg-teal/20",
                    trafficImpact.color === "amber" && "bg-amber/20",
                    trafficImpact.color === "red" && "bg-red-500/20"
                  )}
                  variants={iconHoverVariants}
                  animate={trafficImpact.color === "red" ? {
                    boxShadow: [
                      "0 0 0 0 rgba(239,68,68,0.3)",
                      "0 0 0 6px rgba(239,68,68,0)",
                      "0 0 0 0 rgba(239,68,68,0)",
                    ],
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <Route className={cn(
                    "w-4 h-4 group-hover:scale-110 transition-transform",
                    trafficImpact.color === "teal" && "text-teal",
                    trafficImpact.color === "amber" && "text-amber",
                    trafficImpact.color === "red" && "text-red-400"
                  )} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={cn(
                      "text-[11px] font-bold",
                      trafficImpact.color === "teal" && "text-teal",
                      trafficImpact.color === "amber" && "text-amber",
                      trafficImpact.color === "red" && "text-red-400"
                    )}>Traffic</span>
                    <span className={cn(
                      "px-1.5 py-0.5 text-[8px] font-black uppercase rounded",
                      trafficImpact.color === "teal" && "bg-teal/30 text-teal",
                      trafficImpact.color === "amber" && "bg-amber/30 text-amber",
                      trafficImpact.color === "red" && "bg-red-500/30 text-red-300"
                    )}>
                      {trafficImpact.level === "low" ? "LOW IMPACT" : trafficImpact.level === "moderate" ? "MODERATE" : "HIGH IMPACT"}
                    </span>
                    {/* Live Feed Indicator */}
                    <div className="flex items-center gap-1 ml-1">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      >
                        <Radio className={cn(
                          "w-2.5 h-2.5",
                          trafficImpact.color === "teal" && "text-teal",
                          trafficImpact.color === "amber" && "text-amber",
                          trafficImpact.color === "red" && "text-red-400"
                        )} />
                      </motion.div>
                      <span className={cn(
                        "text-[7px] uppercase font-semibold",
                        trafficImpact.color === "teal" && "text-teal/70",
                        trafficImpact.color === "amber" && "text-amber/70",
                        trafficImpact.color === "red" && "text-red-400/70"
                      )}>Live</span>
                    </div>
                  </div>
                  <p className={cn(
                    "text-[9px]",
                    trafficImpact.color === "teal" && "text-teal/70",
                    trafficImpact.color === "amber" && "text-amber/70",
                    trafficImpact.color === "red" && "text-red-300/70"
                  )}>{getTrafficDescription()}</p>
                  {/* Mini timeline bar with destination marker */}
                  <div className="flex items-center gap-0.5 mt-2">
                    <div className="flex-1 h-0.5 bg-muted/30 rounded-full relative">
                      <motion.div
                        className={cn(
                          "absolute right-1/4 -top-1.5 w-1.5 h-1.5 rounded-full",
                          trafficImpact.color === "teal" && "bg-teal",
                          trafficImpact.color === "amber" && "bg-amber",
                          trafficImpact.color === "red" && "bg-red-400"
                        )}
                        animate={{
                          scale: [1, 1.3, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      />
                      <span className={cn(
                        "absolute right-1/4 -top-5 text-[7px] font-semibold transform -translate-x-1/2",
                        trafficImpact.color === "teal" && "text-teal",
                        trafficImpact.color === "amber" && "text-amber",
                        trafficImpact.color === "red" && "text-red-400"
                      )}>
                        {destinationCity.split(",")[0]}
                      </span>
                    </div>
                  </div>
                </div>
                <motion.div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded transition-colors",
                    trafficImpact.color === "teal" && "bg-teal/20 group-hover:bg-teal/30",
                    trafficImpact.color === "amber" && "bg-amber/20 group-hover:bg-amber/30",
                    trafficImpact.color === "red" && "bg-red-500/20 group-hover:bg-red-500/30"
                  )}
                  whileHover={{
                    scale: 1.05,
                  }}
                >
                  <Route className={cn(
                    "w-3 h-3",
                    trafficImpact.color === "teal" && "text-teal",
                    trafficImpact.color === "amber" && "text-amber",
                    trafficImpact.color === "red" && "text-red-400"
                  )} />
                  <span className={cn(
                    "text-[10px] font-black",
                    trafficImpact.color === "teal" && "text-teal",
                    trafficImpact.color === "amber" && "text-amber",
                    trafficImpact.color === "red" && "text-red-400"
                  )}>
                    {trafficImpact.level === "low" ? "± 0.0h" : `+${trafficFactor.adjustment.toFixed(1)}h`}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Day of Week Card - Dynamic styling based on impact */}
          {dayFactor && (
            <motion.div
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              variants={cardHoverVariants}
              whileHover="hover"
              transition={{
                delay: 0.15,
              }}
              className={cn(
                "relative rounded-lg p-3 border-2 cursor-pointer group",
                dayFactor.adjustment === 0 
                  ? "bg-teal/10 border-teal/60"
                  : dayFactor.adjustment <= 3.0
                    ? "bg-amber/10 border-amber/60"
                    : "bg-slate-700/50 border-red-500/60"
              )}
            >
              <motion.div className={cn(
                "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                dayFactor.adjustment === 0 ? "bg-teal/5" : dayFactor.adjustment <= 3.0 ? "bg-amber/5" : "bg-red-500/5"
              )} />
              <div className="relative flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  dayFactor.adjustment === 0 ? "bg-teal/20" : dayFactor.adjustment <= 3.0 ? "bg-amber/20" : "bg-red-500/20"
                )}>
                  <Calendar className={cn(
                    "w-4 h-4 group-hover:scale-110 transition-transform",
                    dayFactor.adjustment === 0 ? "text-teal" : dayFactor.adjustment <= 3.0 ? "text-amber" : "text-red-400"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={cn(
                      "text-[11px] font-bold",
                      dayFactor.adjustment === 0 ? "text-teal" : dayFactor.adjustment <= 3.0 ? "text-amber" : "text-red-400"
                    )}>Day of Week</span>
                    <span className={cn(
                      "px-1.5 py-0.5 text-[8px] font-black uppercase rounded",
                      dayFactor.adjustment === 0 
                        ? "bg-teal/30 text-teal" 
                        : dayFactor.adjustment <= 3.0
                          ? "bg-amber/30 text-amber"
                          : "bg-red-500/30 text-red-300"
                    )}>
                      {dayFactor.adjustment === 0 ? "NO IMPACT" : dayFactor.adjustment <= 3.0 ? "MODERATE" : "HIGH IMPACT"}
                    </span>
                  </div>
                  <p className={cn(
                    "text-[9px]",
                    dayFactor.adjustment === 0 ? "text-teal/70" : dayFactor.adjustment <= 3.0 ? "text-amber/70" : "text-red-300/70"
                  )}>{dayFactor.adjustment === 0 ? "Conditions stable" : dayFactor.description}</p>
                </div>
                <motion.div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded transition-colors",
                    dayFactor.adjustment === 0 
                      ? "bg-teal/20 group-hover:bg-teal/30" 
                      : dayFactor.adjustment <= 3.0
                        ? "bg-amber/20 group-hover:bg-amber/30"
                        : "bg-red-500/20 group-hover:bg-red-500/30"
                  )}
                  whileHover={{
                    scale: 1.05,
                  }}
                >
                  <Check className={cn(
                    "w-3 h-3",
                    dayFactor.adjustment === 0 ? "text-teal" : dayFactor.adjustment <= 3.0 ? "text-amber" : "text-red-400"
                  )} />
                  <span className={cn(
                    "text-[10px] font-black",
                    dayFactor.adjustment === 0 ? "text-teal" : dayFactor.adjustment <= 3.0 ? "text-amber" : "text-red-400"
                  )}>
                    {dayFactor.adjustment === 0 ? "± 0.0h" : `+${dayFactor.adjustment.toFixed(1)}h`}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Weather Card - Dynamic based on OpenWeather data */}
          {weatherFactor && (
            <motion.div
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              variants={cardHoverVariants}
              whileHover="hover"
              transition={{
                delay: 0.2,
              }}
              className={cn(
                "relative rounded-lg p-3 border-2 overflow-hidden cursor-pointer group",
                weatherImpact.color === "teal" && "bg-teal/10 border-teal/60",
                weatherImpact.color === "amber" && "bg-amber/10 border-amber/60",
                weatherImpact.color === "red" && "bg-slate-700/50 border-red-500/60"
              )}
            >
              {/* Subtle diagonal grain overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
              <motion.div className={cn(
                "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                weatherImpact.color === "teal" && "bg-teal/5",
                weatherImpact.color === "amber" && "bg-amber/5",
                weatherImpact.color === "red" && "bg-red-500/5"
              )} />
              <div className="relative flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  weatherImpact.color === "teal" && "bg-teal/20",
                  weatherImpact.color === "amber" && "bg-amber/20",
                  weatherImpact.color === "red" && "bg-red-500/20"
                )}>
                  <WeatherIcon className={cn(
                    "w-4 h-4 group-hover:scale-110 transition-transform",
                    weatherImpact.color === "teal" && "text-teal",
                    weatherImpact.color === "amber" && "text-amber",
                    weatherImpact.color === "red" && "text-red-400"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={cn(
                      "text-[11px] font-bold",
                      weatherImpact.color === "teal" && "text-teal",
                      weatherImpact.color === "amber" && "text-amber",
                      weatherImpact.color === "red" && "text-red-400"
                    )}>Weather</span>
                    <span className={cn(
                      "px-1.5 py-0.5 text-[8px] font-black uppercase rounded",
                      weatherImpact.color === "teal" && "bg-teal/30 text-teal",
                      weatherImpact.color === "amber" && "bg-amber/30 text-amber",
                      weatherImpact.color === "red" && "bg-red-500/30 text-red-300"
                    )}>
                      {weatherImpact.level === "low" ? "NO IMPACT" : weatherImpact.level === "moderate" ? "MODERATE" : "HIGH IMPACT"}
                    </span>
                    {/* Live Feed Indicator */}
                    <div className="flex items-center gap-1 ml-1">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      >
                        <Radio className={cn(
                          "w-2.5 h-2.5",
                          weatherImpact.color === "teal" && "text-teal",
                          weatherImpact.color === "amber" && "text-amber",
                          weatherImpact.color === "red" && "text-red-400"
                        )} />
                      </motion.div>
                      <span className={cn(
                        "text-[7px] uppercase font-semibold",
                        weatherImpact.color === "teal" && "text-teal/70",
                        weatherImpact.color === "amber" && "text-amber/70",
                        weatherImpact.color === "red" && "text-red-400/70"
                      )}>Live</span>
                    </div>
                  </div>
                  <p className={cn(
                    "text-[9px]",
                    weatherImpact.color === "teal" && "text-teal/70",
                    weatherImpact.color === "amber" && "text-amber/70",
                    weatherImpact.color === "red" && "text-red-300/70"
                  )}>{getWeatherDescription()}</p>
                  {liveWeatherData && liveWeatherData.routeImpact.warnings.length > 1 && (
                    <p className={cn(
                      "text-[9px] mt-0.5",
                      weatherImpact.color === "teal" && "text-teal/60",
                      weatherImpact.color === "amber" && "text-amber/60",
                      weatherImpact.color === "red" && "text-red-300/60"
                    )}>{liveWeatherData.routeImpact.warnings[1]}</p>
                  )}
                </div>
                <motion.div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded transition-colors",
                    weatherImpact.color === "teal" && "bg-teal/20 group-hover:bg-teal/30",
                    weatherImpact.color === "amber" && "bg-amber/20 group-hover:bg-amber/30",
                    weatherImpact.color === "red" && "bg-red-500/20 group-hover:bg-red-500/30"
                  )}
                  whileHover={{
                    scale: 1.05,
                  }}
                >
                  <WeatherIcon className={cn(
                    "w-3 h-3",
                    weatherImpact.color === "teal" && "text-teal",
                    weatherImpact.color === "amber" && "text-amber",
                    weatherImpact.color === "red" && "text-red-400"
                  )} />
                  <span className={cn(
                    "text-[10px] font-black",
                    weatherImpact.color === "teal" && "text-teal",
                    weatherImpact.color === "amber" && "text-amber",
                    weatherImpact.color === "red" && "text-red-400"
                  )}>
                    {weatherImpact.level === "low" ? "± 0.0h" : `+${weatherDelayHours.toFixed(1)}h`}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced Confidence Row + Pagination */}
        <div className="px-3 py-2 bg-muted/10 border-t border-border/30 flex items-center justify-between">
          <div className="flex flex-col items-start text-[9px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              <span>
                Model confidence: <span className="font-bold text-foreground">94%</span>
              </span>
            </div>
            <span className="text-[8px] text-muted-foreground/70 mt-0.5 ml-4.5">
              Based on 8,921 similar LTL shipments in the last 90 days
            </span>
          </div>
          {/* Enhanced Pagination Dots */}
          <div className="flex items-center gap-2">
            {["Overview", "Alternatives", "History"].map((label, i) => (
              <motion.div
                key={label}
                className={cn(
                  "w-2 h-2 rounded-full cursor-pointer transition-all",
                  i === 0 ? "bg-primary scale-110" : "bg-teal/50 hover:bg-teal/70",
                )}
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                whileHover={{
                  scale: 1.3,
                }}
                transition={{
                  delay: 0.4 + 0.08 * i,
                }}
                title={label}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default ETADisplay;
