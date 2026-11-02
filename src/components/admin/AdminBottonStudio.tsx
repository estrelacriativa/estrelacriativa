import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useStore } from '../../context/StoreContext';
import BottonCircularEditor from '../store/BottonCircularEditor';
import {
  LISTA_MATRIZES_BOTTON,
  MATRIZES_BOTTON,
  carregarElementoImagem,
  lerArquivoComoDataUrl,
  gerarArteCircularAltaQualidadeBlob,
  gerarFolhaA4BottonsDataUrl,
  abrirJanelaImpressaoA4,
  uploadArteBottonClienteSupabase,
  gerarPromptsProntosBotton,
  type TamanhoBottonId,
  type ConfigAjusteBotton,
} from '../../utils/bottonStudio';
import type { StudioBottonPreset } from '../../types/store';

interface AdminBottonStudioProps {
  presetPedido?: StudioBottonPreset | null;
  onLimparPreset?: () => void;
  onIrParaPedidos?: () => void;
}

export default function AdminBottonStudio({
  presetPedido,
  onLimparPreset,
  onIrParaPedidos,
}: AdminBottonStudioProps) {
  const { mostrarNotificacao, salvarArteAvulsaEmPedidos } = useStore();

  const [tamanhoAtivo, setTamanhoAtivo] = useState<TamanhoBottonId>('44mm');
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [ajuste, setAjuste] = useState<ConfigAjusteBotton>({
    frenteMm: MATRIZES_BOTTON['44mm'].frenteMm,
    corteMm: MATRIZES_BOTTON['44mm'].corteMm,
    zoom: 1,
    normOffsetX: 0,
    normOffsetY: 0,
    rotacaoGraus: 0,
    modoSangria: 'auto',
    corFundo: '#FFFFFF',
  });
  const [qtdNaFolha, setQtdNaFolha] = useState<number>(
    MATRIZES_BOTTON['44mm'].maxPorA4
  );
  const [gerandoArquivo, setGerandoArquivo] = useState<boolean>(false);
  const [salvandoEmPedidos, setSalvandoEmPedidos] = useState<boolean>(false);
  const [nomeClienteSalvar, setNomeClienteSalvar] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!presetPedido?.arteUrl) return;
    const tam: TamanhoBottonId = presetPedido.tamanhoBotton?.includes('32')
      ? '32mm'
      : presetPedido.tamanhoBotton?.includes('58')
      ? '58mm'
      : '44mm';
    const spec = MATRIZES_BOTTON[tam];
    setTamanhoAtivo(tam);
    setQtdNaFolha(
      Math.min(spec.maxPorA4, Math.max(1, presetPedido.quantidade || spec.maxPorA4))
    );
    if (presetPedido.clienteNome) {
      setNomeClienteSalvar(presetPedido.clienteNome);
    }

    carregarElementoImagem(presetPedido.arteUrl)
      .then((el) => {
        setImgEl(el);
        setAjuste({
          frenteMm: spec.frenteMm,
          corteMm: spec.corteMm,
          zoom: 1,
          normOffsetX: 0,
          normOffsetY: 0,
          rotacaoGraus: 0,
          modoSangria: 'preencher',
          corFundo: '#FFFFFF',
        });
        mostrarNotificacao('🎯 Arte do pedido carregada no Estúdio!');
        onLimparPreset?.();
      })
      .catch(() => {
        mostrarNotificacao(
          '⚠️ Baixe a foto na aba Pedidos e carregue pelo botão acima.'
        );
      });
  }, [presetPedido, mostrarNotificacao, onLimparPreset]);

  const handleSalvarArteNosPedidos = async () => {
    if (!imgEl) {
      mostrarNotificacao('⚠️ Carregue uma imagem antes de salvar em Pedidos.');
      return;
    }
    setSalvandoEmPedidos(true);
    try {
      const blob = await gerarArteCircularAltaQualidadeBlob(imgEl, ajuste, {
        resolucaoPx: 1600,
        incluirLinhaCorte: false,
        formato: 'image/png',
      });
      const urlSalva = await uploadArteBottonClienteSupabase(blob, tamanhoAtivo);
      await salvarArteAvulsaEmPedidos({
        clienteNome: nomeClienteSalvar.trim() || 'Arte Gerada no Estúdio',
        tamanhoBotton: `${ajuste.frenteMm}mm (corte c/ dobra ${ajuste.corteMm}mm)`,
        quantidade: qtdNaFolha,
        arteBottonUrl: urlSalva,
      });
      setNomeClienteSalvar('');
      mostrarNotificacao('💾 Foto circular salva na aba Pedidos com sucesso!');
      onIrParaPedidos?.();
    } catch {
      mostrarNotificacao(
        '❌ Erro ao enviar foto ao Supabase. Verifique se o bucket "produtos" já foi criado.'
      );
    } finally {
      setSalvandoEmPedidos(false);
    }
  };

  const handleSelecionarMatriz = (id: TamanhoBottonId) => {
    const spec = MATRIZES_BOTTON[id];
    setTamanhoAtivo(id);
    setAjuste((prev) => ({
      ...prev,
      frenteMm: spec.frenteMm,
      corteMm: spec.corteMm,
    }));
    setQtdNaFolha(spec.maxPorA4);
  };

  const handleUploadArquivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await lerArquivoComoDataUrl(file);
      const elemento = await carregarElementoImagem(dataUrl);
      setImgEl(elemento);
      setAjuste((prev) => ({
        ...prev,
        zoom: 1,
        normOffsetX: 0,
        normOffsetY: 0,
        rotacaoGraus: 0,
      }));
      mostrarNotificacao('📸 Imagem carregada no Estúdio de Bottons!');
    } catch {
      mostrarNotificacao('❌ Erro ao abrir o arquivo de imagem.');
    }
  };

  const handleBaixarIndividual600Dpi = async () => {
    if (!imgEl) {
      mostrarNotificacao('⚠️ Envie uma imagem primeiro para gerar a arte.');
      return;
    }
    setGerandoArquivo(true);
    try {
      const blob = await gerarArteCircularAltaQualidadeBlob(imgEl, ajuste, {
        resolucaoPx: 1800,
        incluirLinhaCorte: true,
        formato: 'image/png',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `botton-${ajuste.frenteMm}mm-corte-${ajuste.corteMm}mm-alta-qualidade.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      mostrarNotificacao('✅ PNG circular em alta resolução baixado!');
    } catch {
      mostrarNotificacao('❌ Erro ao exportar imagem circular.');
    } finally {
      setGerandoArquivo(false);
    }
  };

  const handleBaixarFolhaA4 = () => {
    if (!imgEl) {
      mostrarNotificacao('⚠️ Envie uma imagem primeiro para montar a folha A4.');
      return;
    }
    setGerandoArquivo(true);
    try {
      const { dataUrl } = gerarFolhaA4BottonsDataUrl(imgEl, ajuste, qtdNaFolha);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `folha-a4-bottons-${ajuste.frenteMm}mm-300dpi.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      mostrarNotificacao('🖨️ Folha A4 em 300 DPI baixada! Imprima em Escala 100%.');
    } catch {
      mostrarNotificacao('❌ Erro ao gerar folha A4.');
    } finally {
      setGerandoArquivo(false);
    }
  };

  const handleImprimirFolhaA4Direto = () => {
    if (!imgEl) {
      mostrarNotificacao('⚠️ Envie uma imagem primeiro para imprimir.');
      return;
    }
    setGerandoArquivo(true);
    try {
      const { dataUrl } = gerarFolhaA4BottonsDataUrl(imgEl, ajuste, qtdNaFolha);
      abrirJanelaImpressaoA4(
        dataUrl,
        `Gabarito A4 Bottons ${ajuste.frenteMm}mm - Estrela Criativa`
      );
    } catch {
      mostrarNotificacao('❌ Erro ao preparar impressão A4.');
    } finally {
      setGerandoArquivo(false);
    }
  };

  const handleCopiarPrompt = async (texto: string, tipo: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      mostrarNotificacao(`📋 Prompt "${tipo}" copiado! Cole junto com a imagem na IA.`);
    } catch {
      mostrarNotificacao('⚠️ Selecione o texto manualmente e copie com Ctrl+C.');
    }
  };

  const { promptAdaptarFotoCliente, promptCriarArteDoZero } =
    gerarPromptsProntosBotton(ajuste.frenteMm, ajuste.corteMm);

  const specAtual = MATRIZES_BOTTON[tamanhoAtivo];

  return (
    <div className="botton-studio-grid">
      {/* COLUNA ESQUERDA: GERADOR CIRCULAR & GABARITO A4 300 DPI */}
      <div className="admin-panel-card">
        <div className="panel-title">
          <span>🎖️ Estúdio de Bottons &amp; Gabarito A4 (300 DPI)</span>
        </div>

        <div className="form-group">
          <label>1. Selecione sua Matriz de Fabricação:</label>
          <div className="botton-size-selector">
            {LISTA_MATRIZES_BOTTON.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`botton-size-card ${
                  tamanhoAtivo === m.id ? 'active' : ''
                }`}
                onClick={() => handleSelecionarMatriz(m.id)}
              >
                <strong>
                  {m.nomeCurto} — R$ {(m.preco * 0.95).toFixed(2).replace('.', ',')} no PIX
                </strong>
                <span>Corte: {m.corteMm}mm • {m.maxPorA4}/folha A4</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="frenteMmInput">
              Frente Visível do Botton (mm)
            </label>
            <input
              type="number"
              step="0.5"
              min="15"
              max="100"
              id="frenteMmInput"
              className="form-control"
              value={ajuste.frenteMm}
              onChange={(e) =>
                setAjuste((prev) => ({
                  ...prev,
                  frenteMm: Math.max(10, parseFloat(e.target.value) || 44),
                }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="corteMmInput">
              Diâmetro do Cortador / Dobra (mm)
            </label>
            <input
              type="number"
              step="0.5"
              min="20"
              max="120"
              id="corteMmInput"
              className="form-control"
              value={ajuste.corteMm}
              onChange={(e) =>
                setAjuste((prev) => ({
                  ...prev,
                  corteMm: Math.max(
                    prev.frenteMm + 4,
                    parseFloat(e.target.value) || 54
                  ),
                }))
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label>2. Carregar Foto / Arte do Cliente:</label>
          <label htmlFor="studioFileInput" className="image-upload-box">
            <span style={{ fontSize: '1.4rem', display: 'block' }}>📤</span>
            <span
              style={{
                fontSize: '0.86rem',
                fontWeight: 800,
                color: 'var(--rose-primary)',
              }}
            >
              Escolher foto ou arte do seu computador
            </span>
            <span
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                display: 'block',
              }}
            >
              JPG, PNG ou WebP • Mantém resolução máxima de impressão
            </span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="studioFileInput"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleUploadArquivo}
          />
        </div>

        <BottonCircularEditor
          imgElement={imgEl}
          ajuste={ajuste}
          onChangeAjuste={setAjuste}
          tamanhoCanvasVisual={280}
        />

        <div className="studio-print-box">
          <div className="form-row-2" style={{ alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="qtdFolhaInput">
                Unidades nesta Folha A4 (máx. {specAtual.maxPorA4}):
              </label>
              <input
                type="number"
                id="qtdFolhaInput"
                className="form-control"
                min="1"
                max={30}
                value={qtdNaFolha}
                onChange={(e) =>
                  setQtdNaFolha(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
              />
            </div>

            <button
              type="button"
              className="btn-outline-muted"
              style={{ height: '44px' }}
              onClick={() => setQtdNaFolha(specAtual.maxPorA4)}
            >
              Preencher folha ({specAtual.maxPorA4} unid.)
            </button>
          </div>

          <div className="studio-export-actions">
            <button
              type="button"
              className="btn-primary"
              disabled={!imgEl || gerandoArquivo}
              onClick={handleImprimirFolhaA4Direto}
              style={{
                width: '100%',
                justifyContent: 'center',
                opacity: !imgEl ? 0.55 : 1,
              }}
            >
              🖨️ Imprimir Folha A4 Agora (Tamanho Real em mm)
            </button>

            <div className="form-row-2">
              <button
                type="button"
                className="btn-secondary"
                disabled={!imgEl || gerandoArquivo}
                onClick={handleBaixarFolhaA4}
                style={{
                  justifyContent: 'center',
                  padding: '11px 12px',
                  fontSize: '0.82rem',
                  opacity: !imgEl ? 0.55 : 1,
                }}
              >
                ⬇️ Baixar Folha A4 (300 DPI)
              </button>

              <button
                type="button"
                className="btn-secondary"
                disabled={!imgEl || gerandoArquivo}
                onClick={handleBaixarIndividual600Dpi}
                style={{
                  justifyContent: 'center',
                  padding: '11px 12px',
                  fontSize: '0.82rem',
                  opacity: !imgEl ? 0.55 : 1,
                }}
              >
                ⭕ Baixar 1 Círculo PNG (600 DPI)
              </button>
            </div>

            <div className="studio-save-order-box">
              <input
                type="text"
                className="form-control"
                placeholder="Nome do cliente / identificação p/ salvar em Pedidos..."
                value={nomeClienteSalvar}
                onChange={(e) => setNomeClienteSalvar(e.target.value)}
              />
              <button
                type="button"
                className="btn-save-to-orders"
                disabled={!imgEl || salvandoEmPedidos}
                onClick={handleSalvarArteNosPedidos}
              >
                {salvandoEmPedidos
                  ? '⏳ Salvando...'
                  : '💾 Guardar Foto em Pedidos'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COLUNA DIREITA: PROMPTS PRONTOS DE IA CALIBRADOS PARA A MATRIZ */}
      <div className="admin-panel-card">
        <div className="panel-title">
          <span>
            🤖 Prompts Prontos de IA ({ajuste.frenteMm}mm / corte {ajuste.corteMm}mm)
          </span>
        </div>

        <div className="prompt-helper-banner">
          💡 <strong>Quando usar o Prompt de IA?</strong> Quando o cliente mandar
          uma foto muito fechada/cortada na cabeça ou em baixa resolução e você
          quiser que a IA (aqui mesmo no Antigravity, no Gemini ou no ChatGPT)
          <strong> expanda o fundo automaticamente</strong> e melhore a nitidez
          antes de jogar no Gabarito A4 ao lado!
        </div>

        <div className="prompt-card-block">
          <div className="prompt-card-header">
            <div>
              <h4>1. Adaptar Foto/Logo Enviada pelo Cliente</h4>
              <span>
                Anexe a imagem do cliente na IA + cole este prompt pronto
              </span>
            </div>
            <button
              type="button"
              className="btn-copy-prompt"
              onClick={() =>
                handleCopiarPrompt(
                  promptAdaptarFotoCliente,
                  'Adaptar Foto do Cliente'
                )
              }
            >
              📋 Copiar Prompt
            </button>
          </div>
          <textarea
            readOnly
            className="prompt-textarea"
            rows={9}
            value={promptAdaptarFotoCliente}
          />
        </div>

        <div className="prompt-card-block" style={{ marginBottom: 0 }}>
          <div className="prompt-card-header">
            <div>
              <h4>2. Criar Arte Nova de Botton do Zero</h4>
              <span>
                Para criar temas de festa, lembrancinhas ou campanhas escolares
              </span>
            </div>
            <button
              type="button"
              className="btn-copy-prompt"
              onClick={() =>
                handleCopiarPrompt(promptCriarArteDoZero, 'Criar Arte do Zero')
              }
            >
              📋 Copiar Prompt
            </button>
          </div>
          <textarea
            readOnly
            className="prompt-textarea"
            rows={7}
            value={promptCriarArteDoZero}
          />
        </div>
      </div>
    </div>
  );
}

