import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ChangeEvent,
  type RefObject,
} from 'react';
import { useStore } from '../../context/StoreContext';
import {
  OPCOES_EMOJIS_PRODUTO,
  OPCOES_CORES_FUNDO,
} from '../../data/defaultStoreData';
import { formatarMoeda } from '../../utils/formatters';
import { uploadImagemProdutoSupabase } from '../../utils/imageUpload';
import type { Category, Product, ProductFormInput } from '../../types/store';

interface AdminProductFormProps {
  produtoEditando: Product | null;
  onFinalizarEdicao: () => void;
  formCardRef: RefObject<HTMLDivElement>;
}

function criarEstadoInicial(categorias: Category[]): ProductFormInput {
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
    detalhesExtras: '',
    dimensoes: '',
    quantidadeFolhas: '',
    galeriaFotos: [],
  };
}

export default function AdminProductForm({
  produtoEditando,
  onFinalizarEdicao,
  formCardRef,
}: AdminProductFormProps) {
  const { config, categorias, salvarProduto, mostrarNotificacao } = useStore();
  const [form, setForm] = useState<ProductFormInput>(() =>
    criarEstadoInicial(categorias)
  );
  const [enviandoFoto, setEnviandoFoto] = useState<boolean>(false);
  const [enviandoGaleria, setEnviandoGaleria] = useState<boolean>(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const inputGaleriaRef = useRef<HTMLInputElement>(null);
  const nomeInputRef = useRef<HTMLInputElement>(null);

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
        detalhesExtras: produtoEditando.detalhesExtras || '',
        dimensoes: produtoEditando.dimensoes || '',
        quantidadeFolhas: produtoEditando.quantidadeFolhas || '',
        galeriaFotos: Array.isArray(produtoEditando.galeriaFotos)
          ? produtoEditando.galeriaFotos
          : [],
      });
    } else {
      setForm(criarEstadoInicial(categorias));
    }
  }, [produtoEditando, categorias]);

  const pctPix = Number(config.descontoPix ?? 5);
  const precoNum = parseFloat(String(form.preco)) || 0;
  const valorPix = precoNum * (1 - pctPix / 100);

  const handleChange = <K extends keyof ProductFormInput>(
    campo: K,
    valor: ProductFormInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleUploadImagem = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviandoFoto(true);
    try {
      const resultado = await uploadImagemProdutoSupabase(file);
      setForm((prev) => ({ ...prev, imagem: resultado.url }));
      if (resultado.origem === 'supabase') {
        mostrarNotificacao('☁️ Foto principal enviada para o Supabase Storage!');
      } else {
        mostrarNotificacao(
          '⚠️ Bucket "produtos" ainda não criado no Supabase (foto salva em modo local).'
        );
      }
    } catch {
      mostrarNotificacao('❌ Erro ao processar imagem. Tente outro arquivo.');
    } finally {
      setEnviandoFoto(false);
    }
  };

  const handleUploadGaleria = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setEnviandoGaleria(true);
    try {
      const arquivosLista = Array.from(files);
      const resultados = await Promise.all(
        arquivosLista.map((arquivo) => uploadImagemProdutoSupabase(arquivo))
      );
      const novasUrls = resultados.map((r) => r.url).filter(Boolean);

      setForm((prev) => ({
        ...prev,
        galeriaFotos: [...prev.galeriaFotos, ...novasUrls],
      }));

      const usouSupabase = resultados.every((r) => r.origem === 'supabase');
      if (usouSupabase) {
        mostrarNotificacao(
          `☁️ ${novasUrls.length} foto(s) extra(s) adicionada(s) à galeria!`
        );
      } else {
        mostrarNotificacao(
          `📸 ${novasUrls.length} foto(s) extra(s) carregada(s)!`
        );
      }
    } catch {
      mostrarNotificacao('❌ Erro ao enviar uma ou mais fotos da galeria.');
    } finally {
      setEnviandoGaleria(false);
      if (inputGaleriaRef.current) {
        inputGaleriaRef.current.value = '';
      }
    }
  };

  const handleRemoverFoto = () => {
    setForm((prev) => ({ ...prev, imagem: '' }));
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const handleRemoverFotoGaleria = (indice: number) => {
    setForm((prev) => ({
      ...prev,
      galeriaFotos: prev.galeriaFotos.filter((_, idx) => idx !== indice),
    }));
  };

  const handleLimpar = () => {
    setForm(criarEstadoInicial(categorias));
    if (inputFileRef.current) inputFileRef.current.value = '';
    if (inputGaleriaRef.current) inputGaleriaRef.current.value = '';
    onFinalizarEdicao();
    nomeInputRef.current?.focus();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    salvarProduto(form);
    setForm(criarEstadoInicial(categorias));
    if (inputFileRef.current) inputFileRef.current.value = '';
    if (inputGaleriaRef.current) inputGaleriaRef.current.value = '';
    onFinalizarEdicao();
  };

  const estaEditando = Boolean(form.id);
  const ocupandoUpload = enviandoFoto || enviandoGaleria;

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
          <label htmlFor="prodDescricao">Resumo Curto (exibido no card) *</label>
          <textarea
            id="prodDescricao"
            className="form-control"
            rows={2}
            value={form.descricao}
            onChange={(e) => handleChange('descricao', e.target.value)}
            placeholder="Resumo rápido exibido no card da vitrine."
            required
          />
        </div>

        {/* Upload de Foto Principal do Produto */}
        <div className="form-group">
          <label>
            📸 Foto Principal da Capa (Opcional — se não enviar, usa o ícone abaixo)
          </label>
          <label
            htmlFor="prodImagemInput"
            className="image-upload-box"
            style={{
              opacity: enviandoFoto ? 0.65 : 1,
              pointerEvents: enviandoFoto ? 'none' : 'auto',
            }}
          >
            <span style={{ fontSize: '1.5rem', display: 'block' }}>
              {enviandoFoto ? '⏳' : '📤'}
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: 'var(--rose-primary)',
              }}
            >
              {enviandoFoto
                ? 'Enviando foto para o Supabase Storage...'
                : 'Clique aqui para escolher a foto principal'}
            </span>
            <span
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                display: 'block',
              }}
            >
              JPG, PNG ou WebP (otimização e envio automático para a nuvem)
            </span>
          </label>
          <input
            ref={inputFileRef}
            type="file"
            id="prodImagemInput"
            accept="image/*"
            disabled={enviandoFoto}
            style={{ display: 'none' }}
            onChange={handleUploadImagem}
          />

          {form.imagem && (
            <div className="image-preview-wrapper">
              <img src={form.imagem} alt="Prévia da foto principal" />
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

        {/* ==============================================================
            BLOCO NOVO: MAIS INFORMAÇÕES, FICHA TÉCNICA E GALERIA DE FOTOS
           ============================================================== */}
        <div className="admin-extra-details-box">
          <div className="admin-extra-details-title">
            🔍 Botão &quot;Mais Informações&quot; (Opcional)
          </div>
          <p className="admin-extra-details-hint">
            Preencha apenas o que fizer sentido para este item (fotos do miolo,
            dimensões, número de folhas, itens inclusos, etc.).
          </p>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="prodDimensoes">📏 Dimensões / Tamanho</label>
              <input
                type="text"
                id="prodDimensoes"
                className="form-control"
                value={form.dimensoes}
                onChange={(e) => handleChange('dimensoes', e.target.value)}
                placeholder="Ex: 15,5 x 21,5 cm (A5)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prodQtdFolhas">📄 Quantidade de Folhas</label>
              <input
                type="text"
                id="prodQtdFolhas"
                className="form-control"
                value={form.quantidadeFolhas}
                onChange={(e) =>
                  handleChange('quantidadeFolhas', e.target.value)
                }
                placeholder="Ex: 100 folhas (papel 90g)"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="prodDetalhesExtras">
              📋 Mais Detalhes / Descrição Completa
            </label>
            <textarea
              id="prodDetalhesExtras"
              className="form-control"
              rows={4}
              value={form.detalhesExtras}
              onChange={(e) => handleChange('detalhesExtras', e.target.value)}
              placeholder="Ex: Acompanha bolso canguru plástico, cartela de adesivos, divisórias mensais plastificadas, elástico combinando..."
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>
              🖼️ Fotos Extras da Galeria (Miolo, Verso, Detalhes — pode selecionar várias)
            </label>
            <label
              htmlFor="prodGaleriaInput"
              className="image-upload-box gallery-upload-box"
              style={{
                opacity: enviandoGaleria ? 0.65 : 1,
                pointerEvents: enviandoGaleria ? 'none' : 'auto',
              }}
            >
              <span style={{ fontSize: '1.35rem', display: 'block' }}>
                {enviandoGaleria ? '⏳' : '🖼️'}
              </span>
              <span
                style={{
                  fontSize: '0.83rem',
                  fontWeight: 800,
                  color: 'var(--lilac-dark)',
                }}
              >
                {enviandoGaleria
                  ? 'Enviando fotos extras para a nuvem...'
                  : '+ Adicionar fotos extras do produto'}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  display: 'block',
                }}
              >
                Selecione 1 ou várias fotos de uma vez
              </span>
            </label>
            <input
              ref={inputGaleriaRef}
              type="file"
              id="prodGaleriaInput"
              accept="image/*"
              multiple
              disabled={enviandoGaleria}
              style={{ display: 'none' }}
              onChange={handleUploadGaleria}
            />

            {form.galeriaFotos.length > 0 && (
              <div className="admin-gallery-grid">
                {form.galeriaFotos.map((url, idx) => (
                  <div key={`${url}-${idx}`} className="admin-gallery-item">
                    <img src={url} alt={`Foto extra ${idx + 1}`} />
                    <button
                      type="button"
                      className="admin-gallery-remove"
                      onClick={() => handleRemoverFotoGaleria(idx)}
                      title="Remover esta foto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
          disabled={ocupandoUpload}
          style={{
            width: '100%',
            justifyContent: 'center',
            marginTop: '8px',
            opacity: ocupandoUpload ? 0.65 : 1,
          }}
        >
          {ocupandoUpload
            ? '⏳ Aguarde o envio das fotos...'
            : estaEditando
            ? '💾 Salvar Alterações'
            : '💾 Salvar Produto no Catálogo'}
        </button>
      </form>
    </div>
  );
}
