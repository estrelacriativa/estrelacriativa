import { useStore } from '../context/StoreContext';

export default function DepartmentsSection() {
  const { categorias, produtos, categoriaAtiva, filtrarPorCategoria } = useStore();

  return (
    <section className="departments-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Navegue por Departamentos</span>
          <h2 className="section-title">Escolha a Categoria Desejada</h2>
        </div>

        <div className="departments-grid">
          <div
            role="button"
            tabIndex={0}
            className={`dept-card ${categoriaAtiva === 'todos' ? 'active' : ''}`}
            onClick={() => filtrarPorCategoria('todos', true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                filtrarPorCategoria('todos', true);
              }
            }}
          >
            <div className="dept-icon-circle">🌟</div>
            <div>
              <div className="dept-name">Ver Tudo</div>
              <div className="dept-count">{produtos.length} itens exclusivos</div>
            </div>
          </div>

          {categorias.map((cat) => {
            const qtd = produtos.filter((p) => p.categoria === cat.id).length;
            return (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                className={`dept-card ${categoriaAtiva === cat.id ? 'active' : ''}`}
                onClick={() => filtrarPorCategoria(cat.id, true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    filtrarPorCategoria(cat.id, true);
                  }
                }}
              >
                <div className="dept-icon-circle">{cat.icone || '✨'}</div>
                <div>
                  <div className="dept-name">{cat.nomeCurto || cat.nome}</div>
                  <div className="dept-count">
                    {cat.subtitulo || `${qtd} produtos`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

