import { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatarMoeda } from '../../utils/formatters';
import type { Product } from '../../types/store';

interface ProductCardProps {
  produto: Product;
  nomeCategoria: string;
}

export default function ProductCard({ produto, nomeCategoria }: ProductCardProps) {
  const {
    config,
    abrirModalDetalhes,
    abrirModalPersonalizacao,
    duvidaRapidaProduto,
  } = useStore();

  const pctPix = Number(config.descontoPix ?? 5);
  const fatorPix = 1 - pctPix / 100;
  const precoPix = produto.preco * fatorPix;
  const parcela = produto.preco / 3;
  const descontoPct =
    produto.precoAntigo > produto.preco
      ? Math.round(
          ((produto.precoAntigo - produto.preco) / produto.precoAntigo) * 100
        )
      : 0;

  const listaFotos = useMemo(() => {
    return Array.from(
      new Set(
        [
          ...(produto.imagem ? [produto.imagem] : []),
          ...(produto.galeriaFotos || []),
        ].filter(Boolean)
      )
    );
  }, [produto.imagem, produto.galeriaFotos]);

  const totalFotos = listaFotos.length;
  const [indiceFoto, setIndiceFoto] = useState<number>(0);

  const fotoExibida = listaFotos[indiceFoto] || listaFotos[0] || '';
  const ehBotton =
    produto.categoria === 'bottons' || /botton/i.test(produto.nome);

  return (
    <article className="product-card flex flex-col justify-between h-full">
      <div className="product-badges">
        {produto.destaque && (
          <span className="badge badge-bestseller">{produto.destaque}</span>
        )}
        {descontoPct > 0 && (
          <span className="badge badge-discount">-{descontoPct}%</span>
        )}
      </div>

      {totalFotos > 1 && (
        <span className="product-photo-count-badge">
          📷 {indiceFoto + 1}/{totalFotos}
        </span>
      )}

      <div
        className="product-thumb clickable-thumb"
        onClick={() => abrirModalDetalhes(produto)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            abrirModalDetalhes(produto);
          }
        }}
        title="Clique para ver mais fotos e informações"
      >
        {fotoExibida ? (
          <div
            className="thumb-illustration"
            style={{
              padding: '6px',
              overflow: 'hidden',
              background: '#ffffff',
              position: 'relative',
            }}
          >
            <img
              src={fotoExibida}
              alt={`${produto.nome} - Foto ${indiceFoto + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />

            {totalFotos > 1 && (
              <>
                <button
                  type="button"
                  className="card-carousel-nav prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndiceFoto((prev) =>
                      prev === 0 ? totalFotos - 1 : prev - 1
                    );
                  }}
                  aria-label="Foto anterior"
                  title="Foto anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="card-carousel-nav next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndiceFoto((prev) => (prev + 1) % totalFotos);
                  }}
                  aria-label="Próxima foto"
                  title="Próxima foto"
                >
                  ›
                </button>

                <div
                  className="card-carousel-dots"
                  onClick={(e) => e.stopPropagation()}
                >
                  {listaFotos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`card-carousel-dot ${
                        i === indiceFoto ? 'active' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIndiceFoto(i);
                      }}
                      aria-label={`Ver foto ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            <span
              className="thumb-preview-tag"
              style={{ position: 'absolute', bottom: '10px' }}
            >
              ⭐ {produto.tagPreview || 'Personalizável'}
            </span>
          </div>
        ) : (
          <div
            className="thumb-illustration"
            style={{
              background:
                produto.corFundo || 'linear-gradient(135deg, #f3ebff, #e6fbf9)',
            }}
          >
            <div className="thumb-emoji">{produto.emoji || '⭐'}</div>
            <span className="thumb-preview-tag">
              ⭐ {produto.tagPreview || 'Personalizável'}
            </span>
          </div>
        )}
      </div>

      <div className="product-body">
        <div className="product-content-top">
          <span className="product-category-label">{nomeCategoria}</span>
          <h3 className="product-title">{produto.nome}</h3>
          <p className="product-desc">{produto.descricao}</p>

          {(produto.dimensoes || produto.quantidadeFolhas) && (
            <div className="product-mini-specs">
              {produto.dimensoes && (
                <span className="mini-spec-pill">📏 {produto.dimensoes}</span>
              )}
              {produto.quantidadeFolhas && (
                <span className="mini-spec-pill">
                  📄 {produto.quantidadeFolhas}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="product-footer">
          <div className="product-pricing">
            {ehBotton ? (
              <>
                <span className="price-from-label">A partir de</span>
                <div className="price-current-row">
                  <span className="price-current">
                    {formatarMoeda(4.21 * fatorPix)}
                  </span>
                  {pctPix > 0 && (
                    <span className="price-pix-tag">no PIX ({pctPix}% OFF)</span>
                  )}
                </div>
                <div className="price-installments price-botton-sizes">
                  32mm: R$ 4,00 • 44mm: R$ 6,00 • 58mm: R$ 9,00
                </div>
              </>
            ) : (
              <>
                {produto.precoAntigo > produto.preco && (
                  <span className="price-old">
                    De {formatarMoeda(produto.precoAntigo)}
                  </span>
                )}
                <div className="price-current-row">
                  <span className="price-current">{formatarMoeda(precoPix)}</span>
                  {pctPix > 0 && (
                    <span className="price-pix-tag">no PIX ({pctPix}% OFF)</span>
                  )}
                </div>
                <div className="price-installments">
                  ou {formatarMoeda(produto.preco)} em até 3x de{' '}
                  {formatarMoeda(parcela)} sem juros
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            className="btn-more-info"
            onClick={() => abrirModalDetalhes(produto)}
          >
            🔍 Mais Informações
          </button>

          <div className="product-actions">
            <button
              type="button"
              className="btn-customize"
              onClick={() => abrirModalPersonalizacao(produto)}
            >
              <span>🎨 Personalizar</span>
            </button>
            <button
              type="button"
              className="btn-quick-whatsapp"
              title="Pedir ou tirar dúvida deste item no WhatsApp"
              onClick={() => duvidaRapidaProduto(produto)}
              aria-label={`Pedir ou tirar dúvida sobre ${produto.nome} no WhatsApp`}
            >
              💬
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
