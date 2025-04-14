import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// ~ ======= create client -->
// I would consider this over-engineering but there might be a reason to add more
// methods to this in the future.
class Supabase {
  private readonly url: string | undefined;
  private readonly key: string | undefined;

  constructor() {
    // ~ ======= assign values -->
    this.url = process.env.NEXT_PUBLIC_PROJECT_URL;
    this.key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  // ~ ======= server client -->
  async ssr_client() {
    if (!this.key || !this.url)
      throw new Error("Supabase env variables missing or not set correctly");
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
