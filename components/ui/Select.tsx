import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export default function Select({
  label,
  error,
  helperText,
  options,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 bg-surface-1 border border-border-light rounded-xl
          text-text-primary
          focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-transparent
          transition-all duration-200 appearance-none cursor-pointer
          ${error ? 'border-status-danger focus:ring-status-danger/60' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-status-danger">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-text-tertiary">{helperText}</p>
      )}
    </div>
  );
}

