import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FaqAccordion } from '@/components/FaqAccordion';
import { FAQ } from '@/content/faq';

describe('FaqAccordion', () => {
  it('renderiza cada item como <details>/<summary>', () => {
    const { container } = render(<FaqAccordion itens={FAQ} />);
    expect(container.querySelectorAll('details')).toHaveLength(FAQ.length);
    expect(container.querySelectorAll('summary')).toHaveLength(FAQ.length);
  });

  // Restrição global 7: todo texto existe no DOM inicial. <details> nativo
  // esconde o conteúdo do <p> visualmente quando fechado, mas não o remove do
  // DOM — por isso pergunta e resposta devem estar acessíveis mesmo sem abrir.
  it('todas as perguntas e respostas estão no DOM inicial, sem precisar abrir nada', () => {
    render(<FaqAccordion itens={FAQ} />);
    for (const item of FAQ) {
      expect(screen.getByText(item.pergunta)).toBeInTheDocument();
      expect(screen.getByText(item.resposta)).toBeInTheDocument();
    }
  });
});
