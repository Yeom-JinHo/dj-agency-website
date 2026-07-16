/**
 * Supabase Database 타입. §6 스키마를 손으로 미러링했으며, 마이그레이션 확정 후
 * `supabase gen types typescript`로 재생성할 수 있다. snake_case = DB 원본 컬럼명.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sites: {
        Row: { slug: string; name: string };
        Insert: { slug: string; name: string };
        Update: { slug?: string; name?: string };
        Relationships: [];
      };
      artists: {
        Row: {
          id: string;
          slug: string;
          name: string;
          nickname: string | null;
          short_description_en: string | null;
          short_description_ko: string | null;
          full_description_en: string | null;
          full_description_ko: string | null;
          image_path: string | null;
          logo_image_path: string | null;
          image_placeholder: string | null;
          city: string | null;
          selected_works: Json;
          socials: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          nickname?: string | null;
          short_description_en?: string | null;
          short_description_ko?: string | null;
          full_description_en?: string | null;
          full_description_ko?: string | null;
          image_path?: string | null;
          logo_image_path?: string | null;
          image_placeholder?: string | null;
          city?: string | null;
          selected_works?: Json;
          socials?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          nickname?: string | null;
          short_description_en?: string | null;
          short_description_ko?: string | null;
          full_description_en?: string | null;
          full_description_ko?: string | null;
          image_path?: string | null;
          logo_image_path?: string | null;
          image_placeholder?: string | null;
          city?: string | null;
          selected_works?: Json;
          socials?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      releases: {
        Row: {
          id: string;
          slug: string;
          title: string;
          primary_artist_id: string | null;
          artist_credit: string | null;
          featured_artists: string[];
          label: string | null;
          catalog_no: string | null;
          artwork_path: string | null;
          artwork_placeholder: string | null;
          short_description_en: string | null;
          short_description_ko: string | null;
          full_description_en: string | null;
          full_description_ko: string | null;
          release_date: string | null;
          platform_links: Json;
          socials: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          primary_artist_id?: string | null;
          artist_credit?: string | null;
          featured_artists?: string[];
          label?: string | null;
          catalog_no?: string | null;
          artwork_path?: string | null;
          artwork_placeholder?: string | null;
          short_description_en?: string | null;
          short_description_ko?: string | null;
          full_description_en?: string | null;
          full_description_ko?: string | null;
          release_date?: string | null;
          platform_links?: Json;
          socials?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          primary_artist_id?: string | null;
          artist_credit?: string | null;
          featured_artists?: string[];
          label?: string | null;
          catalog_no?: string | null;
          artwork_path?: string | null;
          artwork_placeholder?: string | null;
          short_description_en?: string | null;
          short_description_ko?: string | null;
          full_description_en?: string | null;
          full_description_ko?: string | null;
          release_date?: string | null;
          platform_links?: Json;
          socials?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "releases_primary_artist_id_fkey";
            columns: ["primary_artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
        ];
      };
      tours: {
        Row: {
          id: string;
          slug: string;
          title: string;
          artist_id: string | null;
          venue: string | null;
          city: string | null;
          country: string | null;
          event_date: string;
          door_time: string | null;
          ticket_url: string | null;
          poster_path: string | null;
          poster_placeholder: string | null;
          description_en: string | null;
          description_ko: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          artist_id?: string | null;
          venue?: string | null;
          city?: string | null;
          country?: string | null;
          event_date: string;
          door_time?: string | null;
          ticket_url?: string | null;
          poster_path?: string | null;
          poster_placeholder?: string | null;
          description_en?: string | null;
          description_ko?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          artist_id?: string | null;
          venue?: string | null;
          city?: string | null;
          country?: string | null;
          event_date?: string;
          door_time?: string | null;
          ticket_url?: string | null;
          poster_path?: string | null;
          poster_placeholder?: string | null;
          description_en?: string | null;
          description_ko?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tours_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
        ];
      };
      artist_sites: {
        Row: { artist_id: string; site_slug: string; sort_order: number };
        Insert: { artist_id: string; site_slug: string; sort_order?: number };
        Update: { artist_id?: string; site_slug?: string; sort_order?: number };
        Relationships: [
          {
            foreignKeyName: "artist_sites_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "artists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "artist_sites_site_slug_fkey";
            columns: ["site_slug"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["slug"];
          },
        ];
      };
      release_sites: {
        Row: { release_id: string; site_slug: string; sort_order: number };
        Insert: { release_id: string; site_slug: string; sort_order?: number };
        Update: { release_id?: string; site_slug?: string; sort_order?: number };
        Relationships: [
          {
            foreignKeyName: "release_sites_release_id_fkey";
            columns: ["release_id"];
            isOneToOne: false;
            referencedRelation: "releases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "release_sites_site_slug_fkey";
            columns: ["site_slug"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["slug"];
          },
        ];
      };
      tour_sites: {
        Row: { tour_id: string; site_slug: string; sort_order: number };
        Insert: { tour_id: string; site_slug: string; sort_order?: number };
        Update: { tour_id?: string; site_slug?: string; sort_order?: number };
        Relationships: [
          {
            foreignKeyName: "tour_sites_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tour_sites_site_slug_fkey";
            columns: ["site_slug"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["slug"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
