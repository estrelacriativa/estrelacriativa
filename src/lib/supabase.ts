import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  rawUrl && rawKey && rawKey !== 'seu_supabase_anon_key_aqui'
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase URL ou Anon Key ausente/incompleto no arquivo .env! A loja funcionará com dados padrão e armazenamento local.'
  );
}

// Fallback seguro para evitar que a aplicação quebre com tela branca caso a chave ainda não tenha sido preenchida
const supabaseUrl = rawUrl || 'https://alaavpbttwxuzchjgite.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder-anon-key-prevent-crash';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


