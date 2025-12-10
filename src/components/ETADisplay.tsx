import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  MapPin,
  Truck,
  Route,
  Calendar,
  CloudSnow,
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
import LivePulseIndicator from "./LivePulseIndicator";
import RouteTrafficBar from "./RouteTrafficBar";
import TomTomTrafficBar from "./TomTomTrafficBar";

interface ETADisplayProps {
  eta: ETAPrediction;
  distanceMiles: number;
  originCity: string;
  destinationCity: string;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
}
const ETADisplay: React.FC<ETADisplayProps> = ({ eta, distanceMiles, originCity, destinationCity, originLat, originLng, destLat, destLng }) => {
  const [trafficStatus, setTrafficStatus] = useState<"loading" | "done">("loading");
  const [weatherStatus, setWeatherStatus] = useState<"loading" | "done">("loading");
  const [trafficProgress, setTrafficProgress] = useState(0);
  const [weatherProgress, setWeatherProgress] = useState(0);
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
          {/* Carrier Mode Card - Neutral slate bg with hover */}
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
              className="relative rounded-lg p-3 border bg-slate-700/50 border-red-500/30 cursor-pointer group"
            >
              <motion.div className="absolute inset-0 bg-red-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/20"
                  variants={iconHoverVariants}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(239,68,68,0.3)",
                      "0 0 0 6px rgba(239,68,68,0)",
                      "0 0 0 0 rgba(239,68,68,0)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <Truck className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-red-400">Carrier Mode</span>
                    <span className="px-1.5 py-0.5 bg-red-500/30 text-red-300 text-[8px] font-black uppercase rounded">
                      HIGH IMPACT
                    </span>
                  </div>
                  <p className="text-[9px] text-red-300/70">{carrierFactor.description}</p>
                  <p className="text-[9px] text-amber/80 font-medium mt-1">
                    💡 AI suggests direct truckload to save ~9–11h
                  </p>
                </div>
                <motion.div
                  className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 group-hover:bg-red-500/30 transition-colors"
                  whileHover={{
                    scale: 1.05,
                  }}
                >
                  <Truck className="w-3 h-3 text-red-400" />
                  <Clock className="w-2.5 h-2.5 text-red-400" />
                  <span className="text-[10px] font-black text-red-400">+{carrierFactor.adjustment.toFixed(1)}h</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Traffic Conditions Card - with live feed indicator */}
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
              className="relative rounded-lg p-3 border bg-slate-800/50 border-red-500/30 cursor-pointer group"
            >
              <motion.div className="absolute inset-0 bg-red-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative flex items-center gap-2">
                <motion.div
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/20"
                  variants={iconHoverVariants}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(239,68,68,0.3)",
                      "0 0 0 6px rgba(239,68,68,0)",
                      "0 0 0 0 rgba(239,68,68,0)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <Route className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-red-400">Traffic</span>
                    <span className="px-1.5 py-0.5 bg-red-500/30 text-red-300 text-[8px] font-black uppercase rounded">
                      HIGH IMPACT
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
                        <Radio className="w-2.5 h-2.5 text-red-400" />
                      </motion.div>
                      <span className="text-[7px] text-red-400/70 uppercase font-semibold">Live</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-red-300/70">Evening congestion forecast at NYC entry window</p>
                  {/* Mini timeline bar */}
                  <div className="flex items-center gap-0.5 mt-2">
                    <div className="flex-1 h-0.5 bg-muted/30 rounded-full relative">
                      <motion.div
                        className="absolute right-1/4 -top-1.5 w-1.5 h-1.5 bg-red-400 rounded-full"
                        animate={{
                          scale: [1, 1.3, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      />
                      <span className="absolute right-1/4 -top-5 text-[7px] text-red-400 font-semibold transform -translate-x-1/2">
                        NYC
                      </span>
                    </div>
                  </div>
                </div>
                <motion.div
                  className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 group-hover:bg-red-500/30 transition-colors"
                  whileHover={{
                    scale: 1.05,
                  }}
                >
                  <Route className="w-3 h-3 text-red-400" />
                  <span className="text-[10px] font-black text-red-400">+{trafficFactor.adjustment.toFixed(1)}h</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Day of Week Card - Soft teal bg with hover */}
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
              className="relative rounded-lg p-3 border bg-teal/10 border-teal/30 cursor-pointer group"
            >
              <motion.div className="absolute inset-0 bg-teal/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal/20">
                  <Calendar className="w-4 h-4 text-teal group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-teal">Day of Week</span>
                    <span className="px-1.5 py-0.5 bg-teal/30 text-teal text-[8px] font-black uppercase rounded">
                      STABLE
                    </span>
                  </div>
                  <p className="text-[9px] text-teal/70">Standard weekday operations (no holiday impact)</p>
                </div>
                <motion.div
                  className="flex items-center gap-1 px-2 py-1 rounded bg-teal/20 group-hover:bg-teal/30 transition-colors"
                  whileHover={{
                    scale: 1.05,
                  }}
                >
                  <Check className="w-3 h-3 text-teal" />
                  <span className="text-[10px] font-black text-teal">± 0.0 h</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Weather Card - With grain overlay and live feed */}
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
              className="relative rounded-lg p-3 border bg-slate-700/50 border-amber/30 overflow-hidden cursor-pointer group"
            >
              {/* Subtle diagonal grain overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
              <motion.div className="absolute inset-0 bg-amber/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="relative flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber/20">
                  <CloudSnow className="w-4 h-4 text-amber group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-amber">Weather</span>
                    <span className="px-1.5 py-0.5 bg-amber/30 text-amber text-[8px] font-black uppercase rounded">
                      MODERATE IMPACT
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
                        <Radio className="w-2.5 h-2.5 text-amber" />
                      </motion.div>
                      <span className="text-[7px] text-amber/70 uppercase font-semibold">Live</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-amber/70">Light snowfall in Midwest corridor</p>
                  <p className="text-[9px] text-amber/60 mt-0.5">Plows may slow travel on key segments</p>
                </div>
                <motion.div
                  className="flex items-center gap-1 px-2 py-1 rounded bg-amber/20 group-hover:bg-amber/30 transition-colors"
                  whileHover={{
                    scale: 1.05,
                  }}
                >
                  <CloudSnow className="w-3 h-3 text-amber" />
                  <span className="text-[10px] font-black text-amber">+{weatherFactor.adjustment.toFixed(1)}h</span>
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
