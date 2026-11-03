import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import {
  CONFIG_PADRAO,
  CATEGORIAS_PADRAO,
  PRODUTOS_PADRAO,
} from '../data/defaultStoreData';
import {
  carregarDadosSupabase,
  salvarProdutoSupabase,
  excluirProdutoSupabase,
  salvarCategoriaSupabase,
  excluirCategoriaSupabase,
  salvarConfigSupabase,
  sincronizarListaProdutosSupabase,
  sincronizarListaCategoriasSupabase,
  sincronizarCatalogoCompletoSupabase,
  carregarPedidosSupabase,
  criarPedidoSupabase,
  atualizarStatusPedidoSupabase,
  excluirPedidoSupabase,
} from '../services/storeService';
import {
  formatarMoeda,
  formatarWhatsappExibicao,
  gerarIdCategoria,
} from '../utils/formatters';
import { generateWhatsAppMessage } from '../utils/whatsapp';
import { supabase } from '../lib/supabase';
import { excluirImagemProdutoSupabase } from '../utils/imageUpload';
import type {
  StoreConfig,
  Category,
  CategoryFormInput,
  Product,
  ProductFormInput,
  ProductCustomization,
  CartItem,
  CustomerCheckoutData,
  OrderStatus,
  StoreOrder,
  SortOption,
  ToastState,
  StoreBackupData,
} from '../types/store';

export interface StoreContextValue {
  // Dados
  config: StoreConfig;
  categorias: Category[];
  produtos: Product[];
  carrinho: CartItem[];
  pedidos: StoreOrder[];

  // Filtros
  categoriaAtiva: string;
  termoBusca: string;
  setTermoBusca: (termo: string) => void;
  ordenacaoAtiva: SortOption;
  setOrdenacaoAtiva: (ordem: SortOption) => void;
  filtrarPorCategoria: (catId: string, rolarParaCatalogo?: boolean) => void;
  limparFiltros: () => void;

  // Modal e Carrinho
  produtoEmDetalhes: Product | null;
  abrirModalDetalhes: (produto: Product) => void;
  fecharModalDetalhes: () => void;
  produtoEmPersonalizacao: Product | null;
  abrirModalPersonalizacao: (produto: Product) => void;
  fecharModalPersonalizacao: () => void;
  carrinhoAberto: boolean;
  abrirCarrinho: () => void;
  fecharCarrinho: () => void;
  adicionarAoCarrinho: (
    produto: Product,
    personalizacao: ProductCustomization,
    quantidade?: number,
    precoUnitarioOverride?: number
  ) => void;
  alterarQuantidadeCarrinho: (uid: string, delta: number) => void;
  removerItemCarrinho: (uid: string) => void;
  limparCarrinho: () => void;
  duvidaRapidaProduto: (produto: Product) => void;
  finalizarPedidoWhatsApp: (dadosCliente: CustomerCheckoutData) => void;

  // Admin CRUD
  salvarProduto: (formProd: ProductFormInput) => void;
  excluirProduto: (id: number) => void;
  restaurarProdutosPadrao: () => void;
  salvarCategoria: (formCat: CategoryFormInput) => void;
  excluirCategoria: (catId: string) => boolean;
  restaurarCategoriasPadrao: () => void;
  salvarConfigLoja: (parcialConfig: Partial<StoreConfig>) => void;
  exportarDadosLojaJs: () => void;
  exportarBackupJson: () => void;
  importarBackupJson: (dados: StoreBackupData) => void;

  // Pedidos & Artes Geradas
  recarregarPedidos: () => Promise<void>;
  atualizarStatusPedido: (id: number, status: OrderStatus) => void;
  excluirPedido: (id: number) => void;
  salvarArteAvulsaEmPedidos: (dados: {
    clienteNome: string;
    tamanhoBotton: string;
    quantidade: number;
    arteBottonUrl: string;
    observacoes?: string;
  }) => Promise<void>;

  // Toast & Feedback
  toast: ToastState;
  mostrarNotificacao: (texto: string) => void;
  mostrarNotificacaoComAcoes: (
    texto: string,
    acoes?: import('../types/store').ToastAction[],
    duracaoMs?: number
  ) => void;
  fecharNotificacao: () => void;
  badgeAnimado: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEYS = {
  CONFIG: 'estrelaCriativaConfigAdmin',
  CATEGORIAS: 'estrelaCriativaCategoriasAdmin',
  PRODUTOS: 'estrelaCriativaProdutosAdmin',
  CARRINHO: 'estrelaCriativaCarrinho',
  PEDIDOS: 'estrelaCriativaPedidosAdmin',
  CATALOGO_V2: 'estrelaCatalogoOficialV16_UnicoServicoReformaCaderno',
} as const;

function enriquecerComPadrao(lista: Product[]): Product[] {
  // Deduplica por ID e por nome para garantir exatamente 1 card por produto oficial
  const idsVistos = new Set<number>();
  const nomesVistos = new Set<string>();
  const semDuplicatas: Product[] = [];
  let viuServicoReformaCaderno = false;

  for (const p of lista) {
    const nomeNorm = p.nome.toLowerCase().trim();
    if (p.id !== 1 && nomeNorm.includes('agenda a5')) {
      continue;
    }

    // Identifica qualquer variação legada de reforma/personalização de caderno (exceto o caderno físico id 10)
    const ehVariacaoServicoCaderno =
      (nomeNorm.includes('reforma') || nomeNorm.includes('personaliza')) &&
      nomeNorm.includes('caderno') &&
      !nomeNorm.includes('caderneta') &&
      !nomeNorm.includes('universitário') &&
      !nomeNorm.includes('pautado');

    if (ehVariacaoServicoCaderno) {
      if (p.id !== 11 || viuServicoReformaCaderno) {
        continue;
      }
      viuServicoReformaCaderno = true;
    }

    // Evita duplicatas do mesmo ID ou mesmo nome
    if (idsVistos.has(p.id) || nomesVistos.has(nomeNorm)) {
      continue;
    }
    idsVistos.add(p.id);
    nomesVistos.add(nomeNorm);
    semDuplicatas.push(p);
  }

  const listaMapeada = semDuplicatas.map((p) => {
    const padrao = PRODUTOS_PADRAO.find(
      (item) =>
        item.id === p.id ||
        (p.id === 1 && item.id === 1) ||
        (p.id === 10 && item.id === 10) ||
        (p.id === 11 && item.id === 11) ||
        (p.id === 12 && item.id === 12) ||
        item.nome.toLowerCase() === p.nome.toLowerCase()
    );
    if (!padrao) return p;

    const ehAgenda1 = p.id === 1;
    const ehNovoOuAtualizado = p.id >= 10 && p.id <= 12;
    const atualizarPrecoProvisorio =
      (p.id === 5 && (p.preco === 114.9 || p.preco === 105.25)) ||
      (p.id === 4 && (p.preco === 8.9 || p.preco === 3.68)) ||
      (p.id === 1 && (p.preco === 79.9 || p.preco === 49.9 || p.preco === 51.47)) ||
      (p.id === 2 && (p.preco === 32.9 || p.preco === 16.74)) ||
      (p.id === 3 && (p.preco === 19.9 || p.preco === 12.62)) ||
      (p.id === 6 && (p.preco === 6.9 || p.preco === 4.0 || p.preco === 4.21)) ||
      ehNovoOuAtualizado;

    return {
      ...p,
      nome: ehAgenda1 || ehNovoOuAtualizado ? padrao.nome : p.nome,
      descricao: ehNovoOuAtualizado ? padrao.descricao : p.descricao,
      destaque: ehNovoOuAtualizado ? padrao.destaque : (p.destaque || padrao.destaque),
      tagPreview: ehNovoOuAtualizado ? padrao.tagPreview : (p.tagPreview || padrao.tagPreview),
      preco: atualizarPrecoProvisorio ? padrao.preco : p.preco,
      precoAntigo: atualizarPrecoProvisorio
        ? padrao.precoAntigo
        : p.precoAntigo,
      imagem: padrao.imagem || p.imagem || '',
      galeriaFotos:
        padrao.galeriaFotos && padrao.galeriaFotos.length > 0
          ? padrao.galeriaFotos
          : p.galeriaFotos || [],
      dimensoes: padrao.dimensoes || p.dimensoes || '',
      quantidadeFolhas: padrao.quantidadeFolhas || p.quantidadeFolhas || '',
      detalhesExtras: padrao.detalhesExtras || p.detalhesExtras || '',
    };
  });

  PRODUTOS_PADRAO.forEach((padrao) => {
    const jaExiste = listaMapeada.some((p) => {
      if (p.id === padrao.id) return true;
      if (padrao.id === 1 && p.id === 1) return true;
      if (padrao.id === 11 && p.id === 11) return true;
      return p.nome.toLowerCase() === padrao.nome.toLowerCase();
    });
    if (!jaExiste) {
      listaMapeada.push(padrao);
    }
  });

  return listaMapeada;
}

function lerConfigInicial(): StoreConfig {
  try {
    const salvo = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (salvo) {
      return { ...CONFIG_PADRAO, ...(JSON.parse(salvo) as Partial<StoreConfig>) };
    }
  } catch {
    // fallback silencioso
  }
  if (typeof window !== 'undefined' && window.DADOS_PUBLICADOS_CONFIG) {
    return { ...CONFIG_PADRAO, ...window.DADOS_PUBLICADOS_CONFIG };
  }
  return CONFIG_PADRAO;
}

function lerCategoriasIniciais(): Category[] {
  try {
    if (localStorage.getItem(STORAGE_KEYS.CATALOGO_V2) === 'sim') {
      const salvo = localStorage.getItem(STORAGE_KEYS.CATEGORIAS);
      if (salvo) {
        const lista = JSON.parse(salvo) as Category[];
        if (Array.isArray(lista) && lista.length > 0) return lista;
      }
    }
  } catch {
    // fallback silencioso
  }
  if (
    typeof window !== 'undefined' &&
    Array.isArray(window.DADOS_PUBLICADOS_CATEGORIAS) &&
    window.DADOS_PUBLICADOS_CATEGORIAS.length > 0
  ) {
    return window.DADOS_PUBLICADOS_CATEGORIAS;
  }
  return CATEGORIAS_PADRAO;
}

function lerProdutosIniciais(): Product[] {
  try {
    const versaoOk = localStorage.getItem(STORAGE_KEYS.CATALOGO_V2) === 'sim';
    if (!versaoOk) {
      localStorage.setItem(STORAGE_KEYS.CATALOGO_V2, 'sim');
      localStorage.setItem(
        STORAGE_KEYS.PRODUTOS,
        JSON.stringify(PRODUTOS_PADRAO)
      );
      return PRODUTOS_PADRAO;
    }

    const salvo = localStorage.getItem(STORAGE_KEYS.PRODUTOS);
    if (salvo) {
      const lista = JSON.parse(salvo) as Product[];
      if (Array.isArray(lista) && lista.length > 0) {
        return enriquecerComPadrao(lista);
      }
    }
  } catch {
    // fallback silencioso
  }
  if (
    typeof window !== 'undefined' &&
    Array.isArray(window.DADOS_PUBLICADOS_PRODUTOS) &&
    window.DADOS_PUBLICADOS_PRODUTOS.length > 0
  ) {
    return window.DADOS_PUBLICADOS_PRODUTOS;
  }
  return PRODUTOS_PADRAO;
}

function lerCarrinhoInicial(): CartItem[] {
  try {
    const salvo = localStorage.getItem(STORAGE_KEYS.CARRINHO);
    if (salvo) {
      const lista = JSON.parse(salvo) as CartItem[];
      if (Array.isArray(lista)) return lista;
    }
  } catch {
    // fallback silencioso
  }
  return [];
}

function lerPedidosIniciais(): StoreOrder[] {
  try {
    const salvo = localStorage.getItem(STORAGE_KEYS.PEDIDOS);
    if (salvo) {
      const lista = JSON.parse(salvo) as StoreOrder[];
      if (Array.isArray(lista)) return lista;
    }
  } catch {
    // fallback silencioso
  }
  return [];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<StoreConfig>(lerConfigInicial);
  const [categorias, setCategorias] = useState<Category[]>(lerCategoriasIniciais);
  const [produtos, setProdutos] = useState<Product[]>(lerProdutosIniciais);
  const [carrinho, setCarrinho] = useState<CartItem[]>(lerCarrinhoInicial);
  const [pedidos, setPedidos] = useState<StoreOrder[]>(lerPedidosIniciais);

  // Filtros e ordenação da vitrine
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [ordenacaoAtiva, setOrdenacaoAtiva] = useState<SortOption>('relevancia');

  // Modais e Sacola
  const [produtoEmDetalhes, setProdutoEmDetalhes] = useState<Product | null>(
    null
  );
  const [produtoEmPersonalizacao, setProdutoEmPersonalizacao] =
    useState<Product | null>(null);
  const [carrinhoAberto, setCarrinhoAberto] = useState<boolean>(false);

  // Toast Notification & Badge Feedback
  const [toast, setToast] = useState<ToastState>({ visivel: false, texto: '' });
  const [badgeAnimado, setBadgeAnimado] = useState<boolean>(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fecharNotificacao = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast((prev) => ({ ...prev, visivel: false }));
  }, []);

  const mostrarNotificacao = useCallback((texto: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ visivel: true, texto, acoes: undefined });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visivel: false }));
    }, 3200);
  }, []);

  const mostrarNotificacaoComAcoes = useCallback(
    (
      texto: string,
      acoes?: import('../types/store').ToastAction[],
      duracaoMs = 3500
    ) => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setToast({ visivel: true, texto, acoes });
      toastTimerRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visivel: false }));
      }, duracaoMs);
    },
    []
  );

  // Sincronizar carrinho no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CARRINHO, JSON.stringify(carrinho));
    } catch {
      // ignora erro de quota
    }
  }, [carrinho]);

  // Sincronização inicial com o Supabase
  useEffect(() => {
    let montado = true;
    carregarDadosSupabase()
      .then((resultado) => {
        if (!montado) return;

        const temCatalogoDemonstracaoAntigo = Boolean(
          resultado.produtos?.some(
            (p) =>
              p.nome.includes('Planner Pedagógico / Professor 2027') ||
              p.nome.includes('Kit Festa em Casa Completo') ||
              p.nome.includes('Topo de Bolo Personalizado 3D')
          )
        );
        const bancoVazio =
          !resultado.produtos || resultado.produtos.length === 0;

        if (temCatalogoDemonstracaoAntigo || bancoVazio) {
          setCategorias(CATEGORIAS_PADRAO);
          setProdutos(PRODUTOS_PADRAO);
          try {
            localStorage.setItem(STORAGE_KEYS.CATALOGO_V2, 'sim');
            localStorage.setItem(
              STORAGE_KEYS.CATEGORIAS,
              JSON.stringify(CATEGORIAS_PADRAO)
            );
            localStorage.setItem(
              STORAGE_KEYS.PRODUTOS,
              JSON.stringify(PRODUTOS_PADRAO)
            );
          } catch {
            // ignora erro quota
          }
          sincronizarCatalogoCompletoSupabase(
            CATEGORIAS_PADRAO,
            PRODUTOS_PADRAO
          ).catch((err) => {
            console.warn(
              'Falha ao sincronizar catálogo oficial no Supabase:',
              err
            );
          });
        } else {
          if (resultado.categorias && resultado.categorias.length > 0) {
            setCategorias(resultado.categorias);
            try {
              localStorage.setItem(
                STORAGE_KEYS.CATEGORIAS,
                JSON.stringify(resultado.categorias)
              );
            } catch {
              // ignora erro quota
            }
          }
          if (resultado.produtos && resultado.produtos.length > 0) {
            // Remove do Supabase duplicatas antigas de Agenda A5 e variações obsoletas de reforma de caderno
            resultado.produtos.forEach((prodBanco) => {
              const nomeB = prodBanco.nome.toLowerCase().trim();
              const ehAgendaDuplicada = prodBanco.id !== 1 && nomeB.includes('agenda a5');
              const ehVariacaoServicoCaderno =
                (nomeB.includes('reforma') || nomeB.includes('personaliza')) &&
                nomeB.includes('caderno') &&
                !nomeB.includes('caderneta') &&
                !nomeB.includes('universitário') &&
                !nomeB.includes('pautado');

              if (ehAgendaDuplicada || (ehVariacaoServicoCaderno && prodBanco.id !== 11)) {
                excluirProdutoSupabase(prodBanco.id).catch(() => { });
              }
            });

            const listaEnriquecida = enriquecerComPadrao(resultado.produtos);
            setProdutos(listaEnriquecida);
            listaEnriquecida.forEach((item) => {
              const original = resultado.produtos!.find(
                (p) =>
                  p.id === item.id ||
                  p.nome.toLowerCase() === item.nome.toLowerCase()
              );
              if (
                !original ||
                original.nome !== item.nome ||
                original.imagem !== item.imagem ||
                original.preco !== item.preco ||
                original.precoAntigo !== item.precoAntigo ||
                (item.galeriaFotos &&
                  item.galeriaFotos.length > (original.galeriaFotos?.length || 0))
              ) {
                salvarProdutoSupabase(item, Boolean(original)).catch(() => { });
              }
            });
            try {
              localStorage.setItem(STORAGE_KEYS.CATALOGO_V2, 'sim');
              localStorage.setItem(
                STORAGE_KEYS.PRODUTOS,
                JSON.stringify(listaEnriquecida)
              );
            } catch {
              // ignora erro quota
            }
          }
        }

        if (resultado.config) {
          setConfig(resultado.config);
          try {
            localStorage.setItem(
              STORAGE_KEYS.CONFIG,
              JSON.stringify(resultado.config)
            );
          } catch {
            // ignora erro quota
          }
        }
      })
      .catch((err) => {
        console.warn('Conexão Supabase em espera ou tabelas ainda não criadas:', err);
      });

    // Proteção LGPD: Sincroniza pedidos da nuvem apenas se houver sessão de administrador autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && montado) {
        carregarPedidosSupabase()
          .then((listaPedidos) => {
            if (!montado || !listaPedidos) return;
            setPedidos(listaPedidos);
            try {
              localStorage.setItem(
                STORAGE_KEYS.PEDIDOS,
                JSON.stringify(listaPedidos)
              );
            } catch {
              // ignora erro quota
            }
          })
          .catch(() => {});
      }
    });

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && montado) {
        carregarPedidosSupabase()
          .then((listaPedidos) => {
            if (!montado || !listaPedidos) return;
            setPedidos(listaPedidos);
          })
          .catch(() => {});
      } else if (!session && montado) {
        setPedidos([]);
        try {
          localStorage.removeItem(STORAGE_KEYS.PEDIDOS);
        } catch {
          // ignora
        }
      }
    });

    return () => {
      montado = false;
      authSub.unsubscribe();
    };
  }, []);

  // Sincronização automática entre abas abertas
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CONFIG) setConfig(lerConfigInicial());
      if (e.key === STORAGE_KEYS.CATEGORIAS) setCategorias(lerCategoriasIniciais());
      if (e.key === STORAGE_KEYS.PRODUTOS) setProdutos(lerProdutosIniciais());
      if (e.key === STORAGE_KEYS.CARRINHO) setCarrinho(lerCarrinhoInicial());
      if (e.key === STORAGE_KEYS.PEDIDOS) setPedidos(lerPedidosIniciais());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Ações de Filtro da Loja
  const filtrarPorCategoria = useCallback(
    (catId: string, rolarParaCatalogo = false) => {
      setCategoriaAtiva(catId);
      if (rolarParaCatalogo) {
        const el = document.getElementById('catalogo');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    []
  );

  const limparFiltros = useCallback(() => {
    setCategoriaAtiva('todos');
    setTermoBusca('');
    setOrdenacaoAtiva('relevancia');
  }, []);

  // Ações do Modal e Sacola
  const abrirModalDetalhes = useCallback((produto: Product) => {
    setProdutoEmDetalhes(produto);
  }, []);

  const fecharModalDetalhes = useCallback(() => {
    setProdutoEmDetalhes(null);
  }, []);

  const abrirModalPersonalizacao = useCallback((produto: Product) => {
    setProdutoEmDetalhes(null);
    setProdutoEmPersonalizacao(produto);
  }, []);

  const fecharModalPersonalizacao = useCallback(() => {
    setProdutoEmPersonalizacao(null);
  }, []);

  const abrirCarrinho = useCallback(() => setCarrinhoAberto(true), []);
  const fecharCarrinho = useCallback(() => setCarrinhoAberto(false), []);

  const adicionarAoCarrinho = useCallback(
    (
      produto: Product,
      personalizacao: ProductCustomization,
      quantidade = 1,
      precoUnitarioOverride?: number
    ) => {
      // Define preço unitário: se for botton com tamanho, usa a tabela (32mm: 4.00, 44mm: 6.00, 58mm: 9.00)
      let precoFinal =
        precoUnitarioOverride !== undefined
          ? Number(precoUnitarioOverride)
          : Number(produto.preco);

      const ehBotton =
        produto.categoria === 'bottons' || /botton/i.test(produto.nome);

      if (precoUnitarioOverride === undefined && ehBotton && personalizacao.tamanhoBotton) {
        if (personalizacao.tamanhoBotton.includes('32')) precoFinal = 4.21;
        else if (personalizacao.tamanhoBotton.includes('58')) precoFinal = 9.47;
        else if (personalizacao.tamanhoBotton.includes('44')) precoFinal = 6.32;
      }

      const novoItem: CartItem = {
        uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        id: produto.id,
        nome: produto.nome,
        preco: precoFinal,
        emoji: produto.emoji || '⭐',
        imagem: produto.imagem || '',
        quantidade: Math.max(1, Number(quantidade) || 1),
        personalizacao: {
          nomeCapa: personalizacao.nomeCapa?.trim() || 'A combinar no WhatsApp',
          tema: personalizacao.tema,
          acabamento: personalizacao.acabamento,
          tamanhoBotton: personalizacao.tamanhoBotton,
          arteBottonUrl: personalizacao.arteBottonUrl,
          arteBottonPreview: personalizacao.arteBottonPreview,
        },
      };

      setCarrinho((prev) => [...prev, novoItem]);
      fecharModalPersonalizacao();

      // Micro-animação do badge Meu Pedido
      setBadgeAnimado(true);
      setTimeout(() => setBadgeAnimado(false), 800);

      // Notificação de 3.5s com ações rápidas
      mostrarNotificacaoComAcoes(
        '✅ Adicionado à sacola!',
        [
          {
            texto: 'Continuar Comprando',
            onClick: () => fecharNotificacao(),
            tipo: 'secondary',
          },
          {
            texto: 'Finalizar Pedido',
            onClick: () => {
              fecharNotificacao();
              abrirCarrinho();
            },
            tipo: 'primary',
          },
        ],
        3500
      );
    },
    [
      abrirCarrinho,
      fecharModalPersonalizacao,
      fecharNotificacao,
      mostrarNotificacaoComAcoes,
    ]
  );

  const alterarQuantidadeCarrinho = useCallback((uid: string, delta: number) => {
    setCarrinho((prev) =>
      prev
        .map((item) =>
          item.uid === uid ? { ...item, quantidade: item.quantidade + delta } : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }, []);

  const removerItemCarrinho = useCallback((uid: string) => {
    setCarrinho((prev) => prev.filter((item) => item.uid !== uid));
    mostrarNotificacao('🗑️ Item removido da sacola.');
  }, [mostrarNotificacao]);

  const limparCarrinho = useCallback(() => {
    setCarrinho([]);
  }, []);

  const duvidaRapidaProduto = useCallback(
    (produto: Product) => {
      if (!produto) return;
      const msg = `Olá, Prof. Ataíse (Estrela Criativa)! ⭐ Vim pelo site e gostaria de tirar uma dúvida sobre o produto: *${produto.nome}* (${formatarMoeda(produto.preco)}).`;
      window.open(
        `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}`,
        '_blank'
      );
    },
    [config.whatsapp]
  );

  const finalizarPedidoWhatsApp = useCallback(
    (dadosCliente: CustomerCheckoutData) => {
      if (carrinho.length === 0) {
        mostrarNotificacao('Adicione pelo menos 1 item na sacola antes de enviar!');
        return;
      }

      const pctPix = Number(config.descontoPix ?? 5);
      const nomeCliente = dadosCliente.nome?.trim() || 'Cliente';
      const entrega = dadosCliente.entrega;
      const cepOuCidade = dadosCliente.cep?.trim() || '';
      const pagamento = dadosCliente.pagamento;
      const observacoes = dadosCliente.obs?.trim() || '';

      const ehEntregaLapa =
        entrega.includes('+ R$ 7,00') ||
        entrega.includes('Entrega em Bom Jesus da Lapa');
      const taxaEntrega = ehEntregaLapa ? 7.0 : 0.0;

      const subtotal = carrinho.reduce(
        (acc, item) => acc + item.preco * item.quantidade,
        0
      );
      const temPix = pagamento.includes('PIX');
      const valorDesconto = temPix ? subtotal * (pctPix / 100) : 0;
      const totalFinal = subtotal - valorDesconto + taxaEntrega;

      const url = generateWhatsAppMessage({
        customerName: nomeCliente,
        items: carrinho,
        deliveryType: entrega,
        deliveryFee: taxaEntrega,
        address: cepOuCidade,
        paymentMethod: pagamento,
        subtotal,
        discountPix: valorDesconto,
        total: totalFinal,
        phoneNumber: config.whatsapp || '5561983069120',
      });
      window.open(url, '_blank');

      // Registra automaticamente o pedido no Painel Admin / Supabase
      const dadosNovoPedido: Omit<StoreOrder, 'id' | 'criadoEm'> = {
        clienteNome: nomeCliente,
        entrega,
        cep: cepOuCidade,
        pagamento,
        observacoes,
        subtotal: +subtotal.toFixed(2),
        descontoPix: +valorDesconto.toFixed(2),
        taxaEntrega: +taxaEntrega.toFixed(2),
        total: +totalFinal.toFixed(2),
        status: 'novo',
        itens: carrinho,
      };

      const idTemp = Date.now();
      const pedidoLocal: StoreOrder = {
        ...dadosNovoPedido,
        id: idTemp,
        criadoEm: new Date().toISOString(),
      };

      setPedidos((prev) => {
          const atualizados = [pedidoLocal, ...prev];
          try {
            localStorage.setItem(
              STORAGE_KEYS.PEDIDOS,
              JSON.stringify(atualizados)
            );
          } catch {
            // ignora quota
          }
          return atualizados;
        });

        criarPedidoSupabase(dadosNovoPedido)
          .then((pedidoSalvo) => {
            setPedidos((prev) => {
              const sincronizados = prev.map((p) =>
                p.id === idTemp ? pedidoSalvo : p
              );
              try {
                localStorage.setItem(
                  STORAGE_KEYS.PEDIDOS,
                  JSON.stringify(sincronizados)
                );
              } catch {
                // ignora quota
              }
              return sincronizados;
            });
          })
          .catch((err) => {
            console.warn(
              'Pedido salvo localmente (tabela pedidos ainda não criada no Supabase):',
              err
            );
          });
      },
        [carrinho, config.descontoPix, config.whatsapp, mostrarNotificacao]
      );

      // ========================================================================
      // AÇÕES DO PAINEL ADMINISTRATIVO (CRUD PRODUTOS, CATEGORIAS E CONFIG)
      // ========================================================================

      const salvarProduto = useCallback(
        (formProd: ProductFormInput) => {
          const objCat = categorias.find((c) => c.id === formProd.categoria);
          const preco = parseFloat(String(formProd.preco)) || 0;
          const precoAntigoInput = parseFloat(String(formProd.precoAntigo)) || 0;
          const editando = Boolean(formProd.id);

          const dadosProduto: Product = {
            id: editando ? Number(formProd.id) : Date.now(),
            nome: formProd.nome.trim(),
            categoria: formProd.categoria,
            categoriaLabel: objCat ? objCat.nome : 'Personalizados',
            precoAntigo:
              precoAntigoInput > preco ? precoAntigoInput : +(preco * 1.15).toFixed(2),
            preco,
            descricao: formProd.descricao.trim(),
            emoji: formProd.emoji || '📔',
            imagem: formProd.imagem || '',
            corFundo:
              formProd.corFundo || 'linear-gradient(135deg, #f3ebff, #e2d1ff)',
            destaque: formProd.destaque?.trim() || 'Personalizável',
            tagPreview: formProd.tagPreview?.trim() || 'Com seu nome na Capa',
            permiteNome: true,
            detalhesExtras: formProd.detalhesExtras?.trim() || '',
            dimensoes: formProd.dimensoes?.trim() || '',
            quantidadeFolhas: formProd.quantidadeFolhas?.trim() || '',
            galeriaFotos: Array.isArray(formProd.galeriaFotos)
              ? formProd.galeriaFotos.filter(Boolean)
              : [],
          };

          setProdutos((prev) => {
            const novaLista = editando
              ? prev.map((p) => (Number(p.id) === Number(formProd.id) ? dadosProduto : p))
              : [dadosProduto, ...prev];
            localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(novaLista));
            return novaLista;
          });

          // Sincroniza com o Supabase em segundo plano
          salvarProdutoSupabase(dadosProduto, editando)
            .then((prodSalvo) => {
              if (!editando && prodSalvo) {
                setProdutos((prev) => {
                  const listaAtualizada = prev.map((p) =>
                    p.id === dadosProduto.id ? prodSalvo : p
                  );
                  try {
                    localStorage.setItem(
                      STORAGE_KEYS.PRODUTOS,
                      JSON.stringify(listaAtualizada)
                    );
                  } catch {
                    // ignora erro quota
                  }
                  return listaAtualizada;
                });
              }
            })
            .catch((err) => {
              console.warn('Falha ao sincronizar produto no Supabase:', err);
            });

          mostrarNotificacao(
            editando
              ? '✅ Produto atualizado com sucesso!'
              : '⭐ Novo produto incluído no catálogo!'
          );
        },
        [categorias, mostrarNotificacao]
      );

      const excluirProduto = useCallback(
        (id: number) => {
          setProdutos((prev) => {
            const prodParaExcluir = prev.find((p) => Number(p.id) === Number(id));
            if (prodParaExcluir?.imagem) {
              excluirImagemProdutoSupabase(prodParaExcluir.imagem).catch(() => { });
            }
            if (prodParaExcluir?.galeriaFotos?.length) {
              prodParaExcluir.galeriaFotos.forEach((fotoUrl) => {
                excluirImagemProdutoSupabase(fotoUrl).catch(() => { });
              });
            }
            const novaLista = prev.filter((p) => Number(p.id) !== Number(id));
            localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(novaLista));
            return novaLista;
          });
          excluirProdutoSupabase(id).catch((err) => {
            console.warn('Falha ao excluir produto no Supabase:', err);
          });
          mostrarNotificacao('🗑️ Produto removido do catálogo.');
        },
        [mostrarNotificacao]
      );

      const restaurarProdutosPadrao = useCallback(() => {
        setCategorias(CATEGORIAS_PADRAO);
        setProdutos(PRODUTOS_PADRAO);
        try {
          localStorage.setItem(STORAGE_KEYS.CATALOGO_V2, 'sim');
          localStorage.setItem(
            STORAGE_KEYS.CATEGORIAS,
            JSON.stringify(CATEGORIAS_PADRAO)
          );
          localStorage.setItem(
            STORAGE_KEYS.PRODUTOS,
            JSON.stringify(PRODUTOS_PADRAO)
          );
        } catch {
          // ignora erro quota
        }
        sincronizarCatalogoCompletoSupabase(
          CATEGORIAS_PADRAO,
          PRODUTOS_PADRAO
        ).catch((err) => {
          console.warn('Falha ao restaurar produtos padrão no Supabase:', err);
        });
        mostrarNotificacao('🔄 Catálogo oficial de 8 produtos restaurado!');
      }, [mostrarNotificacao]);

      const salvarCategoria = useCallback(
        (formCat: CategoryFormInput) => {
          const editando = Boolean(formCat.id);
          const nome = formCat.nome.trim();
          const nomeCurto = formCat.nomeCurto?.trim() || nome;
          const subtitulo = formCat.subtitulo?.trim() || '';
          const icone = formCat.icone?.trim() || '✨';

          setCategorias((prev) => {
            let novaLista: Category[];
            let catCriadaOuEditada: Category;
            if (editando && formCat.id) {
              catCriadaOuEditada = { id: formCat.id, nome, nomeCurto, subtitulo, icone };
              novaLista = prev.map((c) =>
                c.id === formCat.id ? catCriadaOuEditada : c
              );
            } else {
              const novoId = gerarIdCategoria(nome);
              catCriadaOuEditada = { id: novoId, nome, nomeCurto, subtitulo, icone };
              novaLista = [...prev, catCriadaOuEditada];
            }
            localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(novaLista));

            salvarCategoriaSupabase(catCriadaOuEditada).catch((err) => {
              console.warn('Falha ao salvar categoria no Supabase:', err);
            });

            return novaLista;
          });

          mostrarNotificacao(
            editando
              ? '✅ Categoria atualizada com sucesso!'
              : '🌟 Nova categoria criada com sucesso!'
          );
        },
        [mostrarNotificacao]
      );

      const excluirCategoria = useCallback(
        (catId: string): boolean => {
          if (categorias.length <= 1) {
            mostrarNotificacao(
              '⚠️ A loja precisa manter pelo menos 1 categoria ativa.'
            );
            return false;
          }
          setCategorias((prev) => {
            const novaLista = prev.filter((c) => c.id !== catId);
            localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(novaLista));
            return novaLista;
          });
          excluirCategoriaSupabase(catId).catch((err) => {
            console.warn('Falha ao excluir categoria no Supabase:', err);
          });
          if (categoriaAtiva === catId) {
            setCategoriaAtiva('todos');
          }
          mostrarNotificacao('🗑️ Categoria excluída.');
          return true;
        },
        [categoriaAtiva, categorias.length, mostrarNotificacao]
      );

      const restaurarCategoriasPadrao = useCallback(() => {
        localStorage.removeItem(STORAGE_KEYS.CATEGORIAS);
        setCategorias(CATEGORIAS_PADRAO);
        sincronizarListaCategoriasSupabase(CATEGORIAS_PADRAO).catch((err) => {
          console.warn('Falha ao restaurar categorias padrão no Supabase:', err);
        });
        mostrarNotificacao('🔄 Categorias originais restauradas!');
      }, [mostrarNotificacao]);

      const salvarConfigLoja = useCallback(
        (parcialConfig: Partial<StoreConfig>) => {
          const whatsappLimpo =
            String(parcialConfig.whatsapp || '').replace(/\D/g, '') ||
            CONFIG_PADRAO.whatsapp;
          const descontoPix = Math.max(
            0,
            Math.min(50, Number(parcialConfig.descontoPix ?? config.descontoPix ?? 5))
          );
          const instagramLimpo =
            String(parcialConfig.instagram ?? config.instagram ?? '')
              .replace(/^@/, '')
              .trim() || CONFIG_PADRAO.instagram;

          const novaConfig: StoreConfig = {
            ...config,
            ...parcialConfig,
            whatsapp: whatsappLimpo,
            whatsappExibicao:
              parcialConfig.whatsappExibicao?.trim() ||
              formatarWhatsappExibicao(whatsappLimpo),
            instagram: instagramLimpo,
            descontoPix,
            avisoTopo: parcialConfig.avisoTopo?.trim() || CONFIG_PADRAO.avisoTopo,
          };

          localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(novaConfig));
          setConfig(novaConfig);
          salvarConfigSupabase(novaConfig).catch((err) => {
            console.warn('Falha ao sincronizar configurações no Supabase:', err);
          });
          mostrarNotificacao('⚙️ Configurações da loja salvas com sucesso!');
        },
        [config, mostrarNotificacao]
      );

      const exportarDadosLojaJs = useCallback(() => {
        const configPublica: Partial<StoreConfig> = { ...config };

        const conteudo =
          '// Dados exportados pelo Painel Administrativo da Estrela Criativa\n' +
          'window.DADOS_PUBLICADOS_CONFIG = ' +
          JSON.stringify(configPublica, null, 2) +
          ';\n' +
          'window.DADOS_PUBLICADOS_CATEGORIAS = ' +
          JSON.stringify(categorias, null, 2) +
          ';\n' +
          'window.DADOS_PUBLICADOS_PRODUTOS = ' +
          JSON.stringify(produtos, null, 2) +
          ';\n';

        const blob = new Blob([conteudo], {
          type: 'application/javascript;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dados-loja.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        mostrarNotificacao(
          "🌐 Arquivo 'dados-loja.js' gerado! Coloque na pasta public/ antes de publicar."
        );
      }, [categorias, config, mostrarNotificacao, produtos]);

      const exportarBackupJson = useCallback(() => {
        const backup: StoreBackupData = {
          exportadoEm: new Date().toISOString(),
          config,
          categorias,
          produtos,
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], {
          type: 'application/json;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup-estrela-criativa.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        mostrarNotificacao('📦 Backup JSON baixado com sucesso!');
      }, [categorias, config, mostrarNotificacao, produtos]);

      const importarBackupJson = useCallback(
        (dados: StoreBackupData) => {
          if (!dados || typeof dados !== 'object') {
            mostrarNotificacao('❌ Arquivo de backup inválido.');
            return;
          }
          if (dados.config) {
            const cfg: StoreConfig = { ...CONFIG_PADRAO, ...dados.config };
            localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(cfg));
            setConfig(cfg);
            salvarConfigSupabase(cfg).catch((err) => {
              console.warn('Falha ao importar configurações no Supabase:', err);
            });
          }
          if (Array.isArray(dados.categorias) && dados.categorias.length > 0) {
            localStorage.setItem(
              STORAGE_KEYS.CATEGORIAS,
              JSON.stringify(dados.categorias)
            );
            setCategorias(dados.categorias);
            sincronizarListaCategoriasSupabase(dados.categorias).catch((err) => {
              console.warn('Falha ao importar categorias no Supabase:', err);
            });
          }
          if (Array.isArray(dados.produtos) && dados.produtos.length > 0) {
            localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(dados.produtos));
            setProdutos(dados.produtos);
            sincronizarListaProdutosSupabase(dados.produtos).catch((err) => {
              console.warn('Falha ao importar produtos no Supabase:', err);
            });
          }
          mostrarNotificacao('✅ Backup importado e aplicado com sucesso!');
        },
        [mostrarNotificacao]
      );

      // ========================================================================
      // GERENCIAMENTO DE PEDIDOS & ARTES GERADAS NO PAINEL ADMIN
      // ========================================================================

      const recarregarPedidos = useCallback(async () => {
        const lista = await carregarPedidosSupabase();
        if (lista) {
          setPedidos(lista);
          try {
            localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(lista));
          } catch {
            // ignora quota
          }
          mostrarNotificacao('🔄 Lista de pedidos sincronizada com a nuvem!');
        } else {
          mostrarNotificacao(
            '⚠️ Tabela "pedidos" ainda não encontrada no Supabase (exibindo dados locais).'
          );
        }
      }, [mostrarNotificacao]);

      const atualizarStatusPedido = useCallback(
        (id: number, status: OrderStatus) => {
          setPedidos((prev) => {
            const novaLista = prev.map((p) =>
              p.id === id ? { ...p, status } : p
            );
            try {
              localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(novaLista));
            } catch {
              // ignora quota
            }
            return novaLista;
          });
          atualizarStatusPedidoSupabase(id, status).catch((err) => {
            console.warn('Falha ao atualizar status do pedido no Supabase:', err);
          });
          mostrarNotificacao('✅ Status do pedido atualizado!');
        },
        [mostrarNotificacao]
      );

      const excluirPedido = useCallback(
        (id: number) => {
          setPedidos((prev) => {
            const pedidoAlvo = prev.find((p) => p.id === id);
            if (pedidoAlvo) {
              pedidoAlvo.itens.forEach((item) => {
                if (item.personalizacao.arteBottonUrl) {
                  excluirImagemProdutoSupabase(
                    item.personalizacao.arteBottonUrl
                  ).catch(() => { });
                }
              });
            }
            const novaLista = prev.filter((p) => p.id !== id);
            try {
              localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(novaLista));
            } catch {
              // ignora quota
            }
            return novaLista;
          });
          excluirPedidoSupabase(id).catch((err) => {
            console.warn('Falha ao excluir pedido no Supabase:', err);
          });
          mostrarNotificacao('🗑️ Pedido removido.');
        },
        [mostrarNotificacao]
      );

      const salvarArteAvulsaEmPedidos = useCallback(
        async (dados: {
          clienteNome: string;
          tamanhoBotton: string;
          quantidade: number;
          arteBottonUrl: string;
          observacoes?: string;
        }) => {
          const itemArte: CartItem = {
            uid: `studio-${Date.now()}`,
            id: 0,
            nome: `Botton Personalizado (${dados.tamanhoBotton})`,
            preco: 0,
            emoji: '🎖️',
            imagem: dados.arteBottonUrl,
            quantidade: Math.max(1, dados.quantidade || 1),
            personalizacao: {
              nomeCapa: dados.observacoes?.trim() || 'Gerado no Estúdio Admin',
              tema: 'Arte Circular Pronta p/ Produção',
              acabamento: 'Película Protetora Brilho Fotográfico',
              tamanhoBotton: dados.tamanhoBotton,
              arteBottonUrl: dados.arteBottonUrl,
            },
          };

          const dadosNovoPedido: Omit<StoreOrder, 'id' | 'criadoEm'> = {
            clienteNome: dados.clienteNome.trim() || 'Arte Avulsa (Estúdio)',
            entrega: 'Produção Interna',
            cep: '',
            pagamento: 'A combinar',
            observacoes: dados.observacoes?.trim() || '',
            subtotal: 0,
            descontoPix: 0,
            total: 0,
            status: 'novo',
            itens: [itemArte],
          };

          const idTemp = Date.now();
          const pedidoLocal: StoreOrder = {
            ...dadosNovoPedido,
            id: idTemp,
            criadoEm: new Date().toISOString(),
          };

          setPedidos((prev) => {
            const novaLista = [pedidoLocal, ...prev];
            try {
              localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(novaLista));
            } catch {
              // ignora quota
            }
            return novaLista;
          });

          try {
            const salvoNuvem = await criarPedidoSupabase(dadosNovoPedido);
            setPedidos((prev) => {
              const sincronizados = prev.map((p) =>
                p.id === idTemp ? salvoNuvem : p
              );
              try {
                localStorage.setItem(
                  STORAGE_KEYS.PEDIDOS,
                  JSON.stringify(sincronizados)
                );
              } catch {
                // ignora quota
              }
              return sincronizados;
            });
          } catch (err) {
            console.warn('Arte salva localmente na aba Pedidos:', err);
          }
        },
        []
      );

      const value: StoreContextValue = {
        config,
        categorias,
        produtos,
        carrinho,
        pedidos,
        categoriaAtiva,
        termoBusca,
        setTermoBusca,
        ordenacaoAtiva,
        setOrdenacaoAtiva,
        filtrarPorCategoria,
        limparFiltros,
        produtoEmDetalhes,
        abrirModalDetalhes,
        fecharModalDetalhes,
        produtoEmPersonalizacao,
        abrirModalPersonalizacao,
        fecharModalPersonalizacao,
        carrinhoAberto,
        abrirCarrinho,
        fecharCarrinho,
        adicionarAoCarrinho,
        alterarQuantidadeCarrinho,
        removerItemCarrinho,
        limparCarrinho,
        duvidaRapidaProduto,
        finalizarPedidoWhatsApp,
        salvarProduto,
        excluirProduto,
        restaurarProdutosPadrao,
        salvarCategoria,
        excluirCategoria,
        restaurarCategoriasPadrao,
        salvarConfigLoja,
        exportarDadosLojaJs,
        exportarBackupJson,
        importarBackupJson,
        recarregarPedidos,
        atualizarStatusPedido,
        excluirPedido,
        salvarArteAvulsaEmPedidos,
        toast,
        mostrarNotificacao,
        mostrarNotificacaoComAcoes,
        fecharNotificacao,
        badgeAnimado,
      };

      return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
    }

export function useStore(): StoreContextValue {
    const ctx = useContext(StoreContext);
    if (!ctx) {
      throw new Error('useStore deve ser usado dentro de um StoreProvider');
    }
    return ctx;
  }

