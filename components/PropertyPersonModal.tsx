'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyPersonItem {
  name: string;
  expense: number;
  percentage: number;
}

interface PropertyPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: 'month' | 'year';
  totalExpense: number;
}

export default function PropertyPersonModal({ isOpen, onClose, period, totalExpense }: PropertyPersonModalProps) {
  const [data, setData] = useState<PropertyPersonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPropertyPersonData();
    }
  }, [isOpen, period]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPropertyPersonData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/pnl/property-person?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property/person data');
      }
      
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 30) return 'text-status-danger';
    if (percentage >= 15) return 'text-status-warning';
    return 'text-status-success';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          >
            {/* Modal Container - Using glass morphism like CommandSelect */}
            <div className="glass rounded-2xl shadow-elev-3 max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      Property & Person Expenses
                    </h2>
                    <p className="text-sm text-text-secondary mt-1">
                      {period === 'month' ? 'This Month' : 'Year Total'} • {formatCurrency(totalExpense)} Total
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto flex-1">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    <span className="ml-3 text-text-secondary">Loading property/person data...</span>
                  </div>
                )}

                {error && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">❌</div>
                    <p className="text-text-secondary text-sm mb-1">Error loading data</p>
                    <p className="text-text-tertiary text-xs mb-4">{error}</p>
                    <button
                      onClick={fetchPropertyPersonData}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg transition-colors text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!loading && !error && data.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-text-secondary text-sm">No property/person expenses found</p>
                    <p className="text-text-tertiary text-xs mt-1">No data available for this period</p>
                  </div>
                )}

                {!loading && !error && data.length > 0 && (
                  <div className="space-y-3">
                    {data.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 glass-hover rounded-lg transition-all duration-150"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-text-primary mb-1 truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getPercentageColor(item.percentage)}`}>
                              {item.percentage.toFixed(1)}% of total
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="text-lg font-semibold text-text-primary">
                            {formatCurrency(item.expense)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!loading && !error && data.length > 0 && (
                <div className="px-6 py-4 border-t border-white/10 flex-shrink-0">
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>{data.length} properties/persons</span>
                    <span>
                      Total: {formatCurrency(data.reduce((sum, item) => sum + item.expense, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}