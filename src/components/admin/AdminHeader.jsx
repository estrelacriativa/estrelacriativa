import { Link } from 'react-router-dom';

const ABAS_ADMIN = [
  { id: 'visao-geral', label: '📊 Visão Completa' },
  { id: 'produtos', label: '📦 Produtos' },
  { id: 'categorias', label: '🗂️ Categorias' },
  { id: 'configuracoes', label: '⚙️ Configurações & Backup' },
];

export default function AdminHeader({
  abaAtiva,
  onSelecionarAba,
  onNovoProduto,
  onLogout,
}) {
  return (
    <header className="admin-header">
      <div className="container admin-header-content">
        <div className="brand-logo" onClick={() => onSelecionarAba('visao-geral')}>
          <img
            src="/logo-icon.png"
            alt="Estrela Criativa"
            className="logo-img-header"
            style={{ height: '54px' }}
          />
          <div className="brand-text">
            <span className="brand-name" style={{ fontSize: '1.35rem' }}>
              Painel <span>Administrativo</span>
            </span>
            <span className="brand-tagline">Estrela Criativa • Prof. Ataíse</span>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '9px 16px', fontSize: '0.85rem' }}
            onClick={onNovoProduto}
          >
            ➕ Novo Produto
          </button>
          <Link
            to="/"
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '0.85rem' }}
          >
            👁️ Ver Loja Online
          </Link>
          <button type="button" className="btn-logout" onClick={onLogout}>
            Sair
          </button>
        </div>
      </div>

      {/* Barra de Abas do Admin */}
      <div className="admin-tabs-bar">
        <div className="container">
          <nav className="admin-tabs-list" aria-label="Seções do painel administrativo">
            {ABAS_ADMIN.map((aba) => (
              <button
                key={aba.id}
                type="button"
                className={`admin-tab-btn ${abaAtiva === aba.id ? 'active' : ''}`}
                onClick={() => onSelecionarAba(aba.id)}
              >
                {aba.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

