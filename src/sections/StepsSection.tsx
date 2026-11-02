import { PASSOS_ENCOMENDA } from '../data/defaultStoreData';

export default function StepsSection() {
  return (
    <section id="como-funciona" className="steps-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Prático, Rápido e Seguro</span>
          <h2 className="section-title">Como Encomendar seu Personalizado</h2>
        </div>

        <div className="steps-grid">
          {PASSOS_ENCOMENDA.map((passo) => (
            <div className="step-card" key={passo.numero}>
              <div className="step-number">{passo.numero}</div>
              <h3>{passo.titulo}</h3>
              <p>{passo.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

