import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export default function Card({
  children,
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  const baseClasses = 'bg-surface-1 border border-border-light rounded-2xl shadow-elev-1 p-6 transition-all duration-200';
  const hoverClasses = hoverable ? 'hover:bg-surface-2 hover:border-border-medium hover:shadow-elev-2 cursor-pointer' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={hoverable ? {
        y: -4,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      } : {}}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

