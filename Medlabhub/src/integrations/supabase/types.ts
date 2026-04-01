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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      flashcard_progress: {
        Row: {
          correct_count: number
          created_at: string
          ease_factor: number
          id: string
          incorrect_count: number
          interval_days: number
          last_reviewed: string
          next_review: string
          organism_name: string
          user_id: string
        }
        Insert: {
          correct_count?: number
          created_at?: string
          ease_factor?: number
          id?: string
          incorrect_count?: number
          interval_days?: number
          last_reviewed?: string
          next_review?: string
          organism_name: string
          user_id: string
        }
        Update: {
          correct_count?: number
          created_at?: string
          ease_factor?: number
          id?: string
          incorrect_count?: number
          interval_days?: number
          last_reviewed?: string
          next_review?: string
          organism_name?: string
          user_id?: string
        }
        Relationships: []
      }
      identification_records: {
        Row: {
          arrangement: string | null
          associated_diseases: Json | null
          ast_organism: string | null
          ast_results: Json | null
          clinical_significance: string | null
          confidence: number
          created_at: string
          gram_stain: string | null
          id: string
          lab_id: string | null
          medical_history: string | null
          morphology: string | null
          notes: string | null
          organism: string
          oxygen_requirement: string | null
          patient_address: string | null
          patient_age: number | null
          patient_contact: string | null
          patient_gender: string | null
          patient_name: string | null
          recommended_treatment: Json | null
          referring_physician: string | null
          resistance_profile: Json | null
          sample_id: string
          sample_source: string | null
          sample_type: string
          tests: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          arrangement?: string | null
          associated_diseases?: Json | null
          ast_organism?: string | null
          ast_results?: Json | null
          clinical_significance?: string | null
          confidence?: number
          created_at?: string
          gram_stain?: string | null
          id?: string
          lab_id?: string | null
          medical_history?: string | null
          morphology?: string | null
          notes?: string | null
          organism: string
          oxygen_requirement?: string | null
          patient_address?: string | null
          patient_age?: number | null
          patient_contact?: string | null
          patient_gender?: string | null
          patient_name?: string | null
          recommended_treatment?: Json | null
          referring_physician?: string | null
          resistance_profile?: Json | null
          sample_id: string
          sample_source?: string | null
          sample_type?: string
          tests?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          arrangement?: string | null
          associated_diseases?: Json | null
          ast_organism?: string | null
          ast_results?: Json | null
          clinical_significance?: string | null
          confidence?: number
          created_at?: string
          gram_stain?: string | null
          id?: string
          lab_id?: string | null
          medical_history?: string | null
          morphology?: string | null
          notes?: string | null
          organism?: string
          oxygen_requirement?: string | null
          patient_address?: string | null
          patient_age?: number | null
          patient_contact?: string | null
          patient_gender?: string | null
          patient_name?: string | null
          recommended_treatment?: Json | null
          referring_physician?: string | null
          resistance_profile?: Json | null
          sample_id?: string
          sample_source?: string | null
          sample_type?: string
          tests?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          activation_status: string
          created_at: string
          email: string
          id: string
          payment_date: string
          payment_reference: string | null
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          user_id: string
          verification_code: string | null
          verification_code_expires_at: string | null
          verification_code_used: boolean
        }
        Insert: {
          activation_status?: string
          created_at?: string
          email: string
          id?: string
          payment_date?: string
          payment_reference?: string | null
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          user_id: string
          verification_code?: string | null
          verification_code_expires_at?: string | null
          verification_code_used?: boolean
        }
        Update: {
          activation_status?: string
          created_at?: string
          email?: string
          id?: string
          payment_date?: string
          payment_reference?: string | null
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          user_id?: string
          verification_code?: string | null
          verification_code_expires_at?: string | null
          verification_code_used?: boolean
        }
        Relationships: []
      }
      phi_access_logs: {
        Row: {
          accessed_at: string
          action: string
          id: string
          ip_address: string | null
          record_id: string
          user_id: string
        }
        Insert: {
          accessed_at?: string
          action: string
          id?: string
          ip_address?: string | null
          record_id: string
          user_id: string
        }
        Update: {
          accessed_at?: string
          action?: string
          id?: string
          ip_address?: string | null
          record_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_history: {
        Row: {
          created_at: string
          grade: string
          id: string
          percentage: number
          quiz_type: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          created_at?: string
          grade: string
          id?: string
          percentage: number
          quiz_type?: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          created_at?: string
          grade?: string
          id?: string
          percentage?: number
          quiz_type?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expiry_date: string
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expiry_date?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_subscription: {
        Args: { _user_id: string }
        Returns: {
          expiry_date: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
        }[]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      subscription_plan: "free" | "standard" | "premium"
      subscription_status: "active" | "expired" | "pending"
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
    Enums: {
      subscription_plan: ["free", "standard", "premium"],
      subscription_status: ["active", "expired", "pending"],
    },
  },
} as const
