import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, ArrowRight, CheckCircle, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CheckoutFormProps {
  onSubmit: (data: CheckoutData) => Promise<void>;
  isLoading?: boolean;
}

export interface CheckoutData {
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isLoading = false }) => {
  const [step, setStep] = useState<'sender' | 'receiver' | 'confirm'>('sender');
  const [formData, setFormData] = useState<CheckoutData>({
    senderName: '',
    senderEmail: '',
    receiverName: '',
    receiverEmail: '',
  });
  const [errors, setErrors] = useState<Partial<CheckoutData>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateStep = () => {
    const newErrors: Partial<CheckoutData> = {};

    if (step === 'sender') {
      if (!formData.senderName.trim()) newErrors.senderName = 'Name is required';
      if (!formData.senderEmail.trim()) newErrors.senderEmail = 'Email is required';
      else if (!validateEmail(formData.senderEmail)) newErrors.senderEmail = 'Invalid email';
    }

    if (step === 'receiver') {
      if (!formData.receiverName.trim()) newErrors.receiverName = 'Name is required';
      if (!formData.receiverEmail.trim()) newErrors.receiverEmail = 'Email is required';
      else if (!validateEmail(formData.receiverEmail)) newErrors.receiverEmail = 'Invalid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    if (step === 'sender') setStep('receiver');
    else if (step === 'receiver') setStep('confirm');
  };

  const handleBack = () => {
    if (step === 'receiver') setStep('sender');
    else if (step === 'confirm') setStep('receiver');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    await onSubmit(formData);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const steps = ['sender', 'receiver', 'confirm'];
  const currentIndex = steps.indexOf(step);

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                i < currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : i === currentIndex
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'bg-muted text-muted-foreground'
              }`}
              animate={{ scale: i === currentIndex ? 1.1 : 1 }}
            >
              {i < currentIndex ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </motion.div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 transition-colors duration-300 ${
                i < currentIndex ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-center gap-8 text-xs text-muted-foreground">
        <span className={step === 'sender' ? 'text-primary font-medium' : ''}>Sender</span>
        <span className={step === 'receiver' ? 'text-primary font-medium' : ''}>Receiver</span>
        <span className={step === 'confirm' ? 'text-primary font-medium' : ''}>Confirm</span>
      </div>

      {/* Form Steps */}
      <div className="min-h-[280px] relative overflow-hidden">
        <AnimatePresence mode="wait" custom={currentIndex}>
          {step === 'sender' && (
            <motion.div
              key="sender"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Sender Information</h3>
                <p className="text-sm text-muted-foreground">Who is sending this shipment?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="senderName" className="text-foreground">Full Name</Label>
                  <Input
                    id="senderName"
                    placeholder="John Doe"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    className={errors.senderName ? 'border-destructive' : ''}
                  />
                  {errors.senderName && (
                    <span className="text-xs text-destructive">{errors.senderName}</span>
                  )}
                </div>

                <div>
                  <Label htmlFor="senderEmail" className="text-foreground">Email Address</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.senderEmail}
                    onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                    className={errors.senderEmail ? 'border-destructive' : ''}
                  />
                  {errors.senderEmail && (
                    <span className="text-xs text-destructive">{errors.senderEmail}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'receiver' && (
            <motion.div
              key="receiver"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Receiver Information</h3>
                <p className="text-sm text-muted-foreground">Who will receive this shipment?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="receiverName" className="text-foreground">Full Name</Label>
                  <Input
                    id="receiverName"
                    placeholder="Jane Smith"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                    className={errors.receiverName ? 'border-destructive' : ''}
                  />
                  {errors.receiverName && (
                    <span className="text-xs text-destructive">{errors.receiverName}</span>
                  )}
                </div>

                <div>
                  <Label htmlFor="receiverEmail" className="text-foreground">Email Address</Label>
                  <Input
                    id="receiverEmail"
                    type="email"
                    placeholder="jane@company.com"
                    value={formData.receiverEmail}
                    onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
                    className={errors.receiverEmail ? 'border-destructive' : ''}
                  />
                  {errors.receiverEmail && (
                    <span className="text-xs text-destructive">{errors.receiverEmail}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Confirm Shipment</h3>
                <p className="text-sm text-muted-foreground">Review your shipment details</p>
              </div>

              <div className="glass-card p-4 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground">Sender</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{formData.senderName}</div>
                    <div className="text-xs text-muted-foreground">{formData.senderEmail}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Receiver</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{formData.receiverName}</div>
                    <div className="text-xs text-muted-foreground">{formData.receiverEmail}</div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                A tracking link will be sent to the receiver's email upon confirmation.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {step !== 'sender' && (
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex-1"
            disabled={isLoading}
          >
            Back
          </Button>
        )}
        
        {step !== 'confirm' ? (
          <Button 
            variant="hero" 
            onClick={handleNext}
            className="flex-1"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            variant="hero" 
            onClick={handleSubmit}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Shipment...
              </>
            ) : (
              <>
                Confirm Shipment
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
