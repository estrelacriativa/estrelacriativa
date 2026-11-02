import { useStore } from '../../context/StoreContext';

export default function Topbar() {
  const { config } = useStore();
  const descPix = Number(config.descontoPix) || 5;

  return (
    <div className="topbar">
      <div className="container">
        {/* Mobile: linha compacta única sem quebras */}
        <div className="topbar-mobile md:hidden py-1.5 text-xs text-center truncate">
          ⭐ {descPix}% OFF no PIX • Pedidos via WhatsApp
        </div>

        {/* Desktop: itens completos */}
        <div className="topbar-content hidden md:flex">
          <span className="topbar-item">
            {config.avisoTopo || '⭐ Estrela Criativa • Prof. Ataíse'}
          </span>
          {descPix > 0 && (
            <span className="topbar-item">
              🏷️ <strong>{descPix}% de desconto</strong> em todos os pedidos pagos via PIX
            </span>
          )}
          <span className="topbar-item">
            💬 Pedidos pelo WhatsApp: <strong>{config.whatsappExibicao}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

