import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

describe('not-found page', () => {
  it('renderiza um único h1 e links para / e /servicos', () => {
    render(<NotFound />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: /página inicial/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /ver tratamentos/i })).toHaveAttribute(
      'href',
      '/servicos',
    );
  });
});
