import { useStore } from '../context/StoreContext';

interface DiferencialItem {
  icone: string;
  titulo: string;
  subtitulo: string;
}

export default function TrustBar() {
  const { config } = useStore();
  const pctPix = Number(config.descontoPix ?? 5);

  const diferenciais: DiferencialItem[] = [
    {
      icone: '🎨',
      titulo: '100% Personalizado',
      subtitulo: 'Com seu nome, tema ou logotipo',
    },
    {
      icone: '⭐',
      titulo: 'Acabamento Premium',
      subtitulo: 'Laminação fosca, brilho, holo ou glitter',
    },
    {
      icone: '💬',
      titulo: 'Pedido Fácil no WhatsApp',
      subtitulo: 'Monte a sacola e envie em 1 clique',
    },
    {
      icone: '💳',
      titulo:
        pctPix > 0
          ? `PIX com ${pctPix}% OFF ou Cartão`
          : 'PIX ou Cartão de Crédito',
      subtitulo: 'Parcelamento em até 3x sem juros',
    },
  ];

  return (
    <section className="trust-bar" aria-label="Diferenciais da loja">
      <div className="container">
        <div className="trust-grid">
          {diferenciais.map((item) => (
            <div className="trust-item" key={item.titulo}>
              <div className="trust-icon">{item.icone}</div>
              <div className="trust-text">
                <h4>{item.titulo}</h4>
                <p>{item.subtitulo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
