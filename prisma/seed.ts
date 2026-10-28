import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertProfissional(dados: {
  name: string;
  role: string;
  bio: string;
  credentials: string[];
  specialties: string[];
  photoUrl: string;
}) {
  const existente = await prisma.professional.findFirst({ where: { name: dados.name } });
  if (existente) {
    return prisma.professional.update({ where: { id: existente.id }, data: dados });
  }
  return prisma.professional.create({ data: dados });
}

async function main() {
  // update: {} é deliberado (I3 / triagem #5) — nome, categoria, descrição,
  // duração e preço são editáveis pelo admin via PATCH /api/admin/services.
  // Se o upsert reescrevesse esses campos a cada re-execução do seed, uma
  // edição feita pelo admin seria silenciosamente revertida no próximo
  // `prisma db seed`. O `create` mantém o comportamento original: banco sem
  // o serviço ainda ganha os dados de demonstração.
  const facial = await prisma.service.upsert({
    where: { slug: 'limpeza-de-pele-profunda' },
    update: {},
    create: {
      name: 'Limpeza de Pele Profunda',
      slug: 'limpeza-de-pele-profunda',
      category: 'Facial',
      description: 'Higienização, esfoliação e extração para renovar a pele do rosto.',
      duration: 60,
      price: 220,
    },
  });

  const corporal = await prisma.service.upsert({
    where: { slug: 'drenagem-linfatica' },
    update: {},
    create: {
      name: 'Drenagem Linfática',
      slug: 'drenagem-linfatica',
      category: 'Corporal',
      description: 'Massagem terapêutica que estimula a circulação e reduz retenção de líquidos.',
      duration: 50,
      price: 180,
    },
  });

  // Serviços que /pacotes (src/content/pacotes.ts) e as bios das
  // profissionais abaixo já citam, mas que ainda não existiam no catálogo
  // (I3): sem eles, só havia 2 serviços agendáveis e o pacote "Avançado"
  // vendia um protocolo que não existia.
  const protocoloFacial = await prisma.service.upsert({
    where: { slug: 'protocolo-facial-avancado' },
    update: {},
    create: {
      name: 'Protocolo Facial Avançado',
      slug: 'protocolo-facial-avancado',
      category: 'Facial',
      description:
        'Protocolo de rejuvenescimento combinando tecnologias e ativos de alta performance para linhas finas, viço e firmeza.',
      duration: 75,
      price: 320,
    },
  });

  const modelagemCorporal = await prisma.service.upsert({
    where: { slug: 'modelagem-corporal' },
    update: {},
    create: {
      name: 'Modelagem Corporal',
      slug: 'modelagem-corporal',
      category: 'Corporal',
      description: 'Protocolo corporal que combina técnicas manuais e aparelhologia para reduzir medidas e firmar a pele.',
      duration: 60,
      price: 240,
    },
  });

  const peelingQuimico = await prisma.service.upsert({
    where: { slug: 'peeling-quimico' },
    update: {},
    create: {
      name: 'Peeling Químico',
      slug: 'peeling-quimico',
      category: 'Facial',
      description: 'Renovação da camada superficial da pele com ácidos dosados para textura, poros e manchas.',
      duration: 45,
      price: 180,
    },
  });

  const massagemTerapeutica = await prisma.service.upsert({
    where: { slug: 'massagem-terapeutica' },
    update: {},
    create: {
      name: 'Massagem Terapêutica',
      slug: 'massagem-terapeutica',
      category: 'Corporal',
      description: 'Massagem de alívio de tensão e dores musculares, com técnicas de liberação miofascial.',
      duration: 50,
      price: 160,
    },
  });

  const existenteCamila = await prisma.professional.findFirst({ where: { name: 'Dra. Camila Duarte' } });
  const camila = existenteCamila
    ? await prisma.professional.update({ where: { id: existenteCamila.id }, data: { photoUrl: null } })
    : await prisma.professional.create({ data: { name: 'Dra. Camila Duarte', photoUrl: null } });

  await prisma.professionalService.upsert({
    where: { professionalId_serviceId: { professionalId: camila.id, serviceId: facial.id } },
    update: {},
    create: { professionalId: camila.id, serviceId: facial.id },
  });
  await prisma.professionalService.upsert({
    where: { professionalId_serviceId: { professionalId: camila.id, serviceId: corporal.id } },
    update: {},
    create: { professionalId: camila.id, serviceId: corporal.id },
  });

  const horariosCamila = [
    { weekday: 1, startMinute: 9 * 60, endMinute: 18 * 60 },
    { weekday: 2, startMinute: 9 * 60, endMinute: 18 * 60 },
    { weekday: 3, startMinute: 9 * 60, endMinute: 18 * 60 },
    { weekday: 4, startMinute: 9 * 60, endMinute: 18 * 60 },
    { weekday: 5, startMinute: 9 * 60, endMinute: 17 * 60 },
  ];
  // update: {} é deliberado — startMinute/endMinute são editáveis pelo admin via
  // PATCH /api/admin/professionals/[id] (AdminProfessionalsManager). Se o upsert
  // reescrevesse esses campos a cada re-execução do seed, uma alteração de agenda
  // feita pelo admin seria silenciosamente revertida no próximo `prisma db seed`.
  // O `create` mantém o comportamento original: banco sem esses horários ganha o
  // horário padrão de demonstração.
  for (const horario of horariosCamila) {
    await prisma.workingHour.upsert({
      where: { professionalId_weekday: { professionalId: camila.id, weekday: horario.weekday } },
      update: {},
      create: { professionalId: camila.id, ...horario },
    });
  }

  // update: { name } (sem passwordHash) é deliberado — se o admin trocar a senha
  // pela UI, uma re-execução do seed não pode reverter a credencial. A senha do
  // admin vem do ambiente (SEED_ADMIN_PASSWORD) e nunca fica no código.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('Defina SEED_ADMIN_PASSWORD no .env antes de rodar o seed (veja .env.example).');
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { name: 'Administração Aurum' },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Administração Aurum',
    },
  });

  const profissionais = [
    {
      name: 'Dra. Helena Vasconcelos',
      role: 'Diretora clínica · Biomédica esteta',
      bio: 'Fundou a clínica depois de doze anos em dermatologia estética. Conduz as avaliações iniciais e os protocolos faciais mais complexos, e é quem define o padrão técnico da casa.',
      credentials: ['CRBM 28.451', 'Pós-graduação em Estética Avançada — UNIFESP', 'Especialização em Laserterapia'],
      specialties: ['Protocolos faciais', 'Laserterapia', 'Avaliação diagnóstica'],
      photoUrl: '/img/equipe/helena.webp',
    },
    {
      name: 'Marina Okabe',
      role: 'Esteticista sênior',
      bio: 'Especialista em pele acneica e em protocolos de barreira cutânea. Atende principalmente pacientes que chegam depois de tratamentos agressivos e precisam recuperar a pele antes de seguir adiante.',
      credentials: ['Técnica em Estética — SENAC', 'Certificação em Peelings Químicos'],
      specialties: ['Limpeza de pele profunda', 'Peelings', 'Pele acneica'],
      photoUrl: '/img/equipe/marina.webp',
    },
    {
      name: 'Beatriz Nogueira',
      role: 'Fisioterapeuta dermatofuncional',
      bio: 'Cuida de todo o corpo na clínica: drenagem, modelagem e pós-operatório. Trabalha em conjunto com cirurgiões plásticos da região no acompanhamento de pacientes recém-operados.',
      credentials: ['CREFITO 3/198.442', 'Especialização em Dermatofuncional'],
      specialties: ['Drenagem linfática', 'Pós-operatório', 'Modelagem corporal'],
      photoUrl: '/img/equipe/beatriz.webp',
    },
    {
      name: 'Carolina Prado',
      role: 'Biomédica esteta',
      bio: 'Responsável pelos protocolos de rejuvenescimento e pelos procedimentos injetáveis. Conhecida entre as pacientes pela mão leve e pela explicação minuciosa de cada etapa.',
      credentials: ['CRBM 31.907', 'Habilitação em Procedimentos Injetáveis'],
      specialties: ['Rejuvenescimento', 'Injetáveis', 'Bioestimuladores'],
      photoUrl: '/img/equipe/carolina.webp',
    },
    {
      name: 'Tatiane Ribeiro',
      role: 'Esteticista',
      bio: 'Conduz os atendimentos de manutenção e as sessões dos pacotes mensais. É quem a maior parte das pacientes vê com mais frequência ao longo do tratamento.',
      credentials: ['Técnica em Estética — SENAC'],
      specialties: ['Manutenção facial', 'Hidratação profunda', 'Massagem relaxante'],
      photoUrl: '/img/equipe/tatiane.webp',
    },
    {
      name: 'Rafael Teixeira',
      role: 'Terapeuta corporal',
      bio: 'Veio da fisioterapia esportiva e trouxe para a clínica um olhar de postura e movimento. Atende massagem terapêutica e os protocolos corporais de maior intensidade.',
      credentials: ['CREFITO 3/221.003', 'Formação em Massoterapia'],
      specialties: ['Massagem terapêutica', 'Protocolos corporais', 'Postura'],
      photoUrl: '/img/equipe/rafael.webp',
    },
  ];

  const profissionaisCriados: Record<string, Awaited<ReturnType<typeof upsertProfissional>>> = {};
  for (const p of profissionais) {
    profissionaisCriados[p.name] = await upsertProfissional(p);
  }

  // I3: vincula cada profissional aos serviços das suas especialidades, com
  // horários de trabalho realistas. Sem isso as 6 profissionais tinham 0
  // serviços e 0 horários — só Dra. Camila Duarte (sem foto, sem bio)
  // aparecia como agendável, e /pacotes vendia tratamentos inexistentes.
  const vinculos: { profissional: string; servicos: { id: string }[] }[] = [
    { profissional: 'Dra. Helena Vasconcelos', servicos: [facial, protocoloFacial] },
    { profissional: 'Marina Okabe', servicos: [facial, peelingQuimico] },
    { profissional: 'Beatriz Nogueira', servicos: [corporal, modelagemCorporal] },
    { profissional: 'Carolina Prado', servicos: [protocoloFacial] },
    { profissional: 'Tatiane Ribeiro', servicos: [facial, massagemTerapeutica] },
    { profissional: 'Rafael Teixeira', servicos: [massagemTerapeutica, corporal] },
  ];

  for (const vinculo of vinculos) {
    const profissional = profissionaisCriados[vinculo.profissional];
    for (const servico of vinculo.servicos) {
      await prisma.professionalService.upsert({
        where: { professionalId_serviceId: { professionalId: profissional.id, serviceId: servico.id } },
        update: {},
        create: { professionalId: profissional.id, serviceId: servico.id },
      });
    }
  }

  // Segunda a sábado, variados — nem todas atendem todo dia. weekday segue
  // Date#getDay(): 0 = domingo ... 6 = sábado.
  const horariosPorProfissional: Record<string, { weekday: number; startMinute: number; endMinute: number }[]> = {
    'Dra. Helena Vasconcelos': [1, 2, 3, 4, 5].map((weekday) => ({
      weekday,
      startMinute: 9 * 60,
      endMinute: 17 * 60,
    })),
    'Marina Okabe': [2, 3, 4, 5].map((weekday) => ({ weekday, startMinute: 9 * 60, endMinute: 18 * 60 })).concat([
      { weekday: 6, startMinute: 9 * 60, endMinute: 14 * 60 },
    ]),
    'Beatriz Nogueira': [1, 3, 5].map((weekday) => ({ weekday, startMinute: 8 * 60, endMinute: 16 * 60 })).concat([
      { weekday: 6, startMinute: 9 * 60, endMinute: 13 * 60 },
    ]),
    'Carolina Prado': [1, 2, 4].map((weekday) => ({ weekday, startMinute: 10 * 60, endMinute: 19 * 60 })),
    'Tatiane Ribeiro': [1, 2, 3, 4, 5].map((weekday) => ({ weekday, startMinute: 9 * 60, endMinute: 18 * 60 })).concat([
      { weekday: 6, startMinute: 9 * 60, endMinute: 14 * 60 },
    ]),
    'Rafael Teixeira': [2, 4].map((weekday) => ({ weekday, startMinute: 8 * 60, endMinute: 17 * 60 })).concat([
      { weekday: 6, startMinute: 8 * 60, endMinute: 13 * 60 },
    ]),
  };

  // update: {} pelo mesmo motivo do horário da Camila acima — não reverter
  // uma alteração de agenda feita pelo admin numa re-execução do seed.
  for (const [nome, horarios] of Object.entries(horariosPorProfissional)) {
    const profissional = profissionaisCriados[nome];
    for (const horario of horarios) {
      await prisma.workingHour.upsert({
        where: { professionalId_weekday: { professionalId: profissional.id, weekday: horario.weekday } },
        update: {},
        create: { professionalId: profissional.id, ...horario },
      });
    }
  }

  const posts = [
    {
      slug: 'quantas-sessoes-realmente-preciso',
      title: 'Quantas sessões você realmente precisa?',
      excerpt:
        'A resposta honesta é "depende" — mas depende de coisas específicas, e dá para estimar com bastante precisão já na avaliação.',
      coverUrl: '/img/diario/sessoes.webp',
      tags: ['tratamentos', 'avaliação'],
      body: `## O número que ninguém quer dizer\n\nClínica que promete resultado em uma sessão está vendendo expectativa, não tratamento.\n\nO número de sessões depende de quatro coisas: o estado atual da sua pele, a profundidade do que você quer corrigir, a resposta individual do seu organismo e a sua constância entre as sessões.\n\n## O que dá para estimar na avaliação\n\nNa primeira consulta conseguimos definir uma faixa realista — "entre cinco e sete sessões" — e o intervalo entre elas. Essa faixa é revista a cada reavaliação, com foto.\n\n## Por que a constância importa mais que a intensidade\n\nSessões espaçadas demais fazem a pele voltar ao ponto de partida entre uma e outra. É por isso que seis sessões seguidas em intervalo correto superam dez sessões feitas de qualquer jeito ao longo de um ano.`,
      publishedAt: new Date('2026-09-02T10:00:00Z'),
    },
    {
      slug: 'skincare-em-casa-o-que-vale',
      title: 'Skincare em casa: o que realmente muda a sua pele',
      excerpt: 'Três ativos resolvem a maior parte dos casos. O resto da prateleira é, na melhor das hipóteses, opcional.',
      coverUrl: '/img/diario/skincare.webp',
      tags: ['skincare', 'rotina'],
      body: `## Menos passos, mais constância\n\nA rotina de doze etapas que viralizou não é melhor que a de três. É só mais cara e mais difícil de manter.\n\n## Os três que fazem o trabalho\n\nProtetor solar todo dia, um ativo de renovação à noite e um hidratante compatível com a sua barreira. Essa é a base.\n\n## O que a clínica acrescenta\n\nO que fazemos em sessão acelera e aprofunda o que a rotina sustenta. Um não substitui o outro: tratamento sem rotina em casa é dinheiro jogado fora.`,
      publishedAt: new Date('2026-08-19T10:00:00Z'),
    },
    {
      slug: 'pele-no-inverno',
      title: 'Por que sua pele muda no inverno',
      excerpt: 'Ar seco, banho quente e aquecedor formam a combinação que mais destrói barreira cutânea nesta época do ano.',
      coverUrl: '/img/diario/inverno.webp',
      tags: ['sazonal', 'barreira cutânea'],
      body: `## O que acontece com a barreira\n\nUmidade baixa acelera a perda de água pela pele. O banho quente remove os lipídios que seguram essa água. O resultado é repuxamento, descamação e sensibilidade.\n\n## Três ajustes que resolvem a maior parte\n\nBanho mais morno e mais curto, hidratante aplicado com a pele ainda úmida, e protetor solar mantido — sol de inverno também causa dano.\n\n## Quando procurar a clínica\n\nSe a descamação não cede em duas semanas de rotina ajustada, provavelmente a barreira precisa de um protocolo de reconstrução, não de mais hidratante.`,
      publishedAt: new Date('2026-07-28T10:00:00Z'),
    },
    {
      slug: 'antes-de-procedimento-injetavel',
      title: 'O que perguntar antes de qualquer procedimento injetável',
      excerpt: 'Cinco perguntas que separam um atendimento sério de um que você vai se arrepender.',
      coverUrl: '/img/diario/injetaveis.webp',
      tags: ['segurança', 'injetáveis'],
      body: `## Quem vai aplicar, e com que registro?\n\nPeça o número do conselho. Profissional habilitado mostra sem hesitar.\n\n## Qual produto, de qual fabricante, com qual lote?\n\nVocê tem direito a saber e a ver a embalagem sendo aberta na sua frente.\n\n## O que acontece se eu não gostar?\n\nAlgumas substâncias são reversíveis, outras não. Essa diferença precisa estar clara antes, não depois.\n\n## Quanto tempo dura e qual o plano de manutenção?\n\nResultado permanente não existe em injetável. Quem promete isso está mentindo ou não sabe.\n\n## Posso ver resultados de outros pacientes com o meu tipo de pele?\n\nFoto de banco de imagem não conta.`,
      publishedAt: new Date('2026-07-10T10:00:00Z'),
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({ where: { slug: post.slug }, update: post, create: post });
  }

  // NOTA: o brief original apontava a caso 2 para o slug 'protocolo-facial-avancado',
  // que nunca existiu neste seed (só há dois serviços: 'limpeza-de-pele-profunda' e
  // 'drenagem-linfatica'). Ajustado para 'limpeza-de-pele-profunda', como o próprio
  // Step 6 instrui ("ajuste os slugs abaixo para os que existirem de fato no seu seed
  // de serviços"). Ver ledger do projeto, seção "Decisões".
  const casos = [
    {
      servicoSlug: 'limpeza-de-pele-profunda',
      beforeUrl: '/img/resultados/caso-1-antes.webp',
      afterUrl: '/img/resultados/caso-1-depois.webp',
      caption: 'Redução de comedões e uniformização de textura na zona T.',
      sessions: 4,
      order: 0,
    },
    {
      servicoSlug: 'limpeza-de-pele-profunda',
      beforeUrl: '/img/resultados/caso-2-antes.webp',
      afterUrl: '/img/resultados/caso-2-depois.webp',
      caption: 'Melhora de viço e atenuação de linhas finas na região periorbital.',
      sessions: 6,
      order: 1,
    },
    {
      servicoSlug: 'drenagem-linfatica',
      beforeUrl: '/img/resultados/caso-3-antes.webp',
      afterUrl: '/img/resultados/caso-3-depois.webp',
      caption: 'Redução de retenção e definição de contorno na região abdominal.',
      sessions: 10,
      order: 2,
    },
  ];

  for (const caso of casos) {
    const servico = await prisma.service.findUnique({ where: { slug: caso.servicoSlug } });
    if (!servico) {
      console.warn(`Serviço ${caso.servicoSlug} não encontrado — caso de resultado ignorado.`);
      continue;
    }
    const existente = await prisma.resultCase.findFirst({
      where: { serviceId: servico.id, order: caso.order },
    });
    const dados = {
      serviceId: servico.id,
      beforeUrl: caso.beforeUrl,
      afterUrl: caso.afterUrl,
      caption: caso.caption,
      sessions: caso.sessions,
      order: caso.order,
    };
    if (existente) {
      await prisma.resultCase.update({ where: { id: existente.id }, data: dados });
    } else {
      await prisma.resultCase.create({ data: dados });
    }
  }

  console.log('Seed complete:', {
    servicos: [facial, corporal, protocoloFacial, modelagemCorporal, peelingQuimico, massagemTerapeutica].map(
      (s) => s.slug,
    ),
    professional: camila.name,
    profissionaisAdicionados: profissionais.length,
    vinculosProfissionalServico: vinculos.reduce((total, v) => total + v.servicos.length, 0),
    posts: posts.length,
    casos: casos.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
