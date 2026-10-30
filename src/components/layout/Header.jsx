import { useStore } from '../../context/StoreContext';

export default function Header() {
  const {
    config,
    categorias,
    categoriaAtiva,
    termoBusca,
    setTermoBusca,
    filtrarPorCategoria,
    limparFiltros,
    carrinho,
    abrirCarrinho,
  } = useStore();

  const totalItensSacola = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  const handleLogoClick = (e) => {
    e.preventDefault();
    limparFiltros();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="header">
      <div className="container header-main">
        {/* Logotipo Oficial Estrela Criativa */}
        <a href="#topo" className="brand-logo" onClick={handleLogoClick}>
          <img
            src="/logo-icon.png"
            alt="Logo Estrela Criativa"
            className="logo-img-header"
          />
          <div className="brand-text">
            <span className="brand-name">
              Estrela <span>Criativa</span>
            </span>
            <span className="brand-tagline">Prof. Ataíse • Papelaria</span>
          </div>
        </a>

        {/* Barra de Busca */}
        <div className="search-wrapper">
          <input
            type="search"
            className="search-input"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="O que você procura hoje? Ex: planner, agenda, topo de bolo, etiqueta..."
            aria-label="Buscar produtos no catálogo"
          />
          <span className="search-btn" aria-hidden="true">
            🔍
          </span>
        </div>

        {/* Ações do Cabeçalho */}
        <div className="header-actions">
          <a
            href={`https://www.instagram.com/${config.instagram}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-link"
          >
            📸 @{config.instagram}
          </a>
          <a href="#como-funciona" className="action-link">
            ✨ Como Encomendar
          </a>
          <button
            type="button"
            className="cart-trigger"
            onClick={abrirCarrinho}
            aria-label="Abrir sacola de pedidos"
          >
            <span>🛍️ Meu Pedido</span>
            <span className="cart-badge">{totalItensSacola}</span>
          </button>
        </div>
      </div>

      {/* Menu de Departamentos */}
      <nav className="category-nav" aria-label="Categorias de produtos">
        <div className="container">
          <ul className="category-nav-list">
            <li>
              <button
                type="button"
                className={`cat-nav-btn ${categoriaAtiva === 'todos' ? 'active' : ''}`}
                onClick={() => filtrarPorCategoria('todos', true)}
              >
                🌟 Todos os Produtos
              </button>
            </li>
            {categorias.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  className={`cat-nav-btn ${categoriaAtiva === cat.id ? 'active' : ''}`}
                  onClick={() => filtrarPorCategoria(cat.id, true)}
                >
                  {cat.icone || '✨'} {cat.nome}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

