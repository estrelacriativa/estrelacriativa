import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  OPCOES_EMOJIS_PRODUTO,
  OPCOES_CORES_FUNDO,
} from '../../data/defaultStoreData';
import { formatarMoeda } from '../../utils/formatters';
import { redimensionarImagemUpload } from '../../utils/imageUpload';

function criarEstadoInicial(categorias) {
  return {
    id: '',
    nome: '',
    categoria: categorias[0]?.id || 'agendas',
    precoAntigo: '',
    preco: '',
    descricao: '',
    emoji: '📔',
    imagem: '',
    corFundo: OPCOES_CORES_FUNDO[0].value,
    destaque: 'Personalizável',
    tagPreview: 'Com seu nome na Capa',
  };
}

export default function AdminProductForm({
  produtoEditando,
  onFinalizarEdicao,
  formCardRef,
}) {
  const { config, categorias, salvarProduto, mostrarNotificacao } = useStore();
  const [form, setForm] = useState(() => criarEstadoInicial(categorias));
  const inputFileRef = useRef(null);
  const nomeInputRef = useRef(null);

  useEffect(() => {
    if (produtoEditando) {
      setForm({
        id: produtoEditando.id,
        nome: produtoEditando.nome || '',
        categoria: produtoEditando.categoria || categorias[0]?.id || 'agendas',
        precoAntigo: produtoEditando.precoAntigo || '',
        preco: produtoEditando.preco || '',
        descricao: produtoEditando.descricao || '',
        emoji: produtoEditando.emoji || '⭐',
        imagem: produtoEditando.imagem || '',
        corFundo: produtoEditando.corFundo || OPCOES_CORES_FUNDO[0].value,
        destaque: produtoEditando.destaque || '',
        tagPreview: produtoEditando.tagPreview || '',
      });
    } else {
      setForm(criarEstadoInicial(categorias));
    }
  }, [produtoEditando, categorias]);

  const pctPix = Number(config.descontoPix ?? 5);
  const precoNum = parseFloat(form.preco) || 0;
  const valorPix = precoNum * (1 - pctPix / 100);

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleUploadImagem = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await redimensionarImagemUpload(file, 520, 0.82);
      setForm((prev) => ({ ...prev, imagem: base64 }));
    } catch {
      mostrarNotificacao('❌ Erro ao processar imagem. Tente outro arquivo.');
    }
  };

  const handleRemoverFoto = () => {
    setForm((prev) => ({ ...prev, imagem: '' }));
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const handleLimpar = () => {
    setForm(criarEstadoInicial(categorias));
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
    onFinalizarEdicao();
    nomeInputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    salvarProduto(form);
    setForm(criarEstadoInicial(categorias));
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
    onFinalizarEdicao();
  };

  const estaEditando = Boolean(form.id);

  return (
    <div className="admin-panel-card" ref={formCardRef}>
      <div className="panel-title">
        <span>
          {estaEditando ? '✏️ Editando Produto' : '➕ Cadastrar Novo Produto'}
        </span>
        <button
          type="button"
          onClick={handleLimpar}
          style={{
            fontSize: '0.8rem',
            color: 'var(--rose-primary)',
            fontWeight: 800,
          }}
        >
          {estaEditando ? 'Cancelar edição' : 'Limpar campos'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="prodNome">Nome do Produto *</label>
          <input
            ref={nomeInputRef}
            type="text"
            id="prodNome"
            className="form-control"
            value={form.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            placeholder="Ex: Planner Pedagógico 2027 com Nome"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="prodCategoria">Categoria / Departamento *</label>
          <select
            id="prodCategoria"
            className="form-control"
            value={form.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
            required
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icone || '✨'} {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="prodPrecoAntigo">
              Preço Antigo &quot;De R$&quot; (opcional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="prodPrecoAntigo"
              className="form-control"
              value={form.precoAntigo}
              onChange={(e) => handleChange('precoAntigo', e.target.value)}
              placeholder="Ex: 139.90"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prodPreco">Preço de Venda &quot;Por R$&quot; *</label>
            <input
              type="number"
              step="0.01"
              min="0.5"
              id="prodPreco"
              className="form-control"
              value={form.preco}
              onChange={(e) => handleChange('preco', e.target.value)}
              placeholder="Ex: 119.90"
              required
            />
          </div>
        </div>

        <div className="pix-simulation-box">
          💠 Valor automático no PIX ({pctPix}% OFF): {formatarMoeda(valorPix)}
        </div>

        <div className="form-group">
          <label htmlFor="prodDescricao">Descrição dos Detalhes *</label>
          <textarea
            id="prodDescricao"
            className="form-control"
            rows="3"
            value={form.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            placeholder="Descreva os itens inclusos, gramatura das folhas, tamanho, etc."
            required
          />
        </div>

        {/* Upload de Foto Real do Produto */}
        <div className="form-group">
          <label>
            📸 Foto do Produto (Opcional — se não enviar, usa o ícone abaixo)
          </label>
          <label htmlFor="prodImagemInput" className="image-upload-box">
            <span style={{ fontSize: '1.5rem', display: 'block' }}>📤</span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--rose-primary)',
              }}
            >
              Clique aqui para escolher uma foto do seu computador
            </span>
            <span
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                display: 'block',
              }}
            >
              JPG, PNG ou WebP (redimensionamento automático)
            </span>
          </label>
          <input
            ref={inputFileRef}
            type="file"
            id="prodImagemInput"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUploadImagem}
          />

          {form.imagem && (
            <div className="image-preview-wrapper">
              <img src={form.imagem} alt="Prévia da foto" />
              <button
                type="button"
                className="btn-remove-img"
                onClick={handleRemoverFoto}
              >
                ✕ Remover Foto
              </button>
            </div>
          )}
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="prodEmoji">Ícone / Emoji (quando sem foto)</label>
            <select
              id="prodEmoji"
              className="form-control"
              value={form.emoji}
              onChange={(e) => handleChange('emoji', e.target.value)}
            >
              {OPCOES_EMOJIS_PRODUTO.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="prodCorFundo">Cor de Fundo do Card</label>
            <select
              id="prodCorFundo"
              className="form-control"
              value={form.corFundo}
              onChange={(e) => handleChange('corFundo', e.target.value)}
            >
              {OPCOES_CORES_FUNDO.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="prodDestaque">Selo de Destaque</label>
            <input
              type="text"
              id="prodDestaque"
              className="form-control"
              value={form.destaque}
              onChange={(e) => handleChange('destaque', e.target.value)}
              placeholder="Ex: Mais Vendido / Lançamento"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prodTagPreview">Etiqueta da Foto</label>
            <input
              type="text"
              id="prodTagPreview"
              className="form-control"
              value={form.tagPreview}
              onChange={(e) => handleChange('tagPreview', e.target.value)}
              placeholder="Ex: Com seu nome na Capa"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
        >
          {estaEditando ? '💾 Salvar Alterações' : '💾 Salvar Produto no Catálogo'}
        </button>
      </form>
    </div>
  );
}

