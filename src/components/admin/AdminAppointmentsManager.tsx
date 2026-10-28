'use client';

import { useState } from 'react';

interface AppointmentRow {
  id: string;
  clientName: string;
  serviceName: string;
  professionalName: string;
  startAt: string;
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
};

export function AdminAppointmentsManager({ initialAppointments }: { initialAppointments: AppointmentRow[] }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: 'cancelled' | 'completed') {
    setError(null);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setError('Não foi possível atualizar o agendamento. Tente novamente.');
        return;
      }
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch {
      setError('Não foi possível atualizar o agendamento. Tente novamente.');
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="divide-y divide-charcoal/10 rounded-2xl bg-white">
        {appointments.map((appointment) => (
          <li key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{appointment.clientName}</p>
              <p className="text-sm text-charcoal/65">
                <span>{appointment.serviceName}</span> · <span>{appointment.professionalName}</span> ·{' '}
                <span>
                  {new Date(appointment.startAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-charcoal/65">{STATUS_LABELS[appointment.status] ?? appointment.status}</span>
              {appointment.status === 'confirmed' && (
                <>
                  <button type="button" onClick={() => updateStatus(appointment.id, 'completed')} className="text-sm text-terracotta">
                    Marcar como concluído
                  </button>
                  <button type="button" onClick={() => updateStatus(appointment.id, 'cancelled')} className="text-sm text-red-600">
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
