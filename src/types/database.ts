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
      profiles: {
        Row: {
          id: string;
          telegram_id: number | null;
          google_id: string | null;
          username: string | null;
          avatar_id: string | null;
          level: number;
          prestige_score: number;
          camp_id: string | null;
          captcha_verified_at: string | null;
          wallet_balance_cents: number;
          role: "player" | "camp_owner" | "admin";
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      camps: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string | null;
          is_default: boolean;
          member_count: number;
          total_sessions: number;
          leaderboard_score: number;
          referral_code: string | null;
          camp_switch_level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["camps"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["camps"]["Row"]>;
        Relationships: [];
      };
      squads: {
        Row: {
          id: string;
          name: string;
          is_permanent: boolean;
          leader_id: string;
          member_count: number;
          squad_tokens: number;
          history_sessions: number;
          banner_id: string | null;
          emblem_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["squads"]["Row"]> & {
          name: string;
          leader_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["squads"]["Row"]>;
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          title: string;
          status: "draft" | "open" | "locked" | "active" | "completed" | "invalid";
          starts_at: string;
          registration_closes_at: string;
          entry_fee_cents: number;
          max_players: number;
          phase_config: Json;
          platform_fee_pct: number;
          economy_config: Json;
          registered_count: number;
          total_pool_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sessions"]["Row"]> & {
          title: string;
          starts_at: string;
          registration_closes_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["sessions"]["Row"]>;
        Relationships: [];
      };
      shop_items: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          economy: "session_cash" | "squad_tokens" | "prestige_cash";
          price_cents: number | null;
          price_squad_tokens: number | null;
          level_required: number;
          metadata: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["shop_items"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["shop_items"]["Row"]>;
        Relationships: [];
      };
      wallet_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "deposit" | "entry_fee" | "reward" | "refund" | "shop_purchase" | "withdrawal";
          amount_cents: number;
          balance_after_cents: number;
          reference_type: string | null;
          reference_id: string | null;
          stripe_payment_intent_id: string | null;
          idempotency_key: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["wallet_transactions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["wallet_transactions"]["Row"]>;
        Relationships: [];
      };
      live_feed_events: {
        Row: {
          id: string;
          event_type: string;
          message: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["live_feed_events"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["live_feed_events"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
