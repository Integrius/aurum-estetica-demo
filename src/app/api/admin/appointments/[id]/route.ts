import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateStatusSchema = z.object({ status: z.enum(['confirmed', 'cancelled', 'completed']) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = updateStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  await prisma.appointment.update({ where: { id }, data: { status: parsed.data.status } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
