'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SITE } from '@/content/site';
import { useMotionGuards } from '@/components/motion';

const links = [
  { href: '/servicos', label: 'Serviços' },
  { href: '/resultados', label: 'Resultados' },
  { href: '/equipe', label: 'Equipe' },
  { href: '/pacotes', label: 'Pacotes' },
  { href: '/diario', label: 'Diário' },
];

export function SiteNav() {
  const pathname = usePathname();
  const [compacta, setCompacta] = useState(false);
  const [oculta, setOculta] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const { animar } = useMotionGuards();

  useEffect(() => {
    // Restrição global 6: nada preso/ligado ao scroll abaixo de 1024px nem
    // sob prefers-reduced-motion. `animar` já engloba os dois; fora dele a
    // pílula fica no estado final estático — nunca compacta, sempre visível.
    if (!animar) {
      setCompacta(false);
      setOculta(false);
      return;
    }

    let ultimoY = window.scrollY;
    const aoRolar = () => {
      const y = window.scrollY;
      setCompacta(y > 80);
      // Só esconde depois de 400px, senão pisca no topo da página.
      setOculta(y > ultimoY && y > 400);
      ultimoY = y;
    };
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, [animar]);

  // Fecha o menu ao navegar.
  useEffect(() => setMenuAberto(false), [pathname]);

  // O admin tem a própria navegação — não empilhe dois cabeçalhos lá.
  if (pathname?.startsWith('/admin')) return null;

  return (
    <header
      className={`fixed left-1/2 top-3 z-50 w-[min(1100px,calc(100%-1.5rem))] -translate-x-1/2 rounded-full border border-charcoal/10 bg-ivory/75 shadow-[0_10px_40px_-14px_rgba(31,27,24,0.35)] backdrop-blur-xl transition-all duration-500 ease-editorial md:top-6 ${
        compacta ? 'md:w-[min(820px,calc(100%-1.5rem))]' : ''
      } ${oculta ? '-translate-y-[160%]' : ''}`}
    >
      <nav
        aria-label="Navegação principal"
        className="flex items-center justify-between gap-4 py-2 pl-5 pr-2 md:py-2.5"
      >
        <Link href="/" className="font-display text-lg tracking-wide text-charcoal">
          {SITE.nomeCurto}
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? 'text-charcoal underline decoration-terracotta decoration-2 underline-offset-8'
                  : 'text-charcoal/75 hover:text-terracotta'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/agendamento"
            className="hidden rounded-full bg-terracotta px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-charcoal md:inline-flex"
          >
            Agendar
          </Link>
          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            className="rounded-full p-3 text-charcoal lg:hidden"
          >
            <span className="block h-px w-5 bg-current" />
            <span className="mt-1.5 block h-px w-5 bg-current" />
          </button>
        </div>
      </nav>

      <div
        id="menu-mobile"
        hidden={!menuAberto}
        className="border-t border-charcoal/10 px-5 pb-5 pt-4 lg:hidden"
      >
        <div className="flex flex-col gap-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-charcoal/80">
              {link.label}
            </Link>
          ))}
          <Link href="/sobre" className="text-charcoal/80">Sobre</Link>
          <Link href="/contato" className="text-charcoal/80">Contato</Link>
        </div>
      </div>
    </header>
  );
}
