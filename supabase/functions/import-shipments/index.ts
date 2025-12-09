import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Parse date strings like "1/3/22 9:45" or "1/3/2022 9:45"
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Handle format: M/D/YY H:MM or M/D/YYYY H:MM
    const parts = dateStr.trim().split(' ');
    if (parts.length < 2) return null;
    
    const dateParts = parts[0].split('/');
    const timeParts = parts[1].split(':');
    
    if (dateParts.length !== 3) return null;
    
    let year = parseInt(dateParts[2]);
    // Handle 2-digit years
    if (year < 100) {
      year = year + 2000;
    }
    
    const month = parseInt(dateParts[0]) - 1; // 0-indexed
    const day = parseInt(dateParts[1]);
    const hours = parseInt(timeParts[0]) || 0;
    const minutes = parseInt(timeParts[1]) || 0;
    
    return new Date(year, month, day, hours, minutes);
  } catch {
    return null;
  }
}

// Parse CSV content into rows
function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.trim());
  return lines.map(line => {
    // Handle tab-separated or comma-separated
    if (line.includes('\t')) {
      return line.split('\t').map(cell => cell.trim());
    }
    return line.split(',').map(cell => cell.trim());
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { csvContent, clearExisting = false } = await req.json();

    if (!csvContent) {
      return new Response(
        JSON.stringify({ error: 'No CSV content provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting CSV import...');

    // Parse CSV
    const rows = parseCSV(csvContent);
    if (rows.length < 2) {
      return new Response(
        JSON.stringify({ error: 'CSV must have header row and at least one data row' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const dataRows = rows.slice(1);

    console.log(`Found ${dataRows.length} rows to import`);
    console.log('Headers:', headers);

    // Clear existing data if requested
    if (clearExisting) {
      console.log('Clearing existing historical shipments...');
      const { error: deleteError } = await supabase
        .from('historical_shipments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (deleteError) {
        console.error('Error clearing data:', deleteError);
      }
    }

    // Map headers to database columns
    const headerMap: Record<string, string> = {
      'carrier_mode': 'carrier_mode',
      'actual_ship': 'actual_ship',
      'actual_delivery': 'actual_delivery',
      'carrier_posted_service_days': 'carrier_posted_service_days',
      'customer_distance': 'customer_distance',
      'truckload_service_days': 'truckload_service_days',
      'all_modes_goal_transit_days': 'goal_transit_days',
      'actual_transit_days': 'actual_transit_days',
      'otd_designation': 'otd_designation',
      'load_id_pseudo': 'load_id_pseudo',
      'carrier_pseudo': 'carrier_pseudo',
      'origin_zip_3d': 'origin_zip_3d',
      'dest_zip_3d': 'dest_zip_3d',
      'ship_dow': 'ship_dow',
      'ship_week': 'ship_week',
      'ship_month': 'ship_month',
      'ship_year': 'ship_year',
      'lane_zip3_pair': 'lane_zip3_pair',
      'lane_id': 'lane_id',
      'distance_bucket': 'distance_bucket',
    };

    // Process rows in batches
    const BATCH_SIZE = 500;
    let imported = 0;
    let errors: string[] = [];

    for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
      const batch = dataRows.slice(i, i + BATCH_SIZE);
      
      const records = batch.map((row, rowIndex) => {
        const record: Record<string, any> = {};
        
        headers.forEach((header, colIndex) => {
          const dbColumn = headerMap[header];
          if (dbColumn && row[colIndex] !== undefined) {
            const value = row[colIndex];
            
            // Handle different data types
            if (dbColumn === 'actual_ship' || dbColumn === 'actual_delivery') {
              const date = parseDate(value);
              record[dbColumn] = date ? date.toISOString() : null;
            } else if (['customer_distance', 'truckload_service_days', 'goal_transit_days', 
                        'actual_transit_days', 'ship_dow', 'ship_week', 'ship_month', 
                        'ship_year', 'carrier_posted_service_days'].includes(dbColumn)) {
              record[dbColumn] = value ? parseInt(value) || null : null;
            } else {
              record[dbColumn] = value || null;
            }
          }
        });
        
        return record;
      }).filter(record => record.carrier_mode); // Filter out empty rows

      if (records.length > 0) {
        const { error: insertError } = await supabase
          .from('historical_shipments')
          .insert(records);

        if (insertError) {
          console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, insertError);
          errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${insertError.message}`);
        } else {
          imported += records.length;
          console.log(`Imported batch ${Math.floor(i / BATCH_SIZE) + 1}: ${records.length} records`);
        }
      }
    }

    // Compute lane statistics after import
    console.log('Computing lane statistics...');
    const { error: statsError } = await supabase.rpc('compute_lane_statistics');
    if (statsError) {
      console.error('Error computing statistics:', statsError);
      errors.push(`Lane statistics: ${statsError.message}`);
    }

    // Get statistics summary
    const { data: laneCount } = await supabase
      .from('lane_statistics')
      .select('id', { count: 'exact' });

    const result = {
      success: true,
      imported,
      totalRows: dataRows.length,
      laneStatisticsComputed: laneCount?.length || 0,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('Import complete:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
