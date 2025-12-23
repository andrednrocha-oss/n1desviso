
import { createClient } from '@supabase/supabase-js';

// Função auxiliar para buscar variáveis de forma segura em diferentes ambientes (Vite/Node/Browser)
const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // Fallback para import.meta.env (padrão Vite)
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv[key]) {
    return metaEnv[key];
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn(
    'DeviTrack: Chaves do Supabase não configuradas. Operando em modo OFFLINE (LocalStorage).'
  );
} else {
  console.log('DeviTrack: Conexão com Supabase estabelecida com sucesso. Operando em modo ONLINE.');
}
