export interface Numero {
  valor: string;
  unidade: string;
  texto: string;
}

/**
 * Extraído de `src/app/page.tsx` (Tarefa 14) para ser reutilizado também em
 * `/sobre`. Os valores não mudaram — são os mesmos da home.
 */
export const NUMEROS: Numero[] = [
  { valor: '12', unidade: 'anos', texto: 'de clínica aberta no mesmo endereço' },
  { valor: '4.200', unidade: 'pacientes', texto: 'atendidas desde a inauguração' },
  { valor: '6', unidade: 'especialistas', texto: 'com registro ativo no conselho' },
  { valor: '4,9', unidade: '/5', texto: 'média de avaliação das pacientes' },
];
