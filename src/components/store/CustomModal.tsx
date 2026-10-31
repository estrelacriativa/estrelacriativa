import { useState, useEffect, type FormEvent } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatarMoeda } from '../../utils/formatters';
import type { SelectOption } from '../../types/store';

const TEMAS_DISPONIVEIS: SelectOption[] = [
  {
    value: 'Roxo Estrela & Turquesa (Cores da Marca)',
    label: '⭐ Roxo Estrela & Turquesa (Cores da Marca)',
  },
  {
    value: 'Floral Delicado / Tons Pastel',
    label: '🌸 Floral Delicado / Tons Pastel',
  },
  {
    value: 'Pedagógico / Professora Criativa',
    label: '👩‍🏫 Pedagógico / Professora Criativa',
  },
  {
    value: 'Com Meu Logotipo (Corporativo)',
    label: '💼 Com Meu Logotipo (Corporativo)',
  },
  {
    value: 'Tema Infantil / Festa (Escolher no WhatsApp)',
    label: '🎂 Tema Infantil / Festa (Escolher no WhatsApp)',
  },
];

const ACABAMENTOS_DISPONIVEIS: SelectOption[] = [
  { value: 'Laminação Fosca Aveludada', label: 'Fosca Aveludada (Toque Seda)' },
  { value: 'Laminação Brilho Clássico', label: 'Brilho Clássico' },
  {
    value: 'Laminação Holográfica / Caquinhos',
    label: 'Holográfica / Caquinhos Furta-Cor',
  },
  { value: 'Laminação Glitter Fino', label: 'Glitter Fino' },
];

export default function CustomModal() {
  const {
    config,
    produtoEmPersonalizacao,
    fecharModalPersonalizacao,
    adicionarAoCarrinho,
  } = useStore();

  const [nomeCapa, setNomeCapa] = useState<string>('');
  const [tema, setTema] = useState<string>(TEMAS_DISPONIVEIS[0].value);
  const [acabamento, setAcabamento] = useState<string>(
    ACABAMENTOS_DISPONIVEIS[0].value
  );
  const [quantidade, setQuantidade] = useState<number>(1);

  useEffect(() => {
    if (produtoEmPersonalizacao) {
      setNomeCapa('');
      setTema(TEMAS_DISPONIVEIS[0].value);
      setAcabamento(ACABAMENTOS_DISPONIVEIS[0].value);
      setQuantidade(1);
    }
  }, [produtoEmPersonalizacao]);

  useEffect(() => {
    if (!produtoEmPersonalizacao) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fecharModalPersonalizacao();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [produtoEmPersonalizacao, fecharModalPersonalizacao]);

  if (!produtoEmPersonalizacao) return null;

  const pctPix = Number(config.descontoPix ?? 5);
  const fatorPix = 1 - pctPix / 100;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    adicionarAoCarrinho(
      produtoEmPersonalizacao,
      { nomeCapa, tema, acabamento },
      quantidade
    );
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) fecharModalPersonalizacao();
      }}
    >
      <div className="custom-modal">
        <button
          type="button"
          className="modal-close"
          onClick={fecharModalPersonalizacao}
          aria-label="Fechar janela"
        >
          ✕
        </button>

        <div className="modal-product-header">
          <div className="modal-product-emoji">
            {produtoEmPersonalizacao.imagem ? (
              <img
                src={produtoEmPersonalizacao.imagem}
                alt={produtoEmPersonalizacao.nome}
              />
            ) : (
              produtoEmPersonalizacao.emoji || '⭐'
            )}
          </div>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--lilac-dark)',
                textTransform: 'uppercase',
              }}
            >
              Personalize seu item
            </span>
            <h3 id="modalTitle" style={{ fontSize: '1.3rem' }}>
              {produtoEmPersonalizacao.nome}
            </h3>
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                color: 'var(--rose-primary)',
                marginTop: '2px',
              }}
            >
              {formatarMoeda(produtoEmPersonalizacao.preco * fatorPix)} no PIX ou{' '}
              {formatarMoeda(produtoEmPersonalizacao.preco)} no cartão
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customNome">
              1. Nome, Turma/Série ou Marca para estampar (opcional):
            </label>
            <input
              type="text"
              id="customNome"
              className="form-control"
              value={nomeCapa}
              onChange={(e) => setNomeCapa(e.target.value)}
              placeholder="Ex: Prof. Maria Clara / Helena 1º Ano / Enviarei logo no WhatsApp"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customTema">
              2. Escolha a Paleta / Tema de preferência:
            </label>
            <select
              id="customTema"
              className="form-control"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            >
              {TEMAS_DISPONIVEIS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="customAcabamento">3. Acabamento / Laminação:</label>
            <select
              id="customAcabamento"
              className="form-control"
              value={acabamento}
              onChange={(e) => setAcabamento(e.target.value)}
            >
              {ACABAMENTOS_DISPONIVEIS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="customQtd">4. Quantidade:</label>
            <input
              type="number"
              id="customQtd"
              className="form-control"
              value={quantidade}
              min="1"
              max="100"
              onChange={(e) =>
                setQuantidade(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
          >
            🛍️ Adicionar à Sacola de Pedidos
          </button>
        </form>
      </div>
    </div>
  );
}
