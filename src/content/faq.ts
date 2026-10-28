export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export const FAQ: FaqItem[] = [
  {
    pergunta: 'Preciso de avaliação antes de marcar um tratamento?',
    resposta:
      'Sim. A primeira consulta é sempre uma avaliação, onde analisamos sua pele, seu histórico e seus objetivos para montar o protocolo certo. Só depois dela definimos número de sessões e intervalo.',
  },
  {
    pergunta: 'Quantas sessões preciso fazer para ver resultado?',
    resposta:
      'Depende do protocolo e da resposta da sua pele. Em média, tratamentos faciais mostram diferença visível entre a terceira e a quinta sessão; corporais costumam pedir de oito a dez. Na avaliação você recebe uma estimativa realista, não uma promessa.',
  },
  {
    pergunta: 'Os procedimentos doem?',
    resposta:
      'A maioria causa apenas desconforto leve. Nos protocolos mais intensos usamos anestésico tópico aplicado com antecedência, e a intensidade é ajustada durante a sessão conforme o seu retorno.',
  },
  {
    pergunta: 'Posso fazer tratamento estando grávida ou amamentando?',
    resposta:
      'Alguns sim, outros não. Drenagem linfática e limpeza de pele costumam ser liberados; protocolos com ativos injetáveis, radiofrequência e ácidos fortes ficam suspensos. Informe a gestação na avaliação para montarmos um plano seguro.',
  },
  {
    pergunta: 'Qual o prazo para remarcar sem custo?',
    resposta:
      'Até 24 horas antes do horário agendado, pelo WhatsApp ou telefone. Remarcações com menos de 24 horas de antecedência consomem a sessão do pacote.',
  },
  {
    pergunta: 'Vocês atendem convênio?',
    resposta:
      'Não. Procedimentos estéticos não têm cobertura de convênio. Trabalhamos com pagamento à vista com desconto, cartão em até 6× sem juros e pacotes fechados com condição especial.',
  },
];
