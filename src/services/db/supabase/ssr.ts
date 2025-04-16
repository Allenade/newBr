import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// ~ ======= create client -->
// I would consider this over-engineering but there might be a reason to add more
// methods to this in the future. yes it is to me time to understand it
class Supabase {
  private readonly url: string;
  private readonly key: string;

  constructor() {
    // ~ ======= assign values -->
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      // Use fallback values in production
      this.url = "https://qmwqamuywtjheyqpglg.supabase.co";
      this.key =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd2dxYW11eXd0amhleXFwZ2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4Njg4MjUsImV4cCI6MjA1OTQ0NDgyNX0.viXmNysJLewatBvRasKz4LV2VdYNtq6qi4B1h0cRGNg";
    } else {
      this.url = supabaseUrl;
      this.key = supabaseAnonKey;
    }
  }

  // ~ ======= server client -->
  async ssr_client() {
    const cookie_store = await cookies();
    return createServerClient(this.url, this.key, {
      cookies: {
        getAll() {
          return cookie_store.getAll();
        },
        setAll(cookies_to_set) {
          try {
            cookies_to_set.forEach(({ name, value, options }) =>
              cookie_store.set(name, value, options)
            );
          } catch {}
        },
      },
    });
  }
}

export { Supabase };
