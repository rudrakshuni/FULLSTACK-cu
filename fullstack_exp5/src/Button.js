import React from 'react';

// UNIT TEST EXAMPLE: Simple Button Component
// A basic functional component that renders text and handles click events
export default function Button({ label, onClick }) {
  return (
    <button onClick={onClick} data-testid="simple-button">
      {label}
    </button>
  );
}
