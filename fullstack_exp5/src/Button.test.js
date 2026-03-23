import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component - Unit Tests', () => {
  // Test 1: Verify component renders with correct text
  it('should render the button with correct label text', () => {
    render(<Button label="Click Me" />);
    
    const button = screen.getByTestId('simple-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
  });

  // Test 2: Verify click event handler is called
  it('should call onClick handler when button is clicked', () => {
    const mockClickHandler = jest.fn();
    render(<Button label="Submit" onClick={mockClickHandler} />);
    
    const button = screen.getByTestId('simple-button');
    fireEvent.click(button);
    
    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });

  // Test 3: Verify multiple clicks are tracked
  it('should handle multiple clicks', () => {
    const mockClickHandler = jest.fn();
    render(<Button label="Count" onClick={mockClickHandler} />);
    
    const button = screen.getByTestId('simple-button');
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(mockClickHandler).toHaveBeenCalledTimes(3);
  });
});
