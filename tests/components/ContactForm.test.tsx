import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/components/ContactForm';
import { SITE } from '@/content/site';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.stubGlobal('open', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens WhatsApp with the entered name and message on submit', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText('Nome'), 'Beatriz Lima');
    await user.type(screen.getByLabelText('Mensagem'), 'Gostaria de saber os horários de sábado.');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining(`https://wa.me/${SITE.whatsapp}?text=`),
        '_blank',
      ),
    );
    const calledUrl = (window.open as any).mock.calls[0][0] as string;
    expect(calledUrl).toContain(encodeURIComponent('Beatriz Lima'));
    expect(calledUrl).toContain(encodeURIComponent('Gostaria de saber os horários de sábado.'));
  });

  it('associates a <label> with each field via htmlFor/id', () => {
    render(<ContactForm />);
    const nome = screen.getByLabelText('Nome');
    const mensagem = screen.getByLabelText('Mensagem');
    expect(nome).toHaveAttribute('id');
    expect(mensagem).toHaveAttribute('id');
  });

  it('marks aria-invalid, shows an error and moves focus on invalid submit', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole('button', { name: /enviar/i }));

    const nome = screen.getByLabelText('Nome');
    expect(nome).toHaveAttribute('aria-invalid', 'true');

    const nomeDescribedBy = nome.getAttribute('aria-describedby');
    expect(nomeDescribedBy).toBeTruthy();
    const erro = document.getElementById(nomeDescribedBy as string);
    expect(erro).toHaveTextContent(/nome/i);

    expect(document.activeElement).toBe(nome);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('disables the submit button (aria-busy) after sending, until a field is edited again', () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Olá.' } });

    const button = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(button);

    // Continua desabilitado depois do envio (não um piscar rápido): é essa
    // trava que impede um segundo clique de abrir uma segunda aba.
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana Paula' } });

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
  });

  it('shows a success message in a status region when window.open succeeds', async () => {
    vi.stubGlobal('open', vi.fn(() => ({}) as Window));
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText('Nome'), 'Ana');
    await user.type(screen.getByLabelText('Mensagem'), 'Olá.');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    const status = screen.getByRole('status');
    await waitFor(() => expect(status).toHaveTextContent(/abrimos o whatsapp/i));
  });

  it('calls window.open synchronously during submit, with no wait needed', () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Olá.' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    // Sem await nem waitFor: a chamada precisa já ter acontecido no mesmo
    // turno síncrono do clique, dentro do gesto do usuário — é isso que o
    // Safari/iOS exige para não bloquear o pop-up.
    expect(window.open).toHaveBeenCalledTimes(1);
  });

  it('only opens WhatsApp once when submitted twice in a row', () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Olá.' } });

    const button = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(window.open).toHaveBeenCalledTimes(1);
  });

  it('automatically re-enables the submit button after a short cooldown, allowing a new submit', () => {
    vi.useFakeTimers();
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Olá.' } });

    const button = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(window.open).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
    expect(button).toHaveTextContent('Enviar pelo WhatsApp');

    fireEvent.click(button);
    expect(window.open).toHaveBeenCalledTimes(2);
  });

  it('shows a failure message with a manual link when window.open is blocked', async () => {
    vi.stubGlobal('open', vi.fn(() => null));
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText('Nome'), 'Ana');
    await user.type(screen.getByLabelText('Mensagem'), 'Olá.');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    const status = screen.getByRole('status');
    await waitFor(() => expect(status).toHaveTextContent(/não conseguimos abrir/i));
    const link = screen.getByRole('link', { name: /abrir o whatsapp manualmente/i });
    expect(link).toHaveAttribute('href', expect.stringContaining(`https://wa.me/${SITE.whatsapp}?text=`));
  });
});
