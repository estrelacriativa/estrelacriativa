import { useStore } from '../../context/StoreContext';

export default function FloatingWhatsApp() {
  const { config, carrinho, carrinhoAberto } = useStore();
  const mensagem =
    'Olá, Prof. Ataíse! Vim pelo site da Estrela Criativa e gostaria de um atendimento personalizado.';

  const temBarraMobile = carrinho.length > 0 && !carrinhoAberto;

  return (
    <a
      href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(mensagem)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`floating-wa w-12 h-12 right-4 z-40 transition-all duration-300 ${
        temBarraMobile ? 'bottom-20 md:bottom-4' : 'bottom-4'
      }`}
      title={`Falar no WhatsApp ${config.whatsappExibicao}`}
      aria-label="Falar conosco no WhatsApp"
    >
      💬
    </a>
  );
}

