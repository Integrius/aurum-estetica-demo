export interface Depoimento {
  nome: string;
  tratamento: string;
  texto: string;
}

export const DEPOIMENTOS: Depoimento[] = [
  {
    nome: 'Fernanda R.',
    tratamento: 'Protocolo facial avançado',
    texto:
      'Ambiente impecável e resultado visível já na primeira sessão. O que mais me marcou foi a franqueza da avaliação: me disseram exatamente quantas sessões eu precisaria, sem inventar pacote.',
  },
  {
    nome: 'Juliana M.',
    tratamento: 'Drenagem linfática',
    texto:
      'Atendimento cuidadoso do início ao fim. Consigo remarcar pelo WhatsApp em minutos e nunca esperei mais de cinco minutos para ser atendida.',
  },
  {
    nome: 'Patrícia A.',
    tratamento: 'Limpeza de pele profunda',
    texto:
      'A equipe explica cada etapa do tratamento com muita clareza. Saí entendendo o que foi feito na minha pele e o que eu preciso manter em casa.',
  },
  {
    nome: 'Camila S.',
    tratamento: 'Pacote Avançado',
    texto:
      'O registro fotográfico mês a mês mudou minha percepção. Dá para ver a evolução de verdade, não é só sensação.',
  },
];
