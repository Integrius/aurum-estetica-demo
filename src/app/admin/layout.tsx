import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div className="min-h-screen bg-champagne">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-champagne">
      <AdminNav userName={session.user?.name ?? ''} />
      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
    </div>
  );
}
