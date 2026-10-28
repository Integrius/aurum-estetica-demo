import { prisma } from '@/lib/prisma';
import { AdminAppointmentsManager } from '@/components/admin/AdminAppointmentsManager';

export default async function AdminAgendamentosPage() {
  const appointments = await prisma.appointment.findMany({
    include: { client: true, service: true, professional: true },
    orderBy: { startAt: 'asc' },
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Agendamentos</h1>
      <div className="mt-8">
        <AdminAppointmentsManager
          initialAppointments={appointments.map((a) => ({
            id: a.id,
            clientName: a.client.name,
            serviceName: a.service.name,
            professionalName: a.professional.name,
            startAt: a.startAt.toISOString(),
            status: a.status,
          }))}
        />
      </div>
    </div>
  );
}
