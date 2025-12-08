import { CarrierMode, ETAPrediction, ETAFactor, RiskLevel, WeatherCondition } from '@/types/shipment';

// Carrier mode multipliers - realistic adjustments
const CARRIER_MULTIPLIERS: Record<CarrierMode, { multiplier: number; risk: RiskLevel; delayProbability: number }> = {
  'ltl': { multiplier: 1.35, risk: 'medium', delayProbability: 0.25 },
  'tl-dry': { multiplier: 1.0, risk: 'low', delayProbability: 0.08 },
  'flatbed': { multiplier: 1.15, risk: 'medium', delayProbability: 0.15 },
  'refrigerated': { multiplier: 1.2, risk: 'medium', delayProbability: 0.18 },
};

// Time-of-day congestion factors
function getTimeOfDayCongestion(hour: number): { factor: number; description: string } {
  if (hour >= 7 && hour <= 9) return { factor: 1.25, description: 'Morning rush hour traffic expected' };
  if (hour >= 16 && hour <= 19) return { factor: 1.35, description: 'Evening rush hour delays likely' };
  if (hour >= 22 || hour < 5) return { factor: 0.85, description: 'Light overnight traffic conditions' };
  return { factor: 1.0, description: 'Normal traffic conditions' };
}

// Day-of-week factors
function getDayOfWeekFactor(day: number): { factor: number; description: string } {
  if (day === 0) return { factor: 0.9, description: 'Sunday - reduced commercial traffic' };
  if (day === 5) return { factor: 1.15, description: 'Friday - increased end-of-week freight volume' };
  if (day === 6) return { factor: 0.95, description: 'Saturday - moderate traffic' };
  return { factor: 1.0, description: 'Standard weekday operations' };
}

// Simulate weather conditions along route
function getWeatherConditions(originLat: number, destLat: number): WeatherCondition[] {
  const conditions: WeatherCondition[] = [];
  const now = new Date();
  const month = now.getMonth();
  
  // Winter months - higher chance of snow in northern routes
  if (month >= 10 || month <= 2) {
    if (originLat > 40 || destLat > 40) {
      const severity = Math.random() > 0.6 ? 'moderate' : 'light';
      conditions.push({
        condition: 'snow',
        severity,
        location: 'Midwest corridor',
      });
    }
  }
  
  // Random weather events
  if (Math.random() > 0.7) {
    conditions.push({
      condition: 'rain',
      severity: Math.random() > 0.5 ? 'moderate' : 'light',
      location: 'En route segments',
    });
  }
  
  if (Math.random() > 0.85) {
    conditions.push({
      condition: 'wind',
      severity: 'moderate',
      location: 'Plains region',
    });
  }
  
  return conditions;
}

function getWeatherImpact(conditions: WeatherCondition[]): { factor: number; description: string } {
  if (conditions.length === 0) {
    return { factor: 1.0, description: 'Clear weather conditions forecasted' };
  }
  
  let maxFactor = 1.0;
  const descriptions: string[] = [];
  
  for (const condition of conditions) {
    let factor = 1.0;
    
    if (condition.condition === 'snow') {
      factor = condition.severity === 'severe' ? 1.5 : condition.severity === 'moderate' ? 1.3 : 1.15;
      descriptions.push(`${condition.severity} snowfall expected in ${condition.location}`);
    } else if (condition.condition === 'rain') {
      factor = condition.severity === 'severe' ? 1.25 : condition.severity === 'moderate' ? 1.15 : 1.05;
      descriptions.push(`${condition.severity} rain forecasted along route`);
    } else if (condition.condition === 'wind') {
      factor = condition.severity === 'severe' ? 1.2 : 1.1;
      descriptions.push(`High wind advisory for ${condition.location}`);
    } else if (condition.condition === 'fog') {
      factor = condition.severity === 'severe' ? 1.15 : 1.05;
      descriptions.push('Reduced visibility conditions expected');
    }
    
    maxFactor = Math.max(maxFactor, factor);
  }
  
  return { factor: maxFactor, description: descriptions.join('. ') };
}

export function calculateETA(
  baseDurationHours: number,
  carrierMode: CarrierMode,
  originLat: number,
  destLat: number,
  departureTime: Date = new Date()
): ETAPrediction {
  const factors: ETAFactor[] = [];
  let totalDuration = baseDurationHours;
  
  // 1. Apply carrier mode adjustment
  const carrierData = CARRIER_MULTIPLIERS[carrierMode];
  const carrierAdjustment = (carrierData.multiplier - 1) * baseDurationHours;
  totalDuration += carrierAdjustment;
  
  factors.push({
    name: 'Carrier Mode',
    impact: carrierAdjustment > 0 ? 'negative' : 'positive',
    description: getCarrierDescription(carrierMode),
    adjustment: carrierAdjustment,
  });
  
  // 2. Time-of-day congestion
  const timeData = getTimeOfDayCongestion(departureTime.getHours());
  const timeAdjustment = (timeData.factor - 1) * baseDurationHours;
  totalDuration += timeAdjustment;
  
  factors.push({
    name: 'Traffic Conditions',
    impact: timeAdjustment > 0 ? 'negative' : timeAdjustment < 0 ? 'positive' : 'neutral',
    description: timeData.description,
    adjustment: timeAdjustment,
  });
  
  // 3. Day-of-week
  const dayData = getDayOfWeekFactor(departureTime.getDay());
  const dayAdjustment = (dayData.factor - 1) * baseDurationHours;
  totalDuration += dayAdjustment;
  
  factors.push({
    name: 'Day of Week',
    impact: dayAdjustment > 0 ? 'negative' : dayAdjustment < 0 ? 'positive' : 'neutral',
    description: dayData.description,
    adjustment: dayAdjustment,
  });
  
  // 4. Weather conditions
  const weatherConditions = getWeatherConditions(originLat, destLat);
  const weatherData = getWeatherImpact(weatherConditions);
  const weatherAdjustment = (weatherData.factor - 1) * baseDurationHours;
  totalDuration += weatherAdjustment;
  
  factors.push({
    name: 'Weather',
    impact: weatherAdjustment > 0 ? 'negative' : 'positive',
    description: weatherData.description,
    adjustment: weatherAdjustment,
  });
  
  // Calculate confidence window
  const varianceHours = totalDuration * (carrierData.delayProbability * 0.5);
  const estimatedArrival = new Date(departureTime.getTime() + totalDuration * 60 * 60 * 1000);
  
  // Determine overall risk level
  const riskLevel = determineRiskLevel(factors, carrierData.risk, weatherConditions.length > 0);
  
  // Generate explanation
  const explanation = generateExplanation(factors, carrierMode, weatherConditions);
  
  // Generate recommendations
  const recommendations = generateRecommendations(factors, carrierMode, riskLevel);
  
  return {
    estimatedArrival,
    durationHours: Math.round(totalDuration * 10) / 10,
    riskLevel,
    confidenceWindow: {
      earliest: new Date(estimatedArrival.getTime() - varianceHours * 60 * 60 * 1000),
      latest: new Date(estimatedArrival.getTime() + varianceHours * 60 * 60 * 1000),
    },
    factors,
    explanation,
    recommendations,
  };
}

function getCarrierDescription(mode: CarrierMode): string {
  switch (mode) {
    case 'ltl':
      return 'LTL shipments involve multiple stops, increasing transit variability';
    case 'tl-dry':
      return 'Direct truckload provides fastest, most predictable transit';
    case 'flatbed':
      return 'Flatbed loads may require route adjustments for clearance';
    case 'refrigerated':
      return 'Temperature-controlled loads follow stricter scheduling';
  }
}

function determineRiskLevel(
  factors: ETAFactor[],
  baseRisk: RiskLevel,
  hasWeatherIssues: boolean
): RiskLevel {
  const negativeFactors = factors.filter(f => f.impact === 'negative').length;
  const totalNegativeImpact = factors
    .filter(f => f.impact === 'negative')
    .reduce((sum, f) => sum + f.adjustment, 0);
  
  if (negativeFactors >= 3 || totalNegativeImpact > 4 || (hasWeatherIssues && baseRisk !== 'low')) {
    return 'high';
  }
  if (negativeFactors >= 2 || totalNegativeImpact > 2 || hasWeatherIssues) {
    return 'medium';
  }
  return baseRisk;
}

function generateExplanation(
  factors: ETAFactor[],
  carrierMode: CarrierMode,
  weatherConditions: WeatherCondition[]
): string {
  const parts: string[] = [];
  
  if (weatherConditions.length > 0) {
    const weatherDescriptions = weatherConditions.map(w => 
      `${w.severity} ${w.condition} in ${w.location}`
    );
    parts.push(`Weather advisory: ${weatherDescriptions.join(', ')}.`);
  }
  
  const negativeFactors = factors.filter(f => f.impact === 'negative' && f.adjustment > 0.5);
  if (negativeFactors.length > 0) {
    parts.push(`${negativeFactors.map(f => f.description).join('. ')}.`);
  }
  
  if (carrierMode === 'ltl') {
    parts.push('LTL shipments on this route historically experience ~20% delays under similar conditions.');
  }
  
  if (parts.length === 0) {
    parts.push('Optimal conditions expected. No significant delays anticipated.');
  }
  
  return parts.join(' ');
}

function generateRecommendations(
  factors: ETAFactor[],
  carrierMode: CarrierMode,
  riskLevel: RiskLevel
): string[] {
  const recommendations: string[] = [];
  
  if (riskLevel === 'high') {
    if (carrierMode === 'ltl') {
      recommendations.push('Consider upgrading to TL Dry for time-sensitive cargo');
    }
    recommendations.push('Schedule pickup during off-peak hours if possible');
    recommendations.push('Enable real-time tracking notifications for immediate updates');
  } else if (riskLevel === 'medium') {
    recommendations.push('Monitor weather conditions along the route');
    if (carrierMode !== 'tl-dry') {
      recommendations.push('TL Dry option available for faster transit');
    }
  }
  
  const weatherFactor = factors.find(f => f.name === 'Weather' && f.impact === 'negative');
  if (weatherFactor && weatherFactor.adjustment > 1) {
    recommendations.push('Consider delaying pickup by 24-48 hours for improved conditions');
  }
  
  const trafficFactor = factors.find(f => f.name === 'Traffic Conditions' && f.impact === 'negative');
  if (trafficFactor) {
    recommendations.push('Early morning or late evening pickup recommended');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Current conditions are favorable for on-time delivery');
  }
  
  return recommendations.slice(0, 3);
}

// Calculate distance in miles between two coordinates
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

// Estimate base duration from distance (average 50mph for freight)
export function estimateBaseDuration(distanceMiles: number): number {
  const avgSpeedMph = 50;
  const restStops = Math.floor(distanceMiles / 500); // Rest every 500 miles
  const restHours = restStops * 0.75; // 45 min rest stops
  return (distanceMiles / avgSpeedMph) + restHours;
}
