export interface Pacote {
  slug: string;
  nome: string;
  chamada: string;
  precoMensal: number;
  sessoes: number;
  destaque: boolean;
  inclui: string[];
}

export const PACOTES: Pacote[] = [
  {
    slug: 'essencial',
    nome: 'Essencial',
    chamada: 'Para quem está começando a cuidar da pele com método.',
    precoMensal: 390,
    sessoes: 2,
    destaque: false,
    inclui: [
      'Avaliação completa com biomédica esteta',
      '2 sessões mensais de limpeza de pele profunda',
      'Protocolo de skincare domiciliar personalizado',
      'Reavaliação a cada 3 meses',
    ],
  },
  {
    slug: 'avancado',
    nome: 'Avançado',
    chamada: 'O mais procurado. Combina tratamento facial e corporal.',
    precoMensal: 740,
    sessoes: 4,
    destaque: true,
    inclui: [
      'Tudo do Essencial',
      '2 sessões mensais de protocolo facial avançado',
      '2 sessões mensais de drenagem ou modelagem corporal',
      'Registro fotográfico de evolução a cada 4 semanas',
      'Prioridade na agenda',
    ],
  },
  {
    slug: 'intensivo',
    nome: 'Intensivo',
    chamada: 'Acompanhamento semanal, para objetivos com prazo definido.',
    precoMensal: 1280,
    sessoes: 8,
    destaque: false,
    inclui: [
      'Tudo do Avançado',
      '8 sessões mensais combinando os protocolos do seu plano',
      'Acompanhamento semanal por WhatsApp com a equipe',
      'Sessão de manutenção bonificada a cada trimestre',
      'Horários reservados fora do expediente comum',
    ],
  },
];
