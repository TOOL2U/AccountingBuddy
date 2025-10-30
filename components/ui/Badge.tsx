import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export default function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
  ...props
}: BadgeProps) {
  const variantClasses = {
    success: 'bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400/80 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400/80 border border-red-500/20',
    info: 'bg-slate-500/10 text-slate-400/80 border border-slate-500/20',
    default: 'bg-slate-800/30 text-slate-400 border border-slate-700/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs font-medium rounded-lg',
    md: 'px-3 py-1.5 text-sm font-medium rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

