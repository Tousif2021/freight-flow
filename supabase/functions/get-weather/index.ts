import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  condition: 'clear' | 'rain' | 'snow' | 'wind' | 'fog';
  severity: 'light' | 'moderate' | 'severe';
  temperature: number;
  windSpeed: number;
  visibility: number;
  description: string;
  icon: string;
}

interface WeatherResponse {
  origin: WeatherData;
  destination: WeatherData;
  routeImpact: {
    delayFactor: number;
    riskLevel: 'low' | 'medium' | 'high';
    warnings: string[];
  };
}

function mapWeatherCondition(weatherId: number, windSpeed: number): { condition: WeatherData['condition']; severity: WeatherData['severity'] } {
  // OpenWeatherMap weather condition codes: https://openweathermap.org/weather-conditions
  
  // Thunderstorm (2xx)
  if (weatherId >= 200 && weatherId < 300) {
    return { condition: 'rain', severity: weatherId >= 210 ? 'severe' : 'moderate' };
  }
  
  // Drizzle (3xx)
  if (weatherId >= 300 && weatherId < 400) {
    return { condition: 'rain', severity: 'light' };
  }
  
  // Rain (5xx)
  if (weatherId >= 500 && weatherId < 600) {
    if (weatherId >= 502) return { condition: 'rain', severity: 'severe' };
    if (weatherId >= 501) return { condition: 'rain', severity: 'moderate' };
    return { condition: 'rain', severity: 'light' };
  }
  
  // Snow (6xx)
  if (weatherId >= 600 && weatherId < 700) {
    if (weatherId >= 602 || weatherId === 622) return { condition: 'snow', severity: 'severe' };
    if (weatherId >= 601 || weatherId === 621) return { condition: 'snow', severity: 'moderate' };
    return { condition: 'snow', severity: 'light' };
  }
  
  // Atmosphere - Fog, Mist, etc. (7xx)
  if (weatherId >= 700 && weatherId < 800) {
    if (weatherId === 781) return { condition: 'wind', severity: 'severe' }; // Tornado
    if (weatherId === 741) return { condition: 'fog', severity: 'moderate' }; // Fog
    if (weatherId === 751 || weatherId === 761) return { condition: 'fog', severity: 'severe' }; // Sand/Dust
    return { condition: 'fog', severity: 'light' };
  }
  
  // Clear/Clouds (8xx) - check wind
  if (windSpeed >= 20) { // ~45 mph
    return { condition: 'wind', severity: 'severe' };
  }
  if (windSpeed >= 13) { // ~30 mph
    return { condition: 'wind', severity: 'moderate' };
  }
  if (windSpeed >= 9) { // ~20 mph
    return { condition: 'wind', severity: 'light' };
  }
  
  return { condition: 'clear', severity: 'light' };
}

function calculateDelayFactor(weather: WeatherData): number {
  const factors: Record<WeatherData['condition'], Record<WeatherData['severity'], number>> = {
    clear: { light: 1.0, moderate: 1.0, severe: 1.0 },
    rain: { light: 1.05, moderate: 1.15, severe: 1.25 },
    snow: { light: 1.15, moderate: 1.25, severe: 1.40 },
    wind: { light: 1.03, moderate: 1.08, severe: 1.15 },
    fog: { light: 1.05, moderate: 1.12, severe: 1.20 },
  };
  
  return factors[weather.condition][weather.severity];
}

function generateWarnings(origin: WeatherData, destination: WeatherData): string[] {
  const warnings: string[] = [];
  
  const checkLocation = (weather: WeatherData, location: string) => {
    if (weather.condition === 'snow') {
      if (weather.severity === 'severe') {
        warnings.push(`Heavy snowfall at ${location} - expect significant delays`);
      } else if (weather.severity === 'moderate') {
        warnings.push(`Moderate snow at ${location} - roads may be slippery`);
      }
    }
    
    if (weather.condition === 'rain' && weather.severity === 'severe') {
      warnings.push(`Heavy rain at ${location} - reduced visibility expected`);
    }
    
    if (weather.condition === 'fog' && weather.severity !== 'light') {
      warnings.push(`${weather.severity === 'severe' ? 'Dense' : 'Moderate'} fog at ${location}`);
    }
    
    if (weather.condition === 'wind' && weather.severity !== 'light') {
      warnings.push(`High winds at ${location} (${Math.round(weather.windSpeed * 2.237)} mph)`);
    }
    
    if (weather.temperature < 0) {
      warnings.push(`Freezing conditions at ${location} - watch for ice`);
    }
  };
  
  checkLocation(origin, 'origin');
  checkLocation(destination, 'destination');
  
  return warnings;
}

async function fetchWeather(lat: number, lon: number, apiKey: string): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  
  console.log(`Fetching weather for coordinates: ${lat}, ${lon}`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenWeatherMap API error: ${response.status} - ${errorText}`);
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`Weather data received:`, JSON.stringify(data.weather?.[0]));
  
  const weatherId = data.weather?.[0]?.id || 800;
  const windSpeed = data.wind?.speed || 0;
  const { condition, severity } = mapWeatherCondition(weatherId, windSpeed);
  
  return {
    condition,
    severity,
    temperature: Math.round(data.main?.temp || 0),
    windSpeed: windSpeed,
    visibility: (data.visibility || 10000) / 1000, // Convert to km
    description: data.weather?.[0]?.description || 'Unknown',
    icon: data.weather?.[0]?.icon || '01d',
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Weather API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { originLat, originLng, destLat, destLng } = await req.json();
    
    console.log(`Weather request for route: (${originLat}, ${originLng}) -> (${destLat}, ${destLng})`);
    
    if (!originLat || !originLng || !destLat || !destLng) {
      return new Response(
        JSON.stringify({ error: 'Missing coordinates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch weather for both locations in parallel
    const [originWeather, destWeather] = await Promise.all([
      fetchWeather(originLat, originLng, apiKey),
      fetchWeather(destLat, destLng, apiKey),
    ]);

    // Calculate combined impact
    const originFactor = calculateDelayFactor(originWeather);
    const destFactor = calculateDelayFactor(destWeather);
    const combinedFactor = Math.max(originFactor, destFactor); // Use worst case
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (combinedFactor >= 1.25) riskLevel = 'high';
    else if (combinedFactor >= 1.10) riskLevel = 'medium';
    
    const warnings = generateWarnings(originWeather, destWeather);

    const response: WeatherResponse = {
      origin: originWeather,
      destination: destWeather,
      routeImpact: {
        delayFactor: combinedFactor,
        riskLevel,
        warnings,
      },
    };

    console.log(`Weather response:`, JSON.stringify(response.routeImpact));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-weather function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
