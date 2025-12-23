
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string | undefined => {
  // Tenta obter do process.env (Vite define ou Vercel runtime) ou import.meta.env
  return (
    (typeof process !== 'undefined' ? process.env?.[key] : undefined) ||
    (import.meta as any).env?.[key] ||
    (window as any).process?.env?.[key]
  );
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn('Supabase: Chaves de configuração não encontradas. O app funcionará em modo offline (localStorage).');
}
