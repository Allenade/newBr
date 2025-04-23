import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { CookieOptions } from "@supabase/ssr";

// ~ ======= create client -->
// I would consider this over-engineering but there might be a reason to add more
// methods to this in the future. yes it is to me time to understand it
class Supabase {
  private readonly url: string;
  private readonly key: string;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing Supabase environment variables. Please check your .env.local file."
      );
    }

    this.url = supabaseUrl;
    this.key = supabaseAnonKey;
  }

  // ~ ======= server client -->
  async ssr_client() {
    const cookie_store = await cookies();
    return createServerClient(this.url, this.key, {
      cookies: {
        get(name: string) {
          return cookie_store.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookie_store.set(name, value, options);
          } catch (error) {
            console.error("Error setting cookie:", error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookie_store.set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            console.error("Error removing cookie:", error);
          }
        },
      },
    });
  }
}

export { Supabase };
