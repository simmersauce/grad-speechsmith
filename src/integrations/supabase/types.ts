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
      click_events: {
        Row: {
          additional_data: Json | null
          button_name: string
          created_at: string
          customer_email: string | null
          id: string
          session_id: string | null
        }
        Insert: {
          additional_data?: Json | null
          button_name: string
          created_at?: string
          customer_email?: string | null
          id?: string
          session_id?: string | null
        }
        Update: {
          additional_data?: Json | null
          button_name?: string
          created_at?: string
          customer_email?: string | null
          id?: string
          session_id?: string | null
        }
        Relationships: []
      }
      graduation_speeches: {
        Row: {
          acknowledgements: string | null
          additional_info: string | null
          created_at: string
          email: string
          goals_lessons: string | null
          graduation_class: string
          graduation_type: string
          graduation_type_other: string | null
          id: string
          institution: string
          memories: string | null
          name: string
          personal_background: string | null
          quote: string | null
          role: string
          themes: string | null
          tone: string
          wishes: string | null
        }
        Insert: {
          acknowledgements?: string | null
          additional_info?: string | null
          created_at?: string
          email: string
          goals_lessons?: string | null
          graduation_class: string
          graduation_type: string
          graduation_type_other?: string | null
          id?: string
          institution: string
          memories?: string | null
          name: string
          personal_background?: string | null
          quote?: string | null
          role: string
          themes?: string | null
          tone: string
          wishes?: string | null
        }
        Update: {
          acknowledgements?: string | null
          additional_info?: string | null
          created_at?: string
          email?: string
          goals_lessons?: string | null
          graduation_class?: string
          graduation_type?: string
          graduation_type_other?: string | null
          id?: string
          institution?: string
          memories?: string | null
          name?: string
          personal_background?: string | null
          quote?: string | null
          role?: string
          themes?: string | null
          tone?: string
          wishes?: string | null
        }
        Relationships: []
      }
      pending_form_data: {
        Row: {
          created_at: string | null
          customer_email: string
          form_data: Json
          id: string
          processed: boolean | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          form_data: Json
          id?: string
          processed?: boolean | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          form_data?: Json
          id?: string
          processed?: boolean | null
        }
        Relationships: []
      }
      speech_deliveries: {
        Row: {
          created_at: string
          customer_email: string
          file_name: string
          id: string
          pdf_data: string
          purchase_id: string
          tone: string
          version_type: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          file_name: string
          id?: string
          pdf_data: string
          purchase_id: string
          tone: string
          version_type: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          file_name?: string
          id?: string
          pdf_data?: string
          purchase_id?: string
          tone?: string
          version_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "speech_deliveries_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "speech_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      speech_purchases: {
        Row: {
          amount_paid: number
          created_at: string
          customer_email: string
          customer_reference: string
          emails_sent: boolean
          form_data: Json
          id: string
          payment_status: string
          speeches_generated: boolean
          stripe_session_id: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string
          customer_email: string
          customer_reference?: string
          emails_sent?: boolean
          form_data: Json
          id?: string
          payment_status: string
          speeches_generated?: boolean
          stripe_session_id?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          customer_email?: string
          customer_reference?: string
          emails_sent?: boolean
          form_data?: Json
          id?: string
          payment_status?: string
          speeches_generated?: boolean
          stripe_session_id?: string | null
        }
        Relationships: []
      }
      speech_versions: {
        Row: {
          content: string
          created_at: string
          id: string
          purchase_id: string
          tone: string
          version_number: number
          version_type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          purchase_id: string
          tone: string
          version_number: number
          version_type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          purchase_id?: string
          tone?: string
          version_number?: number
          version_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "speech_versions_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "speech_purchases"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
