import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Textarea({
  label,
  error,
  helperText,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-2.5 bg-surface-1 border border-border-light rounded-xl
          text-text-primary placeholder-text-tertiary font-mono text-sm
          focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-transparent
          transition-all duration-200 resize-none
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

