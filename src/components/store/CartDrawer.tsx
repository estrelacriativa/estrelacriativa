import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatarMoeda } from '../../utils/formatters';

const STORAGE_KEY_CHECKOUT = 'estrelaCriativaCheckoutCliente';

const OPCAO_RETIRADA = '🏪 Retirada no Local — Bom Jesus da Lapa (Grátis)';
const OPCAO_ENTREGA = '🛵 Entrega em Bom Jesus da Lapa (+ R$ 7,00)';

interface SalvedCheckoutData {
  nome?: string;
  entrega?: string;
  cep?: string;
  pagamento?: string;
  obs?: string;
}

export default function CartDrawer() {
  const {
    config,
    carrinho,
    carrinhoAberto,
    fecharCarrinho,
    alterarQuantidadeCarrinho,
    removerItemCarrinho,
    finalizarPedidoWhatsApp,
  } = useStore();

  const pctPix = Number(config.descontoPix ?? 5);
  const opcaoPixLabel = `PIX (com ${pctPix}% de desconto)`;

  // Restaura dados salvos da cliente no localStorage
  const [clienteNome, setClienteNome] = useState<string>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_CHECKOUT);
      if (salvo) {
        const parsed = JSON.parse(salvo) as SalvedCheckoutData;
        return parsed.nome || '';
      }
    } catch {
      // fallback
    }
    return '';
  });

  const [clienteEntrega, setClienteEntrega] = useState<string>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_CHECKOUT);
      if (salvo) {
        const parsed = JSON.parse(salvo) as SalvedCheckoutData;
        if (parsed.entrega === OPCAO_ENTREGA || parsed.entrega === OPCAO_RETIRADA) {
          return parsed.entrega;
        }
      }
    } catch {
      // fallback
    }
    return OPCAO_RETIRADA;
  });

  const [clienteCep, setClienteCep] = useState<string>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_CHECKOUT);
      if (salvo) {
        const parsed = JSON.parse(salvo) as SalvedCheckoutData;
        return parsed.cep || '';
      }
    } catch {
      // fallback
    }
    return '';
  });

  const [clientePagamento, setClientePagamento] = useState<string>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_CHECKOUT);
      if (salvo) {
        const parsed = JSON.parse(salvo) as SalvedCheckoutData;
        if (parsed.pagamento) return parsed.pagamento;
      }
    } catch {
      // fallback
    }
    return opcaoPixLabel;
  });

  const [clienteObs, setClienteObs] = useState<string>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY_CHECKOUT);
      if (salvo) {
        const parsed = JSON.parse(salvo) as SalvedCheckoutData;
        return parsed.obs || '';
      }
    } catch {
      // fallback
    }
    return '';
  });

  // Salva alterações do formulário automaticamente no localStorage
  useEffect(() => {
    try {
      const dados: SalvedCheckoutData = {
        nome: clienteNome,
        entrega: clienteEntrega,
        cep: clienteCep,
        pagamento: clientePagamento,
        obs: clienteObs,
      };
      localStorage.setItem(STORAGE_KEY_CHECKOUT, JSON.stringify(dados));
    } catch {
      // ignora quota
    }
  }, [clienteNome, clienteEntrega, clienteCep, clientePagamento, clienteObs]);

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

  const ehEntrega = clienteEntrega === OPCAO_ENTREGA;
  const taxaEntrega = ehEntrega ? 7.0 : 0.0;
  const totalFinal = subtotal - valorDesconto + taxaEntrega;

  const temBottonNoCarrinho = carrinho.some(
    (item) =>
      Boolean(item.personalizacao.tamanhoBotton) ||
      /botton/i.test(item.nome)
  );

  const handleEnviarPedido = () => {
    finalizarPedidoWhatsApp({
      nome: clienteNome,
      entrega: clienteEntrega,
      cep: clienteCep,
      pagamento: clientePagamento,
      obs: clienteObs,
      taxaEntrega,
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
              {temBottonNoCarrinho && (
                <div className="cart-botton-notice bg-amber-50 text-amber-900 border border-amber-200 p-3 rounded-xl text-xs mb-3 flex items-start gap-2 shadow-sm">
                  <span className="text-base leading-none">📎</span>
                  <span>
                    <strong>Lembrete importante:</strong> Se você personalizou bottons com foto ou arte própria, lembre-se de enviar a imagem original na conversa do WhatsApp ao finalizar o pedido!
                  </span>
                </div>
              )}

              <div>
                {carrinho.map((item) => (
                  <div className="cart-item relative" key={item.uid}>
                    <div
                      className="cart-item-icon"
                      style={{
                        borderRadius: item.personalizacao.arteBottonPreview
                          ? '50%'
                          : undefined,
                      }}
                    >
                      {item.personalizacao.arteBottonPreview ? (
                        <img
                          src={item.personalizacao.arteBottonPreview}
                          alt={`Arte ${item.nome}`}
                        />
                      ) : item.imagem ? (
                        <img src={item.imagem} alt={item.nome} />
                      ) : (
                        item.emoji || '⭐'
                      )}
                    </div>
                    <div className="cart-item-info">
                      <div className="flex justify-between items-start gap-2">
                        <div className="cart-item-title">{item.nome}</div>
                        <button
                          type="button"
                          className="cart-item-remove-btn text-xs text-red-500 hover:text-red-700 font-semibold p-1 transition-colors flex items-center gap-0.5"
                          onClick={() => removerItemCarrinho(item.uid)}
                          title="Remover este item da sacola"
                          aria-label={`Remover ${item.nome} da sacola`}
                        >
                          <span>🗑️</span>
                          <span className="hidden sm:inline">Remover</span>
                        </button>
                      </div>

                      <div className="cart-item-custom">
                        {item.personalizacao.tamanhoBotton && (
                          <>
                            <strong>Tamanho:</strong>{' '}
                            {item.personalizacao.tamanhoBotton}
                            <br />
                          </>
                        )}
                        <strong>Nome/Obs:</strong> {item.personalizacao.nomeCapa}
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
                    <option value={OPCAO_RETIRADA}>{OPCAO_RETIRADA}</option>
                    <option value={OPCAO_ENTREGA}>{OPCAO_ENTREGA}</option>
                  </select>

                  {ehEntrega ? (
                    <div className="mt-3">
                      <label
                        htmlFor="clienteCep"
                        style={{
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          color: 'var(--text-dark)',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        Seu Bairro e Endereço (em Bom Jesus da Lapa):
                      </label>
                      <input
                        type="text"
                        id="clienteCep"
                        className="form-control"
                        value={clienteCep}
                        onChange={(e) => setClienteCep(e.target.value)}
                        placeholder="Ex: Bairro São João, Rua..., Nº..., Ponto de referência"
                      />
                    </div>
                  ) : (
                    <div className="bg-purple-50 text-purple-800 p-3 rounded-lg text-xs mt-2 border border-purple-200 flex items-start gap-2">
                      <span className="text-base leading-none">📍</span>
                      <span>
                        <strong>Retirada Grátis:</strong> O endereço e horário de retirada em Bom Jesus da Lapa serão combinados diretamente no WhatsApp!
                      </span>
                    </div>
                  )}
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

          {temDescontoPix && pctPix > 0 && (
            <div className="cart-summary-row" style={{ color: 'var(--success)' }}>
              <span>Desconto PIX ({pctPix}%):</span>
              <strong>- {formatarMoeda(valorDesconto)}</strong>
            </div>
          )}

          <div className="cart-summary-row">
            <span>Taxa de Entrega (Bom Jesus da Lapa):</span>
            {taxaEntrega > 0 ? (
              <strong>{formatarMoeda(taxaEntrega)}</strong>
            ) : (
              <strong style={{ color: 'var(--success)', fontWeight: 800 }}>
                Grátis (Retirada)
              </strong>
            )}
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

