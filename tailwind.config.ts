import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        champagne: '#EDE4D8',
        ivory: '#F7F2EA',
        sand: '#D8C9B6',
        clay: '#8A6A4F',
        charcoal: '#1F1B18',
        // Adendo da Tarefa 17 (decisão do usuário): o tom original (#C08552) dava
        // 2.8:1 sobre ivory e 3.12:1 como fundo com texto branco — abaixo do
        // WCAG AA (4.5:1 para texto). Um token único não serve: escurecer o
        // suficiente para passar sobre claro deixa o contraste contra charcoal
        // abaixo de 3:1. Três tons do mesmo matiz/saturação (HSL ~28°/47%),
        // cada um calculado pela fórmula de luminância relativa do WCAG:
        terracotta: {
          // Escurecido — uso padrão (texto/ícone/borda) sobre fundo claro
          // (ivory/champagne/branco). Primeiro tom da escala de luminosidade
          // que atinge ≥4.5:1 nos três: 5.20:1 ivory, 4.61:1 champagne, 5.80:1
          // branco (mas só 2.95:1 sobre charcoal — não usar em seção escura).
          DEFAULT: '#8A5B32',
          // Tom original — texto/ícone/borda sobre fundo escuro (charcoal:
          // rodapé, seções `bg-charcoal`, card em destaque do PackageTable):
          // 5.47:1 contra charcoal (mas só 2.8:1 contra ivory — não usar em
          // fundo claro).
          light: '#C08552',
          // Tom intermediário só para elementos não textuais que precisam
          // funcionar em QUALQUER fundo (anel de foco global e a barra de
          // progresso do scroll, que ficam fixos no topo da página e passam
          // por cima de hero escuro numa página e de fundo claro na outra).
          // Limiar não-textual do WCAG é 3:1, não 4.5:1 — este tom atinge
          // ≥3:1 contra ivory (4.25), champagne (3.77), branco (4.74) E
          // charcoal (3.61) ao mesmo tempo.
          balanced: '#9D6739',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      fontSize: {
        // Escala editorial. line-height e letter-spacing seguem a tabela do
        // catálogo de tendências: quanto maior a fonte, mais apertada.
        display: ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        hero: ['clamp(3rem, 11vw, 9rem)', { lineHeight: '0.86', letterSpacing: '-0.045em' }],
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
