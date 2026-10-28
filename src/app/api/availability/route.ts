import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAvailableSlots } from '@/lib/availability';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('serviceId');
  const dateParam = searchParams.get('date');

  if (!serviceId || !dateParam) {
    return NextResponse.json({ error: 'serviceId e date são obrigatórios' }, { status: 400 });
  }

  const date = new Date(`${dateParam}T00:00:00`);
  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      professionals: {
        include: { professional: { include: { workingHours: true } } },
      },
    },
  });

  if (!service) {
    return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
  }

  const options = [];
  for (const link of service.professionals) {
    const professional = link.professional;
    const busyAppointments = await prisma.appointment.findMany({
      where: {
        professionalId: professional.id,
        status: { not: 'cancelled' },
        startAt: { gte: dayStart, lte: dayEnd },
      },
    });

    // M2: getAvailableSlots não sabe que horas são agora — ela só olha o dia
    // da semana e os horários de trabalho. Sem este filtro, pedir a
    // disponibilidade de hoje devolve também os horários que já passaram, e
    // o POST em /api/appointments rejeita a tentativa de agendar neles.
    const agora = new Date();
    const slots = getAvailableSlots({
      date,
      durationMinutes: service.duration,
      workingHours: professional.workingHours,
      busySlots: busyAppointments.map((a) => ({ startAt: a.startAt, endAt: a.endAt })),
    }).filter((slot) => slot > agora);

    options.push({
      professionalId: professional.id,
      professionalName: professional.name,
      professionalPhotoUrl: professional.photoUrl ?? null,
      slots: slots.map((s) => {
        const year = s.getFullYear();
        const month = String(s.getMonth() + 1).padStart(2, '0');
        const day = String(s.getDate()).padStart(2, '0');
        const hours = String(s.getHours()).padStart(2, '0');
        const minutes = String(s.getMinutes()).padStart(2, '0');
        const seconds = String(s.getSeconds()).padStart(2, '0');
        const milliseconds = String(s.getMilliseconds()).padStart(3, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
      }),
    });
  }

  return NextResponse.json({ options });
}
