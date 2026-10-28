import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'svc_1',
          name: 'Limpeza de Pele Profunda',
          slug: 'limpeza-de-pele-profunda',
          category: 'Facial',
          description: 'Higienização, esfoliação e extração.',
          duration: 60,
          price: { toNumber: () => 220 },
        },
      ]),
    },
    resultCase: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'case_1',
          serviceId: 'svc_1',
          beforeUrl: '/img/resultados/caso1-antes.webp',
          afterUrl: '/img/resultados/caso1-depois.webp',
          caption: 'Redução visível de manchas após o ciclo completo.',
          sessions: 6,
          order: 0,
          service: { name: 'Limpeza de Pele Profunda' },
        },
      ]),
    },
    professional: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'prof_1',
          name: 'Dra. Helena Ribeiro',
          photoUrl: '/img/equipe/helena.webp',
          role: 'Biomédica esteta',
          bio: 'Mais de dez anos dedicados a protocolos faciais.',
          credentials: ['CRBM 12345'],
          specialties: ['Protocolos faciais'],
        },
        {
          id: 'prof_2',
          name: 'Marina Okabe',
          photoUrl: '/img/equipe/marina.webp',
          role: 'Esteticista sênior',
          bio: 'Especialista em pele acneica e em protocolos de barreira cutânea.',
          credentials: ['Técnica em Estética — SENAC'],
          specialties: ['Limpeza de pele profunda', 'Peelings'],
        },
      ]),
    },
    post: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'post_1',
          slug: 'rotina-de-inverno',
          title: 'Rotina de inverno para pele sensível',
          excerpt: 'O que muda no frio e como ajustar o skincare.',
          coverUrl: '/img/diario/inverno.webp',
          tags: ['sazonal'],
          publishedAt: new Date('2026-07-28T10:00:00Z'),
        },
      ]),
    },
  },
}));

import Home from '@/app/page';

describe('Home page', () => {
  it('renders the clinic name, a booking CTA and the featured service', async () => {
    render(await Home());
    expect(screen.getByText('Aurum Estética Avançada')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /agendar/i }).length).toBeGreaterThan(0);
    expect(screen.getByText('Limpeza de Pele Profunda')).toBeInTheDocument();
  });

  it('renders the journey chapters, results, testimonials, team preview and journal preview', async () => {
    render(await Home());

    // Jornada (StickyStory) — os 3 capítulos, texto completo no DOM.
    expect(screen.getByText('Avaliação')).toBeInTheDocument();
    expect(screen.getByText('Protocolo')).toBeInTheDocument();
    expect(screen.getByText('Manutenção')).toBeInTheDocument();

    // Resultados — caso mockado e aviso obrigatório de imagens ilustrativas.
    expect(screen.getByText(/Redução visível de manchas/)).toBeInTheDocument();
    expect(screen.getByText(/Imagens ilustrativas\. Resultados variam/)).toBeInTheDocument();

    // Depoimentos — vindos de DEPOIMENTOS.
    expect(screen.getByText('O que elas dizem')).toBeInTheDocument();
    expect(screen.getByText(/Fernanda R\./)).toBeInTheDocument();

    // Prévia da equipe — usa o TeamCard reutilizável (Tarefa 11). A home só traz
    // profissionais com foto (I3): confere o filtro na query, não só o texto.
    expect(screen.getByText('Dra. Helena Ribeiro')).toBeInTheDocument();
    expect(screen.getByText('Marina Okabe')).toBeInTheDocument();
    const { prisma } = await import('@/lib/prisma');
    expect(prisma.professional.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { photoUrl: { not: null } } }),
    );

    // Prévia do diário — usa o PostCard reutilizável (Tarefa 13).
    expect(screen.getByText('Rotina de inverno para pele sensível')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Rotina de inverno/ })).toHaveAttribute(
      'href',
      '/diario/rotina-de-inverno',
    );

    // CTA final.
    expect(
      screen.getByText('A avaliação é o único jeito de saber o que a sua pele precisa'),
    ).toBeInTheDocument();
  });
});
