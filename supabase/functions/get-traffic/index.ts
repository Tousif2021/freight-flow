import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrafficFlowResponse {
  flowSegmentData?: {
    currentSpeed: number;
    freeFlowSpeed: number;
    currentTravelTime: number;
    freeFlowTravelTime: number;
    confidence: number;
    roadClosure: boolean;
  };
}

interface TrafficIncident {
  type: string;
  properties: {
    iconCategory: number;
    magnitudeOfDelay: number;
    events: Array<{ description: string; code: number }>;
    startTime: string;
    endTime: string;
    from: string;
    to: string;
    length: number;
    delay: number;
    roadNumbers: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originLat, originLng, destLat, destLng } = await req.json();
    const apiKey = Deno.env.get('TOMTOM_API_KEY');

    if (!apiKey) {
      throw new Error('TOMTOM_API_KEY not configured');
    }

    console.log(`Fetching traffic data for route: (${originLat},${originLng}) -> (${destLat},${destLng})`);

    // Calculate midpoint for traffic flow sampling
    const midLat = (originLat + destLat) / 2;
    const midLng = (originLng + destLng) / 2;

    // Fetch Traffic Flow at multiple points along route
    const flowPoints = [
      { lat: originLat, lng: originLng },
      { lat: midLat, lng: midLng },
      { lat: destLat, lng: destLng },
    ];

    const flowPromises = flowPoints.map(async (point) => {
      const flowUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${point.lat},${point.lng}&key=${apiKey}`;
      console.log(`Fetching flow at: ${point.lat},${point.lng}`);
      
      try {
        const response = await fetch(flowUrl);
        if (!response.ok) {
          console.log(`Flow API error at ${point.lat},${point.lng}: ${response.status}`);
          return null;
        }
        return await response.json() as TrafficFlowResponse;
      } catch (e) {
        console.log(`Flow fetch error: ${e}`);
        return null;
      }
    });

    // Fetch Traffic Incidents in bounding box
    const minLat = Math.min(originLat, destLat) - 0.5;
    const maxLat = Math.max(originLat, destLat) + 0.5;
    const minLng = Math.min(originLng, destLng) - 0.5;
    const maxLng = Math.max(originLng, destLng) + 0.5;

    const incidentsUrl = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${apiKey}&bbox=${minLng},${minLat},${maxLng},${maxLat}&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code},startTime,endTime,from,to,length,delay,roadNumbers}}}&language=en-US&categoryFilter=0,1,2,3,4,5,6,7,8,9,10,11,14&timeValidityFilter=present`;

    console.log('Fetching incidents...');
    
    let incidentsData: { incidents?: TrafficIncident[] } = { incidents: [] };
    try {
      const incidentsResponse = await fetch(incidentsUrl);
      if (incidentsResponse.ok) {
        incidentsData = await incidentsResponse.json();
      } else {
        console.log(`Incidents API error: ${incidentsResponse.status}`);
      }
    } catch (e) {
      console.log(`Incidents fetch error: ${e}`);
    }

    const flowResults = await Promise.all(flowPromises);
    
    // Process flow data to get average congestion
    let totalCongestion = 0;
    let validFlowCount = 0;
    let hasRoadClosure = false;

    flowResults.forEach((result) => {
      if (result?.flowSegmentData) {
        const data = result.flowSegmentData;
        const congestionRatio = data.freeFlowSpeed > 0 
          ? (data.freeFlowSpeed - data.currentSpeed) / data.freeFlowSpeed 
          : 0;
        totalCongestion += Math.max(0, congestionRatio);
        validFlowCount++;
        if (data.roadClosure) hasRoadClosure = true;
      }
    });

    const avgCongestion = validFlowCount > 0 ? totalCongestion / validFlowCount : 0;

    // Process incidents
    const rawIncidents = incidentsData.incidents || [];
    const severeIncidents = rawIncidents.filter(
      (i) => i.properties?.magnitudeOfDelay >= 3 || i.properties?.iconCategory <= 2
    );
    const moderateIncidents = rawIncidents.filter(
      (i) => i.properties?.magnitudeOfDelay === 2 || (i.properties?.iconCategory > 2 && i.properties?.iconCategory <= 5)
    );

    // Calculate overall traffic score (0 = free flow, 100 = severe congestion)
    let trafficScore = avgCongestion * 60; // Base score from flow
    trafficScore += severeIncidents.length * 15; // Add for severe incidents
    trafficScore += moderateIncidents.length * 5; // Add for moderate incidents
    if (hasRoadClosure) trafficScore += 30;
    trafficScore = Math.min(100, Math.max(0, trafficScore));

    // Determine status
    let status: 'green' | 'yellow' | 'red';
    let label: string;
    
    if (trafficScore <= 20) {
      status = 'green';
      label = 'Free-flowing traffic';
    } else if (trafficScore <= 50) {
      status = 'yellow';
      label = 'Moderate congestion';
    } else {
      status = 'red';
      label = 'Heavy traffic / incidents';
    }

    // Extract incident details with coordinates for map markers
    const processedIncidents = rawIncidents.slice(0, 10).map((incident: any, index: number) => {
      // TomTom incidents have geometry.coordinates as [lng, lat] or array of points
      let lat = midLat;
      let lng = midLng;
      
      if (incident.geometry?.coordinates) {
        const coords = incident.geometry.coordinates;
        if (Array.isArray(coords[0])) {
          // LineString - take first point
          lng = coords[0][0];
          lat = coords[0][1];
        } else {
          // Point
          lng = coords[0];
          lat = coords[1];
        }
      }

      const severity = incident.properties?.magnitudeOfDelay >= 3 || incident.properties?.iconCategory <= 2
        ? 'severe'
        : incident.properties?.magnitudeOfDelay === 2 || incident.properties?.iconCategory <= 5
          ? 'moderate'
          : 'minor';

      const typeMap: Record<number, string> = {
        1: 'accident',
        2: 'fog',
        3: 'hazard',
        4: 'congestion',
        5: 'construction',
        6: 'lane_closure',
        7: 'road_closure',
        8: 'road_works',
        9: 'wind',
        10: 'flooding',
        11: 'detour',
        14: 'broken_down_vehicle',
      };

      return {
        id: `incident-${index}`,
        lat,
        lng,
        type: typeMap[incident.properties?.iconCategory] || 'incident',
        severity,
        description: incident.properties?.events?.[0]?.description || 'Traffic incident',
        delay: incident.properties?.delay || 0,
        from: incident.properties?.from || '',
        to: incident.properties?.to || '',
      };
    });

    const result = {
      trafficScore: Math.round(trafficScore),
      status,
      label,
      avgCongestionPercent: Math.round(avgCongestion * 100),
      incidentCount: rawIncidents.length,
      severeIncidentCount: severeIncidents.length,
      hasRoadClosure,
      flowDataPoints: validFlowCount,
      incidents: processedIncidents,
    };

    console.log('Traffic result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-traffic function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
