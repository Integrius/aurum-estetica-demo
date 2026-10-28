import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const workingHourSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1440),
  endMinute: z.number().int().min(0).max(1440),
});

const updateSchema = z.object({ workingHours: z.array(workingHourSchema) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.workingHour.deleteMany({ where: { professionalId: id } });
    await tx.workingHour.createMany({
      data: parsed.data.workingHours.map((wh) => ({ professionalId: id, ...wh })),
    });
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
