import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { MobileBookingDock } from '@/components/MobileBookingDock';
import { ProgressBar } from '@/components/motion';
import { Providers } from './providers';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/content/site';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = buildMetadata({
  title: `${SITE.nome} — Estética facial e corporal`,
  description: SITE.descricaoCurta,
  path: '/',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${fraunces.variable} ${inter.variable} font-body bg-champagne text-charcoal antialiased`}>
        <Providers>
          <ProgressBar />
          <SiteNav />
          {children}
          <SiteFooter />
          <MobileBookingDock />
        </Providers>
      </body>
    </html>
  );
}
