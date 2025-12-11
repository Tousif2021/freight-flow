import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { originZip3, destZip3 } = await req.json();

    console.log(`Looking up lane statistics for ${originZip3} -> ${destZip3}`);

    // Try to find exact lane match
    const { data: laneStats, error } = await supabase
      .from('lane_statistics')
      .select('*')
      .eq('origin_zip_3d', originZip3)
      .eq('dest_zip_3d', destZip3)
      .maybeSingle();

    if (error) {
      console.error('Error fetching lane statistics:', error);
      throw error;
    }

    if (laneStats) {
      console.log('Found lane statistics:', laneStats);
      
      // Calculate risk level based on late rate
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      const lateRate = laneStats.late_rate || 0;
      
      if (lateRate > 0.20) {
        riskLevel = 'high';
      } else if (lateRate > 0.10) {
        riskLevel = 'medium';
      }

      return new Response(JSON.stringify({
        found: true,
        laneZip3Pair: laneStats.lane_zip3_pair,
        avgTransitDays: laneStats.avg_transit_days,
        minTransitDays: laneStats.min_transit_days,
        maxTransitDays: laneStats.max_transit_days,
        stdDevTransit: laneStats.std_dev_transit,
        onTimeRate: laneStats.on_time_rate,
        lateRate: laneStats.late_rate,
        totalShipments: laneStats.total_shipments,
        avgDistance: laneStats.avg_distance,
        riskLevel,
        onTimeCount: laneStats.on_time_count,
        lateCount: laneStats.late_count,
        earlyCount: laneStats.early_count,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // No exact match found - try to find similar lanes or return aggregate stats
    console.log('No exact lane match, looking for similar lanes...');
    
    // Get aggregate statistics from all lanes
    const { data: aggregateStats } = await supabase
      .from('lane_statistics')
      .select('avg_transit_days, on_time_rate, late_rate, total_shipments')
      .limit(100);

    if (aggregateStats && aggregateStats.length > 0) {
      const avgOnTimeRate = aggregateStats.reduce((sum, s) => sum + (s.on_time_rate || 0), 0) / aggregateStats.length;
      const avgLateRate = aggregateStats.reduce((sum, s) => sum + (s.late_rate || 0), 0) / aggregateStats.length;
      const avgTransit = aggregateStats.reduce((sum, s) => sum + (s.avg_transit_days || 0), 0) / aggregateStats.length;

      return new Response(JSON.stringify({
        found: false,
        isAggregate: true,
        avgTransitDays: Math.round(avgTransit * 10) / 10,
        onTimeRate: Math.round(avgOnTimeRate * 1000) / 1000,
        lateRate: Math.round(avgLateRate * 1000) / 1000,
        totalShipments: aggregateStats.reduce((sum, s) => sum + (s.total_shipments || 0), 0),
        riskLevel: avgLateRate > 0.15 ? 'medium' : 'low',
        message: 'No exact lane match. Using aggregate statistics.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // No data at all
    return new Response(JSON.stringify({
      found: false,
      message: 'No historical data available for this lane.',
      riskLevel: 'medium',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-lane-statistics:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      found: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
