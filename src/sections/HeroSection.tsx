import { useStore } from '../context/StoreContext';

export default function HeroSection() {
  const { config } = useStore();
  const pctPix = Number(config.descontoPix ?? 5);
  const mensagemOrcamento =
    'Olá, Prof. Ataíse! Vim pelo site da Estrela Criativa e gostaria de fazer um orçamento.';

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-banner">
          <div className="hero-grid">
            <div className="hero-text">
              <span className="hero-badge">
                💜 Papelaria Personalizada &amp; Criativa • Prof. Ataíse
              </span>
              <h1 className="hero-title">
                Transformamos papel em{' '}
                <span className="highlight-purple">encanto</span> e{' '}
                <span className="highlight-aqua">criatividade</span> com o seu
                nome!
              </h1>
              <p className="hero-description">
                Planners pedagógicos, agendas, cadernos personalizados, kits de
                festa em 3D, etiquetas escolares à prova d&apos;água e brindes
                corporativos. Escolha seus itens no catálogo e envie seu pedido
                direto para o nosso WhatsApp!
              </p>
              <div className="hero-buttons">
                <a href="#catalogo" className="btn-primary">
                  <span>🛍️ Ver Catálogo Completo</span>
                </a>
                <a
                  href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
                    mensagemOrcamento
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <span>💬 Falar no WhatsApp {config.whatsappExibicao}</span>
                </a>
              </div>
            </div>

            {/* Destaque com a Logo Oficial */}
            <div className="hero-visual">
              <div className="hero-showcase-card">
                <div className="floating-pill pill-top-left">
                  ⭐ Feito com Amor
                </div>
                <img
                  src="/logo-header.png"
                  alt={`Estrela Criativa - Prof. Ataíse - @${config.instagram} - ${config.whatsappExibicao}`}
                  className="hero-logo-display"
                />
                <div className="hero-showcase-footer">
                  <div style={{ textAlign: 'left' }}>
                    <strong
                      style={{
                        fontSize: '0.92rem',
                        color: 'var(--text-dark)',
                        display: 'block',
                      }}
                    >
                      Personalização Exclusiva
                    </strong>
                    <span
                      style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
                    >
                      Prévia da arte pelo WhatsApp
                    </span>
                  </div>
                  {pctPix > 0 && (
                    <span className="hero-pix-pill">{pctPix}% OFF no PIX</span>
                  )}
                </div>
                <div className="floating-pill pill-bottom-right">
                  📸 @{config.instagram}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
