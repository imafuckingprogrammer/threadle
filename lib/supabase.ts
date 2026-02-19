import { createClient } from "@supabase/supabase-js";

// Server-only client — never import this in client components
export function createServerClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}
