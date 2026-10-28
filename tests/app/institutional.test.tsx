import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SobrePage from '@/app/sobre/page';
import ContatoPage from '@/app/contato/page';
import { SITE } from '@/content/site';

describe('Sobre page', () => {
  it('renders the manifesto and the three princípios', () => {
    render(<SobrePage />);
    expect(screen.getByText(/resultado não se promete/i)).toBeInTheDocument();
    expect(screen.getByText('Avaliação antes de venda')).toBeInTheDocument();
    expect(screen.getByText('Número de sessões realista')).toBeInTheDocument();
    expect(screen.getByText('A mesma profissional do começo ao fim')).toBeInTheDocument();
  });
});

describe('Contato page', () => {
  it('renders address, hours, WhatsApp, e-mail and telephone from SITE', () => {
    render(<ContatoPage />);
    expect(screen.getByText(SITE.endereco)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(SITE.horarios[0].dias, 'i'))).toBeInTheDocument();
    expect(screen.getAllByText(SITE.telefoneExibicao).length).toBeGreaterThan(0);
    expect(screen.getByText(SITE.email)).toBeInTheDocument();
  });

  it('renders an OpenStreetMap iframe built from SITE.mapa', () => {
    render(<ContatoPage />);
    const iframe = screen.getByTitle(`Mapa da localização de ${SITE.nome}`);
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute('src')).toContain('openstreetmap.org/export/embed.html');
    expect(iframe.getAttribute('src')).toContain(String(SITE.mapa.lat));
    expect(iframe.getAttribute('src')).toContain(String(SITE.mapa.lng));
  });

  it('renders the contact form', () => {
    render(<ContatoPage />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem')).toBeInTheDocument();
  });
});
