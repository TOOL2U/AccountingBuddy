'use client';

import { useState, useEffect, useRef } from 'react';

interface CommandSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  hint?: string;
  icon?: string;
  placeholder?: string;
  required?: boolean;
  confidence?: number;
  keywords?: string[];
}

export default function CommandSelect({
  options,
  value,
  onChange,
  label,
  hint,
  icon,
  placeholder = 'Select an option...',
  required = false,
  confidence,
  keywords,
}: CommandSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredOptions(options);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = options.filter((option) => {
      const optionLower = option.toLowerCase();
      return optionLower.includes(query);
    });

    setFilteredOptions(filtered);
  }, [searchQuery, options]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <span className="bg-accent-primary/20 text-accent-primary">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-accent-danger ml-1">*</span>}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 glass glass-hover rounded-xl text-left transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent-primary/60"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
          <span className={value ? 'text-text-primary' : 'text-text-meta'}>
            {value || placeholder}
          </span>
        </div>
        <svg
          className="w-5 h-5 text-text-meta flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {hint && (
        <p className="text-xs text-text-meta">{hint}</p>
      )}

      {/* Modal Sheet */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-50 animate-fade-in"
            onClick={handleClose}
          />

          {/* Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up md:inset-0 md:flex md:items-center md:justify-center">
            <div className="bg-dark-base md:glass md:rounded-2xl md:max-w-lg md:w-full md:max-h-[80vh] flex flex-col h-[85vh] md:h-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{label}</h3>
                  {filteredOptions.length > 0 && (
                    <p className="text-xs text-text-meta mt-0.5">
                      {filteredOptions.length} option{filteredOptions.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4 border-b border-white/10 flex-shrink-0">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-meta"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-meta focus:outline-none focus:ring-2 focus:ring-accent-primary/60 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded transition-colors"
                    >
                      <svg className="w-4 h-4 text-text-meta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Options List */}
              <div className="flex-1 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-text-secondary text-sm">No options found</p>
                    <p className="text-text-meta text-xs mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelect(option)}
                        className={`
                          w-full text-left px-4 py-3 rounded-lg transition-colors
                          ${option === value
                            ? 'bg-accent-primary/20 text-accent-primary'
                            : 'hover:bg-white/5 text-text-primary'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm">
                            {highlightMatch(option, searchQuery)}
                          </span>
                          {option === value && (
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

