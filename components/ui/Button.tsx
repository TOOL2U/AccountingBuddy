import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap';

  const variantClasses = {
    primary: 'bg-slate-800/40 hover:bg-slate-700/50 text-white border border-blue-500/20 hover:border-blue-400/40 shadow-[0_0_8px_rgba(59,130,246,0.1)] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:bg-slate-900/20 disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-50 backdrop-blur-sm',
    secondary: 'bg-slate-800/30 hover:bg-slate-700/40 text-slate-300 hover:text-white border border-slate-500/20 hover:border-slate-400/30 shadow-[0_0_6px_rgba(148,163,184,0.08)] hover:shadow-[0_0_12px_rgba(148,163,184,0.15)] disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm',
    outline: 'border border-slate-500/30 text-slate-300 hover:text-white hover:bg-slate-800/20 hover:border-blue-400/30 hover:shadow-[0_0_10px_rgba(59,130,246,0.12)] disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm',
    ghost: 'text-slate-400 hover:bg-slate-800/20 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-slate-800/40 hover:bg-red-900/30 text-red-300 hover:text-red-200 border border-red-500/20 hover:border-red-400/40 shadow-[0_0_8px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const finalClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <motion.button
      whileHover={{
        scale: isLoading || disabled ? 1 : 1.02,
        y: isLoading || disabled ? 0 : -1,
        transition: { type: 'spring', stiffness: 300, damping: 25, duration: 0.4 }
      }}
      whileTap={{
        scale: isLoading || disabled ? 1 : 0.98,
        transition: { type: 'spring', stiffness: 300, damping: 25, duration: 0.3 }
      }}
      disabled={isLoading || disabled}
      className={`${finalClassName} relative overflow-hidden`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
}

