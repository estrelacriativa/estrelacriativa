// ==============================================================================
// ESTÚDIO DE BOTTONS — MATRIZES REAIS (32mm, 44mm, 58mm), RENDER 300/600 DPI,
// FOLHA A4 EM ESCALA REAL (MM) E PROMPTS PRONTOS DE IA
// ==============================================================================

import { supabase } from '../lib/supabase';

const BUCKET_PRODUTOS = 'produtos';

export type TamanhoBottonId = '32mm' | '44mm' | '58mm';

export type ModoSangriaBotton = 'auto' | 'solida' | 'preencher';

export interface MatrizBottonSpec {
  id: TamanhoBottonId;
  nomeCurto: string;
  descricao: string;
  preco: number; // Preço unitário do botton
  frenteMm: number; // Área frontal visível do botton pronto
  corteMm: number; // Diâmetro total do papel cortado (frente + dobra/sangria)
  segurancaMm: number; // Área segura p/ textos e rostos não curvarem na borda
  colunasA4: number;
  linhasA4: number;
  maxPorA4: number;
}

export const MATRIZES_BOTTON: Record<TamanhoBottonId, MatrizBottonSpec> = {
  '32mm': {
    id: '32mm',
    nomeCurto: '32 mm (3,2 cm)',
    descricao: 'Delicado • Ideal para mochilas, estojos e kits',
    preco: 4.21,
    frenteMm: 32,
    corteMm: 44,
    segurancaMm: 28,
    colunasA4: 4,
    linhasA4: 5,
    maxPorA4: 20,
  },
  '44mm': {
    id: '44mm',
    nomeCurto: '44 mm (4,4 cm)',
    descricao: 'Tradicional • Mais pedido para eventos, festas e escolas',
    preco: 6.32,
    frenteMm: 44,
    corteMm: 54,
    segurancaMm: 39,
    colunasA4: 3,
    linhasA4: 4,
    maxPorA4: 12,
  },
  '58mm': {
    id: '58mm',
    nomeCurto: '58 mm (5,8 cm)',
    descricao: 'Grande • Máximo destaque para fotos, frases e identificação',
    preco: 9.47,
    frenteMm: 58,
    corteMm: 70,
    segurancaMm: 52,
    colunasA4: 2,
    linhasA4: 3,
    maxPorA4: 6,
  },
};

export const LISTA_MATRIZES_BOTTON: MatrizBottonSpec[] = [
  MATRIZES_BOTTON['32mm'],
  MATRIZES_BOTTON['44mm'],
  MATRIZES_BOTTON['58mm'],
];

export interface ConfigAjusteBotton {
  frenteMm: number;
  corteMm: number;
  zoom: number; // 0.4 a 3.5 (1.0 = encaixa na frente visível)
  normOffsetX: number; // deslocamento proporcional ao diâmetro de corte
  normOffsetY: number;
  rotacaoGraus: number;
  modoSangria: ModoSangriaBotton;
  corFundo: string;
}

export function carregarElementoImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('Não foi possível carregar a imagem selecionada.'));
    img.src = src;
  });
}

export function lerArquivoComoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        resolve(e.target.result);
      } else {
        reject(new Error('Falha ao ler imagem.'));
      }
    };
    reader.onerror = () => reject(new Error('Erro na leitura do arquivo.'));
    reader.readAsDataURL(file);
  });
}

export interface OpcoesDesenhoCirculo {
  ctx: CanvasRenderingContext2D;
  img: HTMLImageElement | null;
  cx: number;
  cy: number;
  diametroCortePx: number;
  ajuste: ConfigAjusteBotton;
  mostrarGuiasEditor?: boolean; // Guias visuais apenas na tela (não saem na impressão!)
  mostrarLinhaCorteImpressao?: boolean; // Linha fininha externa para tesoura/cortador
}

export function desenharArteBottonNoContexto({
  ctx,
  img,
  cx,
  cy,
  diametroCortePx,
  ajuste,
  mostrarGuiasEditor = false,
  mostrarLinhaCorteImpressao = false,
}: OpcoesDesenhoCirculo) {
  const raioCorte = diametroCortePx / 2;
  const proporcaoFrente = Math.min(
    0.98,
    Math.max(0.4, ajuste.frenteMm / Math.max(1, ajuste.corteMm))
  );
  const diametroFrentePx = diametroCortePx * proporcaoFrente;
  const raioFrente = diametroFrentePx / 2;

  ctx.save();

  // Recorte circular exato no diâmetro de corte (frente + sangria/dobra)
  ctx.beginPath();
  ctx.arc(cx, cy, raioCorte, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // 1. Preenchimento base
  ctx.fillStyle = ajuste.corFundo || '#FFFFFF';
  ctx.fillRect(
    cx - raioCorte - 2,
    cy - raioCorte - 2,
    diametroCortePx + 4,
    diametroCortePx + 4
  );

  if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
    const imgAspect = img.naturalWidth / img.naturalHeight;

    // 2. Se modoSangria === 'auto', preenche o anel externo da dobra com borda estendida suave
    if (ajuste.modoSangria === 'auto') {
      ctx.save();
      const escalaFundo = diametroCortePx * 1.18;
      const bgW = imgAspect >= 1 ? escalaFundo * imgAspect : escalaFundo;
      const bgH = imgAspect >= 1 ? escalaFundo : escalaFundo / imgAspect;
      const blurPx = Math.max(8, Math.round(diametroCortePx * 0.035));
      try {
        ctx.filter = `blur(${blurPx}px) saturate(1.1)`;
      } catch {
        // fallback caso navegador antigo não suporte filter
      }
      ctx.translate(cx, cy);
      if (ajuste.rotacaoGraus) {
        ctx.rotate((ajuste.rotacaoGraus * Math.PI) / 180);
      }
      ctx.drawImage(img, -bgW / 2, -bgH / 2, bgW, bgH);
      ctx.restore();
    }

    // 3. Desenha a imagem principal nítida com o zoom e posição escolhidos
    const diametroReferencia =
      ajuste.modoSangria === 'preencher' ? diametroCortePx : diametroFrentePx;
    const baseSize = diametroReferencia * ajuste.zoom;
    const drawW = imgAspect >= 1 ? baseSize * imgAspect : baseSize;
    const drawH = imgAspect >= 1 ? baseSize : baseSize / imgAspect;

    const posX = cx + ajuste.normOffsetX * diametroCortePx;
    const posY = cy + ajuste.normOffsetY * diametroCortePx;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(posX, posY);
    if (ajuste.rotacaoGraus) {
      ctx.rotate((ajuste.rotacaoGraus * Math.PI) / 180);
    }
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  // 4. Guias visuais APENAS no editor interativo da tela (nunca saem na arte impressa!)
  if (mostrarGuiasEditor) {
    // Sombra suave na área externa de dobra (entre frenteMm e corteMm)
    ctx.save();
    ctx.fillStyle = 'rgba(25, 16, 42, 0.34)';
    ctx.beginPath();
    ctx.arc(cx, cy, raioCorte, 0, Math.PI * 2);
    ctx.arc(cx, cy, raioFrente, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore(); // Fim do clip circular

  // Contornos de guia na tela do editor
  if (mostrarGuiasEditor) {
    ctx.save();
    // Círculo externo (Linha de Corte)
    ctx.strokeStyle = 'rgba(124, 58, 237, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, raioCorte - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Círculo interno tracejado (Frente Visível do Botton)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, raioFrente, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Linha fininha externa de corte para impressão (tesoura / cortador circular)
  if (mostrarLinhaCorteImpressao) {
    ctx.save();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = Math.max(1.2, diametroCortePx * 0.0025);
    ctx.beginPath();
    ctx.arc(cx, cy, raioCorte, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Gera a imagem circular individual em ALTÍSSIMA QUALIDADE (1600x1600px ~ 600+ DPI)
 * pronta para impressão ou envio ao Supabase Storage.
 */
export async function gerarArteCircularAltaQualidadeBlob(
  img: HTMLImageElement,
  ajuste: ConfigAjusteBotton,
  opcoes?: { resolucaoPx?: number; incluirLinhaCorte?: boolean; formato?: 'image/png' | 'image/jpeg' }
): Promise<Blob> {
  const tamanhoCanvas = opcoes?.resolucaoPx ?? 1600;
  const incluirLinha = opcoes?.incluirLinhaCorte ?? true;
  const formato = opcoes?.formato ?? 'image/png';

  const canvas = document.createElement('canvas');
  canvas.width = tamanhoCanvas;
  canvas.height = tamanhoCanvas;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Contexto 2D indisponível.');

  if (formato === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, tamanhoCanvas, tamanhoCanvas);
  }

  const margemSeguranca = incluirLinha ? 16 : 0;
  const diametroCortePx = tamanhoCanvas - margemSeguranca * 2;

  desenharArteBottonNoContexto({
    ctx,
    img,
    cx: tamanhoCanvas / 2,
    cy: tamanhoCanvas / 2,
    diametroCortePx,
    ajuste,
    mostrarGuiasEditor: false,
    mostrarLinhaCorteImpressao: incluirLinha,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao exportar imagem circular em alta resolução.'));
          return;
        }
        resolve(blob);
      },
      formato,
      0.95
    );
  });
}

/**
 * Gera uma miniatura circular leve (Base64) da frente visível do botton para mostrar na sacola.
 */
export function gerarPreviewFrenteBottonDataUrl(
  img: HTMLImageElement,
  ajuste: ConfigAjusteBotton
): string {
  const tam = 180;
  const canvas = document.createElement('canvas');
  canvas.width = tam;
  canvas.height = tam;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Escala para que apenas a frente visível ocupe o preview da sacola
  const proporcao = ajuste.corteMm / Math.max(1, ajuste.frenteMm);
  ctx.beginPath();
  ctx.arc(tam / 2, tam / 2, tam / 2, 0, Math.PI * 2);
  ctx.clip();

  desenharArteBottonNoContexto({
    ctx,
    img,
    cx: tam / 2,
    cy: tam / 2,
    diametroCortePx: tam * proporcao,
    ajuste,
    mostrarGuiasEditor: false,
    mostrarLinhaCorteImpressao: false,
  });

  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Envia a arte circular de alta qualidade do cliente para o Supabase Storage.
 */
export async function uploadArteBottonClienteSupabase(
  blob: Blob,
  tamanhoLabel: string
): Promise<string> {
  const slugTam = tamanhoLabel.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'botton';
  const sufixo = Math.random().toString(36).slice(2, 8);
  const extensao = blob.type === 'image/png' ? 'png' : 'jpg';
  const nomeArquivo = `bottons-clientes/botton-${slugTam}-${Date.now()}-${sufixo}.${extensao}`;

  const { error } = await supabase.storage
    .from(BUCKET_PRODUTOS)
    .upload(nomeArquivo, blob, {
      contentType: blob.type || 'image/png',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(BUCKET_PRODUTOS)
    .getPublicUrl(nomeArquivo);

  return data.publicUrl;
}

/**
 * Gera uma Folha A4 completa em 300 DPI REAIS (210mm x 297mm = 2480 x 3508 px)
 * com diâmetro exato em milímetros para imprimir em escala 100% e prensar!
 */
export function gerarFolhaA4BottonsDataUrl(
  img: HTMLImageElement,
  ajuste: ConfigAjusteBotton,
  quantidadeNaFolha: number
): { dataUrl: string; cabemPorFolha: number; colunas: number; linhas: number } {
  const DPI = 300;
  const PX_POR_MM = DPI / 25.4; // 11.8110236 px por mm
  const A4_LARGURA_MM = 210;
  const A4_ALTURA_MM = 297;

  const larguraPx = Math.round(A4_LARGURA_MM * PX_POR_MM); // 2480 px
  const alturaPx = Math.round(A4_ALTURA_MM * PX_POR_MM); // 3508 px

  const canvas = document.createElement('canvas');
  canvas.width = larguraPx;
  canvas.height = alturaPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Contexto 2D indisponível para gerar A4.');

  // Fundo branco puro da folha A4
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, larguraPx, alturaPx);

  const margemLateralMm = 8;
  const margemTopoMm = 12;
  const margemRodapeMm = 16; // espaço p/ régua de conferência de 5cm
  const espacamentoMm = 4;

  const areaUtilLarguraMm = A4_LARGURA_MM - margemLateralMm * 2;
  const areaUtilAlturaMm = A4_ALTURA_MM - margemTopoMm - margemRodapeMm;

  const colunas = Math.max(
    1,
    Math.floor((areaUtilLarguraMm + espacamentoMm) / (ajuste.corteMm + espacamentoMm))
  );
  const linhas = Math.max(
    1,
    Math.floor((areaUtilAlturaMm + espacamentoMm) / (ajuste.corteMm + espacamentoMm))
  );
  const cabemPorFolha = colunas * linhas;
  const totalDesenhar = Math.min(cabemPorFolha, Math.max(1, quantidadeNaFolha));

  const diametroCortePx = ajuste.corteMm * PX_POR_MM;
  const espacamentoPx = espacamentoMm * PX_POR_MM;

  const larguraBlocoPx =
    colunas * diametroCortePx + (colunas - 1) * espacamentoPx;
  const inicioXPx = (larguraPx - larguraBlocoPx) / 2 + diametroCortePx / 2;
  const inicioYPx = margemTopoMm * PX_POR_MM + diametroCortePx / 2;

  // Cabeçalho discreto no topo da folha
  ctx.fillStyle = '#6b7280';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `Estrela Criativa • Gabarito de Bottons — Frente: ${ajuste.frenteMm}mm | Corte c/ Dobra: ${ajuste.corteMm}mm (Imprimir em 100% / Tamanho Real)`,
    larguraPx / 2,
    8 * PX_POR_MM
  );

  for (let i = 0; i < totalDesenhar; i++) {
    const col = i % colunas;
    const lin = Math.floor(i / colunas);
    const cx = inicioXPx + col * (diametroCortePx + espacamentoPx);
    const cy = inicioYPx + lin * (diametroCortePx + espacamentoPx);

    desenharArteBottonNoContexto({
      ctx,
      img,
      cx,
      cy,
      diametroCortePx,
      ajuste,
      mostrarGuiasEditor: false,
      mostrarLinhaCorteImpressao: true,
    });

    // Pequenas marcas de mira externas para facilitar alinhamento do cortador circular
    ctx.save();
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.5;
    const r = diametroCortePx / 2;
    const tick = 10;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r - tick);
    ctx.lineTo(cx, cy - r);
    ctx.moveTo(cx, cy + r);
    ctx.lineTo(cx, cy + r + tick);
    ctx.moveTo(cx - r - tick, cy);
    ctx.lineTo(cx - r, cy);
    ctx.moveTo(cx + r, cy);
    ctx.lineTo(cx + r + tick, cy);
    ctx.stroke();
    ctx.restore();
  }

  // Régua de conferência de 50 mm (5 cm) no rodapé para garantir escala 100% na impressora
  const reguaLarguraPx = 50 * PX_POR_MM;
  const reguaX = (larguraPx - reguaLarguraPx) / 2;
  const reguaY = alturaPx - 8 * PX_POR_MM;

  ctx.save();
  ctx.strokeStyle = '#374151';
  ctx.fillStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(reguaX, reguaY);
  ctx.lineTo(reguaX + reguaLarguraPx, reguaY);
  for (let cm = 0; cm <= 5; cm++) {
    const xTick = reguaX + cm * 10 * PX_POR_MM;
    ctx.moveTo(xTick, reguaY - 12);
    ctx.lineTo(xTick, reguaY + 6);
  }
  ctx.stroke();
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Régua de conferência: esta barra deve medir exatamente 5,0 cm no papel impresso',
    larguraPx / 2,
    reguaY - 18
  );
  ctx.restore();

  return {
    dataUrl: canvas.toDataURL('image/png'),
    cabemPorFolha,
    colunas,
    linhas,
  };
}

/**
 * Abre janela de impressão em escala exata A4 (210mm x 297mm, margem zero)
 */
export function abrirJanelaImpressaoA4(dataUrlFolhaA4: string, titulo: string) {
  const win = window.open('', '_blank');
  if (!win) {
    alert(
      'Permita pop-ups no navegador para abrir a janela de impressão direta, ou use o botão "Baixar Folha A4 (300 DPI)".'
    );
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${titulo}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 210mm;
      height: 297mm;
      background: #fff;
    }
    img {
      width: 210mm;
      height: 297mm;
      display: block;
    }
    @media screen {
      body {
        background: #f3f0f8;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        height: auto;
        width: 100%;
        font-family: sans-serif;
      }
      .aviso-tela {
        background: #7c3aed;
        color: #fff;
        padding: 10px 18px;
        border-radius: 99px;
        margin-bottom: 14px;
        font-size: 14px;
        font-weight: bold;
      }
      img {
        box-shadow: 0 8px 30px rgba(0,0,0,0.18);
        max-width: 100%;
        height: auto;
      }
    }
    @media print {
      .aviso-tela {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="aviso-tela">
    🖨️ Na janela da impressora, selecione "Tamanho Real" ou "Escala: 100%" (sem margens)
  </div>
  <img src="${dataUrlFolhaA4}" alt="Folha A4 Gabarito de Bottons" onload="setTimeout(() => window.print(), 250)" />
</body>
</html>`);
  win.document.close();
}

/**
 * Prompts Prontos de IA (para ChatGPT, Gemini ou Antigravity) calibrados para as matrizes 32mm, 44mm e 58mm
 */
export function gerarPromptsProntosBotton(
  frenteMm: number,
  corteMm: number
): {
  promptAdaptarFotoCliente: string;
  promptCriarArteDoZero: string;
} {
  const margemDobraPorLado = ((corteMm - frenteMm) / 2).toFixed(1).replace('.0', '');
  const areaSegura = Math.max(10, frenteMm - 5);

  const promptAdaptarFotoCliente = `Adapte a imagem enviada em anexo para impressão e fabricação profissional de um BOTTON REDONDO de ${frenteMm}mm (diâmetro total de corte com dobra/sangria: ${corteMm}mm), seguindo rigorosamente estas especificações:

1. FORMATO E PROPORÇÃO: Gere uma imagem quadrada em altíssima resolução (mínimo 2048x2048 px, nitidez de impressão 300 DPI) contendo a arte perfeitamente centralizada em formato circular.
2. ÁREA PRINCIPAL VISÍVEL (Centro de ${frenteMm}mm / Zona Segura de ${areaSegura}mm): Mantenha o assunto principal (rosto, personagem, logotipo ou texto) 100% íntegro, centralizado e dentro da área central segura, sem cortar cabeças, letras ou elementos importantes.
3. SANGRIA / MARGEM DE DOBRA (${margemDobraPorLado}mm extras em toda a volta, totalizando ${corteMm}mm): Expanda naturalmente o fundo/cenário/cores da imagem original ao redor de toda a borda externa (outpainting suave), para que na hora de prensar o botton a dobra metálica lateral fique preenchida com a continuidade do fundo e sem nenhuma borda branca.
4. QUALIDADE DE IMPRESSÃO: Melhore a iluminação, nitidez e vivacidade das cores para impressão fotográfica brilhante, mantendo a fidelidade total aos traços/rostos/cores originais enviados pelo cliente. Não adicione molduras metálicas falsas nem sombras 3D de mockup — quero a arte plana 2D limpa pronta para imprimir, cortar e prensar.`;

  const promptCriarArteDoZero = `Crie uma arte plana 2D exclusiva em altíssima resolução (300 DPI, formato quadrado 1:1) pronta para fabricação de um BOTTON PERSONALIZADO de ${frenteMm}mm (corte total com sangria de dobra: ${corteMm}mm):

• TEMA / TEXTO DESEJADO: [ESCREVA AQUI O TEMA E O NOME/FRASE]
• REGRA DE ENQUADRAMENTO: Centralize todos os textos, personagens e elementos importantes dentro dos ${areaSegura}mm centrais (frente visível do botton).
• MARGEM DE SANGRIA (${margemDobraPorLado}mm em toda a volta): Continue a cor, estampa ou ilustração do fundo até preencher toda a borda externa, sem linhas de contorno grudadas na beirada, garantindo acabamento perfeito na dobra da prensa.
• ESTILO: Cores vibrantes, traços super nítidos para impressão fotográfica, sem efeito 3D de mockup/reflexo falso (somente a arte limpa pronta para corte circular).`;

  return {
    promptAdaptarFotoCliente,
    promptCriarArteDoZero,
  };
}

