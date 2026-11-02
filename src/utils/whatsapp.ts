import type { CartItem } from '../types/store';

export interface WhatsAppOrderData {
  customerName: string;
  items: CartItem[];
  deliveryType: string;
  deliveryFee: number;
  address?: string;
  paymentMethod: string;
  subtotal: number;
  discountPix: number;
  total: number;
  phoneNumber?: string;
}

export function generateWhatsAppMessage(orderData: {
  customerName: string;
  items: CartItem[];
  deliveryType: string;
  deliveryFee: number;
  address?: string;
  paymentMethod: string;
  subtotal: number;
  discountPix: number;
  total: number;
  phoneNumber?: string;
}) {
  const itemsList = orderData.items
    .map((item, index) => {
      const quantity = item.quantity ?? item.quantidade ?? 1;
      const title = item.title || item.nome;
      const subtotalItem = item.subtotal ?? item.preco * quantity;
      const customText = item.customText || item.personalizacao?.nomeCapa;
      const theme = item.theme || item.personalizacao?.tema || 'Padrão';
      const themeDetails = item.themeDetails;
      const lamination =
        item.lamination || item.personalizacao?.acabamento || 'Padrão';
      const isBotton =
        item.type === 'botton' ||
        Boolean(item.bottonSize) ||
        Boolean(item.personalizacao?.tamanhoBotton) ||
        /botton/i.test(item.nome);
      const bottonSize =
        item.bottonSize || item.personalizacao?.tamanhoBotton || 'Padrão';

      let details = `  • Nome/Texto: ${customText || 'A combinar'}\n  • Tema/Cor: ${theme}${themeDetails ? ` (${themeDetails})` : ''}\n  • Acabamento: ${lamination}\n  • Valor: R$ ${subtotalItem.toFixed(2)}`;

      if (isBotton) {
        details = `  • Tamanho: ${bottonSize}\n  • Acabamento: ${lamination}\n  • Observação: ${customText || 'Nenhuma'}\n  • Valor: R$ ${subtotalItem.toFixed(2)}`;
      }

      return `${index + 1}️⃣ *${quantity}x ${title}*\n${details}`;
    })
    .join('\n\n');

  const deliveryText = orderData.deliveryType.includes('Retirada')
    ? 'Retirada no Local — Bom Jesus da Lapa (Grátis)'
    : `Entrega em Bom Jesus da Lapa (Bairro/Endereço: ${orderData.address || 'A combinar'})`;

  const message = `🌟 *OLÁ, PROF. ATAÍSE! GOSTARIA DE FAZER UM PEDIDO NA ESTRELA CRIATIVA* 🌟

👤 *Cliente:* ${orderData.customerName || 'Cliente'}
──────────────────────────
🛍️ *RESUMO DOS ITENS:*

${itemsList}

──────────────────────────
📦 *VALORES:*
• Subtotal dos itens: R$ ${orderData.subtotal.toFixed(2)}
${orderData.discountPix > 0 ? `• Desconto PIX (5%): -R$ ${orderData.discountPix.toFixed(2)}\n` : ''}• Frete: ${orderData.deliveryFee > 0 ? `R$ ${orderData.deliveryFee.toFixed(2)}` : 'Grátis (Retirada)'}
✨ *TOTAL ESTIMADO: R$ ${orderData.total.toFixed(2)}*

🚚 *ENTREGA E PAGAMENTO:*
• Forma: ${deliveryText}
• Pagamento: ${orderData.paymentMethod}

Aguardo o retorno para combinarmos os detalhes da arte! 💖`;

  const phone = orderData.phoneNumber?.replace(/\D/g, '') || '5561983069120';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

