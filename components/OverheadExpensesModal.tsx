'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OverheadExpenseItem {
  name: string;
  expense: number;
  percentage: number;
}

interface OverheadExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: 'month' | 'year';
  totalExpense: number;
}

export default function OverheadExpensesModal({ isOpen, onClose, period, totalExpense }: OverheadExpensesModalProps) {
  const [data, setData] = useState<OverheadExpenseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOverheadExpensesData();
    }
  }, [isOpen, period]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOverheadExpensesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/pnl/overhead-expenses?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch overhead expenses data');
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

  // Group expenses by category
  const groupedExpenses = data.reduce((acc, item) => {
    // Extract category from name (e.g., "EXP - Utilities - Gas" -> "Utilities")
    const match = item.name.match(/EXP - ([^-]+)/);
    const category = match ? match[1].trim() : 'Other';
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, OverheadExpenseItem[]>);

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
            {/* Modal Container - Using glass morphism like PropertyPersonModal */}
            <div className="glass rounded-2xl shadow-elev-3 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      Overhead Expenses Breakdown
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
              <div className="p-6 overflow-y-auto flex-1">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    <span className="ml-3 text-text-secondary">Loading overhead expenses...</span>
                  </div>
                )}

                {error && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">❌</div>
                    <p className="text-text-secondary text-sm mb-1">Error loading data</p>
                    <p className="text-text-tertiary text-xs mb-4">{error}</p>
                    <button
                      onClick={fetchOverheadExpensesData}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg transition-colors text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!loading && !error && data.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-text-secondary text-sm">No overhead expenses found</p>
                    <p className="text-text-tertiary text-xs mt-1">No data available for this period</p>
                  </div>
                )}

                {!loading && !error && data.length > 0 && (
                  <div className="space-y-6">
                    {Object.entries(groupedExpenses).map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        {/* Category Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wide">
                            {category}
                          </h3>
                          <div className="flex-1 h-px bg-white/10"></div>
                          <span className="text-xs text-text-tertiary">
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>

                        {/* Category Items */}
                        <div className="space-y-2">
                          {items.map((item, index) => {
                            // Extract subcategory (everything after the main category)
                            const subcategoryMatch = item.name.match(/EXP - [^-]+ - (.+)/);
                            const subcategory = subcategoryMatch ? subcategoryMatch[1].trim() : item.name;

                            return (
                              <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-3 glass-hover rounded-lg transition-all duration-150"
                              >
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-text-primary mb-1 truncate">
                                    {subcategory}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-medium ${getPercentageColor(item.percentage)}`}>
                                      {item.percentage.toFixed(1)}% of overhead
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                  <div className="text-base font-semibold text-text-primary">
                                    {formatCurrency(item.expense)}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!loading && !error && data.length > 0 && (
                <div className="px-6 py-4 border-t border-white/10 shrink-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-text-secondary">
                        {data.length} expense {data.length === 1 ? 'category' : 'categories'}
                      </span>
                      <span className="text-text-tertiary">
                        {Object.keys(groupedExpenses).length} {Object.keys(groupedExpenses).length === 1 ? 'group' : 'groups'}
                      </span>
                    </div>
                    <span className="text-text-primary font-medium">
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
