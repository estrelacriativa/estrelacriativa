import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import { useStore } from '../../context/StoreContext';
import { formatarMoeda } from '../../utils/formatters';
import BottonCircularEditor from './BottonCircularEditor';
import {
  LISTA_MATRIZES_BOTTON,
  MATRIZES_BOTTON,
  carregarElementoImagem,
  lerArquivoComoDataUrl,
  gerarArteCircularAltaQualidadeBlob,
  gerarPreviewFrenteBottonDataUrl,
  uploadArteBottonClienteSupabase,
  type TamanhoBottonId,
  type ConfigAjusteBotton,
} from '../../utils/bottonStudio';
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
  {
    value: 'Religioso / Cristão / Versículos',
    label: '🕊️ Religioso / Cristão / Versículos',
  },
  {
    value: 'Minimalista / Tons Neutros',
    label: '✨ Minimalista / Tons Neutros',
  },
  {
    value: 'Outro Tema (Especificar abaixo)',
    label: '🎨 Outro Tema (Especificar abaixo)',
  },
];

const ACABAMENTOS_DISPONIVEIS: Array<{
  value: string;
  label: string;
  subtitulo: string;
}> = [
  {
    value: 'Laminação Holográfica / Caquinhos',
    label: '✨ Holográfica (Caquinhos)',
    subtitulo: 'Reflexo furta-cor incrível na luz',
  },
  {
    value: 'Laminação Fosca Aveludada',
    label: '☁️ Fosca Aveludada',
    subtitulo: 'Toque macio de seda, sem reflexo',
  },
  {
    value: 'Laminação Brilho Clássico',
    label: '💎 Brilho Clássico',
    subtitulo: 'Cores vivas e acabamento espelhado',
  },
  {
    value: 'Laminação Glitter Fino',
    label: '🌟 Glitter Fino',
    subtitulo: 'Pontos delicados de brilho que não soltam',
  },
];

const ACABAMENTOS_BOTTON: SelectOption[] = [
  {
    value: 'Película Protetora Brilho Fotográfico',
    label: '✨ Película Brilho Fotográfico (Alta Nitidez)',
  },
  {
    value: 'Película Holográfica / Efeito Especial',
    label: '🌈 Película Holográfica / Efeito Especial',
  },
];

function detectarTamanhoInicial(nomeProduto: string): TamanhoBottonId {
  if (nomeProduto.includes('32')) return '32mm';
  if (nomeProduto.includes('58')) return '58mm';
  return '44mm';
}

export default function CustomModal() {
  const {
    config,
    produtoEmPersonalizacao,
    fecharModalPersonalizacao,
    adicionarAoCarrinho,
    mostrarNotificacao,
  } = useStore();

  const [nomeCapa, setNomeCapa] = useState<string>('');
  const [tema, setTema] = useState<string>(TEMAS_DISPONIVEIS[0].value);
  const [customThemeDetails, setCustomThemeDetails] = useState<string>('');
  const [acabamento, setAcabamento] = useState<string>(
    ACABAMENTOS_DISPONIVEIS[0].value
  );
  const [quantidade, setQuantidade] = useState<number>(1);

  // Estados exclusivos quando o produto é da categoria Bottons
  const [tamanhoBotton, setTamanhoBotton] = useState<TamanhoBottonId>('44mm');
  const [imgBottonEl, setImgBottonEl] = useState<HTMLImageElement | null>(null);
  const [ajusteBotton, setAjusteBotton] = useState<ConfigAjusteBotton>({
    frenteMm: 44,
    corteMm: 54,
    zoom: 1,
    normOffsetX: 0,
    normOffsetY: 0,
    rotacaoGraus: 0,
    modoSangria: 'auto',
    corFundo: '#FFFFFF',
  });
  const [processandoArte, setProcessandoArte] = useState<boolean>(false);
  const fileInputBottonRef = useRef<HTMLInputElement>(null);

  const ehProdutoBotton = Boolean(
    produtoEmPersonalizacao &&
      (produtoEmPersonalizacao.categoria === 'bottons' ||
        /botton/i.test(produtoEmPersonalizacao.nome))
  );

  useEffect(() => {
    if (produtoEmPersonalizacao) {
      setNomeCapa('');
      setCustomThemeDetails('');
      setQuantidade(1);
      setImgBottonEl(null);
      if (fileInputBottonRef.current) fileInputBottonRef.current.value = '';

      const isBotton =
        produtoEmPersonalizacao.categoria === 'bottons' ||
        /botton/i.test(produtoEmPersonalizacao.nome);

      if (isBotton) {
        const tamInit = detectarTamanhoInicial(produtoEmPersonalizacao.nome);
        const spec = MATRIZES_BOTTON[tamInit];
        setTamanhoBotton(tamInit);
        setAcabamento(ACABAMENTOS_BOTTON[0].value);
        setTema('Arte enviada pelo site / WhatsApp');
        setAjusteBotton({
          frenteMm: spec.frenteMm,
          corteMm: spec.corteMm,
          zoom: 1,
          normOffsetX: 0,
          normOffsetY: 0,
          rotacaoGraus: 0,
          modoSangria: 'auto',
          corFundo: '#FFFFFF',
        });
      } else {
        setTema(TEMAS_DISPONIVEIS[0].value);
        setAcabamento(ACABAMENTOS_DISPONIVEIS[0].value);
      }
    }
  }, [produtoEmPersonalizacao]);

  useEffect(() => {
    if (!produtoEmPersonalizacao) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !processandoArte) fecharModalPersonalizacao();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [produtoEmPersonalizacao, fecharModalPersonalizacao, processandoArte]);

  if (!produtoEmPersonalizacao) return null;

  const pctPix = Number(config.descontoPix ?? 5);
  const fatorPix = 1 - pctPix / 100;

  const precoUnitario = ehProdutoBotton
    ? MATRIZES_BOTTON[tamanhoBotton].preco
    : produtoEmPersonalizacao.preco;

  const subtotalNormal = precoUnitario * quantidade;
  const subtotalPix = subtotalNormal * fatorPix;

  const handleSelecionarTamanhoBotton = (novoTam: TamanhoBottonId) => {
    const spec = MATRIZES_BOTTON[novoTam];
    setTamanhoBotton(novoTam);
    setAjusteBotton((prev) => ({
      ...prev,
      frenteMm: spec.frenteMm,
      corteMm: spec.corteMm,
    }));
  };

  const handleUploadFotoClienteBotton = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await lerArquivoComoDataUrl(file);
      const elemento = await carregarElementoImagem(dataUrl);
      setImgBottonEl(elemento);
      setAjusteBotton((prev) => ({
        ...prev,
        zoom: 1,
        normOffsetX: 0,
        normOffsetY: 0,
        rotacaoGraus: 0,
      }));
    } catch {
      mostrarNotificacao('❌ Não foi possível abrir essa imagem. Tente outra.');
    }
  };

  const handleRemoverFotoBotton = () => {
    setImgBottonEl(null);
    if (fileInputBottonRef.current) fileInputBottonRef.current.value = '';
  };

  const handleBaixarArteCircular = async () => {
    if (!imgBottonEl) return;
    try {
      const blob = await gerarArteCircularAltaQualidadeBlob(
        imgBottonEl,
        ajusteBotton,
        {
          resolucaoPx: 1200,
          incluirLinhaCorte: false,
          formato: 'image/png',
        }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arte-botton-${tamanhoBotton}-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
      mostrarNotificacao('⬇️ Download da imagem circular realizado!');
    } catch {
      mostrarNotificacao('❌ Não foi possível gerar a arte para download.');
    }
  };

  const handlePedirDiretoWhatsApp = () => {
    const telWa = config.whatsapp || '5561983069120';
    const temaFinal = customThemeDetails.trim()
      ? `${tema} (Detalhes: ${customThemeDetails.trim()})`
      : tema;

    let msg = `Olá, Prof. Ataíse! Gostaria de pedir este item personalizado pelo site:\n\n`;
    msg += `⭐ *Produto:* ${produtoEmPersonalizacao.nome}\n`;
    if (ehProdutoBotton) {
      const spec = MATRIZES_BOTTON[tamanhoBotton];
      msg += `📏 *Tamanho:* ${spec.frenteMm}mm\n`;
    }
    if (nomeCapa.trim()) {
      msg += `✍️ *Nome/Marca na Capa:* ${nomeCapa.trim()}\n`;
    }
    if (!ehProdutoBotton) {
      msg += `🎨 *Tema/Paleta:* ${temaFinal}\n`;
    }
    msg += `✨ *Acabamento:* ${acabamento}\n`;
    msg += `🔢 *Quantidade:* ${quantidade}\n`;
    msg += `💰 *Subtotal no PIX (${pctPix}% OFF):* ${formatarMoeda(subtotalPix)}\n`;
    msg += `💳 *Subtotal no Cartão:* ${formatarMoeda(subtotalNormal)}\n\n`;
    msg += `Como posso prosseguir com o pagamento e envio da arte?`;

    const url = `https://wa.me/${telWa}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!ehProdutoBotton) {
      const temaFinal = customThemeDetails.trim()
        ? `${tema} (Detalhes: ${customThemeDetails.trim()})`
        : tema;

      adicionarAoCarrinho(
        produtoEmPersonalizacao,
        { nomeCapa, tema: temaFinal, acabamento },
        quantidade
      );
      return;
    }

    const spec = MATRIZES_BOTTON[tamanhoBotton];
    const descricaoTamanho = `${spec.frenteMm}mm (corte c/ dobra ${spec.corteMm}mm)`;

    if (!imgBottonEl) {
      adicionarAoCarrinho(
        produtoEmPersonalizacao,
        {
          nomeCapa: nomeCapa || 'Enviarei a imagem pelo WhatsApp',
          tema: `Botton ${spec.frenteMm}mm`,
          acabamento,
          tamanhoBotton: descricaoTamanho,
        },
        quantidade,
        spec.preco
      );
      return;
    }

    setProcessandoArte(true);
    try {
      const previewFrente = gerarPreviewFrenteBottonDataUrl(
        imgBottonEl,
        ajusteBotton
      );
      const arteAltaResBlob = await gerarArteCircularAltaQualidadeBlob(
        imgBottonEl,
        ajusteBotton,
        {
          resolucaoPx: 1600,
          incluirLinhaCorte: false,
          formato: 'image/png',
        }
      );

      let urlNuvem = '';
      try {
        urlNuvem = await uploadArteBottonClienteSupabase(
          arteAltaResBlob,
          tamanhoBotton
        );
      } catch (err) {
        console.warn('Upload da arte do botton em modo local:', err);
      }

      adicionarAoCarrinho(
        produtoEmPersonalizacao,
        {
          nomeCapa: nomeCapa || 'Arte ajustada no site',
          tema: urlNuvem
            ? `Botton ${spec.frenteMm}mm (Arte pronta p/ impressão)`
            : `Botton ${spec.frenteMm}mm (Enviar foto original no WhatsApp)`,
          acabamento,
          tamanhoBotton: descricaoTamanho,
          arteBottonUrl: urlNuvem || undefined,
          arteBottonPreview: previewFrente,
        },
        quantidade,
        spec.preco
      );
    } catch {
      mostrarNotificacao('❌ Erro ao gerar arte circular. Tente novamente.');
    } finally {
      setProcessandoArte(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget && !processandoArte) {
          fecharModalPersonalizacao();
        }
      }}
    >
      <div
        className="custom-modal"
        style={{ maxWidth: ehProdutoBotton ? '600px' : '560px' }}
      >
        <button
          type="button"
          className="modal-close"
          onClick={fecharModalPersonalizacao}
          disabled={processandoArte}
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
              {ehProdutoBotton
                ? '🎖️ Monte seu Botton Personalizado'
                : 'Personalize seu item'}
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
              {ehProdutoBotton ? (
                <span>
                  {MATRIZES_BOTTON[tamanhoBotton].nomeCurto}:{' '}
                  <strong style={{ color: 'var(--purple-primary, #7c3aed)' }}>
                    {formatarMoeda(MATRIZES_BOTTON[tamanhoBotton].preco * fatorPix)} no PIX
                  </strong>{' '}
                  ou {formatarMoeda(MATRIZES_BOTTON[tamanhoBotton].preco)} cada
                </span>
              ) : (
                <span>
                  {formatarMoeda(produtoEmPersonalizacao.preco * fatorPix)} no PIX ou{' '}
                  {formatarMoeda(produtoEmPersonalizacao.preco)} no cartão
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {ehProdutoBotton ? (
            <>
              <div className="form-group">
                <label>1. Escolha o Tamanho do Botton:</label>
                <div className="botton-size-selector grid grid-cols-3 gap-2">
                  {LISTA_MATRIZES_BOTTON.map((m) => {
                    const isSelected = tamanhoBotton === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        className={`botton-size-card p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'active border-purple-600 bg-purple-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-purple-200'
                        }`}
                        onClick={() => handleSelecionarTamanhoBotton(m.id)}
                        aria-pressed={isSelected}
                      >
                        <div className="flex justify-between items-center w-full">
                          <strong className="text-sm font-bold text-gray-800">{m.nomeCurto}</strong>
                          <span className="font-extrabold text-purple-700 text-xs">
                            {formatarMoeda(m.preco * fatorPix)} <span className="text-[10px]">PIX</span>
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {m.id === '32mm'
                            ? 'Pequeno / Delicado'
                            : m.id === '44mm'
                            ? 'Médio / Tradicional'
                            : 'Grande / Destaque'}{' '}
                          • {formatarMoeda(m.preco)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>
                  2. Envie sua Foto, Logo ou Arte para ajustar no formato circular:
                </label>
                <div className="botton-upload-row">
                  <label
                    htmlFor="clienteBottonImgInput"
                    className="image-upload-box"
                    style={{ flex: 1, padding: '12px' }}
                  >
                    <span
                      style={{
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        color: 'var(--rose-primary)',
                      }}
                    >
                      📤 {imgBottonEl ? 'Trocar imagem enviada' : 'Escolher imagem do celular / computador'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.73rem',
                        color: 'var(--text-muted)',
                        display: 'block',
                      }}
                    >
                      Ajuste no círculo abaixo (ou deixe em branco para mandar no WhatsApp)
                    </span>
                  </label>
                  <input
                    ref={fileInputBottonRef}
                    type="file"
                    id="clienteBottonImgInput"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleUploadFotoClienteBotton}
                  />
                  {imgBottonEl && (
                    <button
                      type="button"
                      className="btn-outline-danger-sm"
                      onClick={handleRemoverFotoBotton}
                    >
                      ✕ Remover
                    </button>
                  )}
                </div>

                {imgBottonEl && (
                  <div style={{ marginTop: '12px' }}>
                    <BottonCircularEditor
                      imgElement={imgBottonEl}
                      ajuste={ajusteBotton}
                      onChangeAjuste={setAjusteBotton}
                      tamanhoCanvasVisual={240}
                      modoCompacto
                    />
                    <button
                      type="button"
                      onClick={handleBaixarArteCircular}
                      className="btn-download-arte-botton flex items-center justify-center gap-1.5 w-full mt-2 py-2 px-3 rounded-lg text-xs font-bold border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                      title="Baixar imagem recortada no formato circular"
                    >
                      <span>⬇️ Baixar imagem recortada no círculo (PNG)</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="customAcabBotton">3. Acabamento:</label>
                <div className="acabamento-grid" style={{ gridTemplateColumns: '1fr' }}>
                  {ACABAMENTOS_BOTTON.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAcabamento(opt.value)}
                      className={`acabamento-card-btn ${
                        acabamento === opt.value
                          ? 'active border-purple-600 bg-purple-50 text-purple-900 font-semibold'
                          : 'border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>4. Quantidade e Subtotal:</label>
                <div className="qty-touch-container">
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className="btn-qty-touch min-w-[44px] min-h-[44px]"
                      onClick={() => setQuantidade((prev) => Math.max(1, prev - 1))}
                      disabled={quantidade <= 1}
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </button>
                    <span className="qty-touch-value" aria-live="polite">
                      {quantidade}
                    </span>
                    <button
                      type="button"
                      className="btn-qty-touch min-w-[44px] min-h-[44px]"
                      onClick={() => setQuantidade((prev) => prev + 1)}
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>

                  <div className="subtotal-preview-box">
                    <span className="subtotal-preview-label">Subtotal:</span>
                    <span className="subtotal-preview-pix">
                      {formatarMoeda(subtotalPix)}{' '}
                      <span>{pctPix}% OFF PIX</span>
                    </span>
                    <span className="subtotal-preview-normal">
                      ou {formatarMoeda(subtotalNormal)} no cartão
                    </span>
                  </div>
                </div>

                {/* Atalhos Rápidos para Lotes */}
                <div className="qty-shortcuts-row flex items-center gap-1.5 mt-2.5 flex-wrap">
                  <span className="text-xs text-gray-500 font-semibold mr-1">
                    Atalhos rápidos para lotes:
                  </span>
                  {[5, 10, 20, 50].map((qtdExtra) => (
                    <button
                      key={qtdExtra}
                      type="button"
                      onClick={() => setQuantidade((prev) => prev + qtdExtra)}
                      className="btn-qty-shortcut px-2.5 py-1 rounded-full text-xs font-bold border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-colors"
                    >
                      +{qtdExtra} un
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <div className="botton-text-tip-box bg-purple-50 text-purple-800 p-2.5 rounded-lg text-xs mb-2 border border-purple-200 flex items-start gap-2">
                  <span className="text-base leading-none">💡</span>
                  <span>
                    <strong>Dica:</strong> Se quiser que a gente escreva um nome ou frase na arte, deixe um espacinho livre na imagem!
                  </span>
                </div>
                <label htmlFor="customObsBotton">
                  5. Nome, frase ou observação para a arte (opcional):
                </label>
                <input
                  type="text"
                  id="customObsBotton"
                  className="form-control"
                  value={nomeCapa}
                  onChange={(e) => setNomeCapa(e.target.value)}
                  placeholder="Ex: Escrever ' Tia Cláudia ', colocar fundo lilás, etc."
                />
              </div>
            </>
          ) : (
            <>
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

                {/* Condição A: Tema Infantil ou Outro Tema */}
                {(tema.includes('Tema Infantil') ||
                  tema.includes('Outro Tema')) && (
                  <div
                    className="conditional-theme-wrapper"
                    style={{ marginTop: '10px', animation: 'fadeIn 0.25s ease-out' }}
                  >
                    <label
                      htmlFor="customThemeDetails"
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        color: 'var(--text-dark)',
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      Qual tema, personagem ou combinação de cores você imagina?
                    </label>
                    <input
                      type="text"
                      id="customThemeDetails"
                      className="form-control"
                      value={customThemeDetails}
                      onChange={(e) => setCustomThemeDetails(e.target.value)}
                      placeholder="Ex: Safari Baby verde menta, Borboletas lilás, Minnie Rosa..."
                      autoFocus
                    />
                  </div>
                )}

                {/* Condição B: Logotipo Corporativo */}
                {tema.includes('Com Meu Logotipo') && (
                  <div className="theme-alert-tip bg-purple-50 text-purple-800 p-3 rounded-lg text-xs mt-2 border border-purple-200 flex items-start gap-2">
                    <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>💡</span>
                    <span>
                      <strong>Dica:</strong> Ao finalizar seu pedido, você poderá enviar a imagem ou arquivo do seu logotipo diretamente na nossa conversa do WhatsApp!
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>3. Escolha o Acabamento / Laminação:</label>
                <div className="acabamento-grid grid grid-cols-2 gap-2">
                  {ACABAMENTOS_DISPONIVEIS.map((opt) => {
                    const isSelected = acabamento === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAcabamento(opt.value)}
                        className={`acabamento-card-btn p-2.5 rounded-xl border-2 text-left transition-all flex flex-col items-start gap-1 ${
                          isSelected
                            ? 'active border-purple-600 bg-purple-50 text-purple-900 font-semibold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200'
                        }`}
                        aria-pressed={isSelected}
                      >
                        <span className="text-xs sm:text-sm font-bold">{opt.label}</span>
                        <span className="text-[11px] text-gray-500 font-normal leading-tight">
                          {opt.subtitulo}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="customQtd">4. Quantidade e Subtotal:</label>
                <div className="qty-touch-container">
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className="btn-qty-touch min-w-[44px] min-h-[44px]"
                      onClick={() => setQuantidade((prev) => Math.max(1, prev - 1))}
                      disabled={quantidade <= 1}
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </button>
                    <span className="qty-touch-value" aria-live="polite">
                      {quantidade}
                    </span>
                    <button
                      type="button"
                      className="btn-qty-touch min-w-[44px] min-h-[44px]"
                      onClick={() => setQuantidade((prev) => prev + 1)}
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>

                  <div className="subtotal-preview-box">
                    <span className="subtotal-preview-label">Subtotal:</span>
                    <span className="subtotal-preview-pix">
                      {formatarMoeda(subtotalPix)}{' '}
                      <span>{pctPix}% OFF PIX</span>
                    </span>
                    <span className="subtotal-preview-normal">
                      ou {formatarMoeda(subtotalNormal)} no cartão
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={processandoArte}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '12px',
              opacity: processandoArte ? 0.7 : 1,
            }}
          >
            {processandoArte
              ? '⏳ Preparando arte circular em alta qualidade...'
              : `🛍️ Adicionar à Sacola de Pedidos • ${formatarMoeda(subtotalPix)}`}
          </button>

          <button
            type="button"
            className="btn-direct-whatsapp"
            onClick={handlePedirDiretoWhatsApp}
            disabled={processandoArte}
            title="Enviar este pedido individual diretamente para o WhatsApp da Prof. Ataíse"
          >
            <span>💬 Ou pedir apenas este item direto no WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
}
