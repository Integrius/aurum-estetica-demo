import type { Metadata } from 'next';
import { SITE } from '@/content/site';
import { FAQ } from '@/content/faq';

const OG_PADRAO = '/img/og-default.jpg';

// Campos exibidos em JSON-LD (título de post, nome de serviço, bio de
// profissional…) vêm de conteúdo editável no admin. Sem essa escapada, um
// valor contendo `</script><script>…` fecha a tag e injeta markup em
// qualquer visitante da página pública — XSS armazenado.
export function jsonLd(dados: unknown): string {
  return JSON.stringify(dados).replace(/</g, '\\u003c');
}

export function buildMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = `${SITE.url}${input.path}`;
  const image = input.image ?? OG_PADRAO;
  // O título da home não repete o nome da clínica; as internas repetem.
  const title = input.path === '/' ? input.title : `${input.title} | ${SITE.nome}`;

  return {
    title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: input.description,
      url,
      siteName: SITE.nome,
      locale: 'pt_BR',
      type: 'website',
      images: [{ url: `${SITE.url}${image}`, width: 1200, height: 630, alt: SITE.nome }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: input.description,
      images: [`${SITE.url}${image}`],
    },
  };
}

export function medicalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: SITE.nome,
    description: SITE.descricaoCurta,
    url: SITE.url,
    email: SITE.email,
    telephone: `+${SITE.whatsapp}`,
    address: { '@type': 'PostalAddress', streetAddress: SITE.endereco, addressCountry: 'BR' },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.mapa.lat, longitude: SITE.mapa.lng },
    openingHours: ['Mo-Fr 09:00-20:00', 'Sa 09:00-16:00'],
    sameAs: [SITE.instagram.url],
  };
}

export function serviceJsonLd(input: { nome: string; descricao: string; preco: number; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.nome,
    description: input.descricao,
    url: `${SITE.url}/servicos/${input.slug}`,
    provider: { '@type': 'MedicalBusiness', name: SITE.nome, url: SITE.url },
    offers: { '@type': 'Offer', price: input.preco, priceCurrency: 'BRL' },
  };
}

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: item.resposta },
    })),
  };
}

export function articleJsonLd(input: {
  titulo: string;
  resumo: string;
  slug: string;
  capa: string;
  publicadoEm: Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.titulo,
    description: input.resumo,
    image: `${SITE.url}${input.capa}`,
    datePublished: input.publicadoEm.toISOString(),
    url: `${SITE.url}/diario/${input.slug}`,
    author: { '@type': 'Organization', name: SITE.nome },
    publisher: { '@type': 'Organization', name: SITE.nome },
  };
}

export function personJsonLd(input: { nome: string; cargo: string; foto: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.nome,
    jobTitle: input.cargo,
    image: `${SITE.url}${input.foto}`,
    worksFor: { '@type': 'MedicalBusiness', name: SITE.nome, url: SITE.url },
  };
}
