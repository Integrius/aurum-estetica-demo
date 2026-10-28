'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ServiceDTO {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  duration: number;
  price: number;
}

interface ProfessionalOption {
  id: string;
  name: string;
}

export function AdminServicesManager({
  initialServices,
  professionals = [],
}: {
  initialServices: ServiceDTO[];
  professionals?: ProfessionalOption[];
}) {
  const [services, setServices] = useState(initialServices);
  const [form, setForm] = useState({ name: '', category: '', description: '', duration: '', price: '' });
  const [professionalIds, setProfessionalIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggleProfessional(id: string) {
    setProfessionalIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      duration: Number(form.duration),
      price: Number(form.price),
    };
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, professionalIds }),
      });
      if (!res.ok) {
        setError('Não foi possível salvar o serviço. Verifique os dados e tente novamente.');
        return;
      }
      const created = await res.json();
      setServices((prev) => [...prev, { id: created.id, slug: created.slug, ...payload }]);
      setForm({ name: '', category: '', description: '', duration: '', price: '' });
      setProfessionalIds([]);
    } catch {
      setError('Não foi possível salvar o serviço. Verifique os dados e tente novamente.');
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setError('Não foi possível remover o serviço. Tente novamente.');
        return;
      }
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError('Não foi possível remover o serviço. Tente novamente.');
    }
  }

  return (
    <div className="space-y-10">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="divide-y divide-charcoal/10 rounded-2xl bg-white">
        {services.length === 0 && (
          <li className="p-4 text-sm text-charcoal/65">Nenhum serviço cadastrado. Adicione o primeiro abaixo.</li>
        )}
        {services.map((service) => (
          <li key={service.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-charcoal/65">
                {service.category} · {service.duration} min · R$ {service.price}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(service.id)}
              aria-label={`Remover ${service.name}`}
              className="text-sm text-red-600"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate} className="grid gap-4 rounded-2xl bg-white p-6 md:grid-cols-2">
        <label className="block text-sm font-medium">
          Nome
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2" />
        </label>
        <label className="block text-sm font-medium">
          Categoria
          <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2" />
        </label>
        <label className="block text-sm font-medium md:col-span-2">
          Descrição
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2" />
        </label>
        <label className="block text-sm font-medium">
          Duração (min)
          <input required type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2" />
        </label>
        <label className="block text-sm font-medium">
          Preço (R$)
          <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2" />
        </label>
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">Profissionais que atendem</legend>
          {professionals.length === 0 ? (
            <p className="mt-2 text-sm text-charcoal/65">
              Nenhum profissional cadastrado. Sem vínculo, o serviço não terá horários disponíveis.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {professionals.map((professional) => (
                <label key={professional.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={professionalIds.includes(professional.id)}
                    onChange={() => toggleProfessional(professional.id)}
                  />
                  {professional.name}
                </label>
              ))}
            </div>
          )}
        </fieldset>
        <div className="md:col-span-2">
          <Button type="submit">Adicionar serviço</Button>
        </div>
      </form>
    </div>
  );
}
