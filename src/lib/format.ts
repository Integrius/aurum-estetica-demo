import { SITE } from '@/content/site';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatPrice(value: number): string {
  // Intl usa espaço não-quebrável (U+00A0) depois de "R$"; normalizamos para
  // espaço comum (U+0020) para que o texto seja comparável e copiável. Um
  // regex com espaço comum como padrão de busca (/ /g) não casa com U+00A0 e
  // deixa o caractere intacto — por isso o padrão é escrito como  .
  return brl.format(value).replace(/ /g, ' ');
}

export function formatDuration(minutes: number): string {
  const horas = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (horas === 0) return `${mins}min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h ${mins}min`;
}

export function whatsappLink(mensagem?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  if (!mensagem) return base;
  return `${base}?text=${encodeURIComponent(mensagem)}`;
}
