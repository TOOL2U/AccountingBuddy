'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { uiStaggerContainer, cardAnimationVariants } from '@/hooks/usePageAnimations';
import PropertyPersonModal from '@/components/PropertyPersonModal';
import OverheadExpensesModal from '@/components/OverheadExpensesModal';
import AdminShell from '@/components/layout/AdminShell';

// Type definitions
interface PnLPeriodData {
  revenue: number;
  overheads: number;
  propertyPersonExpense: number;
  gop: number;
  ebitdaMargin: number;
}

interface PnLData {
  month: PnLPeriodData;
  year: PnLPeriodData;
  updatedAt: string;
}

interface KPICardProps {
  title: string;
  value: number;
  isPercentage?: boolean;
  isCurrency?: boolean;
  period: 'month' | 'year';
  isLoading?: boolean;
  onClick?: () => void;
  isClickable?: boolean;
}

// Format currency in THB
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Format percentage
function formatPercentage(value: number): string {
  return value.toFixed(2);
}

// KPI Card Component
function KPICard({ title, value, isPercentage, isCurrency, period, isLoading, onClick, isClickable }: KPICardProps) {
  const isPositive = value >= 0;
  const periodLabel = period === 'month' ? 'MTD' : 'YTD';
  
  if (isLoading) {
    return (
      <motion.div
        className="glass rounded-2xl p-6 animate-pulse"
        variants={cardAnimationVariants}
      >
        <div className="space-y-4">
          <div className="h-4 bg-white/10 rounded w-2/3 shimmer" />
          <div className="h-10 bg-white/10 rounded w-full shimmer" />
          <div className="h-3 bg-white/10 rounded w-1/2 shimmer" />
        </div>
      </motion.div>
    );
  }

  const cardContent = (
    <>
      {/* Period Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
          {periodLabel}
        </span>
        <div className="flex items-center gap-1">
          {isCurrency && (
            <DollarSign className="w-4 h-4 text-brand-primary" />
          )}
          {isClickable && (
            <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-text-secondary mb-2">
        {title}
        {isClickable && <span className="text-xs text-text-tertiary ml-1">(click for details)</span>}
      </h3>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        {isCurrency && (
          <span className="text-2xl md:text-3xl font-bold text-text-primary">
            ฿{formatCurrency(value)}
          </span>
        )}
        {isPercentage && (
          <div className="flex items-center gap-1">
            <span className={`text-2xl md:text-3xl font-bold ${
              isPositive ? 'text-status-success' : 'text-status-danger'
            }`}>
              {formatPercentage(value)}%
            </span>
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-status-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-status-danger" />
            )}
          </div>
        )}
      </div>

      {/* Subtext */}
      <p className="text-xs text-text-tertiary mt-2">
        Live from P&L sheet
      </p>
    </>
  );

  if (isClickable && onClick) {
    return (
      <motion.button
        className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-200 w-full text-left group"
        variants={cardAnimationVariants}
        whileHover={{ y: -2 }}
        onClick={onClick}
      >
        {cardContent}
      </motion.button>
    );
  }

  return (
    <motion.div
      className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-200"
      variants={cardAnimationVariants}
      whileHover={{ y: -2 }}
    >
      {cardContent}
    </motion.div>
  );
}

// Error Toast Component
function ErrorToast({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-50"
    >
      <div className="glass border border-status-danger/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-status-danger flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary font-medium mb-1">
            Couldn&apos;t fetch P&L data
          </p>
          <p className="text-xs text-text-secondary">
            {message}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="flex-shrink-0 px-3 py-1.5 bg-brand-primary hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    </motion.div>
  );
}

export default function PnLPage() {
  const [data, setData] = useState<PnLData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // Modal state for Property/Person
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPeriod, setModalPeriod] = useState<'month' | 'year'>('month');
  const [modalTotalExpense, setModalTotalExpense] = useState(0);

  // Modal state for Overhead Expenses
  const [isOverheadModalOpen, setIsOverheadModalOpen] = useState(false);
  const [overheadModalPeriod, setOverheadModalPeriod] = useState<'month' | 'year'>('month');
  const [overheadModalTotalExpense, setOverheadModalTotalExpense] = useState(0);

  const openPropertyPersonModal = (period: 'month' | 'year', totalExpense: number) => {
    setModalPeriod(period);
    setModalTotalExpense(totalExpense);
    setIsModalOpen(true);
  };

  const openOverheadExpensesModal = (period: 'month' | 'year', totalExpense: number) => {
    setOverheadModalPeriod(period);
    setOverheadModalTotalExpense(totalExpense);
    setIsOverheadModalOpen(true);
  };

  const fetchPnLData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/pnl');
      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to fetch P&L data');
      }

      setData(result.data);
      setLastUpdated(new Date(result.data.updatedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));

      // Log warnings and computed fallbacks to console for debugging (visible in admin page)
      if (result.warnings && result.warnings.length > 0) {
        console.warn('⚠️ P&L Warnings:', result.warnings);
      }
      if (result.computedFallbacks && result.computedFallbacks.length > 0) {
        console.log('→ Computed Fallbacks:', result.computedFallbacks);
      }
      if (result.matchInfo) {
        console.log('→ Match Info:', result.matchInfo);
      }

    } catch (err) {
      console.error('Error fetching P&L data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPnLData();
  }, []);

  return (
    <AdminShell>
      <div className="relative">
        <motion.div
          className="relative max-w-7xl mx-auto"
          variants={uiStaggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="mb-8" variants={cardAnimationVariants}>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                P&L Analytics
              </h1>
              <button
                onClick={fetchPnLData}
                disabled={isLoading}
                className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50 border border-slate-700/50"
                aria-label="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-slate-400">
              Detailed financial performance and breakdowns
            </p>
          {lastUpdated && !isLoading && (
            <p className="text-xs text-slate-500 mt-1">
              Last updated: {lastUpdated}
            </p>
          )}
        </motion.div>

        {/* Month KPIs */}
        <motion.div variants={cardAnimationVariants}>
          <h2 className="text-lg font-semibold text-white mb-4">
            Month to Date
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <KPICard
              title="Total Revenue"
              value={data?.month.revenue || 0}
              isCurrency
              period="month"
              isLoading={isLoading}
            />
            <KPICard
              title="Total Overheads"
              value={data?.month.overheads || 0}
              isCurrency
              period="month"
              isLoading={isLoading}
              isClickable
              onClick={() => openOverheadExpensesModal('month', data?.month.overheads || 0)}
            />
            <KPICard
              title="Property/Person Expense"
              value={data?.month.propertyPersonExpense || 0}
              isCurrency
              period="month"
              isLoading={isLoading}
              isClickable
              onClick={() => openPropertyPersonModal('month', data?.month.propertyPersonExpense || 0)}
            />
            <KPICard
              title="Gross Operating Profit"
              value={data?.month.gop || 0}
              isCurrency
              period="month"
              isLoading={isLoading}
            />
            <KPICard
              title="EBITDA Margin"
              value={data?.month.ebitdaMargin || 0}
              isPercentage
              period="month"
              isLoading={isLoading}
            />
          </div>
        </motion.div>

        {/* Year KPIs */}
        <motion.div variants={cardAnimationVariants}>
          <h2 className="text-lg font-semibold text-white mb-4">
            Year to Date
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              title="Total Revenue"
              value={data?.year.revenue || 0}
              isCurrency
              period="year"
              isLoading={isLoading}
            />
            <KPICard
              title="Total Overheads"
              value={data?.year.overheads || 0}
              isCurrency
              period="year"
              isLoading={isLoading}
              isClickable
              onClick={() => openOverheadExpensesModal('year', data?.year.overheads || 0)}
            />
            <KPICard
              title="Property/Person Expense"
              value={data?.year.propertyPersonExpense || 0}
              isCurrency
              period="year"
              isLoading={isLoading}
              isClickable
              onClick={() => openPropertyPersonModal('year', data?.year.propertyPersonExpense || 0)}
            />
            <KPICard
              title="Gross Operating Profit"
              value={data?.year.gop || 0}
              isCurrency
              period="year"
              isLoading={isLoading}
            />
            <KPICard
              title="EBITDA Margin"
              value={data?.year.ebitdaMargin || 0}
              isPercentage
              period="year"
              isLoading={isLoading}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Error Toast */}
      {error && (
        <ErrorToast
          message={error}
          onRetry={fetchPnLData}
        />
      )}

      {/* Property/Person Modal */}
      <PropertyPersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        period={modalPeriod}
        totalExpense={modalTotalExpense}
      />

      {/* Overhead Expenses Modal */}
      <OverheadExpensesModal
        isOpen={isOverheadModalOpen}
        onClose={() => setIsOverheadModalOpen(false)}
        period={overheadModalPeriod}
        totalExpense={overheadModalTotalExpense}
      />
      </div>
    </AdminShell>
  );
}

