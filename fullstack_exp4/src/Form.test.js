import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Form from './Form';

describe('Form Component', () => {
  describe('Form Rendering', () => {
    it('should render the form with all input fields', () => {
      render(<Form />);
      
      expect(screen.getByTestId('signup-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should render form with correct labels', () => {
      render(<Form />);
      
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    });

    it('should have empty input fields initially', () => {
      render(<Form />);
      
      expect(screen.getByTestId('email-input').value).toBe('');
      expect(screen.getByTestId('password-input').value).toBe('');
      expect(screen.getByTestId('confirm-password-input').value).toBe('');
    });
  });

  describe('Form Input Handling', () => {
    it('should update email input value when user types', async () => {
      const user = userEvent.setup();
      render(<Form />);
      const emailInput = screen.getByTestId('email-input');
      
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input value when user types', async () => {
      const user = userEvent.setup();
      render(<Form />);
      const passwordInput = screen.getByTestId('password-input');
      
      await user.type(passwordInput, 'password123');
      
      expect(passwordInput.value).toBe('password123');
    });

    it('should update confirm password input value when user types', async () => {
      const user = userEvent.setup();
      render(<Form />);
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      
      await user.type(confirmPasswordInput, 'password123');
      
      expect(confirmPasswordInput.value).toBe('password123');
    });

    it('should fill all form fields with valid data', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      await user.type(screen.getByTestId('email-input'), 'user@example.com');
      await user.type(screen.getByTestId('password-input'), 'securepass123');
      await user.type(screen.getByTestId('confirm-password-input'), 'securepass123');
      
      expect(screen.getByTestId('email-input').value).toBe('user@example.com');
      expect(screen.getByTestId('password-input').value).toBe('securepass123');
      expect(screen.getByTestId('confirm-password-input').value).toBe('securepass123');
    });
  });

  describe('Form Validation - Email', () => {
    it('should show error when email is empty on submit', async () => {
      render(<Form />);
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
      });
    });

    it('should show error when email format is invalid', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      await user.type(screen.getByTestId('email-input'), 'invalidemail');
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Please enter a valid email');
      });
    });

    it('should not show error for valid email', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      await user.type(screen.getByTestId('email-input'), 'valid@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(screen.getByTestId('confirm-password-input'), 'password123');
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
      });
    });

    it('should clear email error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
      });
      
      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'a');
      
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation - Password', () => {
    it('should show error when password is empty on submit', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
      });
    });

    it('should show error when password is less than 6 characters', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'short');
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toHaveTextContent(
          'Password must be at least 6 characters'
        );
      });
    });

    it('should not show error for valid password', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'validpass123');
      await user.type(screen.getByTestId('confirm-password-input'), 'validpass123');
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('password-error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation - Confirm Password', () => {
    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(screen.getByTestId('confirm-password-input'), 'differentpass');
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('confirm-password-error')).toHaveTextContent(
          'Passwords do not match'
        );
      });
    });

    it('should not show error when passwords match', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(screen.getByTestId('confirm-password-input'), 'password123');
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('confirm-password-error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should show success message on valid form submission', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(screen.getByTestId('confirm-password-input'), 'password123');
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
        expect(screen.getByTestId('success-message')).toHaveTextContent('Form submitted successfully!');
      });
    });

    it('should not show success message on invalid submission', async () => {
      render(<Form />);
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup({ delay: null });
      jest.useFakeTimers();
      render(<Form />);
      
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(screen.getByTestId('confirm-password-input'), 'password123');
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });
      
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.getByTestId('email-input').value).toBe('');
        expect(screen.getByTestId('password-input').value).toBe('');
        expect(screen.getByTestId('confirm-password-input').value).toBe('');
      });
      
      jest.useRealTimers();
    });

    it('should handle multiple submissions', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      // First successful submission
      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(screen.getByTestId('confirm-password-input'), 'password123');
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });
    });
  });

  describe('Form Integration Tests', () => {
    it('should validate all fields and show appropriate error messages', async () => {
      render(<Form />);
      
      fireEvent.click(screen.getByTestId('submit-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
        expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
      });
    });

    it('should handle a complete user workflow', async () => {
      const user = userEvent.setup();
      render(<Form />);
      
      // User types email
      await user.type(screen.getByTestId('email-input'), 'user@example.com');
      
      // User types password
      await user.type(screen.getByTestId('password-input'), 'password123');
      
      // User confirms password
      await user.type(screen.getByTestId('confirm-password-input'), 'password123');
      
      // User clicks submit
      fireEvent.click(screen.getByTestId('submit-button'));
      
      // Verify successful submission
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toHaveTextContent(
          'Form submitted successfully!'
        );
      });
    });
  });
});
