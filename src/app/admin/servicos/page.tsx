import { prisma } from '@/lib/prisma';
import { AdminServicesManager } from '@/components/admin/AdminServicesManager';

export default async function AdminServicosPage() {
  const [services, professionals] = await Promise.all([
    prisma.service.findMany({ orderBy: { category: 'asc' } }),
    prisma.professional.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);
  return (
    <div>
      <h1 className="font-display text-3xl">Serviços</h1>
      <div className="mt-8">
        <AdminServicesManager
          initialServices={services.map((s) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            category: s.category,
            description: s.description,
            duration: s.duration,
            price: s.price.toNumber(),
          }))}
          professionals={professionals}
        />
      </div>
    </div>
  );
}
