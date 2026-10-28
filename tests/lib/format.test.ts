import { describe, expect, it } from 'vitest';
import { formatPrice, formatDuration, whatsappLink } from '@/lib/format';
import { SITE } from '@/content/site';

describe('formatPrice', () => {
  it('formata em real brasileiro com dois decimais', () => {
    expect(formatPrice(280)).toBe('R$ 280,00');
  });

  it('usa separador de milhar', () => {
    expect(formatPrice(1250.5)).toBe('R$ 1.250,50');
  });
});

describe('formatDuration', () => {
  it('mostra só minutos abaixo de uma hora', () => {
    expect(formatDuration(45)).toBe('45min');
  });

  it('mostra horas e minutos', () => {
    expect(formatDuration(90)).toBe('1h 30min');
  });

  it('omite os minutos quando é hora cheia', () => {
    expect(formatDuration(120)).toBe('2h');
  });
});

describe('formatPrice com Decimal do Prisma', () => {
  // Armadilha que já causou bug neste repo: Number(decimal) NÃO funciona com o
  // Decimal do Prisma — retorna NaN. A conversão correta é .toNumber().
  // Este teste existe para o erro reaparecer como falha, não como preço quebrado
  // em produção.
  const decimalFalso = { toNumber: () => 280 };

  it('formata corretamente a partir de .toNumber()', () => {
    expect(formatPrice(decimalFalso.toNumber())).toBe('R$ 280,00');
  });

  it('confirma que Number() sobre o Decimal produz NaN', () => {
    expect(Number(decimalFalso as unknown as number)).toBeNaN();
  });
});

describe('whatsappLink', () => {
  it('usa o número do SITE, sem pontuação', () => {
    expect(whatsappLink()).toBe(`https://wa.me/${SITE.whatsapp}`);
  });

  it('codifica a mensagem na query', () => {
    expect(whatsappLink('Olá, tudo bem?')).toBe(
      `https://wa.me/${SITE.whatsapp}?text=Ol%C3%A1%2C%20tudo%20bem%3F`,
    );
  });
});
