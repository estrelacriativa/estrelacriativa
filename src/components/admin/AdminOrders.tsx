import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatarMoeda } from '../../utils/formatters';
import {
  MATRIZES_BOTTON,
  carregarElementoImagem,
  gerarFolhaA4BottonsDataUrl,
  abrirJanelaImpressaoA4,
  type TamanhoBottonId,
} from '../../utils/bottonStudio';
import type { OrderStatus, StudioBottonPreset } from '../../types/store';

interface AdminOrdersProps {
  onAbrirNoEstudioBotton: (preset: StudioBottonPreset) => void;
}

type FiltroPedidos = 'todos' | 'com_arte' | OrderStatus;

function extrairTamanhoId(texto?: string): TamanhoBottonId {
  if (texto?.includes('32')) return '32mm';
  if (texto?.includes('58')) return '58mm';
  return '44mm';
}

function formatarDataHora(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function AdminOrders({
  onAbrirNoEstudioBotton,
}: AdminOrdersProps) {
  const {
    pedidos,
    recarregarPedidos,
    atualizarStatusPedido,
    excluirPedido,
    mostrarNotificacao,
  } = useStore();

  const [filtro, setFiltro] = useState<FiltroPedidos>('todos');
  const [sincronizando, setSincronizando] = useState<boolean>(false);
  const [imprimindoItemUid, setImprimindoItemUid] = useState<string | null>(
    null
  );

  useEffect(() => {
    recarregarPedidos().catch(() => {});
  }, [recarregarPedidos]);

  const totalComArte = useMemo(
    () =>
      pedidos.filter((p) =>
        p.itens.some(
          (i) =>
            Boolean(i.personalizacao.arteBottonUrl) ||
            Boolean(i.personalizacao.arteBottonPreview)
        )
      ).length,
    [pedidos]
  );

  const pedidosFiltrados = useMemo(() => {
    if (filtro === 'todos') return pedidos;
    if (filtro === 'com_arte') {
      return pedidos.filter((p) =>
        p.itens.some(
          (i) =>
            Boolean(i.personalizacao.arteBottonUrl) ||
            Boolean(i.personalizacao.arteBottonPreview)
        )
      );
    }
    return pedidos.filter((p) => p.status === filtro);
  }, [pedidos, filtro]);

  const handleSincronizar = async () => {
    setSincronizando(true);
    try {
      await recarregarPedidos();
    } finally {
      setSincronizando(false);
    }
  };

  const handleBaixarArte = async (
    urlArte: string,
    clienteNome: string,
    tamanhoLabel?: string
  ) => {
    try {
      const resposta = await fetch(urlArte);
      const blob = await resposta.blob();
      const objUrl = URL.createObjectURL(blob);
      const slugCliente =
        clienteNome
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'cliente';
      const tamId = extrairTamanhoId(tamanhoLabel);

      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `arte-botton-${tamId}-${slugCliente}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
      mostrarNotificacao('⬇️ Foto circular em alta qualidade baixada!');
    } catch {
      window.open(urlArte, '_blank');
    }
  };

  const handleImprimirA4Direto = async (
    uidItem: string,
    urlArte: string,
    tamanhoLabel: string | undefined,
    quantidadePedido: number,
    clienteNome: string
  ) => {
    setImprimindoItemUid(uidItem);
    try {
      const tamId = extrairTamanhoId(tamanhoLabel);
      const spec = MATRIZES_BOTTON[tamId];
      const img = await carregarElementoImagem(urlArte);

      // Como a arte salva já possui exatamente o diâmetro de corte (frente + dobra),
      // usamos modoSangria 'preencher' com zoom 1 para manter escala 1:1 sem margem dupla!
      const qtdNaFolha = Math.min(
        spec.maxPorA4,
        Math.max(1, quantidadePedido || 1)
      );

      const { dataUrl } = gerarFolhaA4BottonsDataUrl(
        img,
        {
          frenteMm: spec.frenteMm,
          corteMm: spec.corteMm,
          zoom: 1,
          normOffsetX: 0,
          normOffsetY: 0,
          rotacaoGraus: 0,
          modoSangria: 'preencher',
          corFundo: '#FFFFFF',
        },
        qtdNaFolha
      );

      abrirJanelaImpressaoA4(
        dataUrl,
        `Pedido ${clienteNome} - Bottons ${spec.frenteMm}mm`
      );
    } catch {
      mostrarNotificacao(
        '❌ Não foi possível montar a folha A4 direto. Clique em "Abrir no Estúdio".'
      );
    } finally {
      setImprimindoItemUid(null);
    }
  };

  const handleConfirmarExclusao = (id: number, clienteNome: string) => {
    if (
      window.confirm(
        `Deseja realmente excluir o pedido de "${clienteNome}" e apagar as artes vinculadas?`
      )
    ) {
      excluirPedido(id);
    }
  };

  return (
    <div className="admin-single-col" style={{ maxWidth: '1040px' }}>
      <div className="admin-panel-card">
        <div className="panel-title">
          <span>🛍️ Pedidos Recebidos &amp; Fotos de Bottons Geradas</span>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            disabled={sincronizando}
            onClick={handleSincronizar}
          >
            {sincronizando ? '⏳ Sincronizando...' : '🔄 Atualizar Pedidos'}
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="orders-filter-bar">
          {(
            [
              { id: 'todos', label: `📋 Todos (${pedidos.length})` },
              {
                id: 'com_arte',
                label: `🎖️ Com Foto de Botton (${totalComArte})`,
              },
              {
                id: 'novo',
                label: `🆕 Novos (${
                  pedidos.filter((p) => p.status === 'novo').length
                })`,
              },
              {
                id: 'em_producao',
                label: `⚙️ Em Produção (${
                  pedidos.filter((p) => p.status === 'em_producao').length
                })`,
              },
              {
                id: 'concluido',
                label: `✅ Concluídos (${
                  pedidos.filter((p) => p.status === 'concluido').length
                })`,
              },
            ] as { id: FiltroPedidos; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              className={`order-filter-pill ${filtro === f.id ? 'active' : ''}`}
              onClick={() => setFiltro(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="orders-empty-box">
            <div style={{ fontSize: '2.8rem', marginBottom: '8px' }}>📭</div>
            <h4>Nenhum pedido encontrado neste filtro</h4>
            <p>
              Sempre que um cliente finalizar um pedido na loja (ou quando você
              salvar uma arte circular no Estúdio de Bottons), a foto pronta em
              alta qualidade aparecerá aqui automaticamente para você baixar e
              imprimir!
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {pedidosFiltrados.map((pedido) => (
              <div
                key={pedido.id}
                className={`order-card status-${pedido.status}`}
              >
                <div className="order-card-header">
                  <div>
                    <div className="order-customer-title">
                      <strong>👤 {pedido.clienteNome}</strong>
                      <span className="order-date-badge">
                        🕒 {formatarDataHora(pedido.criadoEm)}
                      </span>
                    </div>
                    <div className="order-meta-line">
                      {pedido.total > 0 && (
                        <span>
                          💰 Total:{' '}
                          <strong style={{ color: 'var(--rose-primary)' }}>
                            {formatarMoeda(pedido.total)}
                          </strong>{' '}
                          ({pedido.pagamento})
                        </span>
                      )}
                      {pedido.entrega && (
                        <span>
                          🚚 {pedido.entrega}
                          {pedido.cep ? ` • ${pedido.cep}` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="order-header-controls">
                    <select
                      className="order-status-select"
                      value={pedido.status}
                      onChange={(e) =>
                        atualizarStatusPedido(
                          pedido.id,
                          e.target.value as OrderStatus
                        )
                      }
                      aria-label="Status do pedido"
                    >
                      <option value="novo">🆕 Novo</option>
                      <option value="em_producao">⚙️ Em Produção</option>
                      <option value="concluido">✅ Concluído</option>
                    </select>

                    <button
                      type="button"
                      className="btn-outline-danger-sm"
                      style={{ height: '36px' }}
                      onClick={() =>
                        handleConfirmarExclusao(pedido.id, pedido.clienteNome)
                      }
                      title="Excluir este pedido"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {pedido.observacoes && (
                  <div className="order-obs-banner">
                    📝 <strong>Observações:</strong> {pedido.observacoes}
                  </div>
                )}

                <div className="order-items-stack">
                  {pedido.itens.map((item) => {
                    const urlArte =
                      item.personalizacao.arteBottonUrl ||
                      item.personalizacao.arteBottonPreview ||
                      '';

                    return (
                      <div key={item.uid} className="order-item-row">
                        <div className="order-item-summary">
                          <span className="order-qty-badge">
                            {item.quantidade}x
                          </span>
                          <div>
                            <strong>{item.nome}</strong>
                            <div className="order-item-specs">
                              {item.personalizacao.tamanhoBotton && (
                                <span>
                                  📐 Tamanho:{' '}
                                  <strong>
                                    {item.personalizacao.tamanhoBotton}
                                  </strong>
                                </span>
                              )}
                              <span>
                                ✏️ Nome/Obs: {item.personalizacao.nomeCapa}
                              </span>
                              <span>
                                ✨ Acabamento: {item.personalizacao.acabamento}
                              </span>
                            </div>
                          </div>
                        </div>

                        {urlArte && (
                          <div className="order-botton-art-box">
                            <a
                              href={urlArte}
                              target="_blank"
                              rel="noreferrer"
                              className="order-art-circle-thumb"
                              title="Clique para abrir a imagem original em nova aba"
                            >
                              <img
                                src={urlArte}
                                alt={`Arte Botton ${pedido.clienteNome}`}
                              />
                            </a>

                            <div className="order-art-actions">
                              <div className="order-art-title">
                                🎖️ Foto Circular Pronta p/ Produção (Alta
                                Qualidade)
                              </div>
                              <div className="order-art-buttons">
                                <button
                                  type="button"
                                  className="btn-art-action primary"
                                  onClick={() =>
                                    handleBaixarArte(
                                      urlArte,
                                      pedido.clienteNome,
                                      item.personalizacao.tamanhoBotton
                                    )
                                  }
                                >
                                  ⬇️ Baixar Foto Circular
                                </button>

                                <button
                                  type="button"
                                  className="btn-art-action print"
                                  disabled={imprimindoItemUid === item.uid}
                                  onClick={() =>
                                    handleImprimirA4Direto(
                                      item.uid,
                                      urlArte,
                                      item.personalizacao.tamanhoBotton,
                                      item.quantidade,
                                      pedido.clienteNome
                                    )
                                  }
                                >
                                  {imprimindoItemUid === item.uid
                                    ? '⏳ Montando A4...'
                                    : `🖨️ Imprimir A4 (${item.quantidade} un.)`}
                                </button>

                                <button
                                  type="button"
                                  className="btn-art-action studio"
                                  onClick={() =>
                                    onAbrirNoEstudioBotton({
                                      arteUrl: urlArte,
                                      tamanhoBotton:
                                        item.personalizacao.tamanhoBotton,
                                      quantidade: item.quantidade,
                                      clienteNome: pedido.clienteNome,
                                    })
                                  }
                                >
                                  🎛️ Abrir no Estúdio
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

