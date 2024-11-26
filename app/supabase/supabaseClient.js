import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const getAllowedOrigins = () => {
  if (import.meta.env.PROD) {
    return ["https://acutis-dm.vercel.app"];
  }
  return ["http://localhost:5173", "http://localhost:3000"];
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "Access-Control-Allow-Origin": getAllowedOrigins().join(","),
    },
  },
});