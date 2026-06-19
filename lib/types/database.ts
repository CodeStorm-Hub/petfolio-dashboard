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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          clinic_id: string | null
          created_at: string
          id: string
          location: string | null
          media_url: string | null
          notes: string | null
          owner_id: string
          pet_id: string
          reason: string | null
          scheduled_at: string
          service_id: string | null
          status: string
          title: string
          updated_at: string
          urgency: string | null
          vet_name: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          media_url?: string | null
          notes?: string | null
          owner_id: string
          pet_id: string
          reason?: string | null
          scheduled_at: string
          service_id?: string | null
          status?: string
          title: string
          updated_at?: string
          urgency?: string | null
          vet_name?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          media_url?: string | null
          notes?: string | null
          owner_id?: string
          pet_id?: string
          reason?: string | null
          scheduled_at?: string
          service_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          urgency?: string | null
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vet_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "vet_services"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          metadata: Json
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          metadata?: Json
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      care_logs: {
        Row: {
          care_type: string
          created_at: string
          duration_minutes: number | null
          id: string
          logged_by: string
          logged_date: string | null
          notes: string | null
          occurred_at: string
          pet_id: string
          task_id: string | null
        }
        Insert: {
          care_type: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          logged_by: string
          logged_date?: string | null
          notes?: string | null
          occurred_at?: string
          pet_id: string
          task_id?: string | null
        }
        Update: {
          care_type?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          logged_by?: string
          logged_date?: string | null
          notes?: string | null
          occurred_at?: string
          pet_id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_logs_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "care_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      care_streaks: {
        Row: {
          best_streak: number
          current_streak: number
          freezes_available: number
          last_completion_date: string | null
          pet_id: string
        }
        Insert: {
          best_streak?: number
          current_streak?: number
          freezes_available?: number
          last_completion_date?: string | null
          pet_id: string
        }
        Update: {
          best_streak?: number
          current_streak?: number
          freezes_available?: number
          last_completion_date?: string | null
          pet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_streaks_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: true
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      care_tasks: {
        Row: {
          anchor_date: string | null
          completed_at: string | null
          created_at: string
          frequency: string
          gamification_points: number
          id: string
          is_ai_suggested: boolean
          is_completed: boolean
          notes: string | null
          pet_id: string
          scheduled_time: string | null
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          anchor_date?: string | null
          completed_at?: string | null
          created_at?: string
          frequency: string
          gamification_points?: number
          id?: string
          is_ai_suggested?: boolean
          is_completed?: boolean
          notes?: string | null
          pet_id: string
          scheduled_time?: string | null
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          anchor_date?: string | null
          completed_at?: string | null
          created_at?: string
          frequency?: string
          gamification_points?: number
          id?: string
          is_ai_suggested?: boolean
          is_completed?: boolean
          notes?: string | null
          pet_id?: string
          scheduled_time?: string | null
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_tasks_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      care_web_reminders: {
        Row: {
          created_at: string
          fcm_sent_at: string | null
          id: string
          remind_at: string
          repeating: boolean
          task_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fcm_sent_at?: string | null
          id?: string
          remind_at: string
          repeating?: boolean
          task_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fcm_sent_at?: string | null
          id?: string
          remind_at?: string
          repeating?: boolean
          task_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          dm_pet_a_id: string | null
          dm_pet_b_id: string | null
          id: string
          last_message_at: string | null
          last_message_content: string | null
          match_request_id: string | null
          mutual_match_id: string | null
          participant_1_id: string
          participant_2_id: string
        }
        Insert: {
          created_at?: string
          dm_pet_a_id?: string | null
          dm_pet_b_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_content?: string | null
          match_request_id?: string | null
          mutual_match_id?: string | null
          participant_1_id: string
          participant_2_id: string
        }
        Update: {
          created_at?: string
          dm_pet_a_id?: string | null
          dm_pet_b_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_content?: string | null
          match_request_id?: string | null
          mutual_match_id?: string | null
          participant_1_id?: string
          participant_2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_dm_pet_a_id_fkey"
            columns: ["dm_pet_a_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_dm_pet_b_id_fkey"
            columns: ["dm_pet_b_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_mutual_match_id_fkey"
            columns: ["mutual_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          pet_id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          pet_id: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          like_count: number
          parent_id: string | null
          pet_id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          like_count?: number
          parent_id?: string | null
          pet_id: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          like_count?: number
          parent_id?: string | null
          pet_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          member_count: number
          name: string
          post_count: number
          species_filter: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          member_count?: number
          name: string
          post_count?: number
          species_filter?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          member_count?: number
          name?: string
          post_count?: number
          species_filter?: string | null
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          joined_at: string
          pet_id: string
        }
        Insert: {
          community_id: string
          joined_at?: string
          pet_id: string
        }
        Update: {
          community_id?: string
          joined_at?: string
          pet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_likes: {
        Row: {
          pet_id: string
          post_id: string
        }
        Insert: {
          pet_id: string
          post_id: string
        }
        Update: {
          pet_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_likes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_pet_id: string
          community_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          like_count: number
        }
        Insert: {
          author_pet_id: string
          community_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          like_count?: number
        }
        Update: {
          author_pet_id?: string
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          like_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_pet_id_fkey"
            columns: ["author_pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          id: string
          order_id: string
          raised_by: string
          reason: string
          resolution: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          raised_by: string
          reason: string
          resolution?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          raised_by?: string
          reason?: string
          resolution?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      fcm_push_outbox: {
        Row: {
          body: string
          created_at: string
          data: Json
          failed_at: string | null
          id: string
          last_error: string | null
          processed_at: string | null
          retry_count: number
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json
          failed_at?: string | null
          id?: string
          last_error?: string | null
          processed_at?: string | null
          retry_count?: number
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json
          failed_at?: string | null
          id?: string
          last_error?: string | null
          processed_at?: string | null
          retry_count?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      hashtags: {
        Row: {
          created_at: string
          post_count: number
          tag: string
        }
        Insert: {
          created_at?: string
          post_count?: number
          tag: string
        }
        Update: {
          created_at?: string
          post_count?: number
          tag?: string
        }
        Relationships: []
      }
      health_logs: {
        Row: {
          created_at: string
          description: string | null
          diagnosis: string | null
          follow_up_date: string | null
          id: string
          log_type: string
          occurred_at: string
          pet_id: string
          recorded_by: string
          severity: string | null
          title: string
          treatment: string | null
          updated_at: string
          vet_clinic: string | null
          vet_name: string | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          diagnosis?: string | null
          follow_up_date?: string | null
          id?: string
          log_type: string
          occurred_at?: string
          pet_id: string
          recorded_by: string
          severity?: string | null
          title: string
          treatment?: string | null
          updated_at?: string
          vet_clinic?: string | null
          vet_name?: string | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          diagnosis?: string | null
          follow_up_date?: string | null
          id?: string
          log_type?: string
          occurred_at?: string
          pet_id?: string
          recorded_by?: string
          severity?: string | null
          title?: string
          treatment?: string | null
          updated_at?: string
          vet_clinic?: string | null
          vet_name?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      health_vitals: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          pet_id: string
          recorded_at: string
          recorded_by: string
          unit: string
          value: number
          vital_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id: string
          recorded_at?: string
          recorded_by: string
          unit: string
          value: number
          vital_type: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id?: string
          recorded_at?: string
          recorded_by?: string
          unit?: string
          value?: number
          vital_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_vitals_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_vitals_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reservations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          status: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          status?: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          status?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          amount_cents: number
          buyer_id: string
          buyer_notes: string | null
          cancelled_at: string | null
          cancelled_reason: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          line_items: Json
          payment_method: Database["public"]["Enums"]["payment_method_enum"]
          payment_status: Database["public"]["Enums"]["payment_status_enum"]
          refund_status: string
          seller_id: string | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_carrier: string | null
          shipping_tracking_number: string | null
          shipping_tracking_url: string | null
          shop_id: string
          sslcommerz_transaction_id: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          buyer_id: string
          buyer_notes?: string | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          line_items?: Json
          payment_method?: Database["public"]["Enums"]["payment_method_enum"]
          payment_status?: Database["public"]["Enums"]["payment_status_enum"]
          refund_status?: string
          seller_id?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_carrier?: string | null
          shipping_tracking_number?: string | null
          shipping_tracking_url?: string | null
          shop_id: string
          sslcommerz_transaction_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          buyer_id?: string
          buyer_notes?: string | null
          cancelled_at?: string | null
          cancelled_reason?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          line_items?: Json
          payment_method?: Database["public"]["Enums"]["payment_method_enum"]
          payment_status?: Database["public"]["Enums"]["payment_status_enum"]
          refund_status?: string
          seller_id?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_carrier?: string | null
          shipping_tracking_number?: string | null
          shipping_tracking_url?: string | null
          shop_id?: string
          sslcommerz_transaction_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      match_profiles: {
        Row: {
          availability: string | null
          created_at: string
          energy_level: string | null
          id: string
          is_active: boolean
          mode: string
          pet_id: string
          play_style: string | null
          preferred_size: string | null
          updated_at: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          energy_level?: string | null
          id?: string
          is_active?: boolean
          mode: string
          pet_id: string
          play_style?: string | null
          preferred_size?: string | null
          updated_at?: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          energy_level?: string | null
          id?: string
          is_active?: boolean
          mode?: string
          pet_id?: string
          play_style?: string | null
          preferred_size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_profiles_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          mode: string
          pet_a_id: string
          pet_b_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string
          pet_a_id: string
          pet_b_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string
          pet_a_id?: string
          pet_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_pet_a_id_fkey"
            columns: ["pet_a_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_pet_b_id_fkey"
            columns: ["pet_b_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_vault: {
        Row: {
          administered_at: string | null
          administered_by: string | null
          batch_number: string | null
          created_at: string
          description: string | null
          document_url: string | null
          dosage: string | null
          expires_at: string | null
          frequency: string | null
          id: string
          is_active: boolean
          name: string
          next_due_at: string | null
          notes: string | null
          pet_id: string
          record_type: string
          reminder_enabled: boolean
          updated_at: string
        }
        Insert: {
          administered_at?: string | null
          administered_by?: string | null
          batch_number?: string | null
          created_at?: string
          description?: string | null
          document_url?: string | null
          dosage?: string | null
          expires_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean
          name: string
          next_due_at?: string | null
          notes?: string | null
          pet_id: string
          record_type: string
          reminder_enabled?: boolean
          updated_at?: string
        }
        Update: {
          administered_at?: string | null
          administered_by?: string | null
          batch_number?: string | null
          created_at?: string
          description?: string | null
          document_url?: string | null
          dosage?: string | null
          expires_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean
          name?: string
          next_due_at?: string | null
          notes?: string | null
          pet_id?: string
          record_type?: string
          reminder_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_vault_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          created_at: string
          given_at: string
          given_by: string | null
          id: string
          medical_record_id: string
          notes: string | null
          pet_id: string
        }
        Insert: {
          created_at?: string
          given_at?: string
          given_by?: string | null
          id?: string
          medical_record_id: string
          notes?: string | null
          pet_id: string
        }
        Update: {
          created_at?: string
          given_at?: string
          given_by?: string | null
          id?: string
          medical_record_id?: string
          notes?: string | null
          pet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_given_by_fkey"
            columns: ["given_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_vault"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_pet_id: string | null
          created_at: string
          id: string
          is_read: boolean
          metadata: Json
          post_id: string | null
          recipient_pet_id: string | null
          recipient_user_id: string | null
          type: string
        }
        Insert: {
          actor_pet_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json
          post_id?: string | null
          recipient_pet_id?: string | null
          recipient_user_id?: string | null
          type: string
        }
        Update: {
          actor_pet_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json
          post_id?: string | null
          recipient_pet_id?: string | null
          recipient_user_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_pet_id_fkey"
            columns: ["actor_pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_pet_id_fkey"
            columns: ["recipient_pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          account_details: Json
          amount_cents: number
          id: string
          method: string
          notes: string | null
          requested_at: string
          resolved_at: string | null
          resolved_by: string | null
          shop_id: string
          status: string
        }
        Insert: {
          account_details?: Json
          amount_cents: number
          id?: string
          method: string
          notes?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          shop_id: string
          status?: string
        }
        Update: {
          account_details?: Json
          amount_cents?: number
          id?: string
          method?: string
          notes?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          shop_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_badges: {
        Row: {
          badge_type: string
          pet_id: string
          unlocked_at: string
        }
        Insert: {
          badge_type: string
          pet_id: string
          unlocked_at?: string
        }
        Update: {
          badge_type?: string
          pet_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_badges_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_care_gamification: {
        Row: {
          created_at: string
          daily_point_award_accrued: number
          daily_point_award_date: string | null
          pet_id: string
          total_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_point_award_accrued?: number
          daily_point_award_date?: string | null
          pet_id: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_point_award_accrued?: number
          daily_point_award_date?: string | null
          pet_id?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_care_gamification_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: true
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_follows: {
        Row: {
          created_at: string | null
          follower_pet_id: string
          following_pet_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_pet_id: string
          following_pet_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_pet_id?: string
          following_pet_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_follows_follower_pet_id_fkey"
            columns: ["follower_pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_follows_following_pet_id_fkey"
            columns: ["following_pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_health_certs: {
        Row: {
          cert_type: string
          created_at: string
          expires_at: string | null
          file_path: string
          id: string
          pet_id: string
          verified: boolean
          verified_by: string | null
        }
        Insert: {
          cert_type: string
          created_at?: string
          expires_at?: string | null
          file_path: string
          id?: string
          pet_id: string
          verified?: boolean
          verified_by?: string | null
        }
        Update: {
          cert_type?: string
          created_at?: string
          expires_at?: string | null
          file_path?: string
          id?: string
          pet_id?: string
          verified?: boolean
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_health_certs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_health_certs_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_pedigree: {
        Row: {
          created_at: string
          dam_ref: string | null
          id: string
          pet_id: string
          registry_id: string | null
          registry_name: string | null
          sire_ref: string | null
          titles: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dam_ref?: string | null
          id?: string
          pet_id: string
          registry_id?: string | null
          registry_name?: string | null
          sire_ref?: string | null
          titles?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dam_ref?: string | null
          id?: string
          pet_id?: string
          registry_id?: string | null
          registry_name?: string | null
          sire_ref?: string | null
          titles?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_pedigree_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: true
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_weight_logs: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          pet_id: string
          recorded_at: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id: string
          recorded_at?: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          pet_id?: string
          recorded_at?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "pet_weight_logs_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          accent_color: string | null
          activity_level: string | null
          archived_at: string | null
          avatar_url: string | null
          bio: string | null
          breed: string | null
          created_at: string
          date_of_birth: string | null
          display_order: number
          gender: string | null
          handle: string | null
          id: string
          is_discoverable: boolean
          is_public: boolean
          location: unknown
          name: string
          owner_id: string
          species: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          accent_color?: string | null
          activity_level?: string | null
          archived_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          breed?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_order?: number
          gender?: string | null
          handle?: string | null
          id?: string
          is_discoverable?: boolean
          is_public?: boolean
          location?: unknown
          name: string
          owner_id: string
          species: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          accent_color?: string | null
          activity_level?: string | null
          archived_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          breed?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_order?: number
          gender?: string | null
          handle?: string | null
          id?: string
          is_discoverable?: boolean
          is_public?: boolean
          location?: unknown
          name?: string
          owner_id?: string
          species?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      playdates: {
        Row: {
          created_at: string
          geog: unknown
          id: string
          location_name: string | null
          match_id: string
          proposed_by_pet_id: string
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          geog?: unknown
          id?: string
          location_name?: string | null
          match_id: string
          proposed_by_pet_id: string
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          geog?: unknown
          id?: string
          location_name?: string | null
          match_id?: string
          proposed_by_pet_id?: string
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playdates_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playdates_proposed_by_pet_id_fkey"
            columns: ["proposed_by_pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      post_hashtags: {
        Row: {
          created_at: string
          post_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          post_id: string
          tag: string
        }
        Update: {
          created_at?: string
          post_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_hashtags_tag_fkey"
            columns: ["tag"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["tag"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          pet_id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pet_id: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pet_id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          comment_count: number
          content: string
          created_at: string
          id: string
          image_urls: string[]
          is_hidden: boolean
          like_count: number
          pet_id: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id: string
          comment_count?: number
          content: string
          created_at?: string
          id?: string
          image_urls?: string[]
          is_hidden?: boolean
          like_count?: number
          pet_id?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          comment_count?: number
          content?: string
          created_at?: string
          id?: string
          image_urls?: string[]
          is_hidden?: boolean
          like_count?: number
          pet_id?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          file_path: string
          id: string
          order_id: string
          review_note: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          vet_name: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          order_id: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          vet_name?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          order_id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json
          created_at: string
          id: string
          is_active: boolean
          price_cents: number
          product_id: string
          sku: string | null
          stock: number
        }
        Insert: {
          attributes?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          price_cents: number
          product_id: string
          sku?: string | null
          stock?: number
        }
        Update: {
          attributes?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          price_cents?: number
          product_id?: string
          sku?: string | null
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          brand: string
          category: string
          created_at: string
          currency: string
          description: string | null
          glyph: string
          gradient_end: string
          gradient_start: string
          id: string
          image_urls: string[]
          inventory_count: number
          is_rx: boolean
          name: string
          price_cents: number
          rating: number | null
          review_count: number
          shop_id: string
          sku: string | null
          sub_price_cents: number | null
          subscribable: boolean
          tags: string[]
          variant: string
          weight_grams: number | null
        }
        Insert: {
          active?: boolean
          brand: string
          category: string
          created_at?: string
          currency?: string
          description?: string | null
          glyph?: string
          gradient_end?: string
          gradient_start?: string
          id?: string
          image_urls?: string[]
          inventory_count: number
          is_rx?: boolean
          name: string
          price_cents: number
          rating?: number | null
          review_count?: number
          shop_id: string
          sku?: string | null
          sub_price_cents?: number | null
          subscribable?: boolean
          tags?: string[]
          variant?: string
          weight_grams?: number | null
        }
        Update: {
          active?: boolean
          brand?: string
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          glyph?: string
          gradient_end?: string
          gradient_start?: string
          id?: string
          image_urls?: string[]
          inventory_count?: number
          is_rx?: boolean
          name?: string
          price_cents?: number
          rating?: number | null
          review_count?: number
          shop_id?: string
          sku?: string | null
          sub_price_cents?: number | null
          subscribable?: boolean
          tags?: string[]
          variant?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      promos: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_discount_cents: number | null
          max_usage: number | null
          min_order_cents: number
          shop_id: string | null
          usage_count: number
          valid_until: string | null
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_discount_cents?: number | null
          max_usage?: number | null
          min_order_cents?: number
          shop_id?: string | null
          usage_count?: number
          valid_until?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_discount_cents?: number | null
          max_usage?: number | null
          min_order_cents?: number
          shop_id?: string | null
          usage_count?: number
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promos_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      reported_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reported_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          courier: string | null
          created_at: string
          delivery_notes: string | null
          estimated_delivery_at: string | null
          id: string
          order_id: string
          shipped_at: string | null
          status: string
          tracking_id: string | null
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          courier?: string | null
          created_at?: string
          delivery_notes?: string | null
          estimated_delivery_at?: string | null
          id?: string
          order_id: string
          shipped_at?: string | null
          status?: string
          tracking_id?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          courier?: string | null
          created_at?: string
          delivery_notes?: string | null
          estimated_delivery_at?: string | null
          id?: string
          order_id?: string
          shipped_at?: string | null
          status?: string
          tracking_id?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_deletion_requests: {
        Row: {
          id: string
          owner_id: string
          reason: string | null
          rejection_note: string | null
          requested_at: string
          resolved_at: string | null
          resolved_by: string | null
          shop_id: string
          status: string
        }
        Insert: {
          id?: string
          owner_id: string
          reason?: string | null
          rejection_note?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          shop_id: string
          status?: string
        }
        Update: {
          id?: string
          owner_id?: string
          reason?: string | null
          rejection_note?: string | null
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
          shop_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_deletion_requests_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address_city: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          announcement_banner: string | null
          banner_url: string | null
          business_email: string | null
          business_phone: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          is_active: boolean
          is_verified: boolean
          kyc_status: Database["public"]["Enums"]["kyc_status_enum"]
          logo_url: string | null
          national_id_url: string | null
          owner_id: string
          payout_method: Database["public"]["Enums"]["payout_method_enum"]
          platform_fee_percent: number
          rejection_reason: string | null
          return_policy: string | null
          shipping_policy: string | null
          shop_name: string
          slug: string
          social_links: Json | null
          stripe_bank_account_token: string | null
          stripe_connect_account_id: string | null
          stripe_onboarding_complete: boolean
          tags: string[]
          trade_license_url: string | null
          updated_at: string
        }
        Insert: {
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          announcement_banner?: string | null
          banner_url?: string | null
          business_email?: string | null
          business_phone?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          is_active?: boolean
          is_verified?: boolean
          kyc_status?: Database["public"]["Enums"]["kyc_status_enum"]
          logo_url?: string | null
          national_id_url?: string | null
          owner_id: string
          payout_method?: Database["public"]["Enums"]["payout_method_enum"]
          platform_fee_percent?: number
          rejection_reason?: string | null
          return_policy?: string | null
          shipping_policy?: string | null
          shop_name: string
          slug: string
          social_links?: Json | null
          stripe_bank_account_token?: string | null
          stripe_connect_account_id?: string | null
          stripe_onboarding_complete?: boolean
          tags?: string[]
          trade_license_url?: string | null
          updated_at?: string
        }
        Update: {
          address_city?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          announcement_banner?: string | null
          banner_url?: string | null
          business_email?: string | null
          business_phone?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          is_active?: boolean
          is_verified?: boolean
          kyc_status?: Database["public"]["Enums"]["kyc_status_enum"]
          logo_url?: string | null
          national_id_url?: string | null
          owner_id?: string
          payout_method?: Database["public"]["Enums"]["payout_method_enum"]
          platform_fee_percent?: number
          rejection_reason?: string | null
          return_policy?: string | null
          shipping_policy?: string | null
          shop_name?: string
          slug?: string
          social_links?: Json | null
          stripe_bank_account_token?: string | null
          stripe_connect_account_id?: string | null
          stripe_onboarding_complete?: boolean
          tags?: string[]
          trade_license_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          image_url: string
          pet_id: string
          viewed_by_users: string[]
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          image_url: string
          pet_id: string
          viewed_by_users?: string[]
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string
          pet_id?: string
          viewed_by_users?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "stories_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      story_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          mode: string
          target_id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          mode?: string
          target_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          mode?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          area: string
          city: string
          created_at: string
          full_address: string
          id: string
          is_default: boolean
          label: string
          user_id: string
          zone: string
        }
        Insert: {
          area?: string
          city?: string
          created_at?: string
          full_address?: string
          id?: string
          is_default?: boolean
          label?: string
          user_id: string
          zone?: string
        }
        Update: {
          area?: string
          city?: string
          created_at?: string
          full_address?: string
          id?: string
          is_default?: boolean
          label?: string
          user_id?: string
          zone?: string
        }
        Relationships: []
      }
      user_fcm_devices: {
        Row: {
          fcm_token: string
          id: string
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          fcm_token: string
          id?: string
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          fcm_token?: string
          id?: string
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_web_push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          location: string | null
          public_key: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id: string
          location?: string | null
          public_key?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          location?: string | null
          public_key?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      vendor_announcements: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          is_pinned: boolean
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean
          title?: string
        }
        Relationships: []
      }
      vendor_ledgers: {
        Row: {
          created_at: string
          id: string
          order_id: string
          order_total_cents: number
          paid_at: string | null
          payout_request_id: string | null
          platform_fee_cents: number
          shop_id: string
          status: Database["public"]["Enums"]["ledger_status_enum"]
          updated_at: string
          vendor_earnings_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          order_total_cents: number
          paid_at?: string | null
          payout_request_id?: string | null
          platform_fee_cents: number
          shop_id: string
          status?: Database["public"]["Enums"]["ledger_status_enum"]
          updated_at?: string
          vendor_earnings_cents: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          order_total_cents?: number
          paid_at?: string | null
          payout_request_id?: string | null
          platform_fee_cents?: number
          shop_id?: string
          status?: Database["public"]["Enums"]["ledger_status_enum"]
          updated_at?: string
          vendor_earnings_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_ledgers_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_ledgers_payout_request_id_fkey"
            columns: ["payout_request_id"]
            isOneToOne: false
            referencedRelation: "payout_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_ledgers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      verifications: {
        Row: {
          created_at: string
          id: string
          reviewed_at: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vet_clinics: {
        Row: {
          address: string
          avatar_url: string | null
          city: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          rating: number
          review_count: number
          tagline: string | null
          website: string | null
        }
        Insert: {
          address: string
          avatar_url?: string | null
          city: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          rating?: number
          review_count?: number
          tagline?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          avatar_url?: string | null
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          rating?: number
          review_count?: number
          tagline?: string | null
          website?: string | null
        }
        Relationships: []
      }
      vet_services: {
        Row: {
          clinic_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          name: string
          price_cents: number
        }
        Insert: {
          clinic_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name: string
          price_cents?: number
        }
        Update: {
          clinic_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "vet_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vet_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          pet_count: string | null
          pet_kind: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          pet_count?: string | null
          pet_kind?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          pet_count?: string | null
          pet_kind?: string | null
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          added_at: string
          id: string
          product_id: string
          variant_id: string | null
          wishlist_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          product_id: string
          variant_id?: string | null
          wishlist_id: string
        }
        Update: {
          added_at?: string
          id?: string
          product_id?: string
          variant_id?: string | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_vendor_kyc: {
        Args: { p_admin_id: string; p_shop_id: string }
        Returns: undefined
      }
      cancel_order: { Args: { p_order_id: string }; Returns: undefined }
      check_daily_completion: {
        Args: { completion_date?: string; target_pet_id: string }
        Returns: Json
      }
      cleanup_expired_stories: { Args: never; Returns: undefined }
      confirm_order_inventory: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      ensure_chat_thread_for_match: {
        Args: { p_actor_pet_id: string; p_match_id: string }
        Returns: string
      }
      ensure_direct_chat_thread: {
        Args: { p_actor_pet_id: string; p_other_pet_id: string }
        Returns: string
      }
      get_care_dashboard_snapshot:
        | {
            Args: {
              p_pet_id: string
              p_selected_date: string
              p_week_end: string
              p_week_start: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_client_today?: string
              p_pet_id: string
              p_selected_date: string
              p_week_end: string
              p_week_start: string
            }
            Returns: Json
          }
      get_chat_inbox: {
        Args: { p_actor_pet_id: string }
        Returns: {
          last_message_at: string
          last_message_preview: string
          match_id: string
          matched_at: string
          other_pet_avatar_url: string
          other_pet_breed: string
          other_pet_id: string
          other_pet_name: string
          thread_id: string
          thread_type: string
        }[]
      }
      get_match_inbox: {
        Args: { p_actor_pet_id: string }
        Returns: {
          last_message_at: string
          last_message_preview: string
          match_id: string
          matched_at: string
          other_pet_avatar_url: string
          other_pet_breed: string
          other_pet_id: string
          other_pet_name: string
          thread_id: string
        }[]
      }
      get_or_create_social_thread: {
        Args: { p_other_user_id: string }
        Returns: string
      }
      get_or_create_wishlist: { Args: never; Returns: string }
      get_pet_awards_summary: { Args: { p_pet_id: string }; Returns: Json }
      get_pet_stats: {
        Args: { p_pet_id: string }
        Returns: {
          follower_count: number
          following_count: number
          post_count: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_vendor: { Args: never; Returns: boolean }
      mark_story_viewed: { Args: { p_story_id: string }; Returns: undefined }
      matching_discovery_candidates: {
        Args: {
          p_actor_pet_id: string
          p_cursor_created_at?: string
          p_cursor_pet_id?: string
          p_limit?: number
          p_max_age_years?: number
          p_min_age_years?: number
          p_mode?: string
          p_radius_meters?: number
          p_species?: string[]
        }
        Returns: {
          avatar_url: string
          bio: string
          breed: string
          created_at: string
          date_of_birth: string
          distance_meters: number
          gender: string
          id: string
          is_discoverable: boolean
          name: string
          owner: Json
          owner_id: string
          species: string
        }[]
      }
      process_checkout: {
        Args: { p_buyer_id: string; p_cart_items: Json; p_shop_id: string }
        Returns: string
      }
      reject_vendor_kyc: {
        Args: { p_admin_id: string; p_reason: string; p_shop_id: string }
        Returns: undefined
      }
      release_order_inventory: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      request_shop_deletion: {
        Args: { p_reason?: string; p_shop_id: string }
        Returns: undefined
      }
      resolve_reported_post: {
        Args: { p_action: string; p_hide_post?: boolean; p_report_id: string }
        Returns: undefined
      }
      resolve_shop_deletion: {
        Args: {
          p_action: string
          p_rejection_note?: string
          p_request_id: string
        }
        Returns: undefined
      }
      set_pet_location_point: {
        Args: { p_latitude: number; p_longitude: number; p_pet_id: string }
        Returns: undefined
      }
      toggle_care_task: {
        Args: {
          p_care_type: string
          p_day: string
          p_is_completed: boolean
          p_occurred_at: string
          p_pet_id: string
          p_task_id: string
        }
        Returns: Json
      }
      vendor_update_order: {
        Args: {
          p_carrier?: string
          p_order_id: string
          p_status: string
          p_tracking_number?: string
          p_tracking_url?: string
        }
        Returns: undefined
      }
      vendor_upsert_shipment: {
        Args: {
          p_courier?: string
          p_estimated_delivery_at?: string
          p_order_id: string
          p_status?: string
          p_tracking_id?: string
          p_tracking_url?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      kyc_status_enum: "pending" | "submitted" | "approved" | "rejected"
      ledger_status_enum: "pending_clearance" | "available" | "paid"
      payment_method_enum: "stripe" | "cod" | "bkash" | "nagad" | "sslcommerz"
      payment_status_enum: "pending" | "paid" | "collected"
      payout_method_enum: "stripe" | "manual"
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
      kyc_status_enum: ["pending", "submitted", "approved", "rejected"],
      ledger_status_enum: ["pending_clearance", "available", "paid"],
      payment_method_enum: ["stripe", "cod", "bkash", "nagad", "sslcommerz"],
      payment_status_enum: ["pending", "paid", "collected"],
      payout_method_enum: ["stripe", "manual"],
    },
  },
} as const
