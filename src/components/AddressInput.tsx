import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface LocationResult {
  id: string;
  address: string;
  city: string;
  state: string;
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

// Mock geocoding - in production, use Mapbox Geocoding API
const mockGeocode = async (query: string): Promise<LocationResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockLocations: Record<string, LocationResult[]> = {
    'los angeles': [
      { id: '1', address: '123 Main St', city: 'Los Angeles', state: 'CA', zip: '90001', lat: 34.0522, lng: -118.2437 },
      { id: '2', address: '456 Broadway', city: 'Los Angeles', state: 'CA', zip: '90012', lat: 34.0511, lng: -118.2491 },
    ],
    'new york': [
      { id: '3', address: '789 5th Ave', city: 'New York', state: 'NY', zip: '10001', lat: 40.7128, lng: -74.0060 },
      { id: '4', address: '321 Wall St', city: 'New York', state: 'NY', zip: '10005', lat: 40.7074, lng: -74.0113 },
    ],
    'chicago': [
      { id: '5', address: '555 Michigan Ave', city: 'Chicago', state: 'IL', zip: '60601', lat: 41.8781, lng: -87.6298 },
    ],
    'houston': [
      { id: '6', address: '100 Main St', city: 'Houston', state: 'TX', zip: '77001', lat: 29.7604, lng: -95.3698 },
    ],
    'phoenix': [
      { id: '7', address: '200 Central Ave', city: 'Phoenix', state: 'AZ', zip: '85001', lat: 33.4484, lng: -112.0740 },
    ],
    'dallas': [
      { id: '8', address: '300 Commerce St', city: 'Dallas', state: 'TX', zip: '75201', lat: 32.7767, lng: -96.7970 },
    ],
    'seattle': [
      { id: '9', address: '400 Pike St', city: 'Seattle', state: 'WA', zip: '98101', lat: 47.6062, lng: -122.3321 },
    ],
    'denver': [
      { id: '10', address: '500 16th St', city: 'Denver', state: 'CO', zip: '80202', lat: 39.7392, lng: -104.9903 },
    ],
    'atlanta': [
      { id: '11', address: '600 Peachtree St', city: 'Atlanta', state: 'GA', zip: '30308', lat: 33.7490, lng: -84.3880 },
    ],
    'miami': [
      { id: '12', address: '700 Biscayne Blvd', city: 'Miami', state: 'FL', zip: '33132', lat: 25.7617, lng: -80.1918 },
    ],
  };

  const lowerQuery = query.toLowerCase();
  let results: LocationResult[] = [];
  
  for (const [key, locations] of Object.entries(mockLocations)) {
    if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
      results = [...results, ...locations];
    }
  }

  if (results.length === 0 && query.length >= 2) {
    // Generate some mock results for any query
    results = [
      {
        id: `gen-1-${query}`,
        address: `123 ${query} St`,
        city: query.charAt(0).toUpperCase() + query.slice(1),
        state: 'CA',
        zip: '90001',
        lat: 34.0522 + Math.random() * 10,
        lng: -118.2437 + Math.random() * 10,
      },
    ];
  }

  return results.slice(0, 5);
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
        const data = await mockGeocode(query);
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
    setQuery(`${location.address}, ${location.city}, ${location.state}`);
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
                    {result.city}, {result.state} {result.zip}
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
          {value.city}, {value.state}
        </motion.div>
      )}
    </div>
  );
};

export default AddressInput;
