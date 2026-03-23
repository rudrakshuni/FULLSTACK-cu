import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with correct text', () => {
      render(<Button label="Click Me" onClick={() => {}} />);
      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click Me');
    });

    it('should render with data-testid attribute', () => {
      render(<Button label="Test Button" onClick={() => {}} />);
      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();
    });

    it('should render with primary variant by default', () => {
      render(<Button label="Primary" onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });

    it('should render with specified variant', () => {
      render(<Button label="Secondary" onClick={() => {}} variant="secondary" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-secondary');
    });
  });

  describe('Click Handling', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button label="Click Me" onClick={handleClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick handler multiple times on multiple clicks', () => {
      const handleClick = jest.fn();
      render(<Button label="Click Me" onClick={handleClick} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should not call onClick when button is disabled', () => {
      const handleClick = jest.fn();
      render(<Button label="Disabled" onClick={handleClick} disabled={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should render disabled button when disabled prop is true', () => {
      render(<Button label="Disabled" onClick={() => {}} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should render enabled button when disabled prop is false', () => {
      render(<Button label="Enabled" onClick={() => {}} disabled={false} />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should render enabled button by default', () => {
      render(<Button label="Default" onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('CSS Classes', () => {
    it('should always have btn class', () => {
      render(<Button label="Test" onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn');
    });

    it('should have both btn and variant classes', () => {
      render(<Button label="Test" onClick={() => {}} variant="primary" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn', 'btn-primary');
    });
  });
});
