import { prisma } from '@/lib/prisma';
import { AdminProfessionalsManager } from '@/components/admin/AdminProfessionalsManager';

export default async function AdminProfissionaisPage() {
  const professionals = await prisma.professional.findMany({
    include: { workingHours: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Profissionais e horários</h1>
      <div className="mt-8">
        <AdminProfessionalsManager
          initialProfessionals={professionals.map((p) => ({
            id: p.id,
            name: p.name,
            workingHours: p.workingHours.map((wh) => ({ weekday: wh.weekday, startMinute: wh.startMinute, endMinute: wh.endMinute })),
          }))}
        />
      </div>
    </div>
  );
}
