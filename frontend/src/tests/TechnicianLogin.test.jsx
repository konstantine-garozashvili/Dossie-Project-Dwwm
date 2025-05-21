import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TechnicianLogin } from '../pages/TechnicianLogin';
import { AUTH_ENDPOINTS } from '../config/api';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API endpoint constants
vi.mock('../config/api', () => ({
  AUTH_ENDPOINTS: {
    TECHNICIAN_LOGIN: 'http://localhost:8000/api/auth/technician/login'
  }
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('TechnicianLogin Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <TechnicianLogin />
      </BrowserRouter>
    );
  };

  it('should render login form elements', () => {
    renderComponent();
    
    expect(screen.getByText('Espace Technicien IT13')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(screen.getByTestId('quick-login-button')).toBeInTheDocument();
    expect(screen.getByText('Mot de passe oublié?')).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    renderComponent();
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should handle successful login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        token: 'fake-token',
        technician: { id: 1, name: 'Technicien Test', email: 'tech@example.com' } 
      }),
    });

    renderComponent();
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-button');

    fireEvent.change(emailInput, { target: { value: 'tech@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(AUTH_ENDPOINTS.TECHNICIAN_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'tech@example.com',
          password: 'password123',
        }),
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboardtech');
    });
  });

  it('should handle login failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Identifiants invalides' }),
    });

    renderComponent();
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-button');

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Identifiants invalides')).toBeInTheDocument();
    });
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    renderComponent();
    
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-button');

    fireEvent.change(emailInput, { target: { value: 'tech@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Erreur de connexion au serveur')).toBeInTheDocument();
    });
  });

  it('should handle quick login', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        token: 'fake-token',
        technician: { id: 1, name: 'Technicien Test', email: 'tech@example.com' } 
      }),
    });

    renderComponent();
    
    const quickLoginButton = screen.getByTestId('quick-login-button');
    fireEvent.click(quickLoginButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(AUTH_ENDPOINTS.TECHNICIAN_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'tech@example.com',
          password: 'password123',
        }),
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboardtech');
    });
  });
}); 