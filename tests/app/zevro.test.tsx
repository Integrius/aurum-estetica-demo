import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ZevroPage from '@/app/zevro/page';

describe('Zevro page', () => {
  it('renders the page hero with title', () => {
    render(<ZevroPage />);
    expect(screen.getByText('Quem fez')).toBeInTheDocument();
    expect(screen.getByText('este site')).toBeInTheDocument();
  });

  it('renders all 8 commercial conditions', () => {
    const { container } = render(<ZevroPage />);
    const conditionTitles = [
      'Hospedagem e domínio',
      'Atualizações inclusas',
      'SEO por padrão',
      'Monitoramento em tempo integral',
      'Tecnologia atual',
      'Tendência e técnica',
      'Certificado de segurança incluso',
      'Atualizações também são testadas',
    ];

    conditionTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    // Verify exactly 8 conditions in the ordered list
    const olElement = container.querySelector('ol.mt-14');
    const conditions = olElement?.querySelectorAll(':scope > li');
    expect(conditions).toHaveLength(8);
  });
});
