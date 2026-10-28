'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE } from '@/content/site';
import { whatsappLink } from '@/lib/format';
import { Container } from '@/components/ui/Container';

const navegacao = [
  { href: '/servicos', label: 'Serviços' },
  { href: '/resultados', label: 'Resultados' },
  { href: '/equipe', label: 'Equipe' },
  { href: '/pacotes', label: 'Pacotes' },
  { href: '/diario', label: 'Diário' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
];

export function SiteFooter() {
  const pathname = usePathname();

  // O admin tem a própria árvore de layout — o rodapé público não pertence lá.
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="mt-24 border-t border-charcoal/10 bg-charcoal pb-28 pt-20 text-champagne md:pb-20">
      <Container>
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl">{SITE.nome}</p>
            <p className="mt-4 max-w-sm text-champagne/70">{SITE.descricaoCurta}</p>
            <a
              href={whatsappLink(`Olá! Vim pelo site da ${SITE.nome}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-full border border-champagne/30 px-5 py-2.5 text-sm transition-colors hover:bg-champagne hover:text-charcoal"
            >
              Falar no WhatsApp
            </a>
          </div>

          <nav aria-label="Rodapé">
            <p className="text-xs uppercase tracking-[0.2em] text-terracotta-light">Navegação</p>
            <ul className="mt-4 space-y-2">
              {navegacao.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-champagne/75 transition-colors hover:text-champagne">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-terracotta-light">Contato</p>
            <address className="mt-4 space-y-2 not-italic text-champagne/75">
              <p>{SITE.endereco}</p>
              <p>
                <a href={`mailto:${SITE.email}`} className="hover:text-champagne">{SITE.email}</a>
              </p>
              <p>
                <a href={`tel:+${SITE.whatsapp}`} className="hover:text-champagne">{SITE.telefoneExibicao}</a>
              </p>
              <p>
                <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-champagne">
                  {SITE.instagram.usuario}
                </a>
              </p>
            </address>
            <div className="mt-6 space-y-1 text-sm text-champagne/60">
              {SITE.horarios.map((h) => (
                <p key={h.dias}>
                  {h.dias} · {h.horas}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-champagne/15 pt-6 text-sm text-champagne/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {SITE.nome}. Site de demonstração.</p>
          <Link href="/zevro" className="transition-colors hover:text-champagne">
            Site criado e mantido pela Zevro
          </Link>
        </div>
      </Container>
    </footer>
  );
}
