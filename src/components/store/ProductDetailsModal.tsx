import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatarMoeda } from '../../utils/formatters';

export default function ProductDetailsModal() {
  const {
    config,
    categorias,
    produtoEmDetalhes,
    fecharModalDetalhes,
    abrirModalPersonalizacao,
    duvidaRapidaProduto,
  } = useStore();

  const [indiceFotoAtiva, setIndiceFotoAtiva] = useState<number>(0);

  const listaFotos = useMemo(() => {
    if (!produtoEmDetalhes) return [];
    const todas = [
      ...(produtoEmDetalhes.imagem ? [produtoEmDetalhes.imagem] : []),
      ...(produtoEmDetalhes.galeriaFotos || []),
    ].filter(Boolean);
    return Array.from(new Set(todas));
  }, [produtoEmDetalhes]);

  useEffect(() => {
    setIndiceFotoAtiva(0);
  }, [produtoEmDetalhes]);

  useEffect(() => {
    if (!produtoEmDetalhes) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        fecharModalDetalhes();
      } else if (e.key === 'ArrowRight' && listaFotos.length > 1) {
        setIndiceFotoAtiva((prev) => (prev + 1) % listaFotos.length);
      } else if (e.key === 'ArrowLeft' && listaFotos.length > 1) {
        setIndiceFotoAtiva((prev) =>
          prev === 0 ? listaFotos.length - 1 : prev - 1
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [produtoEmDetalhes, fecharModalDetalhes, listaFotos.length]);

  if (!produtoEmDetalhes) return null;

  const pctPix = Number(config.descontoPix ?? 5);
  const fatorPix = 1 - pctPix / 100;
  const precoPix = produtoEmDetalhes.preco * fatorPix;
  const parcela = produtoEmDetalhes.preco / 3;
  const descontoPct =
    produtoEmDetalhes.precoAntigo > produtoEmDetalhes.preco
      ? Math.round(
          ((produtoEmDetalhes.precoAntigo - produtoEmDetalhes.preco) /
            produtoEmDetalhes.precoAntigo) *
            100
        )
      : 0;

  const catObj = categorias.find((c) => c.id === produtoEmDetalhes.categoria);
  const nomeCategoria =
    catObj?.nome || produtoEmDetalhes.categoriaLabel || 'Personalizados';

  const temFichaTecnica = Boolean(
    produtoEmDetalhes.dimensoes?.trim() ||
      produtoEmDetalhes.quantidadeFolhas?.trim()
  );

  const ehBotton =
    produtoEmDetalhes.categoria === 'bottons' ||
    /botton/i.test(produtoEmDetalhes.nome);

  const fotoAtual = listaFotos[indiceFotoAtiva] || '';

  const irFotoAnterior = () => {
    setIndiceFotoAtiva((prev) =>
      prev === 0 ? listaFotos.length - 1 : prev - 1
    );
  };

  const irProximaFoto = () => {
    setIndiceFotoAtiva((prev) => (prev + 1) % listaFotos.length);
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detailsModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) fecharModalDetalhes();
      }}
    >
      <div className="custom-modal details-modal">
        <button
          type="button"
          className="modal-close"
          onClick={fecharModalDetalhes}
          aria-label="Fechar detalhes do produto"
        >
          ✕
        </button>

        <div className="details-modal-grid">
          {/* Coluna Esquerda: Galeria de Fotos */}
          <div className="details-gallery-col">
            <div className="details-main-photo">
              {fotoAtual ? (
                <>
                  <img
                    src={fotoAtual}
                    alt={`${produtoEmDetalhes.nome} - Foto ${indiceFotoAtiva + 1}`}
                  />
                  {listaFotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="gallery-nav-btn prev"
                        onClick={irFotoAnterior}
                        aria-label="Foto anterior"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="gallery-nav-btn next"
                        onClick={irProximaFoto}
                        aria-label="Próxima foto"
                      >
                        ›
                      </button>
                      <span className="gallery-counter-pill">
                        📷 {indiceFotoAtiva + 1} / {listaFotos.length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <div
                  className="details-emoji-placeholder"
                  style={{
                    background:
                      produtoEmDetalhes.corFundo ||
                      'linear-gradient(135deg, #f3ebff, #e6fbf9)',
                  }}
                >
                  <div className="thumb-emoji" style={{ fontSize: '4.5rem' }}>
                    {produtoEmDetalhes.emoji || '⭐'}
                  </div>
                  <span className="thumb-preview-tag">
                    ⭐ {produtoEmDetalhes.tagPreview || 'Personalizável'}
                  </span>
                </div>
              )}
            </div>

            {listaFotos.length > 1 && (
              <div className="details-thumbs-row">
                {listaFotos.map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    className={`details-thumb-btn ${
                      idx === indiceFotoAtiva ? 'active' : ''
                    }`}
                    onClick={() => setIndiceFotoAtiva(idx)}
                    aria-label={`Ver foto ${idx + 1}`}
                  >
                    <img src={url} alt={`Miniatura ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coluna Direita: Informações, Ficha Técnica e Ações */}
          <div className="details-info-col">
            <div className="details-badges-row">
              <span className="product-category-label" style={{ marginBottom: 0 }}>
                {nomeCategoria}
              </span>
              {produtoEmDetalhes.destaque && (
                <span className="badge badge-bestseller">
                  {produtoEmDetalhes.destaque}
                </span>
              )}
              {descontoPct > 0 && (
                <span className="badge badge-discount">-{descontoPct}%</span>
              )}
            </div>

            <h3 id="detailsModalTitle" className="details-product-title">
              {produtoEmDetalhes.nome}
            </h3>

            <div className="details-pricing-box">
              {ehBotton ? (
                <>
                  <div className="price-current-row">
                    <span className="price-current">
                      A partir de {formatarMoeda(4.21 * fatorPix)}
                    </span>
                    {pctPix > 0 && (
                      <span className="price-pix-tag">no PIX ({pctPix}% OFF)</span>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      marginTop: '10px',
                    }}
                  >
                    <div
                      style={{
                        background: '#f8f5ff',
                        border: '1.5px solid #d8b4fe',
                        borderRadius: '10px',
                        padding: '10px 8px',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#6b21a8',
                        }}
                      >
                        32 mm (Pequeno)
                      </div>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          color: '#7c3aed',
                          marginTop: '2px',
                        }}
                      >
                        R$ 4,00
                      </div>
                      <div
                        style={{
                          fontSize: '0.73rem',
                          color: '#16a34a',
                          fontWeight: 700,
                        }}
                      >
                        no PIX
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#64748b',
                          marginTop: '2px',
                        }}
                      >
                        ou R$ 4,21 cartão
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8f5ff',
                        border: '1.5px solid #d8b4fe',
                        borderRadius: '10px',
                        padding: '10px 8px',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#6b21a8',
                        }}
                      >
                        44 mm (Médio)
                      </div>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          color: '#7c3aed',
                          marginTop: '2px',
                        }}
                      >
                        R$ 6,00
                      </div>
                      <div
                        style={{
                          fontSize: '0.73rem',
                          color: '#16a34a',
                          fontWeight: 700,
                        }}
                      >
                        no PIX
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#64748b',
                          marginTop: '2px',
                        }}
                      >
                        ou R$ 6,32 cartão
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8f5ff',
                        border: '1.5px solid #d8b4fe',
                        borderRadius: '10px',
                        padding: '10px 8px',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#6b21a8',
                        }}
                      >
                        58 mm (Grande)
                      </div>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 900,
                          color: '#7c3aed',
                          marginTop: '2px',
                        }}
                      >
                        R$ 9,00
                      </div>
                      <div
                        style={{
                          fontSize: '0.73rem',
                          color: '#16a34a',
                          fontWeight: 700,
                        }}
                      >
                        no PIX
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#64748b',
                          marginTop: '2px',
                        }}
                      >
                        ou R$ 9,47 cartão
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {produtoEmDetalhes.precoAntigo > produtoEmDetalhes.preco && (
                    <span className="price-old">
                      De {formatarMoeda(produtoEmDetalhes.precoAntigo)}
                    </span>
                  )}
                  <div className="price-current-row">
                    <span className="price-current">{formatarMoeda(precoPix)}</span>
                    {pctPix > 0 && (
                      <span className="price-pix-tag">no PIX ({pctPix}% OFF)</span>
                    )}
                  </div>
                  <div className="price-installments">
                    ou {formatarMoeda(produtoEmDetalhes.preco)} em até 3x de{' '}
                    {formatarMoeda(parcela)} sem juros
                  </div>
                </>
              )}
            </div>

            {temFichaTecnica && (
              <div className="details-specs-grid">
                {produtoEmDetalhes.dimensoes?.trim() && (
                  <div className="details-spec-card">
                    <span className="spec-icon">📏</span>
                    <div>
                      <strong>Dimensões / Tamanho</strong>
                      <span>{produtoEmDetalhes.dimensoes}</span>
                    </div>
                  </div>
                )}
                {produtoEmDetalhes.quantidadeFolhas?.trim() && (
                  <div className="details-spec-card">
                    <span className="spec-icon">📄</span>
                    <div>
                      <strong>Quantidade de Folhas</strong>
                      <span>{produtoEmDetalhes.quantidadeFolhas}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="details-description-section">
              <h4>✨ Sobre o Produto</h4>
              <p className="details-desc-text">{produtoEmDetalhes.descricao}</p>

              {produtoEmDetalhes.detalhesExtras?.trim() && (
                <div className="details-extra-box">
                  <h4>📋 Mais Detalhes &amp; Especificações</h4>
                  <p className="details-extra-text">
                    {produtoEmDetalhes.detalhesExtras}
                  </p>
                </div>
              )}
            </div>

            <div className="details-actions-footer">
              <button
                type="button"
                className="btn-customize details-cta-main"
                onClick={() => abrirModalPersonalizacao(produtoEmDetalhes)}
              >
                🎨 Personalizar e Comprar
              </button>
              <button
                type="button"
                className="btn-quick-whatsapp details-cta-wa"
                onClick={() => duvidaRapidaProduto(produtoEmDetalhes)}
              >
                💬 Tirar Dúvida no WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

