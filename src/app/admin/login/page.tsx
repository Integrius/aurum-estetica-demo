'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setError('E-mail ou senha inválidos.');
      return;
    }
    router.push('/admin/agendamentos');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-charcoal px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8">
        <h1 className="font-display text-2xl">Acesso administrativo</h1>
        <label className="block text-sm font-medium">
          E-mail
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Senha
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full">Entrar</Button>
      </form>
    </main>
  );
}
