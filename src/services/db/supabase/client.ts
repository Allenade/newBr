import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ~ =============================================>
// ~ ======= Create Supabase Client  -->
// ~ =============================================>
export const createClient = () => {
  // Create a new Supabase client with environment variables or fallback values
  const url = supabaseUrl || "https://qmwqamuywtjheyqpglg.supabase.co";
  const key =
    supabaseAnonKey ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd2dxYW11eXd0amhleXFwZ2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4Njg4MjUsImV4cCI6MjA1OTQ0NDgyNX0.viXmNysJLewatBvRasKz4LV2VdYNtq6qi4B1h0cRGNg";

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
    },
  });
};
