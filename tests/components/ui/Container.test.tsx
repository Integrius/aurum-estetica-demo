import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from '@/components/ui/Container';

describe('Container', () => {
  it('renders the default max width', () => {
    render(<Container>conteúdo</Container>);
    const el = screen.getByText('conteúdo');
    expect(el.className).toContain('max-w-6xl');
    expect(el.className).not.toContain('max-w-3xl');
  });

  it('renders the narrow max width when size="narrow"', () => {
    render(<Container size="narrow">conteúdo</Container>);
    const el = screen.getByText('conteúdo');
    expect(el.className).toContain('max-w-3xl');
    expect(el.className).not.toContain('max-w-6xl');
  });

  it('still appends additive classNames', () => {
    render(
      <Container size="narrow" className="space-y-12">
        conteúdo
      </Container>
    );
    const el = screen.getByText('conteúdo');
    expect(el.className).toContain('max-w-3xl');
    expect(el.className).toContain('space-y-12');
  });
});
