import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const professionalId = searchParams.get('professionalId');

  const where: Record<string, unknown> = {};
  if (professionalId) where.professionalId = professionalId;
  if (dateParam) {
    const dayStart = new Date(`${dateParam}T00:00:00`);
    const dayEnd = new Date(`${dateParam}T23:59:59.999`);
    where.startAt = { gte: dayStart, lte: dayEnd };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { client: true, service: true, professional: true },
    orderBy: { startAt: 'asc' },
  });

  return NextResponse.json({
    appointments: appointments.map((a) => ({
      id: a.id,
      clientName: a.client.name,
      serviceName: a.service.name,
      professionalName: a.professional.name,
      startAt: a.startAt.toISOString(),
      status: a.status,
    })),
  });
}
