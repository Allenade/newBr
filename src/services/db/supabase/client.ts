import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_PROJECT_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ~ =============================================>
// ~ ======= Create Supabase Client  -->
// ~ =============================================>
export const createClient = () => {
  // Create a new Supabase client with the environment variables
  return createSupabaseClient(
    supabaseUrl || "https://your-project.supabase.co",
    supabaseAnonKey || "your-anon-key",
    {
      auth: {
        persistSession: true,
      },
    }
  );
};
