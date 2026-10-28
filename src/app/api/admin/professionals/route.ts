import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const workingHourSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1440),
  endMinute: z.number().int().min(0).max(1440),
});

const createProfessionalSchema = z.object({
  name: z.string().min(1),
  workingHours: z.array(workingHourSchema).default([]),
});

export async function GET() {
  const professionals = await prisma.professional.findMany({
    include: { workingHours: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({
    professionals: professionals.map((p) => ({
      id: p.id,
      name: p.name,
      workingHours: p.workingHours.map((wh) => ({ weekday: wh.weekday, startMinute: wh.startMinute, endMinute: wh.endMinute })),
    })),
  });
}

export async function POST(request: Request) {
  const parsed = createProfessionalSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const professional = await prisma.professional.create({
    data: {
      name: parsed.data.name,
      workingHours: { create: parsed.data.workingHours },
    },
  });

  return NextResponse.json({ id: professional.id }, { status: 201 });
}
