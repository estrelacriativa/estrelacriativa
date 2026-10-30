import { useStore } from '../../context/StoreContext';

export default function Topbar() {
  const { config } = useStore();

  return (
    <div className="topbar">
      <div className="container topbar-content">
        <span className="topbar-item">{config.avisoTopo || '⭐ Estrela Criativa • Prof. Ataíse'}</span>
        {Number(config.descontoPix) > 0 && (
          <span className="topbar-item">
            🏷️ <strong>{config.descontoPix}% de desconto</strong> em todos os pedidos pagos via PIX
          </span>
        )}
        <span className="topbar-item">
          💬 Pedidos pelo WhatsApp: <strong>{config.whatsappExibicao}</strong>
        </span>
      </div>
    </div>
  );
}

