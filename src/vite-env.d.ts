/// <reference types="vite/client" />
import type { StoreConfig, Category, Product } from './types/store';

declare global {
  interface Window {
    DADOS_PUBLICADOS_CONFIG?: Partial<StoreConfig> | null;
    DADOS_PUBLICADOS_CATEGORIAS?: Category[] | null;
    DADOS_PUBLICADOS_PRODUTOS?: Product[] | null;
  }
}
