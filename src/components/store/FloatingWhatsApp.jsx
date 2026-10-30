import { useStore } from '../../context/StoreContext';

export default function FloatingWhatsApp() {
  const { config } = useStore();
  const mensagem =
    'Olá, Prof. Ataíse! Vim pelo site da Estrela Criativa e gostaria de um atendimento personalizado.';

  return (
    <a
      href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(mensagem)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-wa"
      title={`Falar no WhatsApp ${config.whatsappExibicao}`}
      aria-label="Falar conosco no WhatsApp"
    >
      💬
    </a>
  );
}

