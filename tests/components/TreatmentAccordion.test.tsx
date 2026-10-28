import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TreatmentAccordion, type Grupo } from '@/components/TreatmentAccordion';

const grupos: Grupo[] = [
  {
    categoria: 'Facial',
    itens: [
      { id: 'a', slug: 'limpeza', nome: 'Limpeza', descricao: 'Desc A', preco: 'R$ 220', duracao: '1h' },
      { id: 'b', slug: 'peeling', nome: 'Peeling', descricao: 'Desc B', preco: 'R$ 300', duracao: '45min' },
    ],
  },
];

describe('TreatmentAccordion', () => {
  it('painel fechado é inert, aberto não', () => {
    render(<TreatmentAccordion grupos={grupos} />);
    expect(document.getElementById('painel-a')).not.toHaveAttribute('inert');
    expect(document.getElementById('painel-b')).toHaveAttribute('inert');
  });

  // jsdom não implementa a semântica de inert (foco/árvore a11y), então o
  // teste verifica o atributo — no navegador é ele que tira o link do Tab.
  it('ao abrir outro item, o painel anterior passa a ser inert', async () => {
    const user = userEvent.setup();
    render(<TreatmentAccordion grupos={grupos} />);
    await user.click(screen.getByRole('button', { name: /peeling/i }));
    expect(document.getElementById('painel-a')).toHaveAttribute('inert');
    expect(document.getElementById('painel-b')).not.toHaveAttribute('inert');
  });

  it('cada região é rotulada pelo botão que a controla', () => {
    render(<TreatmentAccordion grupos={grupos} />);
    const regiao = document.getElementById('painel-a')!;
    const botao = screen.getByRole('button', { name: /limpeza/i });
    expect(regiao.getAttribute('aria-labelledby')).toBe(botao.id);
    expect(botao.id).not.toBe('');
  });
});
