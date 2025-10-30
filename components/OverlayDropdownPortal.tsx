'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

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

  // Ensure we only render on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position when visible or anchorEl changes
  useEffect(() => {
    if (visible && anchorEl) {
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
  }, [visible, anchorEl]);

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
            className="fixed inset-0 bg-black/80 z-[9998]"
            onClick={onClose}
            style={{ pointerEvents: 'auto' }}
          />

          {/* Dropdown panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] max-h-48 overflow-y-auto rounded-xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-md shadow-elev-2"
            style={{
              top: `${position.top + 4}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
            }}
          >
            {items.length > 0 ? (
              items.map((item, index) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => onSelect(item)}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800/50 focus:bg-slate-800/50 focus:outline-none transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-slate-700/30 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-1">{item}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">
                {emptyMessage}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

