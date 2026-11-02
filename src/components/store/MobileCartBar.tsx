import { useStore } from '../../context/StoreContext';
import { formatarMoeda } from '../../utils/formatters';

export default function MobileCartBar() {
  const { carrinho, carrinhoAberto, abrirCarrinho, config } = useStore();

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  if (totalItens === 0 || carrinhoAberto) {
    return null;
  }

  const pctPix = Number(config.descontoPix ?? 5);
  const subtotal = carrinho.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );
  const subtotalPix = subtotal * (1 - pctPix / 100);

  return (
    <aside
      className="mobile-cart-fixed-bar md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-purple-100 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] px-4 py-3 flex items-center justify-between"
      style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      aria-label="Resumo rápido da sacola"
    >
      <div className="flex flex-col pr-2">
        <span className="text-xs font-bold text-gray-500">
          {totalItens} {totalItens === 1 ? 'item na sacola' : 'itens na sacola'}
        </span>
        <span className="text-base font-extrabold text-purple-700">
          {formatarMoeda(subtotalPix)}{' '}
          <span className="text-[11px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-1">
            no PIX
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={abrirCarrinho}
        className="btn-primary py-2.5 px-4 text-sm font-bold shadow-md hover:shadow-lg transition-all"
        style={{ margin: 0, width: 'auto' }}
      >
        <span>🛍️ Ver Sacola / Finalizar</span>
      </button>
    </aside>
  );
}

