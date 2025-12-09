-- Historical shipments table for ETA analysis
CREATE TABLE public.historical_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_mode TEXT NOT NULL,
  actual_ship TIMESTAMP,
  actual_delivery TIMESTAMP,
  carrier_posted_service_days INTEGER,
  customer_distance INTEGER,
  truckload_service_days INTEGER,
  goal_transit_days INTEGER,
  actual_transit_days INTEGER,
  otd_designation TEXT,
  load_id_pseudo TEXT UNIQUE,
  carrier_pseudo TEXT,
  origin_zip_3d TEXT,
  dest_zip_3d TEXT,
  ship_dow INTEGER,
  ship_week INTEGER,
  ship_month INTEGER,
  ship_year INTEGER,
  lane_zip3_pair TEXT,
  lane_id TEXT,
  distance_bucket TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for fast querying
CREATE INDEX idx_historical_lane_pair ON public.historical_shipments(lane_zip3_pair);
CREATE INDEX idx_historical_carrier ON public.historical_shipments(carrier_pseudo);
CREATE INDEX idx_historical_ship_dow ON public.historical_shipments(ship_dow);
CREATE INDEX idx_historical_distance ON public.historical_shipments(customer_distance);

-- Lane statistics table (computed from historical data)
CREATE TABLE public.lane_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lane_zip3_pair TEXT UNIQUE NOT NULL,
  origin_zip_3d TEXT NOT NULL,
  dest_zip_3d TEXT NOT NULL,
  avg_transit_days DECIMAL(5,2),
  median_transit_days DECIMAL(5,2),
  min_transit_days INTEGER,
  max_transit_days INTEGER,
  std_dev_transit DECIMAL(5,2),
  on_time_count INTEGER DEFAULT 0,
  late_count INTEGER DEFAULT 0,
  early_count INTEGER DEFAULT 0,
  total_shipments INTEGER DEFAULT 0,
  on_time_rate DECIMAL(5,4),
  late_rate DECIMAL(5,4),
  avg_distance INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_lane_origin ON public.lane_statistics(origin_zip_3d);
CREATE INDEX idx_lane_dest ON public.lane_statistics(dest_zip_3d);

-- Carriers table for display names
CREATE TABLE public.carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_pseudo TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  carrier_mode TEXT,
  total_shipments INTEGER DEFAULT 0,
  on_time_rate DECIMAL(5,4),
  avg_delay_hours DECIMAL(5,2),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Pre-populate with common carriers
INSERT INTO public.carriers (carrier_pseudo, display_name, carrier_mode) VALUES
  ('dhl_express', 'DHL Express', 'Truckload'),
  ('fedex_freight', 'FedEx Freight', 'Truckload'),
  ('xpo_logistics', 'XPO Logistics', 'Truckload'),
  ('jb_hunt', 'J.B. Hunt', 'Truckload'),
  ('schneider', 'Schneider National', 'Truckload'),
  ('estes_express', 'Estes Express', 'LTL'),
  ('old_dominion', 'Old Dominion', 'LTL'),
  ('saia', 'Saia LTL Freight', 'LTL'),
  ('ups_freight', 'UPS Freight', 'Truckload'),
  ('yrc_worldwide', 'YRC Worldwide', 'LTL');

-- Enable RLS
ALTER TABLE public.historical_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lane_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;

-- Public read policies (data is reference data, not user-specific)
CREATE POLICY "Anyone can read historical shipments" ON public.historical_shipments FOR SELECT USING (true);
CREATE POLICY "Anyone can read lane statistics" ON public.lane_statistics FOR SELECT USING (true);
CREATE POLICY "Anyone can read carriers" ON public.carriers FOR SELECT USING (true);

-- Function to compute lane statistics from historical data
CREATE OR REPLACE FUNCTION public.compute_lane_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear existing statistics
  DELETE FROM lane_statistics;
  
  -- Compute and insert new statistics
  INSERT INTO lane_statistics (
    lane_zip3_pair,
    origin_zip_3d,
    dest_zip_3d,
    avg_transit_days,
    min_transit_days,
    max_transit_days,
    std_dev_transit,
    on_time_count,
    late_count,
    early_count,
    total_shipments,
    on_time_rate,
    late_rate,
    avg_distance,
    updated_at
  )
  SELECT 
    lane_zip3_pair,
    origin_zip_3d,
    dest_zip_3d,
    ROUND(AVG(actual_transit_days)::numeric, 2) as avg_transit_days,
    MIN(actual_transit_days) as min_transit_days,
    MAX(actual_transit_days) as max_transit_days,
    ROUND(STDDEV(actual_transit_days)::numeric, 2) as std_dev_transit,
    COUNT(*) FILTER (WHERE otd_designation = 'On Time') as on_time_count,
    COUNT(*) FILTER (WHERE otd_designation = 'Late') as late_count,
    COUNT(*) FILTER (WHERE otd_designation LIKE '%Early%') as early_count,
    COUNT(*) as total_shipments,
    ROUND((COUNT(*) FILTER (WHERE otd_designation = 'On Time')::decimal / NULLIF(COUNT(*), 0)), 4) as on_time_rate,
    ROUND((COUNT(*) FILTER (WHERE otd_designation = 'Late')::decimal / NULLIF(COUNT(*), 0)), 4) as late_rate,
    ROUND(AVG(customer_distance)) as avg_distance,
    now()
  FROM historical_shipments
  WHERE lane_zip3_pair IS NOT NULL
  GROUP BY lane_zip3_pair, origin_zip_3d, dest_zip_3d;
END;
$$;