'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface WorkingHour {
  weekday: number;
  startMinute: number;
  endMinute: number;
}

interface ProfessionalDTO {
  id: string;
  name: string;
  workingHours: WorkingHour[];
}

const WEEKDAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function minutesToTime(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function ProfessionalRow({ professional }: { professional: ProfessionalDTO }) {
  const [hours, setHours] = useState(professional.workingHours);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateDay(weekday: number, field: 'startMinute' | 'endMinute', value: string) {
    setHours((prev) => {
      const existing = prev.find((h) => h.weekday === weekday);
      const minutes = timeToMinutes(value);
      if (existing) {
        return prev.map((h) => (h.weekday === weekday ? { ...h, [field]: minutes } : h));
      }
      return [...prev, { weekday, startMinute: field === 'startMinute' ? minutes : 540, endMinute: field === 'endMinute' ? minutes : 1080 }];
    });
  }

  async function handleSave() {
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/professionals/${professional.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workingHours: hours }),
      });
      if (!res.ok) {
        setError('Não foi possível salvar os horários. Tente novamente.');
        return;
      }
      setSaved(true);
    } catch {
      setError('Não foi possível salvar os horários. Tente novamente.');
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6">
      <h3 className="font-display text-xl">{professional.name}</h3>
      <div className="mt-4 space-y-2">
        {WEEKDAY_LABELS.map((label, weekday) => {
          const day = hours.find((h) => h.weekday === weekday);
          return (
            <div key={weekday} className="flex items-center gap-3 text-sm">
              <span className="w-24">{label}</span>
              <input
                type="time"
                value={day ? minutesToTime(day.startMinute) : ''}
                onChange={(e) => updateDay(weekday, 'startMinute', e.target.value)}
                className="rounded border border-charcoal/20 px-2 py-1"
              />
              <span>até</span>
              <input
                type="time"
                value={day ? minutesToTime(day.endMinute) : ''}
                onChange={(e) => updateDay(weekday, 'endMinute', e.target.value)}
                className="rounded border border-charcoal/20 px-2 py-1"
              />
            </div>
          );
        })}
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="mt-4 text-sm text-charcoal/65">Horários salvos.</p>}
      <div className="mt-4">
        <Button onClick={handleSave} aria-label={`Salvar horários de ${professional.name}`}>
          Salvar horários
        </Button>
      </div>
    </div>
  );
}

export function AdminProfessionalsManager({ initialProfessionals }: { initialProfessionals: ProfessionalDTO[] }) {
  return (
    <div className="space-y-6">
      {initialProfessionals.map((professional) => (
        <ProfessionalRow key={professional.id} professional={professional} />
      ))}
    </div>
  );
}
