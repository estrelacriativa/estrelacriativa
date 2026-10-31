import { useState, useRef, type FormEvent } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Category, CategoryFormInput } from '../../types/store';

const ESTADO_INICIAL_CAT: CategoryFormInput = {
  id: '',
  nome: '',
  nomeCurto: '',
  subtitulo: '',
  icone: '✨',
};

export default function AdminCategoryManager() {
  const {
    categorias,
    produtos,
    salvarCategoria,
    excluirCategoria,
    restaurarCategoriasPadrao,
  } = useStore();

  const [formCat, setFormCat] = useState<CategoryFormInput>(ESTADO_INICIAL_CAT);
  const cardRef = useRef<HTMLDivElement>(null);

  const editando = Boolean(formCat.id);

  const handleEditar = (cat: Category) => {
    setFormCat({
      id: cat.id,
      nome: cat.nome,
      nomeCurto: cat.nomeCurto || cat.nome,
      subtitulo: cat.subtitulo || '',
      icone: cat.icone || '✨',
    });
    cardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLimpar = () => {
    setFormCat(ESTADO_INICIAL_CAT);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    salvarCategoria(formCat);
    setFormCat(ESTADO_INICIAL_CAT);
  };

  const handleExcluir = (cat: Category) => {
    if (categorias.length <= 1) {
      window.alert('A loja precisa ter pelo menos 1 categoria ativa.');
      return;
    }
    if (window.confirm(`Deseja realmente excluir a categoria "${cat.nome}"?`)) {
      const excluiu = excluirCategoria(cat.id);
      if (excluiu && formCat.id === cat.id) {
        setFormCat(ESTADO_INICIAL_CAT);
      }
    }
  };

  const handleRestaurar = () => {
    if (
      window.confirm('Deseja restaurar as 4 categorias originais de fábrica?')
    ) {
      restaurarCategoriasPadrao();
      setFormCat(ESTADO_INICIAL_CAT);
    }
  };

  return (
    <div className="admin-panel-card" ref={cardRef}>
      <div className="panel-title">
        <span>🗂️ Gerenciar Categorias / Departamentos</span>
        <button
          type="button"
          onClick={handleRestaurar}
          className="btn-outline-muted"
          style={{ padding: '4px 12px', fontSize: '0.78rem' }}
        >
          🔄 Restaurar Categorias Padrão
        </button>
      </div>

      {/* Formulário para Adicionar ou Editar Categoria */}
      <form className="cat-form-box" onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            gap: '8px',
          }}
        >
          <strong style={{ color: 'var(--rose-dark)', fontSize: '0.95rem' }}>
            {editando
              ? `✏️ Editando Categoria: ${formCat.nome}`
              : '➕ Criar Nova Categoria (ou clique em "Editar" na lista abaixo)'}
          </strong>
          <button
            type="button"
            onClick={handleLimpar}
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--rose-primary)',
            }}
          >
            {editando ? 'Cancelar' : 'Limpar'}
          </button>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="catNome">Nome no Menu do Topo *</label>
            <input
              type="text"
              id="catNome"
              className="form-control"
              value={formCat.nome}
              onChange={(e) =>
                setFormCat((prev) => ({ ...prev, nome: e.target.value }))
              }
              placeholder="Ex: Recursos Pedagógicos"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="catNomeCurto">
              Nome no Card de Departamento *
            </label>
            <input
              type="text"
              id="catNomeCurto"
              className="form-control"
              value={formCat.nomeCurto}
              onChange={(e) =>
                setFormCat((prev) => ({ ...prev, nomeCurto: e.target.value }))
              }
              placeholder="Ex: Pedagógicos & Escola"
              required
            />
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="catSubtitulo">Subtítulo do Card *</label>
            <input
              type="text"
              id="catSubtitulo"
              className="form-control"
              value={formCat.subtitulo}
              onChange={(e) =>
                setFormCat((prev) => ({ ...prev, subtitulo: e.target.value }))
              }
              placeholder="Ex: Jogos, apostilas e atividades"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="catIcone">Ícone / Emoji da Categoria *</label>
            <input
              type="text"
              id="catIcone"
              className="form-control"
              value={formCat.icone}
              onChange={(e) =>
                setFormCat((prev) => ({ ...prev, icone: e.target.value }))
              }
              placeholder="Ex: 👩‍🏫, 📔, 🎂, 💼, 🎒, ✨, 🎁"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{
            marginTop: '14px',
            padding: '10px 20px',
            fontSize: '0.88rem',
          }}
        >
          {editando
            ? '💾 Salvar Alterações da Categoria'
            : '💾 Salvar Categoria'}
        </button>
      </form>

      {/* Lista de Categorias Atuais */}
      <div className="admin-category-list">
        {categorias.map((cat) => {
          const qtdProd = produtos.filter((p) => p.categoria === cat.id).length;
          const estaEditandoCat = formCat.id === cat.id;

          return (
            <div
              className={`admin-prod-item ${estaEditandoCat ? 'editing' : ''}`}
              key={cat.id}
            >
              <div
                className="admin-prod-thumb"
                style={{
                  width: '48px',
                  height: '48px',
                  fontSize: '1.5rem',
                  background: 'var(--rose-light)',
                }}
              >
                {cat.icone || '✨'}
              </div>
              <div className="admin-prod-info">
                <h4>{cat.nome}</h4>
                <div className="admin-prod-meta">
                  <span>
                    Card: <strong>{cat.nomeCurto}</strong>
                  </span>
                  <span>•</span>
                  <span>Subtítulo: &quot;{cat.subtitulo}&quot;</span>
                  <span>•</span>
                  <span
                    style={{ color: 'var(--rose-primary)', fontWeight: 800 }}
                  >
                    {qtdProd} {qtdProd === 1 ? 'produto' : 'produtos'}
                  </span>
                </div>
              </div>
              <div className="admin-prod-actions">
                <button
                  type="button"
                  className="btn-action-sm btn-edit"
                  onClick={() => handleEditar(cat)}
                >
                  ✏️ Editar
                </button>
                <button
                  type="button"
                  className="btn-action-sm btn-delete"
                  onClick={() => handleExcluir(cat)}
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
