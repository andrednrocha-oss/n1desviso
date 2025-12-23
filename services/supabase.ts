
import { createClient } from '@supabase/supabase-js';

// Função segura para obter variáveis de ambiente
const getEnv = (key: string): string | undefined => {
  try {
    return (window as any).process?.env?.[key] || (import.meta as any).env?.[key];
  } catch {
    return undefined;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn('Supabase: Chaves de configuração não encontradas. O app funcionará em modo offline (localStorage).');
}
