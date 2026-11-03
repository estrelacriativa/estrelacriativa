import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import AdminLogin from '../components/admin/AdminLogin';
import AdminHeader from '../components/admin/AdminHeader';
import AdminStats from '../components/admin/AdminStats';
import AdminProductForm from '../components/admin/AdminProductForm';
import AdminProductList from '../components/admin/AdminProductList';
import AdminCategoryManager from '../components/admin/AdminCategoryManager';
import AdminSettings from '../components/admin/AdminSettings';
import AdminBottonStudio from '../components/admin/AdminBottonStudio';
import AdminOrders from '../components/admin/AdminOrders';
import type { AdminTab, Product, StudioBottonPreset } from '../types/store';

export default function AdminPage() {
  const [logado, setLogado] = useState<boolean>(false);
  const [carregandoSessao, setCarregandoSessao] = useState<boolean>(true);
  const [abaAtiva, setAbaAtiva] = useState<AdminTab>('visao-geral');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [produtoEditando, setProdutoEditando] = useState<Product | null>(null);
  const [presetEstudioBotton, setPresetEstudioBotton] =
    useState<StudioBottonPreset | null>(null);
  const formCardRef = useRef<HTMLDivElement>(null);

  const ADMIN_EMAIL_OFICIAL = 'ataiseevangelista@gmail.com';

  useEffect(() => {
    document.title =
      'Painel Administrativo | Estrela Criativa — Prof. Ataíse';

    const validarSessaoAdmin = (session: unknown) => {
      const sess = session as { user?: { email?: string } } | null;
      const email = sess?.user?.email?.toLowerCase().trim();
      if (sess && email === ADMIN_EMAIL_OFICIAL) {
        setLogado(true);
      } else {
        if (sess && email && email !== ADMIN_EMAIL_OFICIAL) {
          supabase.auth.signOut().catch(() => {});
        }
        setLogado(false);
      }
      setCarregandoSessao(false);
    };

    // 1. Verifica se já existe sessão ativa e válida no Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      validarSessaoAdmin(session);
    });

    // 2. Escuta mudanças na autenticação (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      validarSessaoAdmin(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // continua limpeza local
    }
    setLogado(false);
  };

  const handleNovoProduto = () => {
    setProdutoEditando(null);
    if (abaAtiva !== 'visao-geral' && abaAtiva !== 'produtos') {
      setAbaAtiva('produtos');
    }
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleEditarProduto = (produto: Product) => {
    setProdutoEditando(produto);
    if (abaAtiva !== 'visao-geral' && abaAtiva !== 'produtos') {
      setAbaAtiva('produtos');
    }
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleFiltrarPorCardStats = (catId: string) => {
    setFiltroCategoria(catId);
    if (
      abaAtiva === 'categorias' ||
      abaAtiva === 'configuracoes' ||
      abaAtiva === 'bottons' ||
      abaAtiva === 'pedidos'
    ) {
      setAbaAtiva('produtos');
    }
  };

  if (carregandoSessao) {
    return (
      <div
        className="admin-page-bg"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <div style={{ textAlign: 'center', color: 'var(--lilac-dark)' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              border: '4px solid var(--lilac-light)',
              borderTopColor: 'var(--lilac-primary)',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            🔒 Verificando sessão segura...
          </p>
        </div>
      </div>
    );
  }

  if (!logado) {
    return (
      <div className="admin-page-bg">
        <AdminLogin onLoginSuccess={() => setLogado(true)} />
      </div>
    );
  }

  return (
    <div className="admin-page-bg admin-wrapper">
      <AdminHeader
        abaAtiva={abaAtiva}
        onSelecionarAba={setAbaAtiva}
        onNovoProduto={handleNovoProduto}
        onLogout={handleLogout}
      />

      <div className="container">
        <AdminStats
          filtroCategoria={filtroCategoria}
          onFiltrarCategoria={handleFiltrarPorCardStats}
        />

        {abaAtiva === 'visao-geral' && (
          <div className="admin-main-grid">
            <AdminProductForm
              produtoEditando={produtoEditando}
              onFinalizarEdicao={() => setProdutoEditando(null)}
              formCardRef={formCardRef}
            />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <AdminCategoryManager />
              <AdminProductList
                filtroCategoria={filtroCategoria}
                onMudarFiltroCategoria={setFiltroCategoria}
                produtoEditandoId={produtoEditando?.id}
                onEditarProduto={handleEditarProduto}
              />
              <AdminSettings />
            </div>
          </div>
        )}

        {abaAtiva === 'produtos' && (
          <div className="admin-main-grid">
            <AdminProductForm
              produtoEditando={produtoEditando}
              onFinalizarEdicao={() => setProdutoEditando(null)}
              formCardRef={formCardRef}
            />

            <AdminProductList
              filtroCategoria={filtroCategoria}
              onMudarFiltroCategoria={setFiltroCategoria}
              produtoEditandoId={produtoEditando?.id}
              onEditarProduto={handleEditarProduto}
            />
          </div>
        )}

        {abaAtiva === 'pedidos' && (
          <AdminOrders
            onAbrirNoEstudioBotton={(preset) => {
              setPresetEstudioBotton(preset);
              setAbaAtiva('bottons');
            }}
          />
        )}

        {abaAtiva === 'bottons' && (
          <AdminBottonStudio
            presetPedido={presetEstudioBotton}
            onLimparPreset={() => setPresetEstudioBotton(null)}
            onIrParaPedidos={() => setAbaAtiva('pedidos')}
          />
        )}

        {abaAtiva === 'categorias' && (
          <div className="admin-single-col">
            <AdminCategoryManager />
          </div>
        )}

        {abaAtiva === 'configuracoes' && (
          <div className="admin-single-col">
            <AdminSettings />
          </div>
        )}
      </div>
    </div>
  );
}
