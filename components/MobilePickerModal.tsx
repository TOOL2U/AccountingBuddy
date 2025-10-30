'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ArrowRight } from 'lucide-react';

interface MobilePickerModalProps {
  visible: boolean;
  title: string; // "Select Category" | "Select Payment Type"
  options: string[]; // filteredCategories or filteredPaymentTypes
  onSelect: (value: string) => void; // handleCategorySelect / handlePaymentSelect
  onClose: () => void; // close modal
  initialSearch?: string; // (optional) preload search text
  onSearchChange?: (value: string) => void; // update filter as user types
}

export default function MobilePickerModal({
  visible,
  title,
  options,
  onSelect,
  onClose,
  initialSearch = '',
  onSearchChange,
}: MobilePickerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Ensure we only render on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update search value when initialSearch changes
  useEffect(() => {
    setSearchValue(initialSearch);
  }, [initialSearch]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (visible) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // Focus search input after a short delay (after animation)
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);

      return () => {
        clearTimeout(timer);
        
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [visible]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  // Handle option selection
  const handleSelect = (option: string) => {
    onSelect(option);
    onClose();
  };

  if (!mounted || !visible) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {visible && (
        <>
          {/* Scrim / Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 z-9998"
            onClick={onClose}
          />

          {/* Bottom sheet modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className="fixed bottom-0 left-6 right-6 z-9999 bg-surface-1 rounded-t-2xl shadow-elev-3 border border-border-light flex flex-col max-h-[70vh]"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-brand-primary/20 to-status-info/20 border-b border-border-light/40 flex items-center justify-between rounded-t-2xl shrink-0">
              <h3 className="text-sm font-semibold text-text-primary">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-text-tertiary hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
                aria-label="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search input */}
            <div className="px-4 py-3 border-b border-border-light/40 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-2 border border-border-light rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 transition-all"
                />
              </div>
            </div>

            {/* Options list - scrollable */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: '50vh' }}>
              {options.length > 0 ? (
                options.map((option, index) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleSelect(option)}
                    className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-white/5 active:bg-white/10 border-b border-border-light/40 last:border-b-0 flex items-center justify-between transition-colors"
                  >
                    <span className="flex-1 font-medium">{option}</span>
                    <ArrowRight className="w-4 h-4 text-text-tertiary" />
                  </motion.button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-text-tertiary">
                  {searchValue ? `No results found for "${searchValue}"` : 'No options available'}
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

