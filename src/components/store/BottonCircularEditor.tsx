import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import {
  desenharArteBottonNoContexto,
  type ConfigAjusteBotton,
  type ModoSangriaBotton,
} from '../../utils/bottonStudio';

interface BottonCircularEditorProps {
  imgElement: HTMLImageElement | null;
  ajuste: ConfigAjusteBotton;
  onChangeAjuste: (novo: ConfigAjusteBotton) => void;
  tamanhoCanvasVisual?: number;
  modoCompacto?: boolean; // true = modal do cliente | false = estúdio completo no Admin
}

export default function BottonCircularEditor({
  imgElement,
  ajuste,
  onChangeAjuste,
  tamanhoCanvasVisual = 270,
  modoCompacto = false,
}: BottonCircularEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arrastandoRef = useRef<{
    ativo: boolean;
    startX: number;
    startY: number;
    origOffsetX: number;
    origOffsetY: number;
  }>({
    ativo: false,
    startX: 0,
    startY: 0,
    origOffsetX: 0,
    origOffsetY: 0,
  });

  // Renderiza o canvas sempre que imagem ou ajustes mudarem
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = Math.round(tamanhoCanvasVisual * dpr);
    canvas.width = px;
    canvas.height = px;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, px, px);
    const diametroCortePx = px * 0.92;

    desenharArteBottonNoContexto({
      ctx,
      img: imgElement,
      cx: px / 2,
      cy: px / 2,
      diametroCortePx,
      ajuste,
      mostrarGuiasEditor: true,
      mostrarLinhaCorteImpressao: false,
    });
  }, [imgElement, ajuste, tamanhoCanvasVisual]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!imgElement) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastandoRef.current = {
      ativo: true,
      startX: e.clientX,
      startY: e.clientY,
      origOffsetX: ajuste.normOffsetX,
      origOffsetY: ajuste.normOffsetY,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!arrastandoRef.current.ativo || !imgElement) return;
    const dx = e.clientX - arrastandoRef.current.startX;
    const dy = e.clientY - arrastandoRef.current.startY;
    const diametroCorteCss = tamanhoCanvasVisual * 0.92;

    onChangeAjuste({
      ...ajuste,
      normOffsetX: arrastandoRef.current.origOffsetX + dx / diametroCorteCss,
      normOffsetY: arrastandoRef.current.origOffsetY + dy / diametroCorteCss,
    });
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (arrastandoRef.current.ativo) {
      arrastandoRef.current.ativo = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignora
      }
    }
  };

  const handleWheel = (e: ReactWheelEvent<HTMLCanvasElement>) => {
    if (!imgElement) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    const novoZoom = Math.min(3.5, Math.max(0.35, +(ajuste.zoom + delta).toFixed(2)));
    onChangeAjuste({ ...ajuste, zoom: novoZoom });
  };

  const handleCentralizar = () => {
    onChangeAjuste({
      ...ajuste,
      zoom: 1,
      normOffsetX: 0,
      normOffsetY: 0,
      rotacaoGraus: 0,
    });
  };

  return (
    <div className="botton-editor-wrap">
      <div className="botton-canvas-stage">
        <canvas
          ref={canvasRef}
          className="botton-interactive-canvas"
          style={{
            width: `${tamanhoCanvasVisual}px`,
            height: `${tamanhoCanvasVisual}px`,
            cursor: imgElement ? 'grab' : 'default',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        />
        <div className="botton-legend-pills">
          <span className="legend-pill front">
            ⚪ Tracejado branco = Frente do Botton ({ajuste.frenteMm}mm)
          </span>
          <span className="legend-pill bleed">
            🟣 Borda escura = Margem de dobra ({ajuste.corteMm}mm)
          </span>
        </div>
        {imgElement && (
          <p className="botton-drag-tip">
            👆 Arraste a imagem dentro do círculo para posicionar
          </p>
        )}
      </div>

      {imgElement && (
        <div className="botton-controls-panel">
          <div className="botton-control-row">
            <div className="botton-control-label">
              <span>🔍 Zoom da Imagem</span>
              <strong>{Math.round(ajuste.zoom * 100)}%</strong>
            </div>
            <input
              type="range"
              min="0.35"
              max="3.2"
              step="0.02"
              value={ajuste.zoom}
              onChange={(e) =>
                onChangeAjuste({ ...ajuste, zoom: parseFloat(e.target.value) })
              }
              className="botton-slider"
            />
          </div>

          {!modoCompacto && (
            <div className="botton-control-row">
              <div className="botton-control-label">
                <span>🔄 Girar Imagem</span>
                <strong>{ajuste.rotacaoGraus}°</strong>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={ajuste.rotacaoGraus}
                onChange={(e) =>
                  onChangeAjuste({
                    ...ajuste,
                    rotacaoGraus: parseInt(e.target.value, 10),
                  })
                }
                className="botton-slider"
              />
            </div>
          )}

          <div className="botton-control-row">
            <label className="botton-small-label">
              🎨 Preenchimento da Borda / Dobra:
            </label>
            <div className="botton-bleed-modes">
              {(
                [
                  { id: 'auto', label: '✨ Auto-Sangria' },
                  { id: 'solida', label: '🎨 Cor Sólida' },
                  { id: 'preencher', label: '🖼️ Esticar Foto' },
                ] as { id: ModoSangriaBotton; label: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`bleed-mode-btn ${
                    ajuste.modoSangria === m.id ? 'active' : ''
                  }`}
                  onClick={() =>
                    onChangeAjuste({ ...ajuste, modoSangria: m.id })
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {ajuste.modoSangria === 'solida' && (
            <div className="botton-color-picker-row">
              <span>Cor de fundo/borda:</span>
              <div className="color-swatches-inline">
                {['#FFFFFF', '#1F1630', '#F3EBFF', '#FFE380', '#E6FBF9'].map(
                  (cor) => (
                    <button
                      key={cor}
                      type="button"
                      className={`swatch-dot ${
                        ajuste.corFundo.toUpperCase() === cor ? 'active' : ''
                      }`}
                      style={{ background: cor }}
                      onClick={() => onChangeAjuste({ ...ajuste, corFundo: cor })}
                      aria-label={`Cor ${cor}`}
                    />
                  )
                )}
                <input
                  type="color"
                  value={ajuste.corFundo}
                  onChange={(e) =>
                    onChangeAjuste({ ...ajuste, corFundo: e.target.value })
                  }
                  title="Escolher qualquer cor"
                  className="color-input-native"
                />
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn-reset-botton"
            onClick={handleCentralizar}
          >
            🎯 Centralizar e Restaurar Enquadramento
          </button>
        </div>
      )}
    </div>
  );
}

