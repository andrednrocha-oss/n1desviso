
import { createClient } from '@supabase/supabase-js';

// Fix: Use process.env instead of import.meta.env to resolve TypeScript errors regarding ImportMeta
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn(
    'Supabase: Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas. ' +
    'O app funcionará apenas em modo offline.'
  );
}
