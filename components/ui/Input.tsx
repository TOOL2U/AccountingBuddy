import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 bg-surface-1 border border-border-light rounded-xl
          text-text-primary placeholder-text-tertiary
          focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-status-danger focus:ring-status-danger/60' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-status-danger">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-text-tertiary">{helperText}</p>
      )}
    </div>
  );
}

