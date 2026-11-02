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
    nome: 'Agendas & Blocos',
    nomeCurto: 'Agendas & Blocos',
    icone: '📔',
    subtitulo: 'Agendas, Cadernos e Blocos',
  },
  {
    id: 'kits',
    nome: 'Kits & Calendários',
    nomeCurto: 'Kits & Calendários',
    icone: '🎁',
    subtitulo: 'Combo completo e Mini Calendário',
  },
  {
    id: 'cadernetas',
    nome: 'Cadernetas de Vacinação',
    nomeCurto: 'Cadernetas de Vacina',
    icone: '🧸',
    subtitulo: 'Reforma e Caderneta feita do zero',
  },
  {
    id: 'lembrancinhas',
    nome: 'Lembrancinhas & Mimos',
    nomeCurto: 'Lembrancinhas',
    icone: '💛',
    subtitulo: 'Bloquinhos, Etiquetas e Mimos',
  },
  {
    id: 'bottons',
    nome: 'Bottons Personalizados',
    nomeCurto: 'Bottons',
    icone: '🎖️',
    subtitulo: 'Tamanhos 32mm, 44mm e 58mm',
  },
];

export const PRODUTOS_PADRAO: Product[] = [
  {
    id: 1,
    nome: 'Agenda A5 Capa Dura',
    categoria: 'agendas',
    categoriaLabel: 'Agendas & Blocos',
    descricao:
      'Sua rotina com muito mais brilho e organização! Feita para te acompanhar o ano todo com capa de efeito holográfico encantador, miolo estruturado e acabamento impecável.',
    precoAntigo: 65.9,
    preco: 51.47,
    emoji: '📔',
    imagem: '/produtos/agenda-a5-fechada.jpg',
    galeriaFotos: [
      '/produtos/agenda-a5-fechada.jpg',
      '/produtos/agenda-a5-aberta.jpg',
      '/produtos/agenda-a5-enfermagem.jpg',
    ],
    corFundo: 'linear-gradient(135deg, #f3ebff, #e2d1ff)',
    tagPreview: 'Capa Dura Holográfica ✨',
    destaque: 'Mais Vendida',
    permiteNome: true,
    dimensoes: 'Tamanho A5 (15 x 21 cm)',
    quantidadeFolhas: 'Anual estruturada',
    detalhesExtras:
      '✨ Sua rotina com muito mais brilho e organização!\n• Capa dura resistente com efeito holográfico encantador\n• Miolo estruturado datado com horários para planejar seus dias, metas e sonhos\n• Encadernação em Wire-O com tassel de seda e elástico combinando\n• Acabamento artesanal impecável personalizado com seu nome ou tema',
  },
  {
    id: 2,
    nome: 'Bloco de Notas A6 (70 Folhas)',
    categoria: 'agendas',
    categoriaLabel: 'Agendas & Blocos',
    descricao:
      'O companheiro ideal para a sua bolsa ou escrivaninha! Tamanho perfeito para anotações rápidas, listas de tarefas e ideias, com 70 folhas e capa dura holográfica.',
    precoAntigo: 24.9,
    preco: 16.74,
    emoji: '📝',
    imagem: '/produtos/bloco-a6-fechado.jpg',
    galeriaFotos: [
      '/produtos/bloco-a6-fechado.jpg',
      '/produtos/bloco-a6-aberto.jpg',
    ],
    corFundo: 'linear-gradient(135deg, #e6fbf9, #b2f2ec)',
    tagPreview: '70 Folhas • Capa Holográfica',
    destaque: 'Ideal p/ Bolsa',
    permiteNome: true,
    dimensoes: 'Tamanho A6 (10,5 x 14,8 cm)',
    quantidadeFolhas: '70 folhas',
    detalhesExtras:
      '📝 O companheiro ideal para a sua bolsa ou escrivaninha!\n• Tamanho A6 compacto para levar sempre com você\n• 70 folhas perfeitas para anotações rápidas, listas de tarefas e ideias\n• Capa dura linda com acabamento holográfico unindo praticidade e beleza no dia a dia',
  },
  {
    id: 3,
    nome: 'Mini Calendário de Mesa',
    categoria: 'kits',
    categoriaLabel: 'Kits & Calendários',
    descricao:
      'Organize seu ano com um toque de charme na sua mesa! Super compacto (9,5x9,5 cm), delicado e disponível em vários temas para decorar seu ambiente de trabalho ou estudo.',
    precoAntigo: 18.9,
    preco: 12.62,
    emoji: '📅',
    imagem: '/produtos/mini-calendario-capa.jpg',
    galeriaFotos: [
      '/produtos/mini-calendario-capa.jpg',
      '/produtos/mini-calendario-mes.jpg',
      '/produtos/mini-calendario-frase.jpg',
    ],
    corFundo: 'linear-gradient(135deg, #fff8db, #ffe380)',
    tagPreview: 'Compacto 9,5 x 9,5 cm',
    destaque: 'Decor de Mesa',
    permiteNome: true,
    dimensoes: '9,5 x 9,5 cm',
    quantidadeFolhas: '12 meses',
    detalhesExtras:
      '📅 Organize seu ano com um toque de charme na sua mesa!\n• Medida super compacta e delicada: 9,5 x 9,5 cm\n• Decora qualquer ambiente de trabalho, home office ou cantinho de estudos\n• Disponível em vários temas para começar cada mês com inspiração!',
  },
  {
    id: 4,
    nome: 'Bloquinho de Lembrancinha (50 folhas, 6,5x10cm)',
    categoria: 'lembrancinhas',
    categoriaLabel: 'Lembrancinhas & Mimos',
    descricao:
      'A lembrancinha perfeita que seus convidados vão amar e usar de verdade! Capa laminada personalizada acompanhando saquinho de celofane e laço dourado.',
    precoAntigo: 4.9,
    preco: 3.68,
    emoji: '🧸',
    imagem: '/produtos/bloquinho-lembrancinha.jpg',
    corFundo: 'linear-gradient(135deg, #fff8db, #f3ebff)',
    tagPreview: 'Com Celofane + Laço Dourado',
    destaque: 'Condições p/ Lotes',
    permiteNome: true,
    dimensoes: '6,5 x 10 cm',
    quantidadeFolhas: '50 folhas',
    detalhesExtras:
      '🧸 Mimo inesquecível para Chá de Bebê, Maternidade, Aniversário ou evento corporativo!\n• Medida: 6,5 x 10 cm com 50 folhas internas\n• Capa laminada personalizada com todo carinho\n• Já acompanha embalagem individual em saquinho de celofane e laço dourado\n💛 Temos condições especiais para pedidos em lotes!',
  },
  {
    id: 5,
    nome: 'Combo Kit Completo (Agenda + Bloco + Calendário)',
    categoria: 'kits',
    categoriaLabel: 'Kits & Calendários',
    descricao:
      'O kit definitivo para quem ama organização e papelaria de alta qualidade! Inclui a Agenda A5, o Bloco de Notas A6 e o Mini Calendário de Mesa combinando perfeitamente.',
    precoAntigo: 129.9,
    preco: 105.25,
    emoji: '🎁',
    imagem: '/produtos/combo-kit-completo.jpg',
    corFundo: 'linear-gradient(135deg, #f3ebff, #fff8db)',
    tagPreview: '3 Peças Combinando 💖',
    destaque: 'Combo Econômico',
    permiteNome: true,
    dimensoes: 'Agenda A5 + Bloco A6 + Calendário 9,5x9,5cm',
    quantidadeFolhas: 'Kit 3 itens completos',
    detalhesExtras:
      '🎁 Economia e beleza juntas em um presente inesquecível (para alguém especial ou para você!):\n• 1 Agenda A5 Capa Dura Holográfica\n• 1 Bloco de Notas A6 Capa Dura (70 folhas)\n• 1 Mini Calendário de Mesa (9,5 x 9,5 cm)\n✨ Todas as 3 peças produzidas combinando perfeitamente no mesmo tema!',
  },
  {
    id: 6,
    nome: 'Bottons Personalizados (32mm, 44mm e 58mm)',
    categoria: 'bottons',
    categoriaLabel: 'Bottons Personalizados',
    descricao:
      'Estilo, personalidade e identidade em um só acessório! Escolha seu tamanho: 32mm (R$ 4,00 no PIX), 44mm (R$ 6,00 no PIX) ou 58mm (R$ 9,00 no PIX). Perfeitos para mochilas, jaquetas, brindes e eventos.',
    precoAntigo: 6.32,
    preco: 4.21,
    emoji: '🎖️',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #e6fbf9, #f3ebff)',
    tagPreview: '32mm, 44mm e 58mm 🎨',
    destaque: 'A partir de R$ 4,00 no PIX',
    permiteNome: true,
    dimensoes: '32mm (R$ 4,00) • 44mm (R$ 6,00) • 58mm (R$ 9,00)',
    quantidadeFolhas: 'Pedido avulso ou em lote',
    detalhesExtras:
      '🔥 Estilo, personalidade e identidade em um só acessório!\n• Tabela de Preços no PIX (5% OFF):\n  - 32mm: R$ 4,00 no PIX (ou R$ 4,21 cartão)\n  - 44mm: R$ 6,00 no PIX (ou R$ 6,32 cartão)\n  - 58mm: R$ 9,00 no PIX (ou R$ 9,47 cartão)\n• Envie sua foto, frase ou logotipo ao clicar em Personalizar e já veja no formato circular\n• Perfeitos para mochilas, jaquetas, brindes corporativos, eventos escolares e lembrancinhas de festas\n• Faça seu pedido avulso ou em lote!',
  },
  {
    id: 7,
    nome: 'Serviço de Reforma de Caderneta de Vacinação',
    categoria: 'cadernetas',
    categoriaLabel: 'Cadernetas de Vacinação',
    descricao:
      "Transforme a caderneta do SUS do seu filho em uma verdadeira lembrança de luxo! Reforma completa com capa dura laminada (à prova d'água e sujeira), Wire-O e bolso canguru.",
    precoAntigo: 69.9,
    preco: 54.9,
    emoji: '🛡️',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #e6fbf9, #b2f2ec)',
    tagPreview: 'Capa Dura + Bolso Canguru',
    destaque: 'Reforma Completa',
    permiteNome: true,
    dimensoes: 'Padrão Caderneta SUS',
    quantidadeFolhas: 'Renovação da sua caderneta',
    detalhesExtras:
      "🛡️ A caderneta de saúde do SUS acaba rasgando com o tempo — nós fazemos a Reforma Completa:\n• Capa dura laminada personalizada no tema desejado (à prova d'água e sujeira)\n• Encadernação em Wire-O resistente\n• Saco de vinil canguru na primeira página para guardar receitas e documentos com total segurança\n👶 Traga a caderneta antiga para deixarmos novinha!",
  },
  {
    id: 8,
    nome: 'Caderneta de Vacinação Completa (Feita do Zero)',
    categoria: 'cadernetas',
    categoriaLabel: 'Cadernetas de Vacinação',
    descricao:
      'Tudo novo, organizado e feito sob medida para o seu bebê! Miolo oficial completo impresso com qualidade, capa dura laminada personalizada, Wire-O resistente e bolsinho canguru.',
    precoAntigo: 98.9,
    preco: 84.9,
    emoji: '📖',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #f3ebff, #e6fbf9)',
    tagPreview: 'Miolo Oficial + Capa Dura',
    destaque: 'Feita do Zero',
    permiteNome: true,
    dimensoes: 'Tamanho A5 Padrão Oficial',
    quantidadeFolhas: 'Miolo Oficial Atualizado',
    detalhesExtras:
      '✨ Um tesouro para guardar para a vida toda, produzido do zero:\n• Miolo oficial completo e atualizado impresso em alta qualidade\n• Capa dura laminada personalizada com o tema e nome do bebê\n• Encadernação em Wire-O super resistente\n• Bolsinho de vinil canguru interno para receitas, cartão e documentos',
  },
  {
    id: 9,
    nome: 'Caixinha de Bençãos Personalizada',
    categoria: 'lembrancinhas',
    categoriaLabel: 'Lembrancinhas & Mimos',
    descricao:
      'Um presente tocante e inesquecível! Caixinha rígida personalizada com mensagem especial na tampa e repleta de cartõezinhos com versículos bíblicos e palavras de bênção diárias.',
    precoAntigo: 42.0,
    preco: 34.9,
    emoji: '🎁',
    imagem: '/produtos/caixinha-bencaos-fechada.jpg',
    galeriaFotos: [
      '/produtos/caixinha-bencaos-fechada.jpg',
      '/produtos/caixinha-bencaos-aberta.jpg',
    ],
    corFundo: 'linear-gradient(135deg, #f3ebff, #fff8db)',
    tagPreview: 'Versículos & Mensagens ✨',
    destaque: 'Mimo Especial',
    permiteNome: true,
    dimensoes: 'Aprox. 7 x 7 x 4 cm',
    quantidadeFolhas: 'Dúzias de cartões com versículos',
    detalhesExtras:
      '✨ Um presente repleto de fé, amor e carinho para momentos inesquecíveis!\n• Caixinha rígida personalizada com tampa decorada no tema ou identidade visual\n• Mensagem ou versículo bíblico especial estampado no interior da tampa\n• Recheada de cartõezinhos com mensagens edificantes e versículos para o dia a dia\n• Acompanha laço de fita gorgurão com detalhe em pérola dourada\n💛 Perfeita para maternidade, batizado, padrinhos, aniversários e presentes corporativos!',
  },
  {
    id: 10,
    nome: 'Caderno Personalizado (Universitário / Pautado)',
    categoria: 'agendas',
    categoriaLabel: 'Agendas & Blocos',
    descricao:
      'Caderno personalizado com capa dura resistente, acabamento laminado exclusivo e espiral Wire-O. Ideal para escola, faculdade ou rotina de estudos com seu nome e tema preferido.',
    precoAntigo: 54.9,
    preco: 42.9,
    emoji: '📓',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #f3ebff, #e6fbf9)',
    tagPreview: 'Capa Dura Laminada • Miolo 90g Pautado',
    destaque: 'VOLTA ÀS AULAS',
    permiteNome: true,
    dimensoes: 'Universitário (20 x 27,5 cm)',
    quantidadeFolhas: 'Miolo 90g Pautado',
    detalhesExtras:
      '📓 Caderno personalizado com capa dura resistente, acabamento laminado exclusivo e espiral Wire-O.\n• Ideal para escola, faculdade ou rotina de estudos com seu nome e tema preferido\n• Capa dura resistente com acabamento laminado exclusivo\n• Miolo 90g pautado para escrita macia\n• Encadernação em Wire-O e elástico combinando',
  },
  {
    id: 11,
    nome: 'Serviço de Reforma / Personalização de Caderno',
    categoria: 'agendas',
    categoriaLabel: 'Agendas & Blocos',
    descricao:
      'Transforme um caderno comum em um material exclusivo! Aplicamos capa dura personalizada com película protetora impermeável, bolso interno e acabamento impecável.',
    precoAntigo: 35.0,
    preco: 28.0,
    emoji: '🎨',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #e6fbf9, #fff8db)',
    tagPreview: 'Revestimento Capa Dura • Com Seu Nome/Tema',
    destaque: 'REFORMA & ARTE',
    permiteNome: true,
    dimensoes: 'Sob medida para seu caderno (A5 ou Universitário)',
    quantidadeFolhas: 'Revestimento Capa Dura',
    detalhesExtras:
      '🎨 Transforme um caderno comum em um material exclusivo e super durável!\n• Aplicamos capa dura personalizada com película protetora impermeável (à prova de respingos e sujeira)\n• Bolso interno prático para guardar trabalhos e anotações\n• Acabamento impecável com seu nome e tema escolhido\n• Perfeito para cadernos escolares infantis, ensino médio ou faculdade!',
  },
  {
    id: 12,
    nome: 'Kit de Etiquetas Escolares Personalizadas',
    categoria: 'lembrancinhas',
    categoriaLabel: 'Lembrancinhas & Mimos',
    descricao:
      'Kit completo de etiquetas adesivas resistentes à água para identificar cadernos, livros, lápis, canetinhas, garrafinhas e potes. Não desbota e não rasga!',
    precoAntigo: 32.9,
    preco: 24.9,
    emoji: '🏷️',
    imagem: '',
    corFundo: 'linear-gradient(135deg, #fff8db, #ffe380)',
    tagPreview: 'Vinil Lavável • Corte Eletrônico',
    destaque: 'IMPERMEÁVEL',
    permiteNome: true,
    dimensoes: 'Vários tamanhos no kit',
    quantidadeFolhas: 'Vinil Lavável de alta fixação',
    detalhesExtras:
      '🏷️ Kit completo de etiquetas adesivas resistentes à água para identificar cadernos, livros, lápis, canetinhas, garrafinhas e potes.\n• Vinil lavável e impermeável: não desbota e não rasga!\n• Corte eletrônico de precisão, pronto para destacar e colar\n• Vários tamanhos para lápis, canetinhas, livros, cadernos, potes e garrafinhas\n• Personalizado com nome, turma e o tema favorito!',
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
    compra: 'Comprou Combo Kit Completo (Agenda + Bloco + Calendário)',
    texto:
      '"Minha Agenda A5 com capa dura holográfica e o Bloco A6 combinando ficaram simplesmente perfeitos! Brilho maravilhoso e acabamento impecável para organizar minha rotina o ano inteiro."',
  },
  {
    id: 2,
    iniciais: 'JR',
    nome: 'Juliana Ribeiro',
    compra: 'Comprou Reforma de Caderneta de Vacinação',
    texto:
      '"Fiz a reforma da caderneta do SUS da minha filha e virou outra coisa! A capa dura laminada e o bolsinho canguru deixaram tudo protegido e lindo demais!"',
  },
  {
    id: 3,
    iniciais: 'FA',
    nome: 'Fernanda Almeida',
    compra: 'Comprou Bloquinhos de Lembrancinha + Bottons',
    texto:
      '"Encomendei os bloquinhos de lembrancinha com celofane e laço dourado para a maternidade e os bottons personalizados. Todos os convidados amaram o capricho da Prof. Ataíse!"',
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
  { value: '📔', label: '📔 Agenda A5 / Planner' },
  { value: '📓', label: '📓 Caderno Universitário / Pautado' },
  { value: '🎨', label: '🎨 Reforma & Personalização de Caderno' },
  { value: '📝', label: '📝 Bloco de Notas A6' },
  { value: '📅', label: '📅 Mini Calendário de Mesa' },
  { value: '🏷️', label: '🏷️ Kit de Etiquetas Escolares' },
  { value: '🧸', label: '🧸 Lembrancinha / Maternidade' },
  { value: '🎁', label: '🎁 Combo / Kit Completo' },
  { value: '🎖️', label: '🎖️ Botton Personalizado' },
  { value: '🛡️', label: '🛡️ Reforma de Caderneta' },
  { value: '📖', label: '📖 Caderneta Completa' },
  { value: '💛', label: '💛 Mimo / Evento' },
  { value: '👩‍🏫', label: '👩‍🏫 Professora / Pedagógico' },
  { value: '💼', label: '💼 Corporativo / Brindes' },
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

