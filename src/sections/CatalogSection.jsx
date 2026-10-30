import { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/store/ProductCard';

export default function CatalogSection() {
  const {
    produtos,
    categorias,
    categoriaAtiva,
    termoBusca,
    ordenacaoAtiva,
    setOrdenacaoAtiva,
    limparFiltros,
  } = useStore();

  const mapaNomesCat = useMemo(() => {
    const mapa = {};
    categorias.forEach((c) => {
      mapa[c.id] = c.nome;
    });
    return mapa;
  }, [categorias]);

  const produtosFiltrados = useMemo(() => {
    const busca = termoBusca.trim().toLowerCase();

    const filtrados = produtos.filter((p) => {
      const bateCategoria =
        categoriaAtiva === 'todos' || p.categoria === categoriaAtiva;
      const labelCat = mapaNomesCat[p.categoria] || p.categoriaLabel || '';
      const bateBusca =
        busca === '' ||
        p.nome.toLowerCase().includes(busca) ||
        p.descricao.toLowerCase().includes(busca) ||
        labelCat.toLowerCase().includes(busca);
      return bateCategoria && bateBusca;
    });

    const listaOrdenada = [...filtrados];
    if (ordenacaoAtiva === 'menor-preco') {
      listaOrdenada.sort((a, b) => a.preco - b.preco);
    } else if (ordenacaoAtiva === 'maior-preco') {
      listaOrdenada.sort((a, b) => b.preco - a.preco);
    } else if (ordenacaoAtiva === 'nome') {
      listaOrdenada.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    }

    return listaOrdenada;
  }, [produtos, categoriaAtiva, termoBusca, ordenacaoAtiva, mapaNomesCat]);

  return (
    <main id="catalogo" className="catalog-section">
      <div className="container">
        <div className="catalog-toolbar">
          <div className="catalog-results-info">
            Mostrando:{' '}
            <span>
              {produtosFiltrados.length}{' '}
              {produtosFiltrados.length === 1
                ? 'produto encontrado'
                : 'produtos encontrados'}
            </span>
          </div>

          <div className="catalog-controls">
            <label
              htmlFor="sortSelect"
              style={{ fontSize: '0.88rem', fontWeight: 800 }}
            >
              Ordenar por:
            </label>
            <select
              id="sortSelect"
              className="sort-select"
              value={ordenacaoAtiva}
              onChange={(e) => setOrdenacaoAtiva(e.target.value)}
            >
              <option value="relevancia">Mais Procurados</option>
              <option value="menor-preco">Menor Preço</option>
              <option value="maior-preco">Maior Preço</option>
              <option value="nome">Ordem Alfabética (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="products-grid">
          {produtosFiltrados.length === 0 ? (
            <div className="catalog-empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
              <h3 style={{ marginBottom: '8px' }}>
                Nenhum produto encontrado nesta categoria ou busca
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '18px' }}>
                Mas não se preocupe: fazemos projetos 100% personalizados sob encomenda!
              </p>
              <button type="button" className="btn-primary" onClick={limparFiltros}>
                Ver Todo o Catálogo
              </button>
            </div>
          ) : (
            produtosFiltrados.map((produto) => (
              <ProductCard
                key={produto.id}
                produto={produto}
                nomeCategoria={
                  mapaNomesCat[produto.categoria] ||
                  produto.categoriaLabel ||
                  'Personalizados'
                }
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

