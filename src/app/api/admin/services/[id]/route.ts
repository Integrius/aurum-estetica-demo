import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateServiceSchema = z
  .object({
    name: z.string().min(1),
    category: z.string().min(1),
    description: z.string().min(1),
    duration: z.number().int().positive(),
    price: z.number().positive(),
  })
  .partial();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = updateServiceSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  await prisma.service.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.service.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
