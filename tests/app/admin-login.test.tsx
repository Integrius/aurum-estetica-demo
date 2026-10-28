import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));

const signInMock = vi.fn();
vi.mock('next-auth/react', () => ({ signIn: (...args: unknown[]) => signInMock(...args) }));

import AdminLoginPage from '@/app/admin/login/page';

describe('Admin login page', () => {
  it('signs in with credentials and redirects to the dashboard on success', async () => {
    signInMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText('E-mail'), 'admin@example.com');
    await user.type(screen.getByLabelText('Senha'), 'test-password');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('credentials', {
        email: 'admin@example.com',
        password: 'test-password',
        redirect: false,
      });
      expect(pushMock).toHaveBeenCalledWith('/admin/agendamentos');
    });
  });

  it('shows an error message when sign-in fails', async () => {
    signInMock.mockResolvedValue({ error: 'CredentialsSignin' });
    const user = userEvent.setup();
    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText('E-mail'), 'admin@example.com');
    await user.type(screen.getByLabelText('Senha'), 'errado');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/e-mail ou senha inválidos/i)).toBeInTheDocument();
  });
});
