'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE } from '@/content/site';
import { whatsappLink } from '@/lib/format';

export function MobileBookingDock() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-2 rounded-full border border-charcoal/10 bg-ivory/90 p-2 shadow-[0_14px_44px_-16px_rgba(31,27,24,0.5)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <a
        href={whatsappLink(`Olá! Vim pelo site da ${SITE.nome} e gostaria de tirar uma dúvida.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 rounded-full py-3 text-center text-sm font-medium text-charcoal"
      >
        WhatsApp
      </a>
      <Link
        href="/agendamento"
        className="flex-1 rounded-full bg-terracotta py-3 text-center text-sm font-medium text-white"
      >
        Agendar
      </Link>
    </div>
  );
}
