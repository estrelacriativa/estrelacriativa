/// <reference types="vite/client" />
import type { StoreConfig, Category, Product } from './types/store';

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    DADOS_PUBLICADOS_CONFIG?: Partial<StoreConfig> | null;
    DADOS_PUBLICADOS_CATEGORIAS?: Category[] | null;
    DADOS_PUBLICADOS_PRODUTOS?: Product[] | null;
  }
}

