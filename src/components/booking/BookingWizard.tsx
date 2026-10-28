'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { whatsappLink, formatPrice, formatDuration } from '@/lib/format';

interface ServiceDTO {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  duration: number;
  price: number;
}

interface AvailabilityOption {
  professionalId: string;
  professionalName: string;
  professionalPhotoUrl: string | null;
  slots: string[];
}

interface SelectedSlot {
  professionalId: string;
  professionalName: string;
  professionalPhotoUrl: string | null;
  startAt: string;
}

type Step = 'service' | 'schedule' | 'details' | 'success';

const PASSOS: { key: Step; rotulo: string }[] = [
  { key: 'service', rotulo: '1 Serviço' },
  { key: 'schedule', rotulo: '2 Profissional e horário' },
  { key: 'details', rotulo: '3 Seus dados' },
];

function nextSevenDays(): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function toDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatarDataHora(isoLocal: string): string {
  const data = new Date(isoLocal);
  const texto = data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${texto} às ${hora}`;
}

function StepIndicator({ stepAtual }: { stepAtual: Step }) {
  return (
    <ol aria-label="Passos do agendamento" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {PASSOS.map((passo, i) => {
        const ativo = stepAtual === passo.key;
        return (
          <li key={passo.key} className="flex items-center gap-2">
            <span
              aria-current={ativo ? 'step' : undefined}
              className={
                ativo
                  ? 'font-medium text-terracotta'
                  : 'text-charcoal/65'
              }
            >
              {passo.rotulo}
            </span>
            {i < PASSOS.length - 1 && (
              <span aria-hidden="true" className="text-charcoal/30">
                ·
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-charcoal/65 underline-offset-4 hover:text-charcoal hover:underline"
    >
      ← Voltar
    </button>
  );
}

export function BookingWizard({ initialServiceSlug }: { initialServiceSlug?: string }) {
  const [step, setStep] = useState<Step>('service');
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceDTO | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availability, setAvailability] = useState<AvailabilityOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => nextSevenDays(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        if (!res.ok) {
          throw new Error('Failed to load services');
        }
        const data: { services: ServiceDTO[] } = await res.json();
        if (cancelled) return;
        setServices(data.services);
        if (initialServiceSlug) {
          const match = data.services.find((s) => s.slug === initialServiceSlug);
          if (match) {
            setSelectedService(match);
            setStep('schedule');
          }
        }
      } catch {
        if (!cancelled) {
          setError('Não foi possível carregar os serviços. Tente novamente mais tarde.');
        }
      } finally {
        if (!cancelled) {
          setServicesLoaded(true);
        }
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, [initialServiceSlug]);

  function handleSelectService(service: ServiceDTO) {
    setSelectedService(service);
    // Trocar de serviço invalida a data/horário já escolhidos: pertenciam à
    // disponibilidade do serviço anterior.
    setSelectedDate(null);
    setAvailability([]);
    setSelectedSlot(null);
    setError(null);
    setStep('schedule');
  }

  async function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setAvailability([]);
    setError(null);
    if (!selectedService) return;
    try {
      const res = await fetch(`/api/availability?serviceId=${selectedService.id}&date=${toDateParam(date)}`);
      if (!res.ok) {
        throw new Error('Failed to load availability');
      }
      const data = await res.json();
      setAvailability(data.options ?? []);
    } catch {
      setError('Não foi possível carregar os horários disponíveis. Tente novamente.');
    }
  }

  function handleSelectSlot(option: AvailabilityOption, startAt: string) {
    setSelectedSlot({
      professionalId: option.professionalId,
      professionalName: option.professionalName,
      professionalPhotoUrl: option.professionalPhotoUrl,
      startAt,
    });
    setStep('details');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedService || !selectedSlot) return;
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          professionalId: selectedSlot.professionalId,
          startAt: selectedSlot.startAt,
          client: form,
        }),
      });

      if (!res.ok) {
        setError('Não foi possível confirmar o agendamento. Tente outro horário.');
        return;
      }

      setStep('success');
    } catch {
      setError('Não foi possível confirmar o agendamento. Tente outro horário.');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'service') {
    return (
      <div className="space-y-6">
        <StepIndicator stepAtual={step} />
        <h3 className="font-display text-2xl">Escolha o serviço</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && servicesLoaded && services.length === 0 && (
          <p className="text-sm text-charcoal/65">Nenhum serviço disponível para agendamento no momento.</p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              aria-pressed={selectedService?.id === service.id}
              onClick={() => handleSelectService(service)}
              className="rounded-2xl bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-lg aria-pressed:ring-2 aria-pressed:ring-terracotta"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-terracotta">{service.category}</p>
              <h4 className="mt-2 font-display text-xl">{service.name}</h4>
              <p className="mt-2 text-sm text-charcoal/70">
                {formatDuration(service.duration)} · {formatPrice(service.price)}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'schedule' && selectedService) {
    return (
      <div className="space-y-8">
        <StepIndicator stepAtual={step} />
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-2xl">Escolha data e horário</h3>
          <BackButton onClick={() => setStep('service')} />
        </div>

        <div className="flex flex-wrap gap-3">
          {days.map((day) => {
            const selecionado = selectedDate?.getTime() === day.getTime();
            return (
              <button
                key={day.toISOString()}
                type="button"
                aria-pressed={selecionado}
                onClick={() => handleSelectDate(day)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  selecionado ? 'border-terracotta bg-terracotta text-white' : 'border-charcoal/20'
                }`}
              >
                {day.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
              </button>
            );
          })}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {selectedDate && (
          <div className="space-y-6">
            {!error && availability.length === 0 && (
              <p className="text-sm text-charcoal/65">Nenhum horário disponível neste dia.</p>
            )}
            {availability.map((option) => (
              <div key={option.professionalId} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-sand/50">
                    {option.professionalPhotoUrl ? (
                      <Image
                        src={option.professionalPhotoUrl}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex h-full w-full items-center justify-center font-display text-sm text-charcoal/40"
                      >
                        {option.professionalName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-charcoal">{option.professionalName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {option.slots.map((slot) => {
                    const pressionado =
                      selectedSlot?.professionalId === option.professionalId && selectedSlot?.startAt === slot;
                    return (
                      <button
                        key={`${option.professionalId}-${slot}`}
                        type="button"
                        aria-pressed={pressionado}
                        onClick={() => handleSelectSlot(option, slot)}
                        className={`rounded-xl border px-4 py-3 text-sm ${
                          pressionado
                            ? 'border-terracotta bg-terracotta text-white'
                            : 'border-charcoal/20 hover:border-terracotta'
                        }`}
                      >
                        {new Date(slot).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} —{' '}
                        {option.professionalName}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (step === 'details' && selectedService && selectedSlot) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <StepIndicator stepAtual={step} />
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-2xl">Seus dados</h3>
          <BackButton onClick={() => setStep('schedule')} />
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Nome completo
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Telefone
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            E-mail
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
            />
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Confirmando…' : 'Confirmar agendamento'}
        </Button>
      </form>
    );
  }

  if (step === 'success' && selectedService && selectedSlot) {
    return (
      <div className="space-y-6 text-center">
        <h3 className="font-display text-2xl">Agendamento confirmado!</h3>
        <p className="text-charcoal/70">
          Seu horário está reservado. Se precisar remarcar ou tirar dúvidas, fale com a gente pelo WhatsApp.
        </p>
        <dl className="mx-auto max-w-xs space-y-2 rounded-2xl bg-white p-6 text-left text-sm shadow-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-charcoal/65">Serviço</dt>
            <dd className="font-medium text-charcoal">{selectedService.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-charcoal/65">Profissional</dt>
            <dd className="font-medium text-charcoal">{selectedSlot.professionalName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-charcoal/65">Quando</dt>
            <dd className="font-medium capitalize text-charcoal">{formatarDataHora(selectedSlot.startAt)}</dd>
          </div>
        </dl>
        <div className="flex justify-center">
          <a
            href={whatsappLink(`Olá, acabei de agendar ${selectedService.name} e gostaria de confirmar.`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar no WhatsApp"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
              <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.44 9.9-9.9s-4.44-9.92-9.91-9.92zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.21-8.25 8.21zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.04 0 1.2.88 2.37 1 2.53.12.17 1.73 2.64 4.2 3.7.59.25 1.05.4 1.4.51.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return null;
}
