import { describe, expect, it } from 'vitest';
import { jsonLd } from '@/lib/seo';

describe('jsonLd', () => {
  it('serializa um objeto simples como JSON', () => {
    expect(jsonLd({ a: 1, b: 'texto' })).toBe('{"a":1,"b":"texto"}');
  });

  // I2: campos de conteúdo editáveis no admin (título de post, nome de
  // serviço, bio de profissional) entram direto no JSON-LD. Sem escapar
  // `<`, um valor como `</script><script>alert(1)</script>` fecha a tag
  // `<script type="application/ld+json">` e injeta markup executável em
  // todo visitante da página pública — XSS armazenado.
  it('escapa "<" para impedir que o payload feche a tag <script> e injete markup', () => {
    const payload = { name: '</script><script>alert(1)</script>' };
    const html = jsonLd(payload);

    expect(html).not.toContain('</script>');
    expect(html).toContain('\\u003c/script>\\u003cscript>');

    // O texto continua decodificando de volta para o valor original: só a
    // serialização muda, o dado não é truncado nem alterado.
    expect(JSON.parse(html.replace(/\\u003c/g, '<'))).toEqual(payload);
  });
});
