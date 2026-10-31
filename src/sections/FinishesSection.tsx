import { ACABAMENTOS_CAPA } from '../data/defaultStoreData';

export default function FinishesSection() {
  return (
    <section id="acabamentos" className="finishes-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Toque Especial Estrela Criativa</span>
          <h2 className="section-title">Escolha o Acabamento da sua Capa</h2>
          <p
            style={{
              maxWidth: '620px',
              margin: '8px auto 0',
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
            }}
          >
            Todas as nossas capas duras recebem película protetora impermeável
            (você pode limpar com paninho úmido!) disponível em 4 efeitos
            incríveis:
          </p>
        </div>

        <div className="finishes-grid">
          {ACABAMENTOS_CAPA.map((item) => (
            <div className="finish-card" key={item.id}>
              <div className={`finish-swatch ${item.classeSwatch}`}>
                {item.icone}
              </div>
              <h3>{item.titulo}</h3>
              <p>{item.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
