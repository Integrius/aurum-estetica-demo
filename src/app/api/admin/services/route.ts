import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ACCENT_MAP: Record<string, string> = {
  a: 'áàãâä',
  e: 'éèêë',
  i: 'íìîï',
  o: 'óòõôö',
  u: 'úùûü',
  c: 'ç',
  n: 'ñ',
};

function stripAccents(text: string): string {
  let result = text;
  for (const [plain, accented] of Object.entries(ACCENT_MAP)) {
    for (const char of accented) {
      result = result.split(char).join(plain);
    }
  }
  return result;
}

function slugify(text: string): string {
  return stripAccents(text.toLowerCase())
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const createServiceSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  duration: z.number().int().positive(),
  price: z.number().positive(),
  professionalIds: z.array(z.string().min(1)).default([]),
});

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

export async function POST(request: Request) {
  const parsed = createServiceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const { professionalIds, ...serviceData } = parsed.data;

  const service = await prisma.service.create({
    data: { ...serviceData, slug: slugify(serviceData.name) },
  });

  // Without at least one ProfessionalService link the service can never be booked,
  // because /api/availability derives its professionals through that join table.
  if (professionalIds.length > 0) {
    await prisma.professionalService.createMany({
      data: professionalIds.map((professionalId) => ({ professionalId, serviceId: service.id })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ id: service.id, slug: service.slug }, { status: 201 });
}
