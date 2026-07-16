import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * 사이트 공개 읽기용 anon 클라이언트. 세션 미영속.
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 사용.
 */
export function createAnonClient(): SupabaseClient<Database> {
  throw new Error("not implemented (P1 Wave 1)");
}
