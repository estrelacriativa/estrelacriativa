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
  formatarMoeda,
  formatarWhatsappExibicao,
  gerarIdCategoria,
} from '../utils/formatters';
import type {
  StoreConfig,
  Category,
  CategoryFormInput,
  Product,
  ProductFormInput,
  ProductCustomization,
  CartItem,
  CustomerCheckoutData,
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

  // Filtros
  categoriaAtiva: string;
  termoBusca: string;
  setTermoBusca: (termo: string) => void;
  ordenacaoAtiva: SortOption;
  setOrdenacaoAtiva: (ordem: SortOption) => void;
  filtrarPorCategoria: (catId: string, rolarParaCatalogo?: boolean) => void;
  limparFiltros: () => void;

  // Modal e Carrinho
  produtoEmPersonalizacao: Product | null;
  abrirModalPersonalizacao: (produto: Product) => void;
  fecharModalPersonalizacao: () => void;
  carrinhoAberto: boolean;
  abrirCarrinho: () => void;
  fecharCarrinho: () => void;
  adicionarAoCarrinho: (
    produto: Product,
    personalizacao: ProductCustomization,
    quantidade?: number
  ) => void;
  alterarQuantidadeCarrinho: (uid: string, delta: number) => void;
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

  // Toast
  toast: ToastState;
  mostrarNotificacao: (texto: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEYS = {
  CONFIG: 'estrelaCriativaConfigAdmin',
  CATEGORIAS: 'estrelaCriativaCategoriasAdmin',
  PRODUTOS: 'estrelaCriativaProdutosAdmin',
  CARRINHO: 'estrelaCriativaCarrinho',
} as const;

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
    const salvo = localStorage.getItem(STORAGE_KEYS.CATEGORIAS);
    if (salvo) {
      const lista = JSON.parse(salvo) as Category[];
      if (Array.isArray(lista) && lista.length > 0) return lista;
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
    const salvo = localStorage.getItem(STORAGE_KEYS.PRODUTOS);
    if (salvo) {
      const lista = JSON.parse(salvo) as Product[];
      if (Array.isArray(lista) && lista.length > 0) return lista;
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<StoreConfig>(lerConfigInicial);
  const [categorias, setCategorias] = useState<Category[]>(lerCategoriasIniciais);
  const [produtos, setProdutos] = useState<Product[]>(lerProdutosIniciais);
  const [carrinho, setCarrinho] = useState<CartItem[]>(lerCarrinhoInicial);

  // Filtros e ordenação da vitrine
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [ordenacaoAtiva, setOrdenacaoAtiva] = useState<SortOption>('relevancia');

  // Modais e Sacola
  const [produtoEmPersonalizacao, setProdutoEmPersonalizacao] =
    useState<Product | null>(null);
  const [carrinhoAberto, setCarrinhoAberto] = useState<boolean>(false);

  // Toast Notification
  const [toast, setToast] = useState<ToastState>({ visivel: false, texto: '' });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrarNotificacao = useCallback((texto: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ visivel: true, texto });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visivel: false }));
    }, 3200);
  }, []);

  // Sincronizar carrinho no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CARRINHO, JSON.stringify(carrinho));
    } catch {
      // ignora erro de quota
    }
  }, [carrinho]);

  // Sincronização automática entre abas abertas
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.CONFIG) setConfig(lerConfigInicial());
      if (e.key === STORAGE_KEYS.CATEGORIAS) setCategorias(lerCategoriasIniciais());
      if (e.key === STORAGE_KEYS.PRODUTOS) setProdutos(lerProdutosIniciais());
      if (e.key === STORAGE_KEYS.CARRINHO) setCarrinho(lerCarrinhoInicial());
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
  const abrirModalPersonalizacao = useCallback((produto: Product) => {
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
      quantidade = 1
    ) => {
      const novoItem: CartItem = {
        uid: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        id: produto.id,
        nome: produto.nome,
        preco: Number(produto.preco),
        emoji: produto.emoji || '⭐',
        imagem: produto.imagem || '',
        quantidade: Math.max(1, Number(quantidade) || 1),
        personalizacao: {
          nomeCapa: personalizacao.nomeCapa?.trim() || 'A combinar no WhatsApp',
          tema: personalizacao.tema,
          acabamento: personalizacao.acabamento,
        },
      };

      setCarrinho((prev) => [...prev, novoItem]);
      fecharModalPersonalizacao();
      mostrarNotificacao('⭐ Produto personalizado adicionado à sua sacola!');
      abrirCarrinho();
    },
    [abrirCarrinho, fecharModalPersonalizacao, mostrarNotificacao]
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

      const subtotal = carrinho.reduce(
        (acc, item) => acc + item.preco * item.quantidade,
        0
      );
      const temPix = pagamento.includes('PIX');
      const valorDesconto = temPix ? subtotal * (pctPix / 100) : 0;
      const totalFinal = subtotal - valorDesconto;

      let mensagem = `⭐ *OLÁ, PROF. ATAÍSE (ESTRELA CRIATIVA)! GOSTARIA DE FAZER UM PEDIDO:* ⭐\n\n`;
      mensagem += `👤 *Cliente:* ${nomeCliente}\n`;
      mensagem += `──────────────────────\n`;
      mensagem += `🛍️ *ITENS DO PEDIDO:*\n\n`;

      carrinho.forEach((item, idx) => {
        mensagem += `*${idx + 1}. ${item.quantidade}x ${item.nome}*\n`;
        mensagem += `   • Nome/Texto: ${item.personalizacao.nomeCapa}\n`;
        mensagem += `   • Tema/Cor: ${item.personalizacao.tema}\n`;
        mensagem += `   • Acabamento: ${item.personalizacao.acabamento}\n`;
        mensagem += `   • Subtotal item: ${formatarMoeda(
          item.preco * item.quantidade
        )}\n\n`;
      });

      mensagem += `──────────────────────\n`;
      mensagem += `💰 *Subtotal:* ${formatarMoeda(subtotal)}\n`;
      if (temPix && pctPix > 0) {
        mensagem += `🏷️ *Desconto PIX (${pctPix}%):* -${formatarMoeda(
          valorDesconto
        )}\n`;
      }
      mensagem += `🌟 *Valor Total Estimado:* *${formatarMoeda(totalFinal)}*\n\n`;
      mensagem += `🚚 *Entrega:* ${entrega}${
        cepOuCidade ? ` (${cepOuCidade})` : ''
      }\n`;
      mensagem += `💳 *Forma de Pagamento:* ${pagamento}\n`;

      if (observacoes) {
        mensagem += `📝 *Observações:* ${observacoes}\n`;
      }

      mensagem += `\nAguardo o retorno para combinarmos a arte! 💜✨`;

      const url = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
        mensagem
      )}`;
      window.open(url, '_blank');
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
      };

      setProdutos((prev) => {
        const novaLista = editando
          ? prev.map((p) => (Number(p.id) === Number(formProd.id) ? dadosProduto : p))
          : [dadosProduto, ...prev];
        localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(novaLista));
        return novaLista;
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
        const novaLista = prev.filter((p) => Number(p.id) !== Number(id));
        localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(novaLista));
        return novaLista;
      });
      mostrarNotificacao('🗑️ Produto removido do catálogo.');
    },
    [mostrarNotificacao]
  );

  const restaurarProdutosPadrao = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.PRODUTOS);
    setProdutos(PRODUTOS_PADRAO);
    mostrarNotificacao('🔄 Catálogo original de 12 produtos restaurado!');
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
        if (editando && formCat.id) {
          novaLista = prev.map((c) =>
            c.id === formCat.id
              ? { id: formCat.id, nome, nomeCurto, subtitulo, icone }
              : c
          );
        } else {
          const novoId = gerarIdCategoria(nome);
          novaLista = [...prev, { id: novoId, nome, nomeCurto, subtitulo, icone }];
        }
        localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(novaLista));
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
        senhaAdmin:
          parcialConfig.senhaAdmin?.trim() ||
          config.senhaAdmin ||
          CONFIG_PADRAO.senhaAdmin,
      };

      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(novaConfig));
      setConfig(novaConfig);
      mostrarNotificacao('⚙️ Configurações da loja salvas com sucesso!');
    },
    [config, mostrarNotificacao]
  );

  const exportarDadosLojaJs = useCallback(() => {
    const configPublica: Partial<StoreConfig> = { ...config };
    delete configPublica.senhaAdmin;

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
      }
      if (Array.isArray(dados.categorias) && dados.categorias.length > 0) {
        localStorage.setItem(
          STORAGE_KEYS.CATEGORIAS,
          JSON.stringify(dados.categorias)
        );
        setCategorias(dados.categorias);
      }
      if (Array.isArray(dados.produtos) && dados.produtos.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(dados.produtos));
        setProdutos(dados.produtos);
      }
      mostrarNotificacao('✅ Backup importado e aplicado com sucesso!');
    },
    [mostrarNotificacao]
  );

  const value: StoreContextValue = {
    config,
    categorias,
    produtos,
    carrinho,
    categoriaAtiva,
    termoBusca,
    setTermoBusca,
    ordenacaoAtiva,
    setOrdenacaoAtiva,
    filtrarPorCategoria,
    limparFiltros,
    produtoEmPersonalizacao,
    abrirModalPersonalizacao,
    fecharModalPersonalizacao,
    carrinhoAberto,
    abrirCarrinho,
    fecharCarrinho,
    adicionarAoCarrinho,
    alterarQuantidadeCarrinho,
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
    toast,
    mostrarNotificacao,
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
