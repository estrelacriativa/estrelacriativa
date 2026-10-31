import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatarMoeda } from '../../utils/formatters';

export default function CartDrawer() {
  const {
    config,
    carrinho,
    carrinhoAberto,
    fecharCarrinho,
    alterarQuantidadeCarrinho,
    finalizarPedidoWhatsApp,
  } = useStore();

  const pctPix = Number(config.descontoPix ?? 5);
  const opcaoPixLabel = `PIX (com ${pctPix}% de desconto)`;

  const [clienteNome, setClienteNome] = useState<string>('');
  const [clienteEntrega, setClienteEntrega] = useState<string>(
    'Retirada / Entrega Local (DF e Região)'
  );
  const [clienteCep, setClienteCep] = useState<string>('');
  const [clientePagamento, setClientePagamento] =
    useState<string>(opcaoPixLabel);
  const [clienteObs, setClienteObs] = useState<string>('');

  useEffect(() => {
    setClientePagamento((prev) =>
      prev.includes('PIX') ? `PIX (com ${pctPix}% de desconto)` : prev
    );
  }, [pctPix]);

  useEffect(() => {
    if (!carrinhoAberto) return undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fecharCarrinho();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carrinhoAberto, fecharCarrinho]);

  const subtotal = carrinho.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );
  const temDescontoPix = clientePagamento.includes('PIX');
  const valorDesconto = temDescontoPix ? subtotal * (pctPix / 100) : 0;
  const totalFinal = subtotal - valorDesconto;

  const handleEnviarPedido = () => {
    finalizarPedidoWhatsApp({
      nome: clienteNome,
      entrega: clienteEntrega,
      cep: clienteCep,
      pagamento: clientePagamento,
      obs: clienteObs,
    });
  };

  return (
    <>
      {carrinhoAberto && (
        <div
          className="cart-overlay"
          onClick={fecharCarrinho}
          aria-hidden="true"
        />
      )}

      <aside
        className={`cart-drawer ${carrinhoAberto ? 'active' : ''}`}
        aria-label="Sacola de Pedidos"
      >
        <div className="cart-header">
          <h3>🛍️ Meu Pedido Personalizado</h3>
          <button
            type="button"
            className="modal-close"
            style={{ position: 'static' }}
            onClick={fecharCarrinho}
            aria-label="Fechar sacola"
          >
            ✕
          </button>
        </div>

        <div className="cart-body">
          {carrinho.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <h4>Sua sacola está vazia</h4>
              <p style={{ marginTop: '6px', fontSize: '0.88rem' }}>
                Escolha seus produtos personalizados no catálogo para enviar seu
                pedido pelo WhatsApp.
              </p>
            </div>
          ) : (
            <>
              <div>
                {carrinho.map((item) => (
                  <div className="cart-item" key={item.uid}>
                    <div className="cart-item-icon">
                      {item.imagem ? (
                        <img src={item.imagem} alt={item.nome} />
                      ) : (
                        item.emoji || '⭐'
                      )}
                    </div>
                    <div className="cart-item-info">
                      <div className="cart-item-title">{item.nome}</div>
                      <div className="cart-item-custom">
                        <strong>Nome/Texto:</strong> {item.personalizacao.nomeCapa}
                        <br />
                        <strong>Tema:</strong> {item.personalizacao.tema}
                        <br />
                        <strong>Acabamento:</strong>{' '}
                        {item.personalizacao.acabamento}
                      </div>
                      <div className="cart-item-bottom">
                        <div className="qty-controls">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() =>
                              alterarQuantidadeCarrinho(item.uid, -1)
                            }
                            aria-label="Diminuir quantidade"
                          >
                            −
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                            {item.quantidade}
                          </span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() =>
                              alterarQuantidadeCarrinho(item.uid, 1)
                            }
                            aria-label="Aumentar quantidade"
                          >
                            +
                          </button>
                        </div>
                        <strong
                          style={{
                            color: 'var(--rose-primary)',
                            fontSize: '0.92rem',
                          }}
                        >
                          {formatarMoeda(item.preco * item.quantidade)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dados para Envio no WhatsApp */}
              <div className="cart-checkout-form">
                <h4>📋 Seus Dados para agilizar o atendimento:</h4>

                <div className="form-group">
                  <label htmlFor="clienteNome">Seu Nome:</label>
                  <input
                    type="text"
                    id="clienteNome"
                    className="form-control"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="clienteEntrega">Forma de Entrega:</label>
                  <select
                    id="clienteEntrega"
                    className="form-control"
                    value={clienteEntrega}
                    onChange={(e) => setClienteEntrega(e.target.value)}
                  >
                    <option value="Retirada / Entrega Local (DF e Região)">
                      🏠 Retirada / Entrega Local (DF e Região)
                    </option>
                    <option value="Envio por Correios / Transportadora">
                      📦 Envio por Correios / Transportadora
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="clienteCep">Sua Cidade/Bairro ou CEP:</label>
                  <input
                    type="text"
                    id="clienteCep"
                    className="form-control"
                    value={clienteCep}
                    onChange={(e) => setClienteCep(e.target.value)}
                    placeholder="Ex: Brasília - DF ou CEP"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="clientePagamento">
                    Forma de Pagamento Preferida:
                  </label>
                  <select
                    id="clientePagamento"
                    className="form-control"
                    value={clientePagamento}
                    onChange={(e) => setClientePagamento(e.target.value)}
                  >
                    <option value={opcaoPixLabel}>💠 {opcaoPixLabel}</option>
                    <option value="Cartão de Crédito (até 3x sem juros)">
                      💳 Cartão de Crédito (até 3x sem juros)
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="clienteObs">
                    Observações ou Data do Evento (opcional):
                  </label>
                  <input
                    type="text"
                    id="clienteObs"
                    className="form-control"
                    value={clienteObs}
                    onChange={(e) => setClienteObs(e.target.value)}
                    placeholder="Ex: Preciso para o dia 15 / Quero incluir tassel"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-summary-row">
            <span>Subtotal dos itens:</span>
            <strong>{formatarMoeda(subtotal)}</strong>
          </div>
          <div className="cart-summary-row" style={{ color: 'var(--success)' }}>
            <span>Desconto PIX ({pctPix}%):</span>
            <strong>- {formatarMoeda(valorDesconto)}</strong>
          </div>
          <div className="cart-summary-total">
            <span>Total Estimado:</span>
            <span>{formatarMoeda(totalFinal)}</span>
          </div>

          <button
            type="button"
            className="btn-whatsapp-checkout"
            onClick={handleEnviarPedido}
          >
            <span>💬 Enviar Pedido para {config.whatsappExibicao}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
