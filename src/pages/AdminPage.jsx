import { useState, useEffect, useRef } from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import AdminHeader from '../components/admin/AdminHeader';
import AdminStats from '../components/admin/AdminStats';
import AdminProductForm from '../components/admin/AdminProductForm';
import AdminProductList from '../components/admin/AdminProductList';
import AdminCategoryManager from '../components/admin/AdminCategoryManager';
import AdminSettings from '../components/admin/AdminSettings';

export default function AdminPage() {
  const [logado, setLogado] = useState(
    () => sessionStorage.getItem('estrelaAdminLogado') === 'sim'
  );
  const [abaAtiva, setAbaAtiva] = useState('visao-geral');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [produtoEditando, setProdutoEditando] = useState(null);
  const formCardRef = useRef(null);

  useEffect(() => {
    document.title = 'Painel Administrativo | Estrela Criativa — Prof. Ataíse';
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('estrelaAdminLogado');
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

  const handleEditarProduto = (produto) => {
    setProdutoEditando(produto);
    if (abaAtiva !== 'visao-geral' && abaAtiva !== 'produtos') {
      setAbaAtiva('produtos');
    }
    setTimeout(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleFiltrarPorCardStats = (catId) => {
    setFiltroCategoria(catId);
    if (abaAtiva === 'categorias' || abaAtiva === 'configuracoes') {
      setAbaAtiva('produtos');
    }
  };

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

