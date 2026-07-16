import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * 서버 전용 service role 클라이언트. 클라이언트 번들 노출 금지.
 * SUPABASE_SERVICE_ROLE_KEY 사용.
 */
export function createServiceClient(): SupabaseClient<Database> {
  throw new Error("not implemented (P1 Wave 1)");
}
