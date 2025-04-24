import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// ~ ======= create client -->
// I would consider this over-engineering but there might be a reason to add more
// methods to this in the future. yes it is to me time to understand it
class Supabase {
  private readonly url: string;
  private readonly key: string;
  private readonly serviceKey: string;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error(
        "Missing Supabase environment variables. Please check your .env.local file."
      );
    }

    this.url = supabaseUrl;
    this.key = supabaseAnonKey;
    this.serviceKey = supabaseServiceKey;
  }

  // ~ ======= server client -->
  async ssr_client() {
    const cookie_store = await cookies();

    if (!cookie_store) {
      console.error("[Supabase] Failed to get cookie store");
      throw new Error("Failed to get cookie store");
    }

    return createServerClient(this.url, this.key, {
      cookies: {
        get(name: string) {
          const cookie = cookie_store.get(name);
          if (!cookie?.value) {
            console.log(`[Supabase] Cookie not found: ${name}`);
          }
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookie_store.set(name, value, options);
            console.log(`[Supabase] Cookie set: ${name}`);
          } catch (error) {
            console.error("[Supabase] Error setting cookie:", error);
            throw error;
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookie_store.set(name, "", { ...options, maxAge: 0 });
            console.log(`[Supabase] Cookie removed: ${name}`);
          } catch (error) {
            console.error("[Supabase] Error removing cookie:", error);
            throw error;
          }
        },
      },
    });
  }

  // ~ ======= admin client -->
  admin_client() {
    return createClient(this.url, this.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}

export { Supabase };
