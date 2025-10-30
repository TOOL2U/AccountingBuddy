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
          w-full px-4 py-2.5 bg-slate-900/30 border border-slate-700/30 rounded-xl
          text-slate-200 placeholder-slate-500
          focus:outline-none focus:border-slate-600/50 focus:bg-slate-900/40
          transition-all duration-400 backdrop-blur-sm
          ${error ? 'border-red-500/40 focus:border-red-500/60' : ''}
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

