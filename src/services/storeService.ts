import { supabase } from '../lib/supabase';
import type {
  Category,
  Product,
  StoreConfig,
  CategoryFormInput,
  CartItem,
  OrderStatus,
  StoreOrder,
} from '../types/store';

// ==============================================================================
// MAPEAMENTO DB <-> FRONTEND
// ==============================================================================

export interface DbCategory {
  id: string;
  nome: string;
  nome_curto: string;
  icone: string;
  subtitulo: string;
  ordem?: number;
}

export interface DbProduct {
  id: number;
  nome: string;
  categoria: string;
  categoria_label: string;
  descricao: string;
  preco_antigo: number;
  preco: number;
  emoji: string;
  imagem: string;
  cor_fundo: string;
  tag_preview: string;
  destaque: string;
  permite_nome: boolean;
  detalhes_extras?: string | null;
  dimensoes?: string | null;
  quantidade_folhas?: string | null;
  galeria_fotos?: string[] | null;
}

export interface DbStoreConfig {
  id: string;
  whatsapp: string;
  whatsapp_exibicao: string;
  instagram: string;
  desconto_pix: number;
  aviso_topo: string;
  senha_admin?: string;
}

export function formatarCategoriaParaApp(cat: DbCategory): Category {
  return {
    id: cat.id,
    nome: cat.nome,
    nomeCurto: cat.nome_curto || cat.nome,
    icone: cat.icone || '📦',
    subtitulo: cat.subtitulo || '',
  };
}

export function formatarProdutoParaApp(prod: DbProduct): Product {
  return {
    id: Number(prod.id),
    nome: prod.nome,
    categoria: prod.categoria || '',
    categoriaLabel: prod.categoria_label || '',
    descricao: prod.descricao || '',
    precoAntigo: Number(prod.preco_antigo) || 0,
    preco: Number(prod.preco) || 0,
    emoji: prod.emoji || '⭐',
    imagem: prod.imagem || '',
    corFundo: prod.cor_fundo || 'linear-gradient(135deg, #FFF9E6, #FFF0F5)',
    tagPreview: prod.tag_preview || '',
    destaque: prod.destaque || '',
    permiteNome: prod.permite_nome ?? true,
    detalhesExtras: prod.detalhes_extras || '',
    dimensoes: prod.dimensoes || '',
    quantidadeFolhas: prod.quantidade_folhas || '',
    galeriaFotos: Array.isArray(prod.galeria_fotos) ? prod.galeria_fotos : [],
  };
}

export function formatarConfigParaApp(conf: DbStoreConfig): StoreConfig {
  return {
    whatsapp: conf.whatsapp,
    whatsappExibicao: conf.whatsapp_exibicao,
    instagram: conf.instagram,
    descontoPix: conf.desconto_pix,
    avisoTopo: conf.aviso_topo,
  };
}

// ==============================================================================
// FUNÇÕES DE BUSCA E PERSISTÊNCIA NO SUPABASE
// ==============================================================================

export async function carregarDadosSupabase() {
  const [catRes, prodRes, confRes] = await Promise.all([
    supabase.from('categorias').select('*').order('ordem', { ascending: true }),
    supabase.from('produtos').select('*').order('id', { ascending: true }),
    supabase.from('loja_config').select('*').eq('id', 'principal').maybeSingle(),
  ]);

  return {
    categorias:
      !catRes.error && catRes.data
        ? (catRes.data as DbCategory[]).map(formatarCategoriaParaApp)
        : null,
    produtos:
      !prodRes.error && prodRes.data
        ? (prodRes.data as DbProduct[]).map(formatarProdutoParaApp)
        : null,
    config:
      !confRes.error && confRes.data
        ? formatarConfigParaApp(confRes.data as DbStoreConfig)
        : null,
    erros: {
      categorias: catRes.error,
      produtos: prodRes.error,
      config: confRes.error,
    },
  };
}

export async function salvarProdutoSupabase(produto: Product, editando: boolean) {
  const payloadBase = {
    nome: produto.nome,
    categoria: produto.categoria,
    categoria_label: produto.categoriaLabel,
    descricao: produto.descricao,
    preco_antigo: produto.precoAntigo,
    preco: produto.preco,
    emoji: produto.emoji,
    imagem: produto.imagem,
    cor_fundo: produto.corFundo,
    destaque: produto.destaque,
    tag_preview: produto.tagPreview,
    permite_nome: produto.permiteNome,
  };

  const payloadCompleto = {
    ...payloadBase,
    detalhes_extras: produto.detalhesExtras || '',
    dimensoes: produto.dimensoes || '',
    quantidade_folhas: produto.quantidadeFolhas || '',
    galeria_fotos: produto.galeriaFotos || [],
  };

  const executarQuery = async (dados: Record<string, unknown>) => {
    if (editando) {
      return supabase
        .from('produtos')
        .update(dados)
        .eq('id', produto.id)
        .select()
        .single();
    }
    return supabase.from('produtos').insert([dados]).select().single();
  };

  let { data, error } = await executarQuery(payloadCompleto);

  // Fallback seguro caso as novas colunas ainda não tenham sido adicionadas no SQL Editor
  if (error && (error.code === 'PGRST204' || error.code === '42703')) {
    console.warn(
      'Colunas de mais informações ainda não criadas no Supabase. Salvando campos básicos...'
    );
    const retry = await executarQuery(payloadBase);
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  return formatarProdutoParaApp(data as DbProduct);
}

export async function excluirProdutoSupabase(id: number) {
  const { error } = await supabase.from('produtos').delete().eq('id', id);
  if (error) throw error;
}

export async function salvarCategoriaSupabase(formCat: CategoryFormInput, ordem?: number) {
  const payload: DbCategory = {
    id: formCat.id!,
    nome: formCat.nome.trim(),
    nome_curto: (formCat.nomeCurto || formCat.nome).trim(),
    icone: formCat.icone.trim() || '📦',
    subtitulo: formCat.subtitulo.trim(),
    ...(ordem !== undefined ? { ordem } : {}),
  };

  const { data, error } = await supabase
    .from('categorias')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return formatarCategoriaParaApp(data as DbCategory);
}

export async function excluirCategoriaSupabase(catId: string) {
  const { error } = await supabase.from('categorias').delete().eq('id', catId);
  if (error) throw error;
}

export async function salvarConfigSupabase(parcialConfig: Partial<StoreConfig>) {
  const payload: Record<string, unknown> = { id: 'principal' };
  if (parcialConfig.whatsapp !== undefined) payload.whatsapp = parcialConfig.whatsapp;
  if (parcialConfig.whatsappExibicao !== undefined) payload.whatsapp_exibicao = parcialConfig.whatsappExibicao;
  if (parcialConfig.instagram !== undefined) payload.instagram = parcialConfig.instagram;
  if (parcialConfig.descontoPix !== undefined) payload.desconto_pix = parcialConfig.descontoPix;
  if (parcialConfig.avisoTopo !== undefined) payload.aviso_topo = parcialConfig.avisoTopo;

  const { data, error } = await supabase
    .from('loja_config')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return formatarConfigParaApp(data as DbStoreConfig);
}

export async function sincronizarListaCategoriasSupabase(lista: Category[]) {
  const payloads: DbCategory[] = lista.map((c, idx) => ({
    id: c.id,
    nome: c.nome,
    nome_curto: c.nomeCurto || c.nome,
    icone: c.icone || '📦',
    subtitulo: c.subtitulo || '',
    ordem: idx + 1,
  }));

  const idsAtuais = lista.map((c) => c.id);
  if (idsAtuais.length > 0) {
    await supabase.from('categorias').upsert(payloads);

    const { data: existentes } = await supabase.from('categorias').select('id');
    const setAtuais = new Set(idsAtuais);
    const idsParaRemover = (existentes || [])
      .map((c: { id: string }) => c.id)
      .filter((id) => !setAtuais.has(id));
    if (idsParaRemover.length > 0) {
      await supabase.from('categorias').delete().in('id', idsParaRemover);
    }
  }
}

export async function sincronizarCatalogoCompletoSupabase(
  listaCategorias: Category[],
  listaProdutos: Product[]
) {
  const payloadsCat: DbCategory[] = listaCategorias.map((c, idx) => ({
    id: c.id,
    nome: c.nome,
    nome_curto: c.nomeCurto || c.nome,
    icone: c.icone || '📦',
    subtitulo: c.subtitulo || '',
    ordem: idx + 1,
  }));

  if (payloadsCat.length > 0) {
    const { error: errCat } = await supabase
      .from('categorias')
      .upsert(payloadsCat);
    if (errCat) throw errCat;
  }

  await sincronizarListaProdutosSupabase(listaProdutos);

  const { data: existentes } = await supabase.from('categorias').select('id');
  const setAtuais = new Set(listaCategorias.map((c) => c.id));
  const idsParaRemover = (existentes || [])
    .map((c: { id: string }) => c.id)
    .filter((id) => !setAtuais.has(id));
  if (idsParaRemover.length > 0) {
    await supabase.from('categorias').delete().in('id', idsParaRemover);
  }
}

export async function sincronizarListaProdutosSupabase(lista: Product[]) {
  const { error: delError } = await supabase.from('produtos').delete().gte('id', 0);
  if (delError) throw delError;

  if (lista.length === 0) return;

  const payloads = lista.map((p) => ({
    id: p.id,
    nome: p.nome,
    categoria: p.categoria,
    categoria_label: p.categoriaLabel,
    descricao: p.descricao,
    preco_antigo: p.precoAntigo,
    preco: p.preco,
    emoji: p.emoji,
    imagem: p.imagem,
    cor_fundo: p.corFundo,
    tag_preview: p.tagPreview,
    destaque: p.destaque,
    permite_nome: p.permiteNome,
    detalhes_extras: p.detalhesExtras || '',
    dimensoes: p.dimensoes || '',
    quantidade_folhas: p.quantidadeFolhas || '',
    galeria_fotos: p.galeriaFotos || [],
  }));

  const { error: insError } = await supabase.from('produtos').upsert(payloads);
  if (insError && (insError.code === 'PGRST204' || insError.code === '42703')) {
    const payloadsBasicos = lista.map((p) => ({
      id: p.id,
      nome: p.nome,
      categoria: p.categoria,
      categoria_label: p.categoriaLabel,
      descricao: p.descricao,
      preco_antigo: p.precoAntigo,
      preco: p.preco,
      emoji: p.emoji,
      imagem: p.imagem,
      cor_fundo: p.corFundo,
      tag_preview: p.tagPreview,
      destaque: p.destaque,
      permite_nome: p.permiteNome,
    }));
    const retry = await supabase.from('produtos').upsert(payloadsBasicos);
    if (retry.error) throw retry.error;
    return;
  }
  if (insError) throw insError;
}

// ==============================================================================
// PEDIDOS & ARTES DOS CLIENTES (SUPABASE)
// ==============================================================================

export interface DbStoreOrder {
  id: number;
  cliente_nome: string;
  entrega: string;
  cep: string;
  pagamento: string;
  observacoes: string;
  subtotal: number;
  desconto_pix: number;
  total: number;
  status: string;
  itens: CartItem[];
  created_at: string;
}

export function formatarPedidoParaApp(ped: DbStoreOrder): StoreOrder {
  const statusValido: OrderStatus =
    ped.status === 'em_producao' || ped.status === 'concluido'
      ? ped.status
      : 'novo';

  return {
    id: Number(ped.id),
    clienteNome: ped.cliente_nome || 'Cliente',
    entrega: ped.entrega || '',
    cep: ped.cep || '',
    pagamento: ped.pagamento || '',
    observacoes: ped.observacoes || '',
    subtotal: Number(ped.subtotal) || 0,
    descontoPix: Number(ped.desconto_pix) || 0,
    total: Number(ped.total) || 0,
    status: statusValido,
    itens: Array.isArray(ped.itens) ? ped.itens : [],
    criadoEm: ped.created_at || new Date().toISOString(),
  };
}

export async function carregarPedidosSupabase(): Promise<StoreOrder[] | null> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return null;
  }
  return (data as DbStoreOrder[]).map(formatarPedidoParaApp);
}

export async function criarPedidoSupabase(
  novoPedido: Omit<StoreOrder, 'id' | 'criadoEm'>
): Promise<StoreOrder> {
  // Remove base64 temporário se já houver URL pública da nuvem para manter o registro leve
  const itensLimpos: CartItem[] = novoPedido.itens.map((it) => ({
    ...it,
    personalizacao: {
      ...it.personalizacao,
      arteBottonPreview: it.personalizacao.arteBottonUrl
        ? undefined
        : it.personalizacao.arteBottonPreview,
    },
  }));

  const payload = {
    cliente_nome: novoPedido.clienteNome,
    entrega: novoPedido.entrega,
    cep: novoPedido.cep,
    pagamento: novoPedido.pagamento,
    observacoes: novoPedido.observacoes,
    subtotal: novoPedido.subtotal,
    desconto_pix: novoPedido.descontoPix,
    total: novoPedido.total,
    status: novoPedido.status,
    itens: itensLimpos,
  };

  const { data, error } = await supabase
    .from('pedidos')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return formatarPedidoParaApp(data as DbStoreOrder);
}

export async function atualizarStatusPedidoSupabase(
  id: number,
  status: OrderStatus
) {
  const { error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function excluirPedidoSupabase(id: number) {
  const { error } = await supabase.from('pedidos').delete().eq('id', id);
  if (error) throw error;
}
