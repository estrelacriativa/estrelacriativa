import { useStore } from '../../context/StoreContext';

export default function Toast() {
  const { toast } = useStore();

  return (
    <div
      className={`toast ${toast.visivel ? 'show' : ''}`}
      role="status"
      aria-live="polite"
    >
      {toast.texto}
    </div>
  );
}

