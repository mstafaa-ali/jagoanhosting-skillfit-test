import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';

// Mock the context and router
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

const mockSetTheme = vi.fn();
vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Admin RT')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('allows user to type in credentials', () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'admin@admin.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('admin@admin.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls login function and navigates on success', async () => {
    mockLogin.mockResolvedValueOnce(true);
    const { toast } = await import('sonner');

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'admin@admin.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockLogin).toHaveBeenCalledWith('admin@admin.com', 'password123');
    
    // Wait for async actions
    await Promise.resolve();
    
    expect(toast.success).toHaveBeenCalledWith('Login berhasil');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows error toast on login failure', async () => {
    mockLogin.mockResolvedValueOnce(false);
    const { toast } = await import('sonner');

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'admin@admin.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockLogin).toHaveBeenCalledWith('admin@admin.com', 'wrongpassword');
    
    await Promise.resolve();
    
    expect(toast.error).toHaveBeenCalledWith('Login gagal. Periksa kembali email dan password Anda.');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
