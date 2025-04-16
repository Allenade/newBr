import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// ~ ======= create client -->
// I would consider this over-engineering but there might be a reason to add more
// methods to this in the future.
class Supabase {
  private readonly url: string;
  private readonly key: string;

  constructor() {
    // ~ ======= assign values -->
    this.url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://your-project.supabase.co";
    this.key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";
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
