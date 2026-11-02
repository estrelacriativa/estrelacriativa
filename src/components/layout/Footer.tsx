import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export default function Footer() {
  const { config, categorias, filtrarPorCategoria, abrirCarrinho } = useStore();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              src="/logo-header.png"
              alt="Logo Estrela Criativa - Prof. Ataíse"
              style={{
                height: '105px',
                width: 'auto',
                background: '#fff',
                padding: '8px 16px',
                borderRadius: '14px',
                margin: '0 auto 14px',
                display: 'block',
              }}
            />
            <p
              style={{
                fontSize: '0.9rem',
                color: '#d6c8eb',
                marginBottom: '12px',
                textAlign: 'justify',
                width: '100%',
              }}
            >
              Papelaria personalizada e pedagógica feita com amor, cuidado em cada
              detalhe e materiais de alta qualidade para acompanhar sua rotina,
              escola e comemorações.
            </p>
          </div>

          <div>
            <h4>Departamentos</h4>
            <ul className="footer-links">
              {categorias.map((cat) => (
                <li key={cat.id}>
                  <a
                    href="#catalogo"
                    onClick={(e) => {
                      e.preventDefault();
                      filtrarPorCategoria(cat.id, true);
                    }}
                  >
                    {cat.nomeCurto || cat.nome}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Informações</h4>
            <ul className="footer-links">
              <li>
                <a href="#como-funciona">Como Encomendar</a>
              </li>
              <li>
                <a href="#acabamentos">Tipos de Laminação</a>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={abrirCarrinho}
                >
                  Minha Sacola de Pedidos
                </button>
              </li>
              <li>
                <Link
                  to="/admin"
                  style={{ color: 'var(--gold-soft)', fontWeight: 700 }}
                >
                  🔒 Painel Administrativo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Contato Oficial</h4>
            <ul className="footer-links">
              <li>
                👩‍🏫 <strong>Prof. Ataíse</strong>
              </li>
              <li>
                <a
                  href={`https://wa.me/${config.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 WhatsApp: {config.whatsappExibicao}
                </a>
              </li>
              <li>
                <a
                  href={`https://www.instagram.com/${config.instagram}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📸 Instagram: @{config.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Estrela Criativa — Prof. Ataíse | Papelaria
          Personalizada. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

