import { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatarMoeda } from '../../utils/formatters';
import type { Product } from '../../types/store';

interface AdminProductListProps {
  filtroCategoria: string;
  onMudarFiltroCategoria: (catId: string) => void;
  produtoEditandoId?: number;
  onEditarProduto: (produto: Product) => void;
}

export default function AdminProductList({
  filtroCategoria,
  onMudarFiltroCategoria,
  produtoEditandoId,
  onEditarProduto,
}: AdminProductListProps) {
  const { config, produtos, categorias, excluirProduto } = useStore();
  const [busca, setBusca] = useState<string>('');

  const pctPix = Number(config.descontoPix ?? 5);
  const fatorPix = 1 - pctPix / 100;

  const mapaCats = useMemo<Record<string, string>>(() => {
    const mapa: Record<string, string> = {};
    categorias.forEach((c) => {
      mapa[c.id] = c.nome;
    });
    return mapa;
  }, [categorias]);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      const bateCat =
        filtroCategoria === 'todos' || p.categoria === filtroCategoria;
      const bateBusca =
        !termo ||
        p.nome.toLowerCase().includes(termo) ||
        p.descricao.toLowerCase().includes(termo);
      return bateCat && bateBusca;
    });
  }, [produtos, filtroCategoria, busca]);

  const handleExcluir = (prod: Product) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o produto "${prod.nome}" do catálogo?`
      )
    ) {
      excluirProduto(prod.id);
    }
  };

  return (
    <div className="admin-panel-card">
      <div className="panel-title">
        <span>📦 Produtos Cadastrados no Site ({produtosFiltrados.length})</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            className="sort-select"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            value={filtroCategoria}
            onChange={(e) => onMudarFiltroCategoria(e.target.value)}
            aria-label="Filtrar por categoria"
          >
            <option value="todos">Todas as Categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icone || '✨'} {c.nomeCurto || c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <input
        type="search"
        className="form-control"
        placeholder="🔍 Buscar produto pelo nome ou descrição para editar ou excluir..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="admin-product-list">
        {produtosFiltrados.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '32px',
              color: 'var(--text-muted)',
            }}
          >
            Nenhum produto encontrado com esse filtro.
          </div>
        ) : (
          produtosFiltrados.map((p) => {
            const nomeCat =
              mapaCats[p.categoria] || p.categoriaLabel || 'Personalizados';
            const emEdicao = Number(produtoEditandoId) === Number(p.id);

            return (
              <div
                className={`admin-prod-item ${emEdicao ? 'editing' : ''}`}
                key={p.id}
              >
                <div
                  className="admin-prod-thumb"
                  style={{ background: p.corFundo || 'var(--rose-light)' }}
                >
                  {p.imagem ? (
                    <img src={p.imagem} alt={p.nome} />
                  ) : (
                    <span>{p.emoji || '⭐'}</span>
                  )}
                </div>

                <div className="admin-prod-info">
                  <h4>{p.nome}</h4>
                  <div className="admin-prod-meta">
                    <span
                      style={{ color: 'var(--lilac-dark)', fontWeight: 800 }}
                    >
                      {nomeCat}
                    </span>
                    <span>•</span>
                    <strong
                      style={{
                        color: 'var(--rose-primary)',
                        fontSize: '0.92rem',
                      }}
                    >
                      {formatarMoeda(p.preco)}
                    </strong>
                    <span>(PIX: {formatarMoeda(p.preco * fatorPix)})</span>
                    {p.destaque && (
                      <>
                        <span>•</span>
                        <span
                          style={{
                            background: 'var(--gold-light)',
                            color: 'var(--gold-dark)',
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontWeight: 800,
                          }}
                        >
                          {p.destaque}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="admin-prod-actions">
                  <button
                    type="button"
                    className="btn-action-sm btn-edit"
                    onClick={() => onEditarProduto(p)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    type="button"
                    className="btn-action-sm btn-delete"
                    onClick={() => handleExcluir(p)}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
