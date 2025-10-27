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
    success: 'bg-status-success/20 text-status-success border border-status-success/30',
    warning: 'bg-status-warning/20 text-status-warning border border-status-warning/30',
    danger: 'bg-status-danger/20 text-status-danger border border-status-danger/30',
    info: 'bg-status-info/20 text-status-info border border-status-info/30',
    default: 'bg-surface-2 text-text-secondary border border-border-light',
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

