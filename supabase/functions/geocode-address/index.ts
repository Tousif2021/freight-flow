import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapbox public token - same as used in MapView component
const MAPBOX_TOKEN = 'pk.eyJ1IjoidG91c2lmMjUiLCJhIjoiY21peDI1dGpxMDF2aTNkcXN1NzMyajhtOCJ9.GB70BEjjqbc8kXnGMA4uTQ';

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
  properties?: {
    address?: string;
  };
  address?: string;
  text: string;
}

interface MapboxResponse {
  features: MapboxFeature[];
}

interface LocationResult {
  id: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  lat: number;
  lng: number;
}

function parseMapboxFeature(feature: MapboxFeature): LocationResult {
  const context = feature.context || [];
  
  // Extract components from context
  let city = '';
  let state = '';
  let country = '';
  let zip = '';
  
  for (const ctx of context) {
    if (ctx.id.startsWith('place')) {
      city = ctx.text;
    } else if (ctx.id.startsWith('region')) {
      state = ctx.short_code?.replace(/^[A-Z]{2}-/, '') || ctx.text;
    } else if (ctx.id.startsWith('country')) {
      country = ctx.text;
    } else if (ctx.id.startsWith('postcode')) {
      zip = ctx.text;
    }
  }
  
  // If city wasn't found in context, use the feature text
  if (!city && feature.text) {
    city = feature.text;
  }
  
  // Build address string
  const addressNumber = feature.address || '';
  const streetName = feature.text || '';
  const address = addressNumber ? `${addressNumber} ${streetName}` : feature.place_name.split(',')[0];

  return {
    id: feature.id,
    address: address,
    city: city,
    state: state,
    country: country,
    zip: zip,
    lat: feature.center[1],
    lng: feature.center[0],
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 5 } = await req.json();
    
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ results: [], error: 'Query must be at least 2 characters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Geocoding query: "${query}"`);

    // Call Mapbox Geocoding API - global search, no country restriction
    const encodedQuery = encodeURIComponent(query);
    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${MAPBOX_TOKEN}&limit=${limit}&types=address,place,locality,neighborhood`;
    
    console.log(`Calling Mapbox Geocoding API...`);
    
    const response = await fetch(mapboxUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mapbox API error: ${response.status} - ${errorText}`);
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data: MapboxResponse = await response.json();
    
    console.log(`Found ${data.features.length} results`);

    const results: LocationResult[] = data.features.map(parseMapboxFeature);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Geocoding error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ results: [], error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
