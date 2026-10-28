import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingWizard } from '@/components/booking/BookingWizard';

const servicesResponse = {
  services: [
    {
      id: 'svc_1',
      name: 'Limpeza de Pele Profunda',
      slug: 'limpeza-de-pele-profunda',
      category: 'Facial',
      description: 'Higienização, esfoliação e extração.',
      duration: 60,
      price: 220,
    },
  ],
};

const availabilityResponse = {
  options: [
    {
      professionalId: 'pro_1',
      professionalName: 'Dra. Camila Duarte',
      slots: ['2026-08-24T09:00:00.000'],
    },
  ],
};

const createdAppointmentResponse = {
  appointment: { id: 'apt_1', startAt: '2026-08-24T09:00:00.000', endAt: '2026-08-24T10:00:00.000', status: 'confirmed' },
};

describe('BookingWizard', () => {
  beforeEach(() => {
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/services')) {
        return Promise.resolve(new Response(JSON.stringify(servicesResponse), { status: 200 }));
      }
      if (url.includes('/api/availability')) {
        return Promise.resolve(new Response(JSON.stringify(availabilityResponse), { status: 200 }));
      }
      if (url.includes('/api/appointments')) {
        return Promise.resolve(new Response(JSON.stringify(createdAppointmentResponse), { status: 201 }));
      }
      throw new Error(`Unexpected fetch call: ${url}`);
    }) as unknown as typeof fetch;
  });

  it('walks through service selection, schedule selection, details and shows success', async () => {
    const user = userEvent.setup();
    render(<BookingWizard />);

    expect(await screen.findByText('Limpeza de Pele Profunda')).toBeInTheDocument();
    await user.click(screen.getByText('Limpeza de Pele Profunda'));

    const dateButtons = await screen.findAllByRole('button', { name: /seg|ter|qua|qui|sex|sáb|dom/i });
    await user.click(dateButtons[0]);

    const slotButton = await screen.findByRole('button', { name: /09:00.*Dra\. Camila Duarte/i });
    await user.click(slotButton);

    await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza');
    await user.type(screen.getByLabelText('Telefone'), '+5511999999999');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /confirmar agendamento/i }));

    await waitFor(() => {
      expect(screen.getByText(/agendamento confirmado/i)).toBeInTheDocument();
    });
    const whatsappLink = screen.getByRole('link', { name: /whatsapp/i });
    expect(whatsappLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('Limpeza de Pele Profunda')));
  });

  it('shows an error when loading services fails', async () => {
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/services')) {
        return Promise.resolve(new Response(JSON.stringify({ error: 'boom' }), { status: 500 }));
      }
      throw new Error(`Unexpected fetch call: ${url}`);
    }) as unknown as typeof fetch;

    render(<BookingWizard />);

    expect(await screen.findByText(/não foi possível carregar os serviços/i)).toBeInTheDocument();
  });

  it('shows a message when no slots are available for the selected date', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/services')) {
        return Promise.resolve(new Response(JSON.stringify(servicesResponse), { status: 200 }));
      }
      if (url.includes('/api/availability')) {
        return Promise.resolve(new Response(JSON.stringify({ options: [] }), { status: 200 }));
      }
      throw new Error(`Unexpected fetch call: ${url}`);
    }) as unknown as typeof fetch;

    render(<BookingWizard />);

    expect(await screen.findByText('Limpeza de Pele Profunda')).toBeInTheDocument();
    await user.click(screen.getByText('Limpeza de Pele Profunda'));

    const dateButtons = await screen.findAllByRole('button', { name: /seg|ter|qua|qui|sex|sáb|dom/i });
    await user.click(dateButtons[0]);

    expect(await screen.findByText(/nenhum horário disponível/i)).toBeInTheDocument();
  });

  it('shows an error and stays on the details step when appointment creation fails', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/services')) {
        return Promise.resolve(new Response(JSON.stringify(servicesResponse), { status: 200 }));
      }
      if (url.includes('/api/availability')) {
        return Promise.resolve(new Response(JSON.stringify(availabilityResponse), { status: 200 }));
      }
      if (url.includes('/api/appointments')) {
        return Promise.resolve(new Response(JSON.stringify({ error: 'Horário já ocupado' }), { status: 409 }));
      }
      throw new Error(`Unexpected fetch call: ${url}`);
    }) as unknown as typeof fetch;

    render(<BookingWizard />);

    expect(await screen.findByText('Limpeza de Pele Profunda')).toBeInTheDocument();
    await user.click(screen.getByText('Limpeza de Pele Profunda'));

    const dateButtons = await screen.findAllByRole('button', { name: /seg|ter|qua|qui|sex|sáb|dom/i });
    await user.click(dateButtons[0]);

    const slotButton = await screen.findByRole('button', { name: /09:00.*Dra\. Camila Duarte/i });
    await user.click(slotButton);

    await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza');
    await user.type(screen.getByLabelText('Telefone'), '+5511999999999');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /confirmar agendamento/i }));

    expect(await screen.findByText(/não foi possível confirmar o agendamento/i)).toBeInTheDocument();
    expect(screen.queryByText(/agendamento confirmado/i)).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no services to book', async () => {
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/services')) {
        return Promise.resolve(new Response(JSON.stringify({ services: [] }), { status: 200 }));
      }
      throw new Error(`Unexpected fetch call: ${url}`);
    }) as unknown as typeof fetch;

    render(<BookingWizard />);

    expect(await screen.findByText(/nenhum serviço disponível para agendamento/i)).toBeInTheDocument();
  });

  it('does not promise an e-mail on the success screen', async () => {
    const user = userEvent.setup();
    render(<BookingWizard />);

    expect(await screen.findByText('Limpeza de Pele Profunda')).toBeInTheDocument();
    await user.click(screen.getByText('Limpeza de Pele Profunda'));

    const dateButtons = await screen.findAllByRole('button', { name: /seg|ter|qua|qui|sex|sáb|dom/i });
    await user.click(dateButtons[0]);

    const slotButton = await screen.findByRole('button', { name: /09:00.*Dra\. Camila Duarte/i });
    await user.click(slotButton);

    await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza');
    await user.type(screen.getByLabelText('Telefone'), '+5511999999999');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /confirmar agendamento/i }));

    await waitFor(() => expect(screen.getByText(/agendamento confirmado/i)).toBeInTheDocument());
    expect(screen.queryByText(/e-mail informado/i)).not.toBeInTheDocument();
    expect(screen.getByText(/whatsapp/i)).toBeInTheDocument();
  });

  it('surfaces an error and re-enables the submit button when the network fails', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/services')) {
        return Promise.resolve(new Response(JSON.stringify(servicesResponse), { status: 200 }));
      }
      if (url.includes('/api/availability')) {
        return Promise.resolve(new Response(JSON.stringify(availabilityResponse), { status: 200 }));
      }
      if (url.includes('/api/appointments')) {
        return Promise.reject(new Error('network down'));
      }
      throw new Error(`Unexpected fetch call: ${url}`);
    }) as unknown as typeof fetch;

    render(<BookingWizard />);

    expect(await screen.findByText('Limpeza de Pele Profunda')).toBeInTheDocument();
    await user.click(screen.getByText('Limpeza de Pele Profunda'));

    const dateButtons = await screen.findAllByRole('button', { name: /seg|ter|qua|qui|sex|sáb|dom/i });
    await user.click(dateButtons[0]);

    const slotButton = await screen.findByRole('button', { name: /09:00.*Dra\. Camila Duarte/i });
    await user.click(slotButton);

    await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza');
    await user.type(screen.getByLabelText('Telefone'), '+5511999999999');
    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /confirmar agendamento/i }));

    expect(await screen.findByText(/não foi possível confirmar o agendamento/i)).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: /confirmar agendamento/i });
    expect(submit).not.toBeDisabled();
  });

  it('marks the current step with aria-current="step" as the wizard advances', async () => {
    const user = userEvent.setup();
    const { container } = render(<BookingWizard />);

    expect(await screen.findByText('Limpeza de Pele Profunda')).toBeInTheDocument();
    expect(container.querySelector('[aria-current="step"]')).toHaveTextContent('1 Serviço');

    await user.click(screen.getByText('Limpeza de Pele Profunda'));
    expect(container.querySelector('[aria-current="step"]')).toHaveTextContent('2 Profissional e horário');

    const dateButtons = await screen.findAllByRole('button', { name: /seg|ter|qua|qui|sex|sáb|dom/i });
    await user.click(dateButtons[0]);
    const slotButton = await screen.findByRole('button', { name: /09:00.*Dra\. Camila Duarte/i });
    await user.click(slotButton);

    expect(container.querySelector('[aria-current="step"]')).toHaveTextContent('3 Seus dados');
    // Só um passo é o atual por vez.
    expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  });

  it('marks the selected time slot with aria-pressed', async () => {
    const user = userEvent.setup();
    render(<BookingWizard />);

    expect(await screen.findByText('Limpeza de Pele Profunda')).toBeInTheDocument();
    await user.click(screen.getByText('Limpeza de Pele Profunda'));

    const dateButtons = await screen.findAllByRole('button', { name: /seg|ter|qua|qui|sex|sáb|dom/i });
    await user.click(dateButtons[0]);

    const slotButton = await screen.findByRole('button', { name: /09:00.*Dra\. Camila Duarte/i });
    expect(slotButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(slotButton);
    // O passo avança para "Seus dados"; o botão de horário fica em outra
    // árvore quando revisitado pelo Voltar, então conferimos o estado
    // voltando ao passo anterior.
    await user.click(screen.getByRole('button', { name: /voltar/i }));
    expect(await screen.findByRole('button', { name: /09:00.*Dra\. Camila Duarte/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('the back button changes only the visible step, keeping previously chosen data', async () => {
    const user = userEvent.setup();
    render(<BookingWizard />);

    expect(await screen.findByText('Limpeza de Pele Profunda')).toBeInTheDocument();
    await user.click(screen.getByText('Limpeza de Pele Profunda'));

    const dateButtons = await screen.findAllByRole('button', { name: /seg|ter|qua|qui|sex|sáb|dom/i });
    await user.click(dateButtons[0]);
    const slotButton = await screen.findByRole('button', { name: /09:00.*Dra\. Camila Duarte/i });
    await user.click(slotButton);

    await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza');
    await user.click(screen.getByRole('button', { name: /voltar/i }));

    // Voltou para o passo de horário, com a data e o horário ainda
    // selecionados (nenhum novo fetch de disponibilidade necessário).
    expect(await screen.findByRole('button', { name: /09:00.*Dra\. Camila Duarte/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await user.click(screen.getByRole('button', { name: /voltar/i }));
    // Voltou para o passo de serviço; o serviço escolhido continua marcado.
    expect(screen.getByRole('button', { name: /Limpeza de Pele Profunda/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('choosing a different service after going back clears the previously selected slot', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/services')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              services: [
                ...servicesResponse.services,
                {
                  id: 'svc_2',
                  name: 'Drenagem Linfática',
                  slug: 'drenagem-linfatica',
                  category: 'Corporal',
                  description: 'Drenagem manual.',
                  duration: 50,
                  price: 180,
                },
              ],
            }),
            { status: 200 }
          )
        );
      }
      if (url.includes('/api/availability')) {
        return Promise.resolve(new Response(JSON.stringify(availabilityResponse), { status: 200 }));
      }
      throw new Error(`Unexpected fetch call: ${url}`);
    }) as unknown as typeof fetch;

    render(<BookingWizard />);

    expect(await screen.findByText('Limpeza de Pele Profunda')).toBeInTheDocument();
    await user.click(screen.getByText('Limpeza de Pele Profunda'));

    const dateButtons = await screen.findAllByRole('button', { name: /seg|ter|qua|qui|sex|sáb|dom/i });
    await user.click(dateButtons[0]);
    const slotButton = await screen.findByRole('button', { name: /09:00.*Dra\. Camila Duarte/i });
    await user.click(slotButton);

    await user.click(screen.getByRole('button', { name: /voltar/i }));
    await user.click(screen.getByRole('button', { name: /voltar/i }));
    await user.click(screen.getByText('Drenagem Linfática'));

    // A troca de serviço volta para o passo de horário limpo: nenhuma data
    // nem horário seguem marcados como selecionados.
    const novasDatas = await screen.findAllByRole('button', { name: /seg|ter|qua|qui|sex|sáb|dom/i });
    novasDatas.forEach((botao) => expect(botao).toHaveAttribute('aria-pressed', 'false'));
    expect(screen.queryByRole('button', { name: /09:00.*Dra\. Camila Duarte/i })).not.toBeInTheDocument();
  });
});
