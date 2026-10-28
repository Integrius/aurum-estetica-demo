import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders as a button and fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Agendar agora</Button>);
    const button = screen.getByRole('button', { name: 'Agendar agora' });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders as a link when href is provided', () => {
    render(<Button href="/agendamento">Agendar agora</Button>);
    const link = screen.getByRole('link', { name: 'Agendar agora' });
    expect(link).toHaveAttribute('href', '/agendamento');
  });

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Ver serviços</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-charcoal');
  });
});
