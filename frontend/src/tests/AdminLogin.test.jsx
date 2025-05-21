import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminLogin from '../pages/AdminLogin'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate
}))

describe('AdminLogin Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  it('should render login form elements', () => {
    render(<AdminLogin />)
    
    // Check if essential form elements are present
    expect(screen.getByLabelText(/adresse mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
  })

  it('should handle form input changes', () => {
    render(<AdminLogin />)
    
    const mailInput = screen.getByLabelText(/adresse mail/i)
    const passwordInput = screen.getByLabelText(/mot de passe/i)
    
    // Test input changes with real admin credentials
    fireEvent.change(mailInput, { target: { value: 'admin@it13.com' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })
    
    expect(mailInput.value).toBe('admin@it13.com')
    expect(passwordInput.value).toBe('admin123')
  })

  it('should handle successful login', async () => {
    render(<AdminLogin />)
    
    // Fill in the form with correct credentials
    fireEvent.change(screen.getByLabelText(/adresse mail/i), {
      target: { value: 'admin@it13.com' }
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'admin123' }
    })
    
    // Submit the form
    const form = screen.getByRole('form', { name: /admin login form/i })
    fireEvent.submit(form)
    
    // Wait for the login process
    await waitFor(() => {
      // Check if token was set in localStorage
      expect(localStorage.getItem('adminToken')).toBe('demo-token-12345')
      // Check if navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith('/dashboardadmin')
    }, { timeout: 2000 }) // Increased timeout to account for setTimeout
  })

  it('should show error message on invalid credentials', async () => {
    render(<AdminLogin />)
    
    // Fill and submit form with wrong credentials
    fireEvent.change(screen.getByLabelText(/adresse mail/i), {
      target: { value: 'wrong@email.com' }
    })
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'wrongpassword' }
    })
    
    // Submit the form
    const form = screen.getByRole('form', { name: /admin login form/i })
    fireEvent.submit(form)
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/identifiants incorrects\. veuillez réessayer\./i)).toBeInTheDocument()
    }, { timeout: 2000 }) // Increased timeout to account for setTimeout
  })

  it('should handle quick login button', async () => {
    render(<AdminLogin />)
    
    // Click quick login button
    fireEvent.click(screen.getByRole('button', { name: /quick login/i }))
    
    // Wait for the login process
    await waitFor(() => {
      // Check if token was set in localStorage
      expect(localStorage.getItem('adminToken')).toBe('demo-token-12345')
      // Check if navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith('/dashboardadmin')
    }, { timeout: 2000 }) // Increased timeout to account for setTimeout
  })
}) 