import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * admin 서버(인증 세션)용 클라이언트. next/headers 쿠키를 사용하므로 async.
 * (Next 15 `cookies()`는 async)
 */
export async function createServerSupabaseClient(): Promise<
  SupabaseClient<Database>
> {
  throw new Error("not implemented (P1 Wave 1)");
}
