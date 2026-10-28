/**
 * DEMO COMERCIAL DA ZEVRO
 *
 * Para revender este site a outra clínica, troque APENAS os quatro campos
 * marcados com "← trocar" e substitua as imagens de public/img/.
 * Nenhum outro arquivo precisa ser tocado.
 *
 * Valores fictícios mas plausíveis por decisão de projeto: placeholder literal
 * na tela ("[SEU NOME AQUI]") faz o demo parecer inacabado. Exceção: o
 * telefone/WhatsApp tem letras de propósito, para nunca discar um número real.
 */
export const SITE = {
  nome: 'Aurum Estética Avançada',                            // ← trocar
  endereco: 'Rua das Acácias, 1200 — Jardins, São Paulo/SP',   // ← trocar
  email: 'contato@aurum-demo.com.br',                          // ← trocar
  whatsapp: '857985lm2589',                                    // ← trocar

  nomeCurto: 'Aurum',
  telefoneExibicao: '+857 985lm-2589',
  descricaoCurta:
    'Clínica de estética facial e corporal com protocolos avançados, equipe especializada e resultados acompanhados de perto.',
  instagram: {
    usuario: '@aurum.estetica',
    url: 'https://instagram.com/aurum.estetica',
  },
  horarios: [
    { dias: 'Segunda a sexta', horas: '09h — 20h' },
    { dias: 'Sábado', horas: '09h — 16h' },
    { dias: 'Domingo', horas: 'Fechado' },
  ],
  mapa: { lat: -23.5617, lng: -46.6559 },
  url: 'https://beauty.zevro.app',
} as const;
