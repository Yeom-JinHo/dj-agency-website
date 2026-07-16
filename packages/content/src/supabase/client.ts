import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/** admin client component용 브라우저 클라이언트(@supabase/ssr createBrowserClient). */
export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  throw new Error("not implemented (P1 Wave 1)");
}
