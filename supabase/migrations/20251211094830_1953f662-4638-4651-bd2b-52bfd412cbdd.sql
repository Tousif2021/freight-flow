-- Add weather and city columns to historical_shipments table
ALTER TABLE historical_shipments 
ADD COLUMN IF NOT EXISTS origin_city TEXT,
ADD COLUMN IF NOT EXISTS dest_city TEXT,
ADD COLUMN IF NOT EXISTS origin_precipitation_mm DECIMAL,
ADD COLUMN IF NOT EXISTS origin_snowfall_cm DECIMAL,
ADD COLUMN IF NOT EXISTS origin_wind_speed_kmh DECIMAL,
ADD COLUMN IF NOT EXISTS dest_precipitation_mm DECIMAL,
ADD COLUMN IF NOT EXISTS dest_snowfall_cm DECIMAL,
ADD COLUMN IF NOT EXISTS dest_wind_speed_kmh DECIMAL;