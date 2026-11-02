import { DEPOIMENTOS_CLIENTES } from '../data/defaultStoreData';

export default function TestimonialsSection() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Quem Compra, Se Apaixona</span>
          <h2 className="section-title">Avaliações das Nossas Clientes</h2>
        </div>

        <div className="testimonials-grid">
          {DEPOIMENTOS_CLIENTES.map((dep) => (
            <div className="testimonial-card" key={dep.id}>
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">{dep.texto}</p>
              <div className="testimonial-author">
                <div className="author-avatar">{dep.iniciais}</div>
                <div className="author-info">
                  <strong>{dep.nome}</strong>
                  <span>{dep.compra}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

