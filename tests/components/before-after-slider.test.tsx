import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';

function montar() {
  render(
    <BeforeAfterSlider
      antes="/img/resultados/caso-1-antes.webp"
      depois="/img/resultados/caso-1-depois.webp"
      alt="Comparação antes e depois"
    />,
  );
  return screen.getByRole('slider');
}

describe('BeforeAfterSlider', () => {
  it('expõe um slider acessível começando em 50%', () => {
    const slider = montar();
    expect(slider).toHaveAttribute('aria-valuenow', '50');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
  });

  it('move para a direita com a seta direita', async () => {
    const slider = montar();
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '52');
  });

  it('move para a esquerda com a seta esquerda', async () => {
    const slider = montar();
    slider.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(slider).toHaveAttribute('aria-valuenow', '48');
  });

  it('não passa de 100', async () => {
    const slider = montar();
    slider.focus();
    await userEvent.keyboard('{End}');
    expect(slider).toHaveAttribute('aria-valuenow', '100');
  });

  it('não passa de 0', async () => {
    const slider = montar();
    slider.focus();
    await userEvent.keyboard('{Home}');
    expect(slider).toHaveAttribute('aria-valuenow', '0');
  });

  it('mantém as duas imagens no DOM, com texto alternativo', () => {
    // getByAltText com regex (/antes/i, /depois/i) é ambíguo aqui: o `alt` base já
    // contém as duas palavras ("Comparação antes e depois"), então tanto
    // "... — antes" quanto "... — depois" casam com /antes/i. String exata,
    // conforme a nota do Step 4 do brief.
    montar();
    expect(screen.getByAltText('Comparação antes e depois — antes')).toBeInTheDocument();
    expect(screen.getByAltText('Comparação antes e depois — depois')).toBeInTheDocument();
  });
});
