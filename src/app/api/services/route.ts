import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { category: 'asc' } });
  return NextResponse.json({
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      description: s.description,
      duration: s.duration,
      price: s.price.toNumber(),
    })),
  });
}
