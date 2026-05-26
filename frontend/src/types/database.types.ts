export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          phone: string | null
          village: string | null
          taluka: string | null
          district: string | null
          state: string | null
          preferred_language: string | null
          profile_image_url: string | null
          farming_type: string | null
          crop_name: string | null
          crop_type: string | null
          land_size: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          phone?: string | null
          village?: string | null
          taluka?: string | null
          district?: string | null
          state?: string | null
          preferred_language?: string | null
          profile_image_url?: string | null
          farming_type?: string | null
          crop_name?: string | null
          crop_type?: string | null
          land_size?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string | null
          phone?: string | null
          village?: string | null
          taluka?: string | null
          district?: string | null
          state?: string | null
          preferred_language?: string | null
          profile_image_url?: string | null
          farming_type?: string | null
          crop_name?: string | null
          crop_type?: string | null
          land_size?: number | null
        }
      }
      farms: {
        Row: {
          id: string
          user_id: string
          farm_size: number | null
          soil_type: string | null
          irrigation_type: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          farm_size?: number | null
          soil_type?: string | null
          irrigation_type?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          farm_size?: number | null
          soil_type?: string | null
          irrigation_type?: string | null
          location?: string | null
        }
      }
      crops: {
        Row: {
          id: string
          user_id: string
          crop_name: string
          season: string | null
          sowing_date: string | null
          expected_harvest_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          crop_name: string
          season?: string | null
          sowing_date?: string | null
          expected_harvest_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          crop_name?: string
          season?: string | null
          sowing_date?: string | null
          expected_harvest_date?: string | null
        }
      }
      weather_cache: {
        Row: {
          id: string
          district: string
          location: string | null
          latitude: number | null
          longitude: number | null
          temperature: number | null
          feels_like: number | null
          humidity: number | null
          rainfall: number | null
          wind_speed: number | null
          weather_condition: string | null
          uv_index: number | null
          forecast: Json | null
          forecast_json: Json | null
          hourly_json: Json | null
          alerts_json: Json | null
          precipitation_probability: number | null
          cloud_coverage: number | null
          visibility: number | null
          provider: string | null
          stale_after: string | null
          fetched_at: string
        }
        Insert: {
          id?: string
          district: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          temperature?: number | null
          feels_like?: number | null
          humidity?: number | null
          rainfall?: number | null
          wind_speed?: number | null
          weather_condition?: string | null
          uv_index?: number | null
          forecast?: Json | null
          forecast_json?: Json | null
          hourly_json?: Json | null
          alerts_json?: Json | null
          precipitation_probability?: number | null
          cloud_coverage?: number | null
          visibility?: number | null
          provider?: string | null
          stale_after?: string | null
          fetched_at?: string
        }
        Update: {
          district?: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          temperature?: number | null
          feels_like?: number | null
          humidity?: number | null
          rainfall?: number | null
          wind_speed?: number | null
          weather_condition?: string | null
          uv_index?: number | null
          forecast?: Json | null
          forecast_json?: Json | null
          hourly_json?: Json | null
          alerts_json?: Json | null
          precipitation_probability?: number | null
          cloud_coverage?: number | null
          visibility?: number | null
          provider?: string | null
          stale_after?: string | null
          fetched_at?: string
        }
      }
      agri_news: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          source: string
          url: string | null
          language: string
          category: string | null
          published_at: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          source: string
          url?: string | null
          language?: string
          category?: string | null
          published_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          image_url?: string | null
          source?: string
          url?: string | null
          language?: string
          category?: string | null
          published_at?: string
          is_active?: boolean
        }
      }
      agriculture_news: {
        Row: {
          id: string
          title: string
          summary: string | null
          content: string | null
          source_name: string
          source_url: string
          image_url: string | null
          category: string
          crop_related: string[]
          state_related: string[]
          title_hash: string | null
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string | null
          content?: string | null
          source_name: string
          source_url: string
          image_url?: string | null
          category?: string
          crop_related?: string[]
          state_related?: string[]
          title_hash?: string | null
          published_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          summary?: string | null
          content?: string | null
          source_name?: string
          source_url?: string
          image_url?: string | null
          category?: string
          crop_related?: string[]
          state_related?: string[]
          title_hash?: string | null
          published_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      farming_tips: {
        Row: {
          id: string
          title: string
          description: string
          content: string | null
          category: string
          crop_type: string | null
          dataset_id: number | null
          season: string | null
          language: string
          source: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          content?: string | null
          category?: string
          crop_type?: string | null
          dataset_id?: number | null
          season?: string | null
          language?: string
          source?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          content?: string | null
          category?: string
          crop_type?: string | null
          dataset_id?: number | null
          season?: string | null
          language?: string
          source?: string | null
          is_active?: boolean
        }
      }
      farmer_alerts: {
        Row: {
          id: string
          user_id: string
          alert_type: string
          message: string
          severity: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          alert_type: string
          message: string
          severity?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          alert_type?: string
          message?: string
          severity?: string
          is_read?: boolean
        }
      }
    }
  }
}
