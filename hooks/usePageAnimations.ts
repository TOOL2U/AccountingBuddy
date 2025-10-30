'use client';

import { useState, useEffect } from 'react';
import { Variants } from 'framer-motion';

/**
 * Page animation hook for consistent motion across the app
 * Provides animation variants and phase management
 */
export function usePageAnimations() {
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'animating' | 'complete'>('initial');
  const [skipAnimations, setSkipAnimations] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setSkipAnimations(prefersReducedMotion);

    // Start animation phase
    setAnimationPhase('animating');
    
    // Mark as complete after animation duration
    const timer = setTimeout(() => {
      setAnimationPhase('complete');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    animationPhase,
    skipAnimations,
  };
}

/**
 * Container variant for staggered children animations
 */
export const uiStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Hero section animation variants
 */
export const heroAnimationVariants = {
  background: {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  headline: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  subtitle: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  ctaButton: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  trustedLogo: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
};

/**
 * Card animation variants for list items
 */
export const cardAnimationVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Fade in animation variant
 */
export const fadeInVariant: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Scale in animation variant
 */
export const scaleInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Slide up animation variant
 */
export const slideUpVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Slide down animation variant
 */
export const slideDownVariant: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

