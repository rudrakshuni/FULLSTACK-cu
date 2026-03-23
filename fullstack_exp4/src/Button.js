import React from 'react';

/**
 * Button Component - Simple functional component
 * @param {Object} props
 * @param {string} props.label - Button label text
 * @param {Function} props.onClick - Click handler
 * @param {string} props.variant - Button variant (primary, secondary)
 * @param {boolean} props.disabled - Whether button is disabled
 * @returns {JSX.Element} Rendered button
 */
const Button = ({ label, onClick, variant = 'primary', disabled = false }) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      data-testid="button"
    >
      {label}
    </button>
  );
};

export default Button;
