import React, { useState } from 'react';

/**
 * Form Component - Includes form validation and submission
 * @returns {JSX.Element} Rendered form
 */
const Form = () => {
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formState.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formState.password) {
      newErrors.password = 'Password is required';
    } else if (formState.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
      setErrors({});
      // Reset form after successful submission
      setTimeout(() => {
        setFormState({ email: '', password: '', confirmPassword: '' });
        setSubmitted(false);
      }, 2000);
    } else {
      setErrors(newErrors);
      setSubmitted(false);
    }
  };

  return (
    <div className="form-container">
      {submitted && (
        <div className="success-message" data-testid="success-message">
          Form submitted successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} data-testid="signup-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formState.email}
            onChange={handleChange}
            data-testid="email-input"
            aria-label="Email address"
          />
          {errors.email && (
            <span className="error-message" data-testid="email-error">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formState.password}
            onChange={handleChange}
            data-testid="password-input"
            aria-label="Password"
          />
          {errors.password && (
            <span className="error-message" data-testid="password-error">
              {errors.password}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formState.confirmPassword}
            onChange={handleChange}
            data-testid="confirm-password-input"
            aria-label="Confirm password"
          />
          {errors.confirmPassword && (
            <span className="error-message" data-testid="confirm-password-error">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <button type="submit" data-testid="submit-button">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Form;
