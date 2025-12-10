import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TomTomTrafficBarProps {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  className?: string;
}

interface TrafficData {
  trafficScore: number;
  status: "green" | "yellow" | "red";
  label: string;
  incidentCount: number;
  severeIncidentCount: number;
  hasRoadClosure: boolean;
}

const TomTomTrafficBar: React.FC<TomTomTrafficBarProps> = ({
  originLat,
  originLng,
  destLat,
  destLng,
  className,
}) => {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTraffic = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("get-traffic", {
          body: { originLat, originLng, destLat, destLng },
        });

        if (fnError) throw fnError;
        setTrafficData(data);
      } catch (err) {
        console.error("Traffic fetch error:", err);
        setError("Unable to fetch traffic data");
      } finally {
        setLoading(false);
      }
    };

    fetchTraffic();
  }, [originLat, originLng, destLat, destLng]);

  // Gradient stops based on traffic score
  const getGradientStyle = () => {
    if (!trafficData) return { background: "hsl(var(--muted))" };
    
    const score = trafficData.trafficScore;
    
    // Smooth gradient from green → yellow → red based on score
    if (score <= 20) {
      return { background: "linear-gradient(90deg, hsl(152, 69%, 31%) 0%, hsl(152, 69%, 41%) 100%)" };
    } else if (score <= 35) {
      return { background: "linear-gradient(90deg, hsl(152, 69%, 36%) 0%, hsl(45, 93%, 47%) 100%)" };
    } else if (score <= 50) {
      return { background: "linear-gradient(90deg, hsl(45, 93%, 47%) 0%, hsl(45, 93%, 57%) 100%)" };
    } else if (score <= 70) {
      return { background: "linear-gradient(90deg, hsl(45, 93%, 47%) 0%, hsl(0, 84%, 60%) 100%)" };
    } else {
      return { background: "linear-gradient(90deg, hsl(0, 84%, 50%) 0%, hsl(0, 84%, 40%) 100%)" };
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-2", className)}>
        <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">Fetching live traffic...</span>
      </div>
    );
  }

  if (error || !trafficData) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-2", className)}>
        <AlertTriangle className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">{error || "Traffic unavailable"}</span>
      </div>
    );
  }

  return (
    <div className={cn("px-3 py-2", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {trafficData.status === "green" && <CheckCircle className="w-3 h-3 text-teal" />}
          {trafficData.status === "yellow" && <AlertTriangle className="w-3 h-3 text-amber" />}
          {trafficData.status === "red" && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <AlertTriangle className="w-3 h-3 text-red-500" />
            </motion.div>
          )}
          <span className="text-[10px] font-semibold text-foreground">
            Route Traffic
          </span>
        </div>
        <div className="flex items-center gap-2">
          {trafficData.incidentCount > 0 && (
            <span className={cn(
              "text-[9px] px-1.5 py-0.5 rounded",
              trafficData.severeIncidentCount > 0 ? "bg-red-500/20 text-red-400" : "bg-amber/20 text-amber"
            )}>
              {trafficData.incidentCount} incident{trafficData.incidentCount !== 1 ? "s" : ""}
            </span>
          )}
          <span className={cn(
            "text-[9px] font-medium",
            trafficData.status === "green" && "text-teal",
            trafficData.status === "yellow" && "text-amber",
            trafficData.status === "red" && "text-red-400"
          )}>
            {trafficData.label}
          </span>
        </div>
      </div>
      
      {/* Traffic Bar */}
      <div className="relative h-2 rounded-full overflow-hidden bg-muted/30">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={getGradientStyle()}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {/* Animated shimmer overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {trafficData.hasRoadClosure && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 flex items-center gap-1 text-[9px] text-red-400"
        >
          <AlertTriangle className="w-2.5 h-2.5" />
          Road closure detected on route
        </motion.div>
      )}
    </div>
  );
};

export default TomTomTrafficBar;
