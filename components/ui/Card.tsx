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
  const baseClasses = 'bg-slate-900/20 backdrop-blur-md border border-slate-700/20 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.3)] p-6 transition-all duration-300';
  const hoverClasses = hoverable ? 'hover:border-slate-600/30 hover:shadow-[0_0_20px_rgba(148,163,184,0.06)] cursor-pointer' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={hoverable ? {
        y: -4,
        transition: { type: 'spring', stiffness: 200, damping: 25 }
      } : {}}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

