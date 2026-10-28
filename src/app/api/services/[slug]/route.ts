import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) {
    return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
  }
  return NextResponse.json({
    id: service.id,
    name: service.name,
    slug: service.slug,
    category: service.category,
    description: service.description,
    duration: service.duration,
    price: service.price.toNumber(),
  });
}
