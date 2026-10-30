import { useStore } from '../../context/StoreContext';
import { formatarMoeda } from '../../utils/formatters';

export default function ProductCard({ produto, nomeCategoria }) {
  const { config, abrirModalPersonalizacao, duvidaRapidaProduto } = useStore();

  const pctPix = Number(config.descontoPix ?? 5);
  const fatorPix = 1 - pctPix / 100;
  const precoPix = produto.preco * fatorPix;
  const parcela = produto.preco / 3;
  const descontoPct =
    produto.precoAntigo > produto.preco
      ? Math.round(((produto.precoAntigo - produto.preco) / produto.precoAntigo) * 100)
      : 0;

  return (
    <article className="product-card">
      <div className="product-badges">
        {produto.destaque && (
          <span className="badge badge-bestseller">{produto.destaque}</span>
        )}
        {descontoPct > 0 && (
          <span className="badge badge-discount">-{descontoPct}%</span>
        )}
      </div>

      <div className="product-thumb">
        {produto.imagem ? (
          <div
            className="thumb-illustration"
            style={{ padding: 0, overflow: 'hidden', background: '#fff' }}
          >
            <img
              src={produto.imagem}
              alt={produto.nome}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
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
        <span className="product-category-label">{nomeCategoria}</span>
        <h3 className="product-title">{produto.nome}</h3>
        <p className="product-desc">{produto.descricao}</p>

        <div className="product-pricing">
          {produto.precoAntigo > produto.preco && (
            <span className="price-old">De {formatarMoeda(produto.precoAntigo)}</span>
          )}
          <div className="price-current-row">
            <span className="price-current">{formatarMoeda(precoPix)}</span>
            {pctPix > 0 && (
              <span className="price-pix-tag">no PIX ({pctPix}% OFF)</span>
            )}
          </div>
          <div className="price-installments">
            ou {formatarMoeda(produto.preco)} em até 3x de {formatarMoeda(parcela)} sem juros
          </div>
        </div>

        <div className="product-actions">
          <button
            type="button"
            className="btn-customize"
            onClick={() => abrirModalPersonalizacao(produto)}
          >
            <span>🎨 Personalizar e Comprar</span>
          </button>
          <button
            type="button"
            className="btn-quick-whatsapp"
            title="Tirar dúvida deste item no WhatsApp"
            onClick={() => duvidaRapidaProduto(produto)}
            aria-label={`Tirar dúvida sobre ${produto.nome} no WhatsApp`}
          >
            💬
          </button>
        </div>
      </div>
    </article>
  );
}

