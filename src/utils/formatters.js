// ==========================================================================
// UTILITÁRIOS DE FORMATAÇÃO
// ==========================================================================

export function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatarWhatsappExibicao(numeroLimpo) {
  const digitos = String(numeroLimpo || '').replace(/\D/g, '');
  // Ex: 5561983069120 -> (61) 9 8306-9120
  const semPais = digitos.startsWith('55') && digitos.length >= 12 ? digitos.slice(2) : digitos;
  if (semPais.length === 11) {
    return `(${semPais.slice(0, 2)}) ${semPais.slice(2, 3)} ${semPais.slice(3, 7)}-${semPais.slice(7)}`;
  }
  if (semPais.length === 10) {
    return `(${semPais.slice(0, 2)}) ${semPais.slice(2, 6)}-${semPais.slice(6)}`;
  }
  return numeroLimpo || '(61) 9 8306-9120';
}

export function gerarIdCategoria(nome) {
  return (
    String(nome || 'categoria')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    Date.now().toString().slice(-3)
  );
}

