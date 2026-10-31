// ==========================================================================
// TIPAGENS GLOBAIS DA LOJA E PAINEL ADMIN — ESTRELA CRIATIVA
// ==========================================================================

export interface StoreConfig {
  whatsapp: string;
  whatsappExibicao: string;
  instagram: string;
  descontoPix: number;
  avisoTopo: string;
  senhaAdmin?: string;
}

export interface Category {
  id: string;
  nome: string;
  nomeCurto: string;
  icone: string;
  subtitulo: string;
}

export interface CategoryFormInput {
  id?: string;
  nome: string;
  nomeCurto: string;
  icone: string;
  subtitulo: string;
}

export interface Product {
  id: number;
  nome: string;
  categoria: string;
  categoriaLabel: string;
  descricao: string;
  precoAntigo: number;
  preco: number;
  emoji: string;
  imagem: string;
  corFundo: string;
  tagPreview: string;
  destaque: string;
  permiteNome: boolean;
}

export interface ProductFormInput {
  id?: string | number;
  nome: string;
  categoria: string;
  precoAntigo: string | number;
  preco: string | number;
  descricao: string;
  emoji: string;
  imagem: string;
  corFundo: string;
  destaque: string;
  tagPreview: string;
}

export interface ProductCustomization {
  nomeCapa: string;
  tema: string;
  acabamento: string;
}

export interface CartItem {
  uid: string;
  id: number;
  nome: string;
  preco: number;
  emoji: string;
  imagem: string;
  quantidade: number;
  personalizacao: ProductCustomization;
}

export interface CustomerCheckoutData {
  nome: string;
  entrega: string;
  cep: string;
  pagamento: string;
  obs: string;
}

export type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'nome';

export type AdminTab = 'visao-geral' | 'produtos' | 'categorias' | 'configuracoes';

export interface ToastState {
  visivel: boolean;
  texto: string;
}

export interface StoreBackupData {
  exportadoEm?: string;
  config?: Partial<StoreConfig>;
  categorias?: Category[];
  produtos?: Product[];
}

export interface FinishItem {
  id: string;
  icone: string;
  classeSwatch: string;
  titulo: string;
  descricao: string;
}

export interface StepItem {
  numero: number;
  titulo: string;
  descricao: string;
}

export interface TestimonialItem {
  id: number;
  iniciais: string;
  nome: string;
  compra: string;
  texto: string;
}

export interface FaqItem {
  id: number;
  pergunta: string;
  resposta: string;
}

export interface SelectOption {
  value: string;
  label: string;
}
