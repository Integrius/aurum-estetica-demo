import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PackageTable } from '@/components/PackageTable';
import { PACOTES } from '@/content/pacotes';
import { formatPrice } from '@/lib/format';

describe('PackageTable', () => {
  it('lista os 3 nomes de pacote', () => {
    render(<PackageTable pacotes={PACOTES} />);
    expect(screen.getByText('Essencial')).toBeInTheDocument();
    expect(screen.getByText('Avançado')).toBeInTheDocument();
    expect(screen.getByText('Intensivo')).toBeInTheDocument();
  });

  it('mostra "Mais procurado" exatamente uma vez, só no pacote em destaque', () => {
    render(<PackageTable pacotes={PACOTES} />);
    expect(screen.getAllByText('Mais procurado')).toHaveLength(1);
  });

  it('mostra o preço formatado de cada pacote', () => {
    render(<PackageTable pacotes={PACOTES} />);
    for (const pacote of PACOTES) {
      expect(screen.getByText(formatPrice(pacote.precoMensal))).toBeInTheDocument();
    }
  });

  it('lista os itens de "inclui" como texto', () => {
    render(<PackageTable pacotes={PACOTES} />);
    for (const item of PACOTES[0].inclui) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });
});
