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
          w-full px-4 py-2.5 bg-slate-900/30 border border-slate-700/30 rounded-xl
          text-slate-200 placeholder-slate-500 font-mono text-sm
          focus:outline-none focus:border-slate-600/50 focus:bg-slate-900/40
          transition-all duration-400 resize-none backdrop-blur-sm
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

