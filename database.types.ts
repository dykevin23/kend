export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat_room_members: {
        Row: {
          chat_room_id: number
          created_at: string
          is_out: boolean
          profile_id: string
        }
        Insert: {
          chat_room_id: number
          created_at?: string
          is_out?: boolean
          profile_id: string
        }
        Update: {
          chat_room_id?: number
          created_at?: string
          is_out?: boolean
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_chat_room_id_chat_rooms_chat_room_id_fk"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["chat_room_id"]
          },
          {
            foreignKeyName: "chat_room_members_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "chat_room_members_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          chat_room_id: number
          created_at: string
          product_id: number | null
        }
        Insert: {
          chat_room_id?: never
          created_at?: string
          product_id?: number | null
        }
        Update: {
          chat_room_id?: never
          created_at?: string
          product_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "chat_rooms_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      child_growth: {
        Row: {
          child_id: number | null
          created_at: string
          growth_id: number
          head_circumference: number | null
          height: number | null
          recorded_at: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          child_id?: number | null
          created_at?: string
          growth_id?: never
          head_circumference?: number | null
          height?: number | null
          recorded_at: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          child_id?: number | null
          created_at?: string
          growth_id?: never
          head_circumference?: number | null
          height?: number | null
          recorded_at?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "child_growth_child_id_children_child_id_fk"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["child_id"]
          },
        ]
      }
      children: {
        Row: {
          birthday: string
          child_id: number
          created_at: string
          gender: Database["public"]["Enums"]["gender_type"]
          name: string | null
          nickname: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          birthday: string
          child_id?: never
          created_at?: string
          gender: Database["public"]["Enums"]["gender_type"]
          name?: string | null
          nickname: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          birthday?: string
          child_id?: never
          created_at?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          name?: string | null
          nickname?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_profiles_profile_id_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "children_parent_id_profiles_profile_id_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_id: string
          event_type: Database["public"]["Enums"]["event_type"] | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_id?: string
          event_type?: Database["public"]["Enums"]["event_type"] | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_id?: string
          event_type?: Database["public"]["Enums"]["event_type"] | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string | null
          following_id: string | null
        }
        Insert: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
        }
        Update: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_profiles_profile_id_fk"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "follows_follower_id_profiles_profile_id_fk"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "follows_following_id_profiles_profile_id_fk"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "follows_following_id_profiles_profile_id_fk"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_room_id: number | null
          content: string
          created_at: string
          message_id: number
          seen: boolean
          sender_id: string | null
        }
        Insert: {
          chat_room_id?: number | null
          content: string
          created_at?: string
          message_id?: never
          seen?: boolean
          sender_id?: string | null
        }
        Update: {
          chat_room_id?: number | null
          content?: string
          created_at?: string
          message_id?: never
          seen?: boolean
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_room_id_chat_rooms_chat_room_id_fk"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["chat_room_id"]
          },
          {
            foreignKeyName: "messages_sender_id_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "messages_sender_id_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      product_hashtags: {
        Row: {
          created_at: string
          hashtag: string
          hashtag_id: number
          product_id: number
        }
        Insert: {
          created_at?: string
          hashtag: string
          hashtag_id?: never
          product_id: number
        }
        Update: {
          created_at?: string
          hashtag?: string
          hashtag_id?: never
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_hashtags_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_hashtags_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          image: string
          image_id: number
          product_id: number
        }
        Insert: {
          created_at?: string
          image: string
          image_id?: never
          product_id: number
        }
        Update: {
          created_at?: string
          image?: string
          image_id?: never
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_images_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_view"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_likes: {
        Row: {
          product_id: number
          profile_id: string
        }
        Insert: {
          product_id: number
          profile_id: string
        }
        Update: {
          product_id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_likes_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_likes_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_likes_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "product_likes_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      product_views: {
        Row: {
          product_id: number
          profile_id: string
        }
        Insert: {
          product_id: number
          profile_id: string
        }
        Update: {
          product_id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_views_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_views_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "product_views_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          deal_location: string
          description: string
          name: string
          price: number
          product_id: number
          profile_id: string
          stats: Json
          status: Database["public"]["Enums"]["product_status_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deal_location: string
          description: string
          name: string
          price: number
          product_id?: never
          profile_id: string
          stats?: Json
          status?: Database["public"]["Enums"]["product_status_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deal_location?: string
          description?: string
          name?: string
          price?: number
          product_id?: never
          profile_id?: string
          stats?: Json
          status?: Database["public"]["Enums"]["product_status_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "products_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          comment: string | null
          created_at: string
          introduction: string | null
          nickname: string
          profile_id: string
          stats: Json | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar?: string | null
          comment?: string | null
          created_at?: string
          introduction?: string | null
          nickname: string
          profile_id: string
          stats?: Json | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar?: string | null
          comment?: string | null
          created_at?: string
          introduction?: string | null
          nickname?: string
          profile_id?: string
          stats?: Json | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      chats_view: {
        Row: {
          avatar: string | null
          chat_room_id: number | null
          created_at: string | null
          is_out: boolean | null
          last_message: string | null
          nickname: string | null
          not_seen_count: number | null
          other_profile_id: string | null
          owner_profile_id: string | null
          price: number | null
          product_id: number | null
          product_image: string | null
          product_name: string | null
          product_status:
            | Database["public"]["Enums"]["product_status_type"]
            | null
          profile_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_chat_room_id_chat_rooms_chat_room_id_fk"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["chat_room_id"]
          },
          {
            foreignKeyName: "chat_room_members_profile_id_profiles_profile_id_fk"
            columns: ["other_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "chat_room_members_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "chat_room_members_profile_id_profiles_profile_id_fk"
            columns: ["other_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "chat_room_members_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "chat_rooms_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "chat_rooms_product_id_products_product_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "products_profile_id_profiles_profile_id_fk"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "products_profile_id_profiles_profile_id_fk"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      messages_view: {
        Row: {
          avatar: string | null
          chat_room_id: number | null
          content: string | null
          created_at: string | null
          created_date: string | null
          created_time: string | null
          message_id: number | null
          nickname: string | null
          reverse: boolean | null
          sender_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_room_id_chat_rooms_chat_room_id_fk"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["chat_room_id"]
          },
          {
            foreignKeyName: "messages_sender_id_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "messages_sender_id_profiles_profile_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      products_view: {
        Row: {
          avatar: string | null
          chats: string | null
          deal_location: string | null
          description: string | null
          is_liked: boolean | null
          likes: string | null
          name: string | null
          nickname: string | null
          price: number | null
          product_id: number | null
          product_image: string | null
          profile_id: string | null
          status: Database["public"]["Enums"]["product_status_type"] | null
          updated_at: string | null
          username: string | null
          views: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "products_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_view"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles_view: {
        Row: {
          avatar: string | null
          comment: string | null
          followers: string | null
          following: string | null
          introduction: string | null
          is_following: boolean | null
          nickname: string | null
          profile_id: string | null
          sales_product_count: number | null
          username: string | null
        }
        Insert: {
          avatar?: string | null
          comment?: string | null
          followers?: never
          following?: never
          introduction?: string | null
          is_following?: never
          nickname?: string | null
          profile_id?: string | null
          sales_product_count?: never
          username?: string | null
        }
        Update: {
          avatar?: string | null
          comment?: string | null
          followers?: never
          following?: never
          introduction?: string | null
          is_following?: never
          nickname?: string | null
          profile_id?: string | null
          sales_product_count?: never
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      track_event: {
        Args: {
          event_type: Database["public"]["Enums"]["event_type"]
          event_data: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      event_type: "product_view"
      gender_type: "male" | "female"
      product_status_type: "sales" | "done"
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
      event_type: ["product_view"],
      gender_type: ["male", "female"],
      product_status_type: ["sales", "done"],
    },
  },
} as const
