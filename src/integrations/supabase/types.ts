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
      cargo_vehicle_compatibility: {
        Row: {
          cargo_type: string
          compatibility_note: string | null
          id: string
          is_compatible: boolean
          vehicle_type: string
        }
        Insert: {
          cargo_type: string
          compatibility_note?: string | null
          id?: string
          is_compatible?: boolean
          vehicle_type: string
        }
        Update: {
          cargo_type?: string
          compatibility_note?: string | null
          id?: string
          is_compatible?: boolean
          vehicle_type?: string
        }
        Relationships: []
      }
      carrier_insurance: {
        Row: {
          carrier_id: string
          coverage_limit_eur: number
          coverage_type: string
          created_at: string
          document_url: string | null
          expiration_date: string
          id: string
          policy_number: string | null
          provider_name: string
          status: string
          updated_at: string
        }
        Insert: {
          carrier_id: string
          coverage_limit_eur?: number
          coverage_type?: string
          created_at?: string
          document_url?: string | null
          expiration_date: string
          id?: string
          policy_number?: string | null
          provider_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          carrier_id?: string
          coverage_limit_eur?: number
          coverage_type?: string
          created_at?: string
          document_url?: string | null
          expiration_date?: string
          id?: string
          policy_number?: string | null
          provider_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      carrier_verifications: {
        Row: {
          carrier_id: string
          document_type: string
          document_url: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          submitted_at: string | null
        }
        Insert: {
          carrier_id: string
          document_type: string
          document_url: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
        }
        Update: {
          carrier_id?: string
          document_type?: string
          document_url?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          alt_names: string
          ascii_name: string
          country: string
          created_at: string
          geoname_id: number
          id: string
          lat: number
          lng: number
          name: string
          population: number
        }
        Insert: {
          alt_names: string
          ascii_name: string
          country: string
          created_at?: string
          geoname_id: number
          id?: string
          lat: number
          lng: number
          name: string
          population: number
        }
        Update: {
          alt_names?: string
          ascii_name?: string
          country?: string
          created_at?: string
          geoname_id?: number
          id?: string
          lat?: number
          lng?: number
          name?: string
          population?: number
        }
        Relationships: []
      }
      detailed_ratings: {
        Row: {
          accuracy_score: number
          comment: string | null
          communication_score: number
          created_at: string
          id: string
          overall_score: number | null
          rated_id: string
          rater_id: string
          rater_role: string
          reliability_score: number
          shipment_id: string
          timeliness_score: number
        }
        Insert: {
          accuracy_score: number
          comment?: string | null
          communication_score: number
          created_at?: string
          id?: string
          overall_score?: number | null
          rated_id: string
          rater_id: string
          rater_role: string
          reliability_score: number
          shipment_id: string
          timeliness_score: number
        }
        Update: {
          accuracy_score?: number
          comment?: string | null
          communication_score?: number
          created_at?: string
          id?: string
          overall_score?: number | null
          rated_id?: string
          rater_id?: string
          rater_role?: string
          reliability_score?: number
          shipment_id?: string
          timeliness_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "detailed_ratings_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      deviation_requests: {
        Row: {
          carrier_id: string
          carrier_response: string | null
          counter_offer_conditions: string | null
          counter_offer_price: number | null
          created_at: string
          deviation_description: string
          id: string
          notes: string | null
          pallets_required: number
          pickup_address: string
          preferred_time_from: string
          preferred_time_to: string
          route_id: string
          shipper_id: string
          status: string
          updated_at: string
        }
        Insert: {
          carrier_id: string
          carrier_response?: string | null
          counter_offer_conditions?: string | null
          counter_offer_price?: number | null
          created_at?: string
          deviation_description: string
          id?: string
          notes?: string | null
          pallets_required: number
          pickup_address: string
          preferred_time_from: string
          preferred_time_to: string
          route_id: string
          shipper_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          carrier_id?: string
          carrier_response?: string | null
          counter_offer_conditions?: string | null
          counter_offer_price?: number | null
          created_at?: string
          deviation_description?: string
          id?: string
          notes?: string | null
          pallets_required?: number
          pickup_address?: string
          preferred_time_from?: string
          preferred_time_to?: string
          route_id?: string
          shipper_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deviation_requests_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      early_access_requests: {
        Row: {
          challenge: string | null
          company_name: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          challenge?: string | null
          company_name: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          role: string
          status?: string
          updated_at?: string
        }
        Update: {
          challenge?: string | null
          company_name?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      loads: {
        Row: {
          cargo_notes: string | null
          cargo_type: Database["public"]["Enums"]["cargo_type"]
          created_at: string
          delivery_date_from: string
          delivery_date_to: string
          destination_city: string
          destination_country: string
          destination_lat: number | null
          destination_lng: number | null
          height_cm: number | null
          id: string
          length_cm: number | null
          notes: string | null
          origin_city: string
          origin_country: string
          origin_lat: number | null
          origin_lng: number | null
          pallets: number
          pickup_date_from: string
          pickup_date_to: string
          price: number | null
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          shipper_id: string
          space_ldm: number | null
          space_type: string
          space_value: number
          status: Database["public"]["Enums"]["shipment_status"]
          updated_at: string
          weight_kg: number
          width_cm: number | null
        }
        Insert: {
          cargo_notes?: string | null
          cargo_type?: Database["public"]["Enums"]["cargo_type"]
          created_at?: string
          delivery_date_from: string
          delivery_date_to: string
          destination_city: string
          destination_country: string
          destination_lat?: number | null
          destination_lng?: number | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          notes?: string | null
          origin_city: string
          origin_country: string
          origin_lat?: number | null
          origin_lng?: number | null
          pallets: number
          pickup_date_from: string
          pickup_date_to: string
          price?: number | null
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          shipper_id: string
          space_ldm?: number | null
          space_type?: string
          space_value?: number
          status?: Database["public"]["Enums"]["shipment_status"]
          updated_at?: string
          weight_kg?: number
          width_cm?: number | null
        }
        Update: {
          cargo_notes?: string | null
          cargo_type?: Database["public"]["Enums"]["cargo_type"]
          created_at?: string
          delivery_date_from?: string
          delivery_date_to?: string
          destination_city?: string
          destination_country?: string
          destination_lat?: number | null
          destination_lng?: number | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          notes?: string | null
          origin_city?: string
          origin_country?: string
          origin_lat?: number | null
          origin_lng?: number | null
          pallets?: number
          pickup_date_from?: string
          pickup_date_to?: string
          price?: number | null
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          shipper_id?: string
          space_ldm?: number | null
          space_type?: string
          space_value?: number
          status?: Database["public"]["Enums"]["shipment_status"]
          updated_at?: string
          weight_kg?: number
          width_cm?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string
          shipment_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id: string
          shipment_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          carrier_id: string
          created_at: string
          id: string
          is_accepted: boolean
          load_id: string
          message: string | null
          price: number
          route_id: string | null
          updated_at: string
        }
        Insert: {
          carrier_id: string
          created_at?: string
          id?: string
          is_accepted?: boolean
          load_id: string
          message?: string | null
          price: number
          route_id?: string | null
          updated_at?: string
        }
        Update: {
          carrier_id?: string
          created_at?: string
          id?: string
          is_accepted?: boolean
          load_id?: string
          message?: string | null
          price?: number
          route_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_verified: boolean
          avatar_url: string | null
          billing_address: string | null
          bio: string | null
          cmr_expiry: string | null
          cmr_insurance: boolean
          company_name: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          email: string
          fleet_description: string | null
          full_name: string | null
          id: string
          insurance_doc_status: string
          is_suspended: boolean
          last_active_at: string | null
          legal_company_name: string | null
          logo_url: string | null
          max_pallet_capacity: number | null
          operating_countries: string[]
          operator_licence: string | null
          phone: string | null
          preferred_cargo_types: string[]
          registered_address: string | null
          route_flexibility_default: boolean
          shipment_frequency: string | null
          stripe_connect_account_id: string | null
          stripe_connect_onboarded: boolean
          terms_accepted_at: string | null
          terms_version: string | null
          updated_at: string
          vat_number: string | null
          vat_status: string
          vehicle_types: string[]
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          admin_verified?: boolean
          avatar_url?: string | null
          billing_address?: string | null
          bio?: string | null
          cmr_expiry?: string | null
          cmr_insurance?: boolean
          company_name?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          email: string
          fleet_description?: string | null
          full_name?: string | null
          id: string
          insurance_doc_status?: string
          is_suspended?: boolean
          last_active_at?: string | null
          legal_company_name?: string | null
          logo_url?: string | null
          max_pallet_capacity?: number | null
          operating_countries?: string[]
          operator_licence?: string | null
          phone?: string | null
          preferred_cargo_types?: string[]
          registered_address?: string | null
          route_flexibility_default?: boolean
          shipment_frequency?: string | null
          stripe_connect_account_id?: string | null
          stripe_connect_onboarded?: boolean
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
          vat_number?: string | null
          vat_status?: string
          vehicle_types?: string[]
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          admin_verified?: boolean
          avatar_url?: string | null
          billing_address?: string | null
          bio?: string | null
          cmr_expiry?: string | null
          cmr_insurance?: boolean
          company_name?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          email?: string
          fleet_description?: string | null
          full_name?: string | null
          id?: string
          insurance_doc_status?: string
          is_suspended?: boolean
          last_active_at?: string | null
          legal_company_name?: string | null
          logo_url?: string | null
          max_pallet_capacity?: number | null
          operating_countries?: string[]
          operator_licence?: string | null
          phone?: string | null
          preferred_cargo_types?: string[]
          registered_address?: string | null
          route_flexibility_default?: boolean
          shipment_frequency?: string | null
          stripe_connect_account_id?: string | null
          stripe_connect_onboarded?: boolean
          terms_accepted_at?: string | null
          terms_version?: string | null
          updated_at?: string
          vat_number?: string | null
          vat_status?: string
          vehicle_types?: string[]
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rated_id: string
          rater_id: string
          score: number
          shipment_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rated_id: string
          rater_id: string
          score: number
          shipment_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rated_id?: string
          rater_id?: string
          score?: number
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      resolution_cases: {
        Row: {
          carrier_id: string
          carrier_resolved: boolean
          created_at: string
          description: string | null
          id: string
          issue_type: Database["public"]["Enums"]["resolution_issue_type"]
          opened_at: string
          opened_by: string
          resolved_at: string | null
          shipment_id: string | null
          shipper_id: string
          shipper_resolved: boolean
          status: Database["public"]["Enums"]["resolution_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          carrier_id: string
          carrier_resolved?: boolean
          created_at?: string
          description?: string | null
          id?: string
          issue_type: Database["public"]["Enums"]["resolution_issue_type"]
          opened_at?: string
          opened_by: string
          resolved_at?: string | null
          shipment_id?: string | null
          shipper_id: string
          shipper_resolved?: boolean
          status?: Database["public"]["Enums"]["resolution_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          carrier_id?: string
          carrier_resolved?: boolean
          created_at?: string
          description?: string | null
          id?: string
          issue_type?: Database["public"]["Enums"]["resolution_issue_type"]
          opened_at?: string
          opened_by?: string
          resolved_at?: string | null
          shipment_id?: string | null
          shipper_id?: string
          shipper_resolved?: boolean
          status?: Database["public"]["Enums"]["resolution_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resolution_cases_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      resolution_evidence: {
        Row: {
          case_id: string
          created_at: string
          description: string | null
          file_path: string
          id: string
          kind: string
          uploader_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          kind?: string
          uploader_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          kind?: string
          uploader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resolution_evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "resolution_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      resolution_messages: {
        Row: {
          body: string
          case_id: string
          created_at: string
          id: string
          read_by: Json
          sender_id: string | null
          sender_role: Database["public"]["Enums"]["resolution_sender_role"]
        }
        Insert: {
          body: string
          case_id: string
          created_at?: string
          id?: string
          read_by?: Json
          sender_id?: string | null
          sender_role: Database["public"]["Enums"]["resolution_sender_role"]
        }
        Update: {
          body?: string
          case_id?: string
          created_at?: string
          id?: string
          read_by?: Json
          sender_id?: string | null
          sender_role?: Database["public"]["Enums"]["resolution_sender_role"]
        }
        Relationships: [
          {
            foreignKeyName: "resolution_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "resolution_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      route_request_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_system: boolean
          request_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_system?: boolean
          request_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_system?: boolean
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "route_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      route_requests: {
        Row: {
          carrier_id: string
          created_at: string
          delivery_address: string
          goods_type: string
          id: string
          message: string | null
          offer_price: number | null
          offer_type: Database["public"]["Enums"]["route_offer_type"]
          pallets: number
          pallets_requested: number | null
          pickup_address: string
          proposed_dropoff_city: string | null
          proposed_dropoff_country: string | null
          proposed_pickup_city: string | null
          proposed_pickup_country: string | null
          route_id: string
          shipment_date: string
          shipper_id: string
          shipper_message: string | null
          special_requirements: string | null
          status: Database["public"]["Enums"]["route_request_status"]
          updated_at: string
          volume_cbm: number | null
          weight_kg: number
        }
        Insert: {
          carrier_id: string
          created_at?: string
          delivery_address: string
          goods_type: string
          id?: string
          message?: string | null
          offer_price?: number | null
          offer_type?: Database["public"]["Enums"]["route_offer_type"]
          pallets?: number
          pallets_requested?: number | null
          pickup_address: string
          proposed_dropoff_city?: string | null
          proposed_dropoff_country?: string | null
          proposed_pickup_city?: string | null
          proposed_pickup_country?: string | null
          route_id: string
          shipment_date: string
          shipper_id: string
          shipper_message?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["route_request_status"]
          updated_at?: string
          volume_cbm?: number | null
          weight_kg?: number
        }
        Update: {
          carrier_id?: string
          created_at?: string
          delivery_address?: string
          goods_type?: string
          id?: string
          message?: string | null
          offer_price?: number | null
          offer_type?: Database["public"]["Enums"]["route_offer_type"]
          pallets?: number
          pallets_requested?: number | null
          pickup_address?: string
          proposed_dropoff_city?: string | null
          proposed_dropoff_country?: string | null
          proposed_pickup_city?: string | null
          proposed_pickup_country?: string | null
          route_id?: string
          shipment_date?: string
          shipper_id?: string
          shipper_message?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["route_request_status"]
          updated_at?: string
          volume_cbm?: number | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "route_requests_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          available_pallets: number
          city: string
          country: string
          created_at: string
          id: string
          planned_datetime: string | null
          route_id: string
          stop_order: number
        }
        Insert: {
          available_pallets: number
          city: string
          country: string
          created_at?: string
          id?: string
          planned_datetime?: string | null
          route_id: string
          stop_order: number
        }
        Update: {
          available_pallets?: number
          city?: string
          country?: string
          created_at?: string
          id?: string
          planned_datetime?: string | null
          route_id?: string
          stop_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          arrival_date_from: string | null
          arrival_date_to: string | null
          arrival_time: string | null
          available_pallets: number
          carrier_id: string
          created_at: string
          departure_date_from: string
          departure_date_to: string
          departure_time: string | null
          destination_city: string
          destination_country: string
          destination_lat: number | null
          destination_lng: number | null
          flexibility_note: string | null
          goods_accepted: string | null
          id: string
          is_active: boolean
          itinerary_image_url: string | null
          max_destination_radius_km: number | null
          max_deviation_km: number | null
          max_payload_kg: number
          notes: string | null
          open_to_extra_stops: boolean
          origin_city: string
          origin_country: string
          origin_lat: number | null
          origin_lng: number | null
          route_link: string | null
          space_ldm: number | null
          space_type: string
          space_value: number
          status: Database["public"]["Enums"]["route_status"]
          trip_description: string | null
          updated_at: string
          vehicle_constraints: string | null
          vehicle_type: string | null
        }
        Insert: {
          arrival_date_from?: string | null
          arrival_date_to?: string | null
          arrival_time?: string | null
          available_pallets: number
          carrier_id: string
          created_at?: string
          departure_date_from: string
          departure_date_to: string
          departure_time?: string | null
          destination_city: string
          destination_country: string
          destination_lat?: number | null
          destination_lng?: number | null
          flexibility_note?: string | null
          goods_accepted?: string | null
          id?: string
          is_active?: boolean
          itinerary_image_url?: string | null
          max_destination_radius_km?: number | null
          max_deviation_km?: number | null
          max_payload_kg?: number
          notes?: string | null
          open_to_extra_stops?: boolean
          origin_city: string
          origin_country: string
          origin_lat?: number | null
          origin_lng?: number | null
          route_link?: string | null
          space_ldm?: number | null
          space_type?: string
          space_value?: number
          status?: Database["public"]["Enums"]["route_status"]
          trip_description?: string | null
          updated_at?: string
          vehicle_constraints?: string | null
          vehicle_type?: string | null
        }
        Update: {
          arrival_date_from?: string | null
          arrival_date_to?: string | null
          arrival_time?: string | null
          available_pallets?: number
          carrier_id?: string
          created_at?: string
          departure_date_from?: string
          departure_date_to?: string
          departure_time?: string | null
          destination_city?: string
          destination_country?: string
          destination_lat?: number | null
          destination_lng?: number | null
          flexibility_note?: string | null
          goods_accepted?: string | null
          id?: string
          is_active?: boolean
          itinerary_image_url?: string | null
          max_destination_radius_km?: number | null
          max_deviation_km?: number | null
          max_payload_kg?: number
          notes?: string | null
          open_to_extra_stops?: boolean
          origin_city?: string
          origin_country?: string
          origin_lat?: number | null
          origin_lng?: number | null
          route_link?: string | null
          space_ldm?: number | null
          space_type?: string
          space_value?: number
          status?: Database["public"]["Enums"]["route_status"]
          trip_description?: string | null
          updated_at?: string
          vehicle_constraints?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      shipment_timestamps: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          notes: string | null
          shipment_id: string
          status: Database["public"]["Enums"]["shipment_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          shipment_id: string
          status: Database["public"]["Enums"]["shipment_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          shipment_id?: string
          status?: Database["public"]["Enums"]["shipment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "shipment_timestamps_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          carrier_id: string
          carrier_payout_amount: number | null
          created_at: string
          delivery_marked_at: string | null
          dispute_raised_at: string | null
          dispute_reason: string | null
          dispute_resolved_at: string | null
          dispute_status: string | null
          final_price: number
          id: string
          load_id: string
          offer_id: string
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          platform_fee_amount: number | null
          shipper_id: string
          status: Database["public"]["Enums"]["shipment_status"]
          terms_version: string | null
          updated_at: string
        }
        Insert: {
          carrier_id: string
          carrier_payout_amount?: number | null
          created_at?: string
          delivery_marked_at?: string | null
          dispute_raised_at?: string | null
          dispute_reason?: string | null
          dispute_resolved_at?: string | null
          dispute_status?: string | null
          final_price: number
          id?: string
          load_id: string
          offer_id: string
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          platform_fee_amount?: number | null
          shipper_id: string
          status?: Database["public"]["Enums"]["shipment_status"]
          terms_version?: string | null
          updated_at?: string
        }
        Update: {
          carrier_id?: string
          carrier_payout_amount?: number | null
          created_at?: string
          delivery_marked_at?: string | null
          dispute_raised_at?: string | null
          dispute_reason?: string | null
          dispute_resolved_at?: string | null
          dispute_status?: string | null
          final_price?: number
          id?: string
          load_id?: string
          offer_id?: string
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          platform_fee_amount?: number | null
          shipper_id?: string
          status?: Database["public"]["Enums"]["shipment_status"]
          terms_version?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          country: string | null
          full_name: string | null
          id: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          country?: string | null
          full_name?: string | null
          id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          country?: string | null
          full_name?: string | null
          id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_matching_loads_for_route: {
        Args: { p_route_id: string }
        Returns: {
          destination_city: string
          destination_country: string
          load_id: string
          match_type: string
          origin_city: string
          origin_country: string
          pallets: number
          pickup_date_from: string
          pickup_date_to: string
          price: number
          pricing_type: string
          shipper_id: string
        }[]
      }
      get_matching_routes_for_load: {
        Args: {
          p_destination_city: string
          p_destination_country: string
          p_origin_city: string
          p_origin_country: string
          p_pallets: number
          p_pickup_date_from: string
          p_pickup_date_to: string
        }
        Returns: {
          available_pallets: number
          carrier_id: string
          departure_date_from: string
          departure_date_to: string
          destination_city: string
          destination_country: string
          match_type: string
          origin_city: string
          origin_country: string
          route_id: string
          status: Database["public"]["Enums"]["route_status"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      profile_completion_pct: { Args: { _user_id: string }; Returns: number }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      users_share_shipment: {
        Args: { _a: string; _b: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "shipper" | "carrier" | "admin"
      cargo_type:
        | "general"
        | "fragile"
        | "refrigerated"
        | "hazardous"
        | "oversized"
        | "livestock"
        | "vehicles"
        | "other"
      payment_status: "pending" | "paid" | "completed" | "refunded"
      pricing_type: "fixed" | "open_to_offers"
      resolution_issue_type:
        | "late_delivery"
        | "cargo_damage"
        | "no_show"
        | "payment_dispute"
        | "route_deviation"
        | "other"
      resolution_sender_role: "shipper" | "carrier" | "support" | "system"
      resolution_status:
        | "open"
        | "under_review"
        | "decision_pending"
        | "resolved"
      route_offer_type: "direct" | "alternative"
      route_request_status:
        | "sent"
        | "viewed"
        | "in_discussion"
        | "accepted"
        | "rejected"
        | "expired"
        | "cancelled"
      route_status: "planned" | "active" | "completed" | "cancelled"
      shipment_status:
        | "posted"
        | "accepted"
        | "paid"
        | "picked_up"
        | "delivered"
        | "completed"
      vehicle_type:
        | "standard_truck"
        | "refrigerated_truck"
        | "flatbed"
        | "box_truck"
        | "curtain_sider"
        | "tanker"
        | "livestock_carrier"
        | "car_transporter"
      verification_status: "unverified" | "pending" | "verified" | "rejected"
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
      app_role: ["shipper", "carrier", "admin"],
      cargo_type: [
        "general",
        "fragile",
        "refrigerated",
        "hazardous",
        "oversized",
        "livestock",
        "vehicles",
        "other",
      ],
      payment_status: ["pending", "paid", "completed", "refunded"],
      pricing_type: ["fixed", "open_to_offers"],
      resolution_issue_type: [
        "late_delivery",
        "cargo_damage",
        "no_show",
        "payment_dispute",
        "route_deviation",
        "other",
      ],
      resolution_sender_role: ["shipper", "carrier", "support", "system"],
      resolution_status: [
        "open",
        "under_review",
        "decision_pending",
        "resolved",
      ],
      route_offer_type: ["direct", "alternative"],
      route_request_status: [
        "sent",
        "viewed",
        "in_discussion",
        "accepted",
        "rejected",
        "expired",
        "cancelled",
      ],
      route_status: ["planned", "active", "completed", "cancelled"],
      shipment_status: [
        "posted",
        "accepted",
        "paid",
        "picked_up",
        "delivered",
        "completed",
      ],
      vehicle_type: [
        "standard_truck",
        "refrigerated_truck",
        "flatbed",
        "box_truck",
        "curtain_sider",
        "tanker",
        "livestock_carrier",
        "car_transporter",
      ],
      verification_status: ["unverified", "pending", "verified", "rejected"],
    },
  },
} as const
