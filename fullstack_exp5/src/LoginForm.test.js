import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from './LoginForm';

describe('LoginForm Component - Integration Tests', () => {
  // Test 1: Verify form renders with all fields
  it('should render form with email and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('email-field')).toBeInTheDocument();
    expect(screen.getByTestId('password-field')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  // Test 2: Verify user can fill input fields
  it('should update input fields when user fills them', () => {
    render(<LoginForm />);

    const emailInput = screen.getByTestId('email-field');
    const passwordInput = screen.getByTestId('password-field');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  // Test 3: Verify validation - email required
  it('should show error when email is empty', () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('error-message')).toHaveTextContent('Email is required');
  });

  // Test 4: Verify validation - invalid email format
  it('should show error for invalid email format', () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByTestId('email-field'), { target: { value: 'notanemail' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid email format');
  });

  // Test 5: Verify validation - password required
  it('should show error when password is empty', () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByTestId('email-field'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('error-message')).toHaveTextContent('Password is required');
  });

  // Test 6: Verify validation - password minimum length
  it('should show error for short password', () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByTestId('email-field'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-field'), { target: { value: 'short' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Password must be at least 6 characters'
    );
  });

  // Test 7: Verify success message on valid submission
  it('should show success message on valid form submission', () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByTestId('email-field'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByTestId('password-field'), { target: { value: 'validpass123' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('success-message')).toHaveTextContent('Login successful!');
  });

  // Test 8: Verify form resets after successful submission
  it('should clear fields after successful submission', () => {
    render(<LoginForm />);

    const emailInput = screen.getByTestId('email-field');
    const passwordInput = screen.getByTestId('password-field');

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'validpass123' } });
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(emailInput.value).toBe('');
    expect(passwordInput.value).toBe('');
  });
});
