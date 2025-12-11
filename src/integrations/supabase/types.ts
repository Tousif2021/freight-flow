export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      carriers: {
        Row: {
          avg_delay_hours: number | null
          carrier_mode: string | null
          carrier_pseudo: string
          created_at: string | null
          display_name: string
          id: string
          logo_url: string | null
          on_time_rate: number | null
          total_shipments: number | null
        }
        Insert: {
          avg_delay_hours?: number | null
          carrier_mode?: string | null
          carrier_pseudo: string
          created_at?: string | null
          display_name: string
          id?: string
          logo_url?: string | null
          on_time_rate?: number | null
          total_shipments?: number | null
        }
        Update: {
          avg_delay_hours?: number | null
          carrier_mode?: string | null
          carrier_pseudo?: string
          created_at?: string | null
          display_name?: string
          id?: string
          logo_url?: string | null
          on_time_rate?: number | null
          total_shipments?: number | null
        }
        Relationships: []
      }
      historical_shipments: {
        Row: {
          actual_delivery: string | null
          actual_ship: string | null
          actual_transit_days: number | null
          carrier_mode: string
          carrier_posted_service_days: number | null
          carrier_pseudo: string | null
          created_at: string | null
          customer_distance: number | null
          dest_city: string | null
          dest_precipitation_mm: number | null
          dest_snowfall_cm: number | null
          dest_wind_speed_kmh: number | null
          dest_zip_3d: string | null
          distance_bucket: string | null
          goal_transit_days: number | null
          id: string
          lane_id: string | null
          lane_zip3_pair: string | null
          load_id_pseudo: string | null
          origin_city: string | null
          origin_precipitation_mm: number | null
          origin_snowfall_cm: number | null
          origin_wind_speed_kmh: number | null
          origin_zip_3d: string | null
          otd_designation: string | null
          ship_dow: number | null
          ship_month: number | null
          ship_week: number | null
          ship_year: number | null
          truckload_service_days: number | null
        }
        Insert: {
          actual_delivery?: string | null
          actual_ship?: string | null
          actual_transit_days?: number | null
          carrier_mode: string
          carrier_posted_service_days?: number | null
          carrier_pseudo?: string | null
          created_at?: string | null
          customer_distance?: number | null
          dest_city?: string | null
          dest_precipitation_mm?: number | null
          dest_snowfall_cm?: number | null
          dest_wind_speed_kmh?: number | null
          dest_zip_3d?: string | null
          distance_bucket?: string | null
          goal_transit_days?: number | null
          id?: string
          lane_id?: string | null
          lane_zip3_pair?: string | null
          load_id_pseudo?: string | null
          origin_city?: string | null
          origin_precipitation_mm?: number | null
          origin_snowfall_cm?: number | null
          origin_wind_speed_kmh?: number | null
          origin_zip_3d?: string | null
          otd_designation?: string | null
          ship_dow?: number | null
          ship_month?: number | null
          ship_week?: number | null
          ship_year?: number | null
          truckload_service_days?: number | null
        }
        Update: {
          actual_delivery?: string | null
          actual_ship?: string | null
          actual_transit_days?: number | null
          carrier_mode?: string
          carrier_posted_service_days?: number | null
          carrier_pseudo?: string | null
          created_at?: string | null
          customer_distance?: number | null
          dest_city?: string | null
          dest_precipitation_mm?: number | null
          dest_snowfall_cm?: number | null
          dest_wind_speed_kmh?: number | null
          dest_zip_3d?: string | null
          distance_bucket?: string | null
          goal_transit_days?: number | null
          id?: string
          lane_id?: string | null
          lane_zip3_pair?: string | null
          load_id_pseudo?: string | null
          origin_city?: string | null
          origin_precipitation_mm?: number | null
          origin_snowfall_cm?: number | null
          origin_wind_speed_kmh?: number | null
          origin_zip_3d?: string | null
          otd_designation?: string | null
          ship_dow?: number | null
          ship_month?: number | null
          ship_week?: number | null
          ship_year?: number | null
          truckload_service_days?: number | null
        }
        Relationships: []
      }
      lane_statistics: {
        Row: {
          avg_distance: number | null
          avg_transit_days: number | null
          dest_zip_3d: string
          early_count: number | null
          id: string
          lane_zip3_pair: string
          late_count: number | null
          late_rate: number | null
          max_transit_days: number | null
          median_transit_days: number | null
          min_transit_days: number | null
          on_time_count: number | null
          on_time_rate: number | null
          origin_zip_3d: string
          std_dev_transit: number | null
          total_shipments: number | null
          updated_at: string | null
        }
        Insert: {
          avg_distance?: number | null
          avg_transit_days?: number | null
          dest_zip_3d: string
          early_count?: number | null
          id?: string
          lane_zip3_pair: string
          late_count?: number | null
          late_rate?: number | null
          max_transit_days?: number | null
          median_transit_days?: number | null
          min_transit_days?: number | null
          on_time_count?: number | null
          on_time_rate?: number | null
          origin_zip_3d: string
          std_dev_transit?: number | null
          total_shipments?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_distance?: number | null
          avg_transit_days?: number | null
          dest_zip_3d?: string
          early_count?: number | null
          id?: string
          lane_zip3_pair?: string
          late_count?: number | null
          late_rate?: number | null
          max_transit_days?: number | null
          median_transit_days?: number | null
          min_transit_days?: number | null
          on_time_count?: number | null
          on_time_rate?: number | null
          origin_zip_3d?: string
          std_dev_transit?: number | null
          total_shipments?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_lane_statistics: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
