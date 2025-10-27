import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'lg',
  ...rest
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        glass rounded-2xl
        ${hover ? 'glass-hover transition-all duration-150' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}

