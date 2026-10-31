// ==========================================================================
// DADOS PADRÃO DA LOJA — ESTRELA CRIATIVA (PROF. ATAÍSE)
// ==========================================================================

import type {
  StoreConfig,
  Category,
  Product,
  FinishItem,
  StepItem,
  TestimonialItem,
  FaqItem,
  SelectOption,
} from '../types/store';

export const CONFIG_PADRAO: StoreConfig = {
  whatsapp: '5561983069120',
  whatsappExibicao: '(61) 9 8306-9120',
  instagram: 'estrelacriativa__',
  descontoPix: 5,
  avisoTopo: '⭐ Estrela Criativa • Prof. Ataíse',
  senhaAdmin: 'estrela2026',
};

export const CATEGORIAS_PADRAO: Category[] = [
  {
    id: 'agendas',
    nome: 'Cadernos, Agendas & Planners',
    nomeCurto: 'Agendas & Planners',
    icone: '📔',
    subtitulo: 'Pedagógicos, agendas e cadernos',
  },
  {
    id: 'festas',
    nome: 'Papelaria para Festas',
    nomeCurto: 'Festas & Lembrancinhas',
    icone: '🎂',
    subtitulo: 'Topos de bolo e caixas 3D',
  },
  {
    id: 'corporativo',
    nome: 'Corporativo & Brindes',
    nomeCurto: 'Papelaria Corporativa',
    icone: '💼',
    subtitulo: 'Brindes, blocos e calendários',
  },
  {
    id: 'escolar',
    nome: 'Etiquetas & Volta às Aulas',
    nomeCurto: 'Etiquetas & Escolar',
    icone: '🎒',
    subtitulo: "Etiquetas à prova d'água e kits",
  },
];

export const PRODUTOS_PADRAO: Product[] = [
  // 1. Cadernos, Agendas e Planners
  {
    id: 1,
    nome: 'Planner Pedagógico / Professor 2027 Personalizado',
    categoria: 'agendas',
    categoriaLabel: 'Cadernos, Agendas & Planners',
    descricao:
      'Planejamento de aulas, calendário escolar, pauta de chamada, reuniões e divisórias plastificadas com seu nome.',
    precoAntigo: 139.9,
    preco: 119.9,
    emoji: '👩‍🏫',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #f3ebff, #e2d1ff)',
    tagPreview: 'Especial para Professores',
    destaque: 'Mais Vendido',
    permiteNome: true,
  },
  {
    id: 2,
    nome: 'Agenda Diária 2027 Personalizada com Nome',
    categoria: 'agendas',
    categoriaLabel: 'Cadernos, Agendas & Planners',
    descricao:
      'Capa dura laminada, 1 dia por página, bolso plástico, cartela de adesivos e elástico combinando.',
    precoAntigo: 98.9,
    preco: 84.9,
    emoji: '📔',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #e6fbf9, #b2f2ec)',
    tagPreview: 'Com seu nome na Capa',
    destaque: 'Sucesso 2027',
    permiteNome: true,
  },
  {
    id: 3,
    nome: 'Caderno Universitário Capa Dura Personalizado',
    categoria: 'agendas',
    categoriaLabel: 'Cadernos, Agendas & Planners',
    descricao:
      '96 folhas pautadas decoradas em papel 90g (não passa tinta para o verso!). Capa exclusiva com seu nome.',
    precoAntigo: 69.9,
    preco: 58.9,
    emoji: '📓',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #fff8db, #ffe380)',
    tagPreview: 'Folhas 90g Premium',
    destaque: 'Personalizável',
    permiteNome: true,
  },
  {
    id: 4,
    nome: 'Caderneta de Saúde / Vacinação Infantil Luxo',
    categoria: 'agendas',
    categoriaLabel: 'Cadernos, Agendas & Planners',
    descricao:
      'Miolo atualizado do Ministério da Saúde + páginas extras de consultas, mamadas e chaveiro tassel.',
    precoAntigo: 89.9,
    preco: 76.9,
    emoji: '🧸',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #f3ebff, #e6fbf9)',
    tagPreview: 'Com Tassel & Elástico',
    destaque: 'Mães Amam',
    permiteNome: true,
  },

  // 2. Papelaria para Festas e Personalizados
  {
    id: 5,
    nome: 'Kit Festa em Casa Completo (25 Peças 3D)',
    categoria: 'festas',
    categoriaLabel: 'Papelaria para Festas',
    descricao:
      '1 Topo de Bolo 3D + 6 Caixas Milk + 6 Caixas Pirâmide + 6 Porta Bis Duplo + 6 Caixas Sushi com laço.',
    precoAntigo: 159.9,
    preco: 134.9,
    emoji: '🎂',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #f3ebff, #fff8db)',
    tagPreview: 'Fazemos Qualquer Tema',
    destaque: 'Kit Econômico',
    permiteNome: true,
  },
  {
    id: 6,
    nome: 'Topo de Bolo Personalizado 3D em Camadas / Shaker',
    categoria: 'festas',
    categoriaLabel: 'Papelaria para Festas',
    descricao:
      'Produzido em papel lamicote dourado, color plus e camadas em relevo com miçangas e glitter.',
    precoAntigo: 48.0,
    preco: 36.9,
    emoji: '🎉',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #fff8db, #ffe380)',
    tagPreview: 'Papel Lamicote & 3D',
    destaque: 'Mais Vendido',
    permiteNome: true,
  },
  {
    id: 7,
    nome: 'Kit 20 Caixinhas Lembrancinha de Luxo com Laço',
    categoria: 'festas',
    categoriaLabel: 'Papelaria para Festas',
    descricao:
      'Caixas Milk, Pirâmide, Meia Bala e Maletinha com apliques em 3D, fita de cetim e pedraria.',
    precoAntigo: 129.9,
    preco: 109.9,
    emoji: '🎁',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #e6fbf9, #f3ebff)',
    tagPreview: 'Acompanha Laços de Cetim',
    destaque: 'Acabamento Luxo',
    permiteNome: true,
  },

  // 3. Papelaria Corporativa / Brindes
  {
    id: 8,
    nome: 'Kit Empreendedora (Agenda + Bloco + Caneca com Logo)',
    categoria: 'corporativo',
    categoriaLabel: 'Corporativo & Brindes',
    descricao:
      'Perfeito para fortalecer sua marca! Personalizamos com a identidade visual e logotipo da sua empresa.',
    precoAntigo: 165.0,
    preco: 139.9,
    emoji: '💼',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #f3ebff, #e2d1ff)',
    tagPreview: 'Com seu Logotipo',
    destaque: 'Kit Sucesso',
    permiteNome: true,
  },
  {
    id: 9,
    nome: 'Calendário de Mesa 2027 Personalizado (Kit 10 unid.)',
    categoria: 'corporativo',
    categoriaLabel: 'Corporativo & Brindes',
    descricao:
      'Base rígida laminada e wire-o. Excelente brinde de fim de ano para clientes, escolas e parceiros.',
    precoAntigo: 145.0,
    preco: 119.0,
    emoji: '📅',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #e6fbf9, #fff8db)',
    tagPreview: 'Kit Atacado 10 Unidades',
    destaque: 'Brinde Corporativo',
    permiteNome: true,
  },
  {
    id: 10,
    nome: 'Bloco de Pedidos + Cartões de Agradecimento',
    categoria: 'corporativo',
    categoriaLabel: 'Corporativo & Brindes',
    descricao:
      "2 Blocos A5 com 100 folhas cada + 50 cartões 'Obrigado pela compra' personalizados.",
    precoAntigo: 79.9,
    preco: 64.9,
    emoji: '💌',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #fff8db, #f3ebff)',
    tagPreview: 'Identidade da sua Marca',
    destaque: 'Para Lojistas',
    permiteNome: true,
  },

  // 4. Etiquetas Escolares e Kits Volta às Aulas
  {
    id: 11,
    nome: 'Kit Completo Etiquetas Escolares em Vinil (95 Unidades)',
    categoria: 'escolar',
    categoriaLabel: 'Etiquetas & Volta às Aulas',
    descricao:
      "100% à prova d'água! Pode lavar mamadeira, copinho e potes sem desbotar. Inclui tamanhos P, M e G.",
    precoAntigo: 64.9,
    preco: 49.9,
    emoji: '🏷️',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #e6fbf9, #b2f2ec)',
    tagPreview: "Vinil À Prova D'Água",
    destaque: 'Campeão Volta às Aulas',
    permiteNome: true,
  },
  {
    id: 12,
    nome: 'Kit Volta às Aulas Completo + Recursos Pedagógicos Plastificados',
    categoria: 'escolar',
    categoriaLabel: 'Etiquetas & Volta às Aulas',
    descricao:
      '1 Caderno Capa Dura + 60 Etiquetas Vinil + Tabuada/Alfabeto Plastificado + Tag de Mochila.',
    precoAntigo: 118.0,
    preco: 96.9,
    emoji: '🎒',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #f3ebff, #fff8db)',
    tagPreview: 'Combo Completo',
    destaque: 'Super Desconto',
    permiteNome: true,
  },
];

export const ACABAMENTOS_CAPA: FinishItem[] = [
  {
    id: 'fosco',
    icone: '💜',
    classeSwatch: 'swatch-matte',
    titulo: 'Fosco Aveludado',
    descricao:
      'Toque macio e sofisticado que não reflete luz. O queridinho para planners e papelaria corporativa.',
  },
  {
    id: 'brilho',
    icone: '✨',
    classeSwatch: 'swatch-gloss',
    titulo: 'Brilho Clássico',
    descricao:
      'Realça a vivacidade das cores e deixa as estampas criativas e infantis ainda mais alegres.',
  },
  {
    id: 'holo',
    icone: '🌈',
    classeSwatch: 'swatch-holo',
    titulo: 'Holográfico / Caquinhos',
    descricao:
      'Reflete pontos de luz furta-cor conforme você movimenta o caderno ou agenda. Puro encanto!',
  },
  {
    id: 'glitter',
    icone: '⭐',
    classeSwatch: 'swatch-glitter',
    titulo: 'Glitter Fino',
    descricao:
      'Película com micropartículas de brilho delicado que não soltam na mão. Sucesso absoluto!',
  },
];

export const PASSOS_ENCOMENDA: StepItem[] = [
  {
    numero: 1,
    titulo: 'Escolha no Catálogo',
    descricao:
      'Navegue pelos produtos, clique em "Personalizar e Comprar" e informe o nome, tema e acabamento desejados.',
  },
  {
    numero: 2,
    titulo: 'Envie para o WhatsApp',
    descricao:
      'Abra sua sacola, confira os valores com desconto no PIX e clique no botão verde para enviar o pedido pronto.',
  },
  {
    numero: 3,
    titulo: 'Aprovação da Arte',
    descricao:
      'Após a confirmação do pedido, montamos a prévia digital com o seu nome ou logotipo para você aprovar pelo WhatsApp.',
  },
  {
    numero: 4,
    titulo: 'Produção & Carinho',
    descricao:
      'Seu pedido é produzido artesanalmente pela Prof. Ataíse com materiais premium e todo capricho!',
  },
];

export const DEPOIMENTOS_CLIENTES: TestimonialItem[] = [
  {
    id: 1,
    iniciais: 'CM',
    nome: 'Prof. Camila Mendonça',
    compra: 'Comprou Planner Pedagógico + Bloco',
    texto:
      '"Meu Planner Pedagógico ficou simplesmente perfeito! A capa com laminação holográfica e meu nome ficou linda demais, super resistente para usar na escola o ano inteiro."',
  },
  {
    id: 2,
    iniciais: 'JR',
    nome: 'Juliana Ribeiro',
    compra: 'Comprou Kit Festa 25 Peças + Topo Shaker',
    texto:
      '"Encomendei o Kit Festa em Casa para o aniversário da minha filha. As caixinhas em 3D com laço de cetim e o topo de bolo encantaram todos os convidados!"',
  },
  {
    id: 3,
    iniciais: 'FA',
    nome: 'Fernanda Almeida',
    compra: 'Comprou Kit Volta às Aulas Completo',
    texto:
      '"As etiquetas escolares em vinil realmente não saem na água! Já lavei os potinhos e copos da escola várias vezes e continuam intactas. Atendimento maravilhoso da Prof. Ataíse!"',
  },
];

export const PERGUNTAS_FREQUENTES: FaqItem[] = [
  {
    id: 1,
    pergunta: 'Posso colocar meu logotipo ou escolher outro tema que não está nas fotos?',
    resposta:
      'Sim! Todos os nossos produtos são 100% personalizáveis. Você pode enviar o logotipo da sua empresa (para papelaria corporativa) ou escolher qualquer tema infantil, pedagógico, floral ou minimalista. Enviamos opções de capas no WhatsApp!',
  },
  {
    id: 2,
    pergunta: 'Qual é o prazo de produção dos produtos personalizados?',
    resposta:
      'Nosso prazo médio de produção artesanal é de 5 a 7 dias úteis após a aprovação da arte. Caso precise para uma data urgente (como aniversário ou evento escolar), avise-nos no WhatsApp para verificarmos disponibilidade!',
  },
  {
    id: 3,
    pergunta: 'Quais são as formas de pagamento aceitas?',
    resposta:
      'Aceitamos PIX (com desconto imediato), Cartão de Crédito em até 3x sem juros ou link de pagamento.',
  },
];

export const OPCOES_EMOJIS_PRODUTO: SelectOption[] = [
  { value: '👩‍🏫', label: '👩‍🏫 Professora / Pedagógico' },
  { value: '📔', label: '📔 Agenda / Planner' },
  { value: '📓', label: '📓 Caderno' },
  { value: '🧸', label: '🧸 Infantil / Caderneta' },
  { value: '🎂', label: '🎂 Bolo / Kit Festa' },
  { value: '🎉', label: '🎉 Topo de Bolo' },
  { value: '🎁', label: '🎁 Caixinha / Lembrancinha' },
  { value: '💼', label: '💼 Kit Corporativo' },
  { value: '📅', label: '📅 Calendário' },
  { value: '💌', label: '💌 Bloco / Cartões' },
  { value: '🏷️', label: '🏷️ Etiquetas Escolares' },
  { value: '🎒', label: '🎒 Kit Volta às Aulas' },
  { value: '⭐', label: '⭐ Estrela Criativa' },
];

export const OPCOES_CORES_FUNDO: SelectOption[] = [
  { value: 'linear-gradient(135deg, #f3ebff, #e2d1ff)', label: '💜 Roxo Estrela Suave' },
  { value: 'linear-gradient(135deg, #e6fbf9, #b2f2ec)', label: '💎 Turquesa Água' },
  { value: 'linear-gradient(135deg, #fff8db, #ffe380)', label: '⭐ Amarelo Criativo' },
  { value: 'linear-gradient(135deg, #f3ebff, #e6fbf9)', label: '🦄 Lavanda + Turquesa' },
  { value: 'linear-gradient(135deg, #f3ebff, #fff8db)', label: '🌅 Lilás + Dourado' },
  { value: 'linear-gradient(135deg, #e6fbf9, #fff8db)', label: '🌿 Turquesa + Amarelo' },
];
