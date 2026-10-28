import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/prisma', () => {
  const comFoto = {
    id: 'prof_1',
    name: 'Dra. Helena Ribeiro',
    photoUrl: '/img/equipe/helena.webp',
    role: 'Biomédica esteta',
    bio: 'Mais de dez anos dedicados a protocolos faciais.',
    credentials: ['CRBM 12345', 'Pós-graduação em Estética Avançada'],
    specialties: ['Protocolos faciais'],
    createdAt: new Date('2020-01-01'),
  };
  const semFoto = {
    id: 'prof_2',
    name: 'Dra. Camila Duarte',
    photoUrl: null,
    role: null,
    bio: null,
    credentials: [],
    specialties: [],
    createdAt: new Date('2020-02-01'),
  };

  return {
    prisma: {
      professional: {
        findMany: vi.fn().mockResolvedValue([comFoto, semFoto]),
      },
    },
  };
});

import { prisma } from '@/lib/prisma';
import EquipePage from '@/app/equipe/page';

describe('Equipe page', () => {
  it('renderiza os cards com nome, cargo, especialidade e credencial', async () => {
    render(await EquipePage());

    expect(screen.getByText('Dra. Helena Ribeiro')).toBeInTheDocument();
    expect(screen.getByText('Biomédica esteta')).toBeInTheDocument();
    expect(screen.getByText('Protocolos faciais')).toBeInTheDocument();
    expect(screen.getByText('CRBM 12345')).toBeInTheDocument();
  });

  it('subtítulo do hero não presume um número fixo de profissionais', async () => {
    const { container } = render(await EquipePage());

    expect(
      screen.getByText(
        'A equipe de especialistas tem registro ativo no conselho e especialização na área em que cada um atua. Você é atendida pela mesma profissional do começo ao fim do protocolo.',
      ),
    ).toBeInTheDocument();
    // "seis" era o texto herdado do brief (fixo em 6 profissionais); o banco
    // real tem 7 — a palavra não deve mais aparecer em lugar nenhum da página.
    expect(container.textContent).not.toMatch(/seis/i);
  });

  it('profissional sem foto não quebra a página e fica fora do JSON-LD', async () => {
    const { container } = render(await EquipePage());

    // Sem foto, o card ainda renderiza — com a inicial do nome no lugar da
    // imagem, e sem <img> nenhuma para essa profissional.
    expect(screen.getByText('Dra. Camila Duarte')).toBeInTheDocument();
    expect(screen.getByAltText('Retrato de Dra. Helena Ribeiro')).toBeInTheDocument();
    expect(screen.queryByAltText('Retrato de Dra. Camila Duarte')).not.toBeInTheDocument();

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const jsonLd = JSON.parse(script!.innerHTML) as Array<{ name: string }>;
    expect(jsonLd).toHaveLength(1);
    expect(jsonLd[0].name).toBe('Dra. Helena Ribeiro');
    expect(jsonLd.some((p) => p.name === 'Dra. Camila Duarte')).toBe(false);
  });

  it('mostra a mensagem de atualização quando não há profissionais', async () => {
    vi.mocked(prisma.professional.findMany).mockResolvedValueOnce([]);

    render(await EquipePage());

    expect(
      screen.getByText('Estamos atualizando as informações da equipe. Fale com a gente pelo WhatsApp.'),
    ).toBeInTheDocument();
  });
});
