import { useStore } from '../../context/StoreContext';

export default function Toast() {
  const { toast } = useStore();

  return (
    <div
      className={`toast ${toast.visivel ? 'show' : ''} ${
        toast.acoes && toast.acoes.length > 0 ? 'toast-has-actions' : ''
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="toast-content-wrapper">
        <span className="toast-msg">{toast.texto}</span>
        {toast.acoes && toast.acoes.length > 0 && (
          <div className="toast-actions-row">
            {toast.acoes.map((acao, idx) => (
              <button
                key={idx}
                type="button"
                className={`toast-action-btn ${
                  acao.tipo === 'primary'
                    ? 'toast-btn-primary'
                    : 'toast-btn-secondary'
                }`}
                onClick={acao.onClick}
              >
                {acao.texto}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

