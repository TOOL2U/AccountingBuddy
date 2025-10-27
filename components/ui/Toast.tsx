import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const variantStyles = {
  success: {
    bg: 'bg-status-success/90',
    border: 'border-status-success',
    icon: CheckCircle,
    iconColor: 'text-white',
  },
  error: {
    bg: 'bg-status-danger/90',
    border: 'border-status-danger',
    icon: XCircle,
    iconColor: 'text-white',
  },
  warning: {
    bg: 'bg-status-warning/90',
    border: 'border-status-warning',
    icon: AlertCircle,
    iconColor: 'text-white',
  },
  info: {
    bg: 'bg-status-info/90',
    border: 'border-status-info',
    icon: Info,
    iconColor: 'text-white',
  },
};

const positionStyles = {
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-center': 'top-6 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
};

const animationVariants = {
  'top-right': { initial: { opacity: 0, x: 100, y: 0 }, animate: { opacity: 1, x: 0, y: 0 }, exit: { opacity: 0, x: 100, y: 0 } },
  'top-left': { initial: { opacity: 0, x: -100, y: 0 }, animate: { opacity: 1, x: 0, y: 0 }, exit: { opacity: 0, x: -100, y: 0 } },
  'bottom-right': { initial: { opacity: 0, x: 100, y: 0 }, animate: { opacity: 1, x: 0, y: 0 }, exit: { opacity: 0, x: 100, y: 0 } },
  'bottom-left': { initial: { opacity: 0, x: -100, y: 0 }, animate: { opacity: 1, x: 0, y: 0 }, exit: { opacity: 0, x: -100, y: 0 } },
  'top-center': { initial: { opacity: 0, x: 0, y: -50 }, animate: { opacity: 1, x: 0, y: 0 }, exit: { opacity: 0, x: 0, y: -50 } },
  'bottom-center': { initial: { opacity: 0, x: 0, y: 50 }, animate: { opacity: 1, x: 0, y: 0 }, exit: { opacity: 0, x: 0, y: 50 } },
};

export default function Toast({
  message,
  variant = 'info',
  isVisible,
  onClose,
  duration = 3000,
  position = 'bottom-right',
}: ToastProps) {
  const style = variantStyles[variant];
  const Icon = style.icon;
  const positionClass = positionStyles[position];
  const animation = animationVariants[position];

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={animation.initial}
          animate={animation.animate}
          exit={animation.exit}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed ${positionClass} z-50 max-w-md`}
        >
          <div
            className={`${style.bg} ${style.border} border backdrop-blur-md rounded-xl shadow-elev-3 p-4 flex items-center gap-3 min-w-[280px]`}
          >
            <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0`} />
            <p className="text-white font-medium flex-1">{message}</p>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors flex-shrink-0"
              aria-label="Close notification"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easier toast management
export function useToast() {
  const [toast, setToast] = React.useState<{
    message: string;
    variant: ToastVariant;
    isVisible: boolean;
  }>({
    message: '',
    variant: 'info',
    isVisible: false,
  });

  const showToast = (message: string, variant: ToastVariant = 'info') => {
    setToast({ message, variant, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}

