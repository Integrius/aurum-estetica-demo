import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PacotesPage from '@/app/pacotes/page';
import { FAQ } from '@/content/faq';

describe('Pacotes page', () => {
  it('emite o JSON-LD FAQPage com 6 mainEntity, cada um com Question/Answer', () => {
    const { container } = render(<PacotesPage />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const jsonLd = JSON.parse(script!.innerHTML);
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(jsonLd.mainEntity).toHaveLength(6);
    expect(jsonLd.mainEntity).toHaveLength(FAQ.length);

    for (const entry of jsonLd.mainEntity) {
      expect(entry['@type']).toBe('Question');
      expect(typeof entry.name).toBe('string');
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.acceptedAnswer['@type']).toBe('Answer');
      expect(typeof entry.acceptedAnswer.text).toBe('string');
      expect(entry.acceptedAnswer.text.length).toBeGreaterThan(0);
    }
  });
});
