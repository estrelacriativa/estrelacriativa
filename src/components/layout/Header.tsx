import type { MouseEvent } from 'react';
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
    badgeAnimado,
  } = useStore();

  const totalItensSacola = carrinho.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  const handleLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    limparFiltros();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="header">
        <div className="container header-main">
          {/* Linha 1 no mobile: Logo à esquerda + Botão Meu Pedido à direita */}
          <div className="header-top-row flex items-center justify-between w-full md:w-auto">
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

            {/* Botão Meu Pedido compacto no Mobile (Linha 1 à direita) */}
            <div className="mobile-cart-wrapper md:hidden">
              <button
                type="button"
                className={`cart-trigger cart-trigger-compact ${
                  badgeAnimado ? 'cart-trigger-animating' : ''
                }`}
                onClick={abrirCarrinho}
                aria-label="Abrir sacola de pedidos"
              >
                <span>🛍️ Meu Pedido</span>
                <span
                  className={`cart-badge ${
                    badgeAnimado ? 'animate-pulse scale-110 bg-purple-600' : ''
                  }`}
                >
                  {totalItensSacola}
                </span>
              </button>
            </div>
          </div>

          {/* Linha 2 no mobile (100% largura) / Centro no Desktop */}
          <div className="search-wrapper w-full mt-2 md:mt-0">
            <input
              type="search"
              className="search-input"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="O que você procura hoje? Ex: agenda A5, caderno, etiquetas, botton..."
              aria-label="Buscar produtos no catálogo"
            />
            <span className="search-btn" aria-hidden="true">
              🔍
            </span>
          </div>

          {/* Ações do Cabeçalho no Desktop (Instagram, WhatsApp e Botão Meu Pedido) */}
          <div className="header-actions hidden md:flex">
            <a
              href={`https://www.instagram.com/${config.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="action-link action-link-insta"
            >
              📸 @{config.instagram}
            </a>
            <a
              href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
                'Olá! Vim pelo site da Estrela Criativa e gostaria de tirar uma dúvida sobre os personalizados.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="action-link action-link-whatsapp"
            >
              💬 WhatsApp
            </a>
            <button
              type="button"
              className={`cart-trigger ${
                badgeAnimado ? 'cart-trigger-animating' : ''
              }`}
              onClick={abrirCarrinho}
              aria-label="Abrir sacola de pedidos"
            >
              <span>🛍️ Meu Pedido</span>
              <span
                className={`cart-badge ${
                  badgeAnimado ? 'animate-pulse scale-110 bg-purple-600' : ''
                }`}
              >
                {totalItensSacola}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Menu de Departamentos (Touch Swipe no Mobile) */}
      <nav className="category-nav" aria-label="Categorias de produtos">
        <div className="container category-nav-container">
          <ul className="category-nav-list flex overflow-x-auto whitespace-nowrap gap-2 px-4 py-2 scrollbar-none -mx-4">
            <li>
              <button
                type="button"
                className={`cat-nav-btn ${
                  categoriaAtiva === 'todos' ? 'active' : ''
                }`}
                onClick={() => filtrarPorCategoria('todos', true)}
              >
                🌟 Todos os Produtos
              </button>
            </li>
            {categorias.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  className={`cat-nav-btn ${
                    categoriaAtiva === cat.id ? 'active' : ''
                  }`}
                  onClick={() => filtrarPorCategoria(cat.id, true)}
                >
                  {cat.icone || '✨'} {cat.nome}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

