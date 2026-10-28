import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const pathname = vi.hoisted(() => ({ value: '/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => pathname.value,
}));

import { SiteNav } from '@/components/SiteNav';

describe('SiteNav', () => {
  it('links to every public page and the booking CTA', () => {
    pathname.value = '/';
    render(<SiteNav />);

    expect(screen.getByRole('link', { name: 'Serviços' })).toHaveAttribute('href', '/servicos');
    expect(screen.getByRole('link', { name: 'Resultados' })).toHaveAttribute('href', '/resultados');
    expect(screen.getByRole('link', { name: 'Equipe' })).toHaveAttribute('href', '/equipe');
    expect(screen.getByRole('link', { name: 'Pacotes' })).toHaveAttribute('href', '/pacotes');
    expect(screen.getByRole('link', { name: 'Diário' })).toHaveAttribute('href', '/diario');
    expect(screen.getByRole('link', { name: 'Agendar' })).toHaveAttribute('href', '/agendamento');
  });

  it('renders nothing inside the admin panel', () => {
    pathname.value = '/admin/agendamentos';
    const { container } = render(<SiteNav />);
    expect(container).toBeEmptyDOMElement();
  });
});
