
import { createClient } from '@supabase/supabase-js';

// These variables must be provided in the environment. 
// If missing, we export null to prevent the application from crashing on startup.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
