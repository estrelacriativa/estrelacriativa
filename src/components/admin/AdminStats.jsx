import { useStore } from '../../context/StoreContext';

export default function AdminStats({ filtroCategoria, onFiltrarCategoria }) {
  const { produtos, categorias } = useStore();

  return (
    <div className="stats-grid">
      <button
        type="button"
        className={`stat-card clickable ${filtroCategoria === 'todos' ? 'active' : ''}`}
        onClick={() => onFiltrarCategoria('todos')}
      >
        <div className="stat-icon">🌟</div>
        <div className="stat-info">
          <strong>{produtos.length}</strong>
          <span>Total de Produtos</span>
        </div>
      </button>

      {categorias.map((cat) => {
        const qtd = produtos.filter((p) => p.categoria === cat.id).length;
        return (
          <button
            key={cat.id}
            type="button"
            className={`stat-card clickable ${filtroCategoria === cat.id ? 'active' : ''}`}
            onClick={() => onFiltrarCategoria(cat.id)}
          >
            <div
              className="stat-icon"
              style={{
                background: 'var(--lilac-light)',
                color: 'var(--lilac-dark)',
              }}
            >
              {cat.icone || '✨'}
            </div>
            <div className="stat-info">
              <strong>{qtd}</strong>
              <span>{cat.nomeCurto || cat.nome}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

