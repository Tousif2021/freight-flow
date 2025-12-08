import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, X, CloudRain, AlertTriangle, Truck, ArrowRight, 
  Sparkles, MessageCircle, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ETAPrediction, CarrierMode } from '@/types/shipment';

interface AIAdvisorProps {
  eta: ETAPrediction | null;
  carrierMode: CarrierMode | null;
  onCarrierChange?: (carrier: CarrierMode) => void;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ eta, carrierMode, onCarrierChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewAdvice, setHasNewAdvice] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const weatherFactor = eta?.factors.find(f => f.name.toLowerCase().includes('weather'));
  const hasWeatherIssue = weatherFactor?.impact === 'negative';
  const riskLevel = eta?.riskLevel || 'low';

  // Generate advice message
  const getAdviceMessage = () => {
    if (!eta) return '';
    
    const messages: string[] = [];
    
    if (hasWeatherIssue && weatherFactor) {
      messages.push(`⚠️ Weather Alert: ${weatherFactor.description}`);
    }
    
    if (carrierMode === 'ltl' && riskLevel !== 'low') {
      messages.push(`💡 Consider switching to TL Dry for faster delivery with ${riskLevel === 'high' ? '~2h' : '~1h'} time savings and lower delay risk.`);
    }
    
    if (carrierMode === 'refrigerated' && hasWeatherIssue) {
      messages.push(`🧊 Temperature-sensitive cargo detected. Extra precautions recommended due to weather conditions along the route.`);
    }

    if (messages.length === 0) {
      messages.push(`✅ Route conditions look favorable! Your shipment is on track for on-time delivery.`);
    }

    return messages.join('\n\n');
  };

  const adviceMessage = getAdviceMessage();

  // Trigger typing animation when advice changes
  useEffect(() => {
    if (eta && isOpen) {
      setIsTyping(true);
      setTypingText('');
      let i = 0;
      const interval = setInterval(() => {
        if (i < adviceMessage.length) {
          setTypingText(prev => prev + adviceMessage[i]);
          i++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval);
    }
  }, [eta, isOpen, adviceMessage]);

  // Show notification when there's a weather issue
  useEffect(() => {
    if (hasWeatherIssue && !isOpen) {
      setHasNewAdvice(true);
    }
  }, [hasWeatherIssue, isOpen]);

  if (!eta) return null;

  return (
    <>
      {/* Floating Chat Head */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => {
                setIsOpen(true);
                setHasNewAdvice(false);
              }}
              className={cn(
                "relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all",
                hasWeatherIssue 
                  ? "bg-gradient-to-br from-red-500 to-red-600" 
                  : "bg-gradient-to-br from-primary to-primary/80"
              )}
            >
              <Bot className="w-6 h-6 text-primary-foreground" />
              
              {/* Pulse rings */}
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-full",
                  hasWeatherIssue ? "bg-red-500/40" : "bg-primary/40"
                )}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-full",
                  hasWeatherIssue ? "bg-red-500/30" : "bg-primary/30"
                )}
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />

              {/* Notification badge */}
              {hasNewAdvice && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <span className="text-[10px] font-bold text-destructive-foreground">!</span>
                </motion.div>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-0 right-0 w-80 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
            >
              {/* Header */}
              <div className={cn(
                "px-4 py-3 flex items-center justify-between",
                hasWeatherIssue 
                  ? "bg-gradient-to-r from-red-500/20 to-red-600/10" 
                  : "bg-gradient-to-r from-primary/20 to-primary/10"
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    hasWeatherIssue ? "bg-red-500/20" : "bg-primary/20"
                  )}>
                    <Bot className={cn("w-4 h-4", hasWeatherIssue ? "text-red-400" : "text-primary")} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">AI Route Advisor</h4>
                    <div className="flex items-center gap-1">
                      <motion.div 
                        className="w-1.5 h-1.5 rounded-full bg-success"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-[10px] text-muted-foreground">Live Analysis</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4 max-h-64 overflow-y-auto">
                {/* Weather Alert Card */}
                {hasWeatherIssue && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CloudRain className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-red-400">Weather Advisory</span>
                    </div>
                    <p className="text-[11px] text-red-300/80 leading-relaxed">
                      {weatherFactor?.description}
                    </p>
                  </motion.div>
                )}

                {/* AI Message */}
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                      {isTyping ? typingText : adviceMessage}
                      {isTyping && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >|</motion.span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Carrier Switch Suggestion */}
                {carrierMode === 'ltl' && riskLevel !== 'low' && onCarrierChange && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-primary">Recommended Action</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-3">
                      Switch to TL Dry for faster, more reliable delivery
                    </p>
                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={() => onCarrierChange('tl-dry')}
                    >
                      Switch to TL Dry <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border/30 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">Powered by FreightFlow AI</span>
                  <div className="flex items-center gap-1">
                    <motion.div
                      className="w-1 h-1 rounded-full bg-success"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-[9px] text-success">Real-time</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default AIAdvisor;