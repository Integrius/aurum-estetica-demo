import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getAvailableSlots } from '@/lib/availability';

const appointmentSchema = z.object({
  serviceId: z.string().min(1),
  professionalId: z.string().min(1),
  startAt: z.string().min(1),
  client: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
  }),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = appointmentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }

  const { serviceId, professionalId, startAt, client } = parsed.data;

  // Validate startAt is a valid date
  const start = new Date(startAt);
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: 'Dados inválidos', issues: [{ message: 'startAt must be a valid date' }] }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
  }

  const end = new Date(start.getTime() + service.duration * 60000);

  if (start.getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Horário indisponível' }, { status: 400 });
  }

  // The professional must actually offer this service and work at the requested time.
  // getAvailableSlots is the same function the availability API uses, so the public
  // wizard and a hand-crafted POST are held to identical rules.
  const professional = await prisma.professional.findFirst({
    where: { id: professionalId, services: { some: { serviceId } } },
    include: { workingHours: true },
  });

  if (!professional) {
    return NextResponse.json({ error: 'Profissional não atende este serviço' }, { status: 400 });
  }

  const dayStart = new Date(start);
  dayStart.setHours(0, 0, 0, 0);

  const slots = getAvailableSlots({
    date: dayStart,
    durationMinutes: service.duration,
    workingHours: professional.workingHours,
    busySlots: [],
  });

  if (!slots.some((slot) => slot.getTime() === start.getTime())) {
    return NextResponse.json({ error: 'Horário indisponível' }, { status: 400 });
  }

  // Use transaction with Serializable isolation to prevent TOCTOU race conditions
  try {
    const appointment = await prisma.$transaction(
      async (tx) => {
        const collision = await tx.appointment.findFirst({
          where: {
            professionalId,
            status: { not: 'cancelled' },
            startAt: { lt: end },
            endAt: { gt: start },
          },
        });

        if (collision) {
          throw new Error('COLLISION');
        }

        // Upsert client only after collision check passes
        const dbClient = await tx.client.upsert({
          where: { email: client.email },
          update: { name: client.name, phone: client.phone },
          create: client,
        });

        return await tx.appointment.create({
          data: {
            serviceId,
            professionalId,
            clientId: dbClient.id,
            startAt: start,
            endAt: end,
            status: 'confirmed',
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return NextResponse.json(
      { appointment: { id: appointment.id, startAt: appointment.startAt, endAt: appointment.endAt, status: appointment.status } },
      { status: 201 }
    );
  } catch (error) {
    // Handle hand-thrown collision detection
    if (error instanceof Error && error.message === 'COLLISION') {
      return NextResponse.json({ error: 'Horário já ocupado' }, { status: 409 });
    }
    // Handle Serializable transaction conflicts (P2034: write conflict)
    if ((error as any)?.code === 'P2034') {
      return NextResponse.json({ error: 'Horário já ocupado' }, { status: 409 });
    }
    throw error;
  }
}
