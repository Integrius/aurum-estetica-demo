import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/prisma', () => {
  const serviceFixture = {
    id: 'svc_1',
    name: 'Limpeza de Pele Profunda',
    slug: 'limpeza-de-pele-profunda',
    category: 'Facial',
    description: 'Higienização, esfoliação e extração.',
    duration: 60,
    price: { toNumber: () => 220 },
    // A página de detalhe (Tarefa 10) faz `include: { results, professionals }`
    // — o mock ignora os argumentos da chamada e sempre devolve este fixture,
    // então ele precisa trazer os dois arrays para bater com o shape que
    // `servico.results.length` / `servico.professionals.length` esperam.
    results: [],
    professionals: [],
  };

  return {
    prisma: {
      service: {
        findMany: vi.fn().mockResolvedValue([serviceFixture]),
        findUnique: vi.fn().mockResolvedValue(serviceFixture),
      },
    },
  };
});

import ServicesPage from '@/app/servicos/page';
import ServiceDetailPage from '@/app/servicos/[slug]/page';

describe('Services listing page', () => {
  it('groups and lists services by category', async () => {
    render(await ServicesPage());
    expect(screen.getByText('Facial')).toBeInTheDocument();
    expect(screen.getByText('Limpeza de Pele Profunda')).toBeInTheDocument();
  });
});

describe('Service detail page', () => {
  it('renders the service name, duration, price and the investment card CTA', async () => {
    render(await ServiceDetailPage({ params: Promise.resolve({ slug: 'limpeza-de-pele-profunda' }) }));
    // O nome do serviço vira o H1 do PageHero, que quebra cada palavra em um
    // <span> próprio sem espaço entre eles (linha por linha) — por isso não
    // dá pra casar a string inteira (nem com espaço normalizado) via
    // getByText; conferimos que cada palavra do nome aparece no heading.
    const titulo = screen.getByRole('heading', { level: 1 });
    for (const palavra of 'Limpeza de Pele Profunda'.split(' ')) {
      expect(titulo.textContent).toContain(palavra);
    }
    // duration=60min -> formatDuration retorna "1h" (sem minutos restantes).
    expect(screen.getByText(/1h/)).toBeInTheDocument();
    expect(screen.getByText(/220/)).toBeInTheDocument();
    // O botão de WhatsApp desta página foi removido nesta tarefa: o
    // MobileBookingDock (Tarefa 6) já cobre isso fixo em toda página mobile.
    // O cartão de investimento na lateral traz o CTA de agendamento no lugar.
    const agendarLink = screen.getByRole('link', { name: /agendar este tratamento/i });
    expect(agendarLink).toHaveAttribute('href', '/agendamento?service=limpeza-de-pele-profunda');
    expect(screen.queryByRole('link', { name: /whatsapp/i })).not.toBeInTheDocument();
  });
});
