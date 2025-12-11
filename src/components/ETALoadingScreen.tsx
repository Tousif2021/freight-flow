import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Route, CloudRain, Truck, Brain, Target, Check, Sun, Cloud, CloudSnow } from 'lucide-react';

interface ETALoadingScreenProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 'historical',
    label: 'Analyzing 70,000+ historical shipment records',
    icon: Database,
    duration: 400,
  },
  {
    id: 'traffic',
    label: 'Fetching live TomTom traffic flow & incident data',
    icon: Route,
    duration: 400,
  },
  {
    id: 'weather',
    label: 'Retrieving real-time weather conditions',
    icon: CloudRain,
    duration: 400,
  },
  {
    id: 'carrier',
    label: 'Evaluating carrier performance & mode impact',
    icon: Truck,
    duration: 400,
  },
  {
    id: 'routing',
    label: 'Computing optimal routing & delay probability',
    icon: Brain,
    duration: 400,
  },
  {
    id: 'finalizing',
    label: 'Finalizing ETA confidence window & risk score',
    icon: Target,
    duration: 500,
  },
];

const ETALoadingScreen: React.FC<ETALoadingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);

      return () => clearTimeout(timer);
    } else {
      // All steps complete, wait a moment then trigger complete
      const timer = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  const progress = ((completedSteps.length) / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
    >
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative w-full max-w-lg mx-4">
        {/* Glass card container */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative bg-card/60 backdrop-blur-2xl border border-border/50 rounded-2xl p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center"
            >
              <Brain className="w-8 h-8 text-primary" />
            </motion.div>
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
                    opacity: index <= currentStep ? 1 : 0.3,
                    x: 0 
                  }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-primary/10 border border-primary/30' : 
                    isCompleted ? 'bg-teal/5 border border-teal/20' : 
                    'bg-muted/20 border border-transparent'
                  }`}
                >
                  {/* Icon container */}
                  <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-teal/20' : isActive ? 'bg-primary/20' : 'bg-muted/30'
                  }`}>
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Check className="w-5 h-5 text-teal" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        {step.id === 'weather' ? (
                          <WeatherAnimation />
                        ) : step.id === 'traffic' ? (
                          <TrafficAnimation />
                        ) : step.id === 'routing' ? (
                          <NeuralAnimation />
                        ) : step.id === 'finalizing' ? (
                          <CircularProgress />
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
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-foreground' : isCompleted ? 'text-teal' : 'text-muted-foreground'
                  }`}>
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
              transition={{ duration: 0.3 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-teal rounded-full"
            />
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>

          {/* Progress text */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {Math.min(completedSteps.length + 1, steps.length)} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-muted-foreground mt-6 font-medium"
          >
            Powered by historical insights + live traffic + real-time weather
          </motion.p>
        </motion.div>

        {/* Data stream animation at bottom */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-1 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: [4, 16, 4],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.05,
              }}
              className="w-1 bg-primary rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Weather morphing animation
const WeatherAnimation = () => {
  const [icon, setIcon] = useState(0);
  const icons = [Sun, Cloud, CloudRain, CloudSnow];

  useEffect(() => {
    const timer = setInterval(() => {
      setIcon(prev => (prev + 1) % icons.length);
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const Icon = icons[icon];
  return <Icon className="w-5 h-5 text-primary" />;
};

// Traffic light animation
const TrafficAnimation = () => {
  const [color, setColor] = useState(0);
  const colors = ['bg-red-500', 'bg-amber', 'bg-teal'];

  useEffect(() => {
    const timer = setInterval(() => {
      setColor(prev => (prev + 1) % colors.length);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-0.5">
      {colors.map((c, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-200 ${
            i === color ? c : 'bg-muted/30'
          }`}
        />
      ))}
    </div>
  );
};

// Neural network animation
const NeuralAnimation = () => {
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
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="absolute w-1.5 h-1.5 bg-primary rounded-full"
          style={{
            top: `${Math.sin(i * Math.PI / 2) * 8 + 8}px`,
            left: `${Math.cos(i * Math.PI / 2) * 8 + 8}px`,
          }}
        />
      ))}
    </div>
  );
};

// Circular progress animation
const CircularProgress = () => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
    />
  );
};

export default ETALoadingScreen;
