import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Route, CloudRain, Truck, Brain, Target, Check, Sun, Cloud, CloudSnow } from "lucide-react";

interface ETALoadingScreenProps {
  onComplete: () => void;
}

const steps = [
  {
    id: "historical",
    label: "Optimizing route model with past performance",
    icon: Database,
    duration: 1050,
  },
  {
    id: "traffic",
    label: "Fetching live TomTom traffic flow & incident data",
    icon: Route,
    duration: 950,
  },
  {
    id: "weather",
    label: "Retrieving real-time weather conditions",
    icon: CloudRain,
    duration: 800,
  },
  {
    id: "carrier",
    label: "Evaluating carrier performance & mode impact",
    icon: Truck,
    duration: 800,
  },
  {
    id: "routing",
    label: "Computing optimal routing & delay probability",
    icon: Brain,
    duration: 850,
  },
  {
    id: "finalizing",
    label: "Finalizing ETA confidence window & risk score",
    icon: Target,
    duration: 950,
  },
];

const ETALoadingScreen: React.FC<ETALoadingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, currentStep]);
        setCurrentStep((prev) => prev + 1);
      }, steps[currentStep].duration);

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
    >
      {/* Ambient background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large soft primary glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[26rem] h-[26rem] bg-primary/25 rounded-full blur-3xl"
        />
        {/* Secondary teal-ish glow */}
        <motion.div
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.1, 0.18, 0.1],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/5 right-1/4 w-80 h-80 bg-teal/25 rounded-full blur-3xl"
        />
        {/* Subtle moving grid lines */}
        <motion.div
          animate={{ x: ["-15%", "0%", "-15%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_top,_#ffffff40_0,_transparent_55%)]"
        />
      </div>

      <div className="relative w-full max-w-lg mx-4">
        {/* Glass card container */}
        <motion.div
          initial={{ scale: 0.9, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative bg-card/70 backdrop-blur-2xl border border-border/60 rounded-2xl p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative w-16 h-16 mx-auto mb-4">
              {/* Spinning brain container */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center"
              >
                <Brain className="w-8 h-8 text-primary" />
              </motion.div>
              {/* Pulsing halo */}
              <motion.div
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border border-primary/30"
              />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">Computing Optimal ETA</h2>
            <p className="text-sm text-muted-foreground">AI-powered analysis in progress</p>
          </div>

          {/* Steps list */}
          <div className="space-y-3 mb-8">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(index);
              const isActive = currentStep === index;
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: index <= currentStep ? 1 : 0.25,
                    x: 0,
                  }}
                  transition={{ delay: index * 0.08 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-primary/10 border border-primary/40 shadow-sm shadow-primary/20"
                      : isCompleted
                        ? "bg-teal/5 border border-teal/30"
                        : "bg-muted/20 border border-transparent"
                  }`}
                >
                  {/* Icon container */}
                  <div
                    className={`relative w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isCompleted ? "bg-teal/20" : isActive ? "bg-primary/20" : "bg-muted/30"
                    }`}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      >
                        <Check className="w-5 h-5 text-teal" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.7, repeat: Infinity }}>
                        {step.id === "historical" ? (
                          <HistoricalAnimation />
                        ) : step.id === "weather" ? (
                          <WeatherAnimation />
                        ) : step.id === "traffic" ? (
                          <TrafficAnimation />
                        ) : step.id === "routing" ? (
                          <NeuralAnimation />
                        ) : step.id === "finalizing" ? (
                          <CircularProgress />
                        ) : step.id === "carrier" ? (
                          <TruckStepAnimation />
                        ) : (
                          <Icon className="w-5 h-5 text-primary" />
                        )}
                      </motion.div>
                    ) : (
                      <Icon className="w-5 h-5 text-muted-foreground/50" />
                    )}

                    {/* Pulse ring for active step */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 rounded-lg bg-primary/30"
                      />
                    )}
                  </div>

                  {/* Text */}
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-foreground" : isCompleted ? "text-teal" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-teal rounded-full"
            />
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ["-120%", "220%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
          </div>

          {/* Progress text */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {Math.min(completedSteps.length + 1, steps.length)} of {steps.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-muted-foreground mt-6 font-medium"
          >
            Powered by 70,000+ historical shipments, live TomTom traffic, and real-time weather data
          </motion.p>
        </motion.div>

        {/* Data stream “graph” at bottom */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-1 opacity-40">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: [4, 18, 6, 14, 4],
                opacity: [0.3, 1, 0.6, 1, 0.3],
              }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                delay: i * 0.05,
                ease: "easeInOut",
              }}
              className="w-1 bg-primary rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ---------- Custom animations for specific steps ---------- */

// Historical data animation – scrolling “database rows”
const HistoricalAnimation: React.FC = () => {
  const rows = ["101101", "010110", "110011"];

  return (
    <div className="flex flex-col gap-0.5 text-[9px] font-mono tracking-tight leading-[10px]">
      {rows.map((row, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.3, 1, 0.3],
            x: [-4, 0, 4, 0],
          }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            delay: i * 0.18,
          }}
          className="text-primary"
        >
          {row}
        </motion.div>
      ))}
    </div>
  );
};

// Weather morphing animation
const WeatherAnimation: React.FC = () => {
  const [iconIndex, setIconIndex] = useState(0);
  const icons = [Sun, Cloud, CloudRain, CloudSnow];

  useEffect(() => {
    const timer = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  const Icon = icons[iconIndex];
  return <Icon className="w-5 h-5 text-primary" />;
};

// Traffic light + route animation
const TrafficAnimation: React.FC = () => {
  const [active, setActive] = useState(0);
  const colors = ["bg-red-500", "bg-amber", "bg-teal"];

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % colors.length);
    }, 350);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Route line */}
      <motion.div
        className="h-1 w-8 rounded-full bg-muted/40 overflow-hidden"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <motion.div
          className="h-full w-1/2 bg-primary/80 rounded-full"
          animate={{ x: ["-50%", "80%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      {/* Lights */}
      <div className="flex gap-0.5">
        {colors.map((c, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === active ? 1.2 : 0.9,
              opacity: i === active ? 1 : 0.35,
            }}
            transition={{ duration: 0.25 }}
            className={`w-2 h-2 rounded-full ${i === active ? c : "bg-muted/30"}`}
          />
        ))}
      </div>
    </div>
  );
};

// Truck animation for carrier step
const TruckStepAnimation: React.FC = () => {
  return (
    <motion.div
      className="relative w-7 h-5 flex items-center justify-center"
      animate={{ x: [-3, 3, -3] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <Truck className="w-6 h-6 text-primary" />
      {/* Wheels */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-1 w-1.5 h-1.5 border-[2px] border-primary rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-1 w-1.5 h-1.5 border-[2px] border-primary rounded-full"
      />
    </motion.div>
  );
};

// Neural network animation
const NeuralAnimation: React.FC = () => {
  return (
    <div className="relative w-5 h-5">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scale: [0.5, 1, 0.5],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="absolute w-1.5 h-1.5 bg-primary rounded-full"
          style={{
            top: `${Math.sin((i * Math.PI) / 2) * 6 + 8}px`,
            left: `${Math.cos((i * Math.PI) / 2) * 6 + 8}px`,
          }}
        />
      ))}
      {/* Center node */}
      <motion.div
        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute inset-[6px] bg-primary/70 rounded-full"
      />
    </div>
  );
};

// Circular progress animation for finalizing step
const CircularProgress: React.FC = () => {
  return (
    <div className="relative w-5 h-5">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-2 border-primary/30 border-t-primary rounded-full"
      />
      <motion.div
        initial={{ scale: 0.6, opacity: 0.6 }}
        animate={{ scale: [0.6, 1, 0.6], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-1 border border-primary/25 rounded-full"
      />
    </div>
  );
};

export default ETALoadingScreen;
