'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

interface OverlayDropdownPortalProps {
  visible: boolean;
  anchorEl: HTMLElement | null;
  items: string[];
  emptyMessage: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function OverlayDropdownPortal({
  visible,
  anchorEl,
  items,
  emptyMessage,
  onSelect,
  onClose,
}: OverlayDropdownPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Ensure we only render on client
  useEffect(() => {
    setMounted(true);
    // Check if mobile on mount
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Calculate position when visible or anchorEl changes (desktop only)
  useEffect(() => {
    if (visible && anchorEl && !isMobile) {
      const updatePosition = () => {
        const rect = anchorEl.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      };

      updatePosition();

      // Update position on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [visible, anchorEl, isMobile]);

  // Update mobile detection on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted || !visible) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {visible && (
        <>
          {/* Full-screen dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 z-9998"
            onClick={onClose}
            style={{ pointerEvents: 'auto' }}
          />

          {/* Dropdown panel - Bottom sheet on mobile, positioned dropdown on desktop */}
          <motion.div
            initial={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, y: -10, scale: 0.95 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: isMobile ? 0.3 : 0.15, ease: isMobile ? [0.32, 0.72, 0, 1] : 'easeOut' }}
            className={`fixed z-9999 overflow-hidden bg-slate-900 shadow-elev-3 ${
              isMobile
                ? 'bottom-0 left-0 right-0 rounded-t-3xl border-t border-slate-700/50 max-h-[70vh]'
                : 'rounded-xl border border-slate-700/50 backdrop-blur-md max-h-64'
            }`}
            style={
              isMobile
                ? {}
                : {
                    top: `${position.top + 4}px`,
                    left: `${position.left}px`,
                    width: `${position.width}px`,
                  }
            }
          >
            {/* Mobile header with close button and drag handle */}
            {isMobile && (
              <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-2" />
                  <h3 className="text-sm font-medium text-slate-200 text-center">
                    {items.length > 0 ? `${items.length} options` : 'No results'}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            )}

            {/* Scrollable content */}
            <div className={`overflow-y-auto ${isMobile ? 'max-h-[calc(70vh-60px)]' : ''}`}>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <motion.button
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => onSelect(item)}
                    className={`w-full px-4 text-left text-slate-200 hover:bg-slate-800/50 active:bg-slate-800 focus:bg-slate-800/50 focus:outline-none transition-colors border-b border-slate-700/30 last:border-b-0 ${
                      isMobile ? 'py-4 text-base' : 'py-3 text-sm first:rounded-t-xl last:rounded-b-xl'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-1 font-medium">{item}</span>
                      <ArrowRight className={`text-slate-400 ${isMobile ? 'w-5 h-5' : 'w-3 h-3'}`} />
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className={`px-4 text-slate-400 text-center ${isMobile ? 'py-8 text-base' : 'py-3 text-sm'}`}>
                  {emptyMessage}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

