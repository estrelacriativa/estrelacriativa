import { useState } from 'react';
import { PERGUNTAS_FREQUENTES } from '../data/defaultStoreData';
import { useStore } from '../context/StoreContext';

export default function FaqSection() {
  const { config } = useStore();
  const [abertaId, setAbertaId] = useState<number | null>(1);

  const pctPix = Number(config.descontoPix ?? 5);

  const togglePergunta = (id: number) => {
    setAbertaId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="faq-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Tire Suas Dúvidas</span>
          <h2 className="section-title">Perguntas Frequentes</h2>
        </div>

        <div className="faq-list">
          {PERGUNTAS_FREQUENTES.map((faq) => {
            const estaAberta = abertaId === faq.id;
            const textoResposta =
              faq.id === 3 && pctPix > 0
                ? `Aceitamos PIX (com ${pctPix}% de desconto imediato), Cartão de Crédito em até 3x sem juros ou link de pagamento.`
                : faq.resposta;

            return (
              <div
                className={`faq-item ${estaAberta ? 'open' : ''}`}
                key={faq.id}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => togglePergunta(faq.id)}
                  aria-expanded={estaAberta}
                >
                  <span>{faq.pergunta}</span>
                  <span className="faq-chevron">▾</span>
                </button>
                {estaAberta && <div className="faq-answer">{textoResposta}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

