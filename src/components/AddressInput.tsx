import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { supabase } from '@/integrations/supabase/client';

export interface LocationResult {
  id: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  lat: number;
  lng: number;
}

interface AddressInputProps {
  label: string;
  placeholder?: string;
  value: LocationResult | null;
  onChange: (location: LocationResult | null) => void;
  icon?: 'origin' | 'destination';
}

// Real geocoding using Mapbox via edge function
const geocodeAddress = async (query: string): Promise<LocationResult[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('geocode-address', {
      body: { query, limit: 5 },
    });

    if (error) {
      console.error('Geocoding error:', error);
      return [];
    }

    return data?.results || [];
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

const AddressInput: React.FC<AddressInputProps> = ({
  label,
  placeholder = 'Enter address or city',
  value,
  onChange,
  icon = 'origin',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Skip geocoding if user just selected an address
    if (hasSelected) {
      setHasSelected(false);
      return;
    }

    if (!query || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await geocodeAddress(query);
        setResults(data);
        setIsOpen(data.length > 0 && isFocused);
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(searchTimeout);
  }, [query, hasSelected, isFocused]);

  const handleSelect = (location: LocationResult) => {
    setHasSelected(true);
    onChange(location);
    // Build display string with country for international addresses
    const locationParts = [location.address, location.city];
    if (location.state) locationParts.push(location.state);
    if (location.country && !location.state) locationParts.push(location.country);
    setQuery(locationParts.join(', '));
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      
      <div className={cn(
        'relative rounded-lg transition-all duration-200',
        isFocused && 'ring-2 ring-primary/30'
      )}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            icon === 'origin' ? 'bg-success/20' : 'bg-primary/20'
          )}>
            <MapPin className={cn(
              'w-4 h-4',
              icon === 'origin' ? 'text-success' : 'text-primary'
            )} />
          </div>
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onChange(null);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (results.length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          className="pl-14 pr-10"
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : query ? (
            <button 
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <Search className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-lg shadow-elevated overflow-hidden"
          >
            {results.map((result, index) => (
              <motion.button
                key={result.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border/30 last:border-0"
              >
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-foreground">{result.address}</div>
                  <div className="text-xs text-muted-foreground">
                    {result.city}{result.state && `, ${result.state}`}{result.zip && ` ${result.zip}`}
                    {result.country && ` · ${result.country}`}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Location Badge */}
      {value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-xs text-primary"
        >
          <MapPin className="w-3 h-3" />
          {value.city}{value.state ? `, ${value.state}` : value.country ? `, ${value.country}` : ''}
        </motion.div>
      )}
    </div>
  );
};

export default AddressInput;
