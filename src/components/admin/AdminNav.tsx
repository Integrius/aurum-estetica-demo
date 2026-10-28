'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export function AdminNav({ userName }: { userName: string }) {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-y-3 border-b border-charcoal/10 bg-white px-6 py-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="font-display text-lg">Aurum · Admin</span>
        <Link href="/admin/agendamentos" className="text-sm">Agendamentos</Link>
        <Link href="/admin/servicos" className="text-sm">Serviços</Link>
        <Link href="/admin/profissionais" className="text-sm">Profissionais</Link>
        <Link href="/admin/diario" className="text-sm">Diário</Link>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="hidden sm:inline">{userName}</span>
        <button type="button" onClick={() => signOut({ callbackUrl: '/admin/login' })} className="text-terracotta">
          Sair
        </button>
      </div>
    </nav>
  );
}
