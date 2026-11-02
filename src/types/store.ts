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
  detalhesExtras?: string;
  dimensoes?: string;
  quantidadeFolhas?: string;
  galeriaFotos?: string[];
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
  detalhesExtras: string;
  dimensoes: string;
  quantidadeFolhas: string;
  galeriaFotos: string[];
}

export interface ProductCustomization {
  nomeCapa: string;
  tema: string;
  acabamento: string;
  tamanhoBotton?: string;
  arteBottonUrl?: string;
  arteBottonPreview?: string;
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

  // Propriedades compatíveis para templates de mensagem e exportações
  title?: string;
  quantity?: number;
  subtotal?: number;
  customText?: string;
  theme?: string;
  themeDetails?: string;
  lamination?: string;
  type?: string;
  bottonSize?: string;
}

export interface CustomerCheckoutData {
  nome: string;
  entrega: string;
  cep: string;
  pagamento: string;
  obs: string;
  taxaEntrega?: number;
}

export type OrderStatus = 'novo' | 'em_producao' | 'concluido';

export interface StoreOrder {
  id: number;
  clienteNome: string;
  entrega: string;
  cep: string;
  pagamento: string;
  observacoes: string;
  subtotal: number;
  descontoPix: number;
  taxaEntrega?: number;
  total: number;
  status: OrderStatus;
  itens: CartItem[];
  criadoEm: string;
}

export interface StudioBottonPreset {
  arteUrl: string;
  tamanhoBotton?: string;
  quantidade?: number;
  clienteNome?: string;
}

export type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'nome';

export type AdminTab =
  | 'visao-geral'
  | 'pedidos'
  | 'produtos'
  | 'bottons'
  | 'categorias'
  | 'configuracoes';

export interface ToastAction {
  texto: string;
  onClick: () => void;
  tipo?: 'primary' | 'secondary';
}

export interface ToastState {
  visivel: boolean;
  texto: string;
  acoes?: ToastAction[];
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

