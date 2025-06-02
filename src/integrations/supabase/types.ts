export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          is_super_admin: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          auction_type: string | null
          created_at: string | null
          discount_min: number | null
          id: string
          location: string | null
          name: string
          price_max: number | null
          price_min: number | null
          property_type: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auction_type?: string | null
          created_at?: string | null
          discount_min?: number | null
          id?: string
          location?: string | null
          name: string
          price_max?: number | null
          price_min?: number | null
          property_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auction_type?: string | null
          created_at?: string | null
          discount_min?: number | null
          id?: string
          location?: string | null
          name?: string
          price_max?: number | null
          price_min?: number | null
          property_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auctions: {
        Row: {
          auction_date: string
          auction_number: number
          id: string
          min_bid: number
          property_id: string | null
        }
        Insert: {
          auction_date: string
          auction_number: number
          id?: string
          min_bid: number
          property_id?: string | null
        }
        Update: {
          auction_date?: string
          auction_number?: number
          id?: string
          min_bid?: number
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auctions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          allow_consorcio: boolean | null
          allow_fgts: boolean | null
          allow_financing: boolean | null
          area_util: number | null
          auction_date: string | null
          auction_price: number
          auction_type: string | null
          auctioneer: string | null
          auctioneer_site: string | null
          bairro_nome: string | null
          bedrooms: number | null
          city: string
          court: string | null
          created_at: string | null
          description: string | null
          discount: number | null
          edital_pdf_url: string | null
          garage: number | null
          id: string
          images: string[] | null
          judicial_information: string | null
          market_price: number
          matricula_pdf_url: string | null
          min_bid: number | null
          process_number: string | null
          region_description: string | null
          slug: string | null
          state: string
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          address: string
          allow_consorcio?: boolean | null
          allow_fgts?: boolean | null
          allow_financing?: boolean | null
          area_util?: number | null
          auction_date?: string | null
          auction_price: number
          auction_type?: string | null
          auctioneer?: string | null
          auctioneer_site?: string | null
          bairro_nome?: string | null
          bedrooms?: number | null
          city: string
          court?: string | null
          created_at?: string | null
          description?: string | null
          discount?: number | null
          edital_pdf_url?: string | null
          garage?: number | null
          id?: string
          images?: string[] | null
          judicial_information?: string | null
          market_price: number
          matricula_pdf_url?: string | null
          min_bid?: number | null
          process_number?: string | null
          region_description?: string | null
          slug?: string | null
          state: string
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          allow_consorcio?: boolean | null
          allow_fgts?: boolean | null
          allow_financing?: boolean | null
          area_util?: number | null
          auction_date?: string | null
          auction_price?: number
          auction_type?: string | null
          auctioneer?: string | null
          auctioneer_site?: string | null
          bairro_nome?: string | null
          bedrooms?: number | null
          city?: string
          court?: string | null
          created_at?: string | null
          description?: string | null
          discount?: number | null
          edital_pdf_url?: string | null
          garage?: number | null
          id?: string
          images?: string[] | null
          judicial_information?: string | null
          market_price?: number
          matricula_pdf_url?: string | null
          min_bid?: number | null
          process_number?: string | null
          region_description?: string | null
          slug?: string | null
          state?: string
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      property_auction_stages: {
        Row: {
          data_fim: string | null
          id: string
          property_id: string | null
          valor_inicial: number | null
        }
        Insert: {
          data_fim?: string | null
          id?: string
          property_id?: string | null
          valor_inicial?: number | null
        }
        Update: {
          data_fim?: string | null
          id?: string
          property_id?: string | null
          valor_inicial?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_auction_stages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_characteristics: {
        Row: {
          description: string | null
          id: string
          property_id: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          property_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          property_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_characteristics_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          id: string
          property_id: string | null
          url: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          url: string
        }
        Update: {
          id?: string
          property_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          benefits: Json | null
          created_at: string
          description: string | null
          id: string
          price_annual: number
          price_monthly: number
          status: string
          stripe_price_id_annual: string | null
          stripe_price_id_monthly: string | null
          stripe_product_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          price_annual: number
          price_monthly: number
          status?: string
          stripe_price_id_annual?: string | null
          stripe_price_id_monthly?: string | null
          stripe_product_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          price_annual?: number
          price_monthly?: number
          status?: string
          stripe_price_id_annual?: string | null
          stripe_price_id_monthly?: string | null
          stripe_product_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          google_maps_api_key: string | null
          id: string
          notification_email: string | null
          notification_template: string | null
          openai_api_key: string | null
          scraping_interval: number | null
          scraping_sites: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          google_maps_api_key?: string | null
          id?: string
          notification_email?: string | null
          notification_template?: string | null
          openai_api_key?: string | null
          scraping_interval?: number | null
          scraping_sites?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          google_maps_api_key?: string | null
          id?: string
          notification_email?: string | null
          notification_template?: string | null
          openai_api_key?: string | null
          scraping_interval?: number | null
          scraping_sites?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_interval: string | null
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
