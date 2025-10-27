'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { uiStaggerContainer, cardAnimationVariants } from '@/hooks/usePageAnimations';

// Type definitions
interface PnLPeriodData {
  revenue: number;
  overheads: number;
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
function KPICard({ title, value, isPercentage, isCurrency, period, isLoading }: KPICardProps) {
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

  return (
    <motion.div
      className="glass rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-200"
      variants={cardAnimationVariants}
      whileHover={{ y: -2 }}
    >
      {/* Period Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
          {periodLabel}
        </span>
        {isCurrency && (
          <DollarSign className="w-4 h-4 text-brand-primary" />
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-text-secondary mb-2">
        {title}
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
  const [warnings, setWarnings] = useState<string[]>([]);
  const [computedFallbacks, setComputedFallbacks] = useState<string[]>([]);

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

      // Store warnings and computed fallbacks
      setWarnings(result.warnings || []);
      setComputedFallbacks(result.computedFallbacks || []);

      // Log to console for debugging
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
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none" aria-hidden="true" />

      <motion.div
        className="relative max-w-7xl mx-auto px-4 py-8 md:py-12"
        variants={uiStaggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={cardAnimationVariants}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
              P&L Dashboard
            </h1>
            <button
              onClick={fetchPnLData}
              disabled={isLoading}
              className="p-2 glass hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 text-text-secondary ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-text-secondary">
            Live KPIs from your Google Sheet
          </p>
          {lastUpdated && !isLoading && (
            <p className="text-xs text-text-tertiary mt-1">
              Last updated: {lastUpdated}
            </p>
          )}

          {/* Warnings and Computed Fallbacks */}
          {(warnings.length > 0 || computedFallbacks.length > 0) && !isLoading && (
            <div className="mt-4 space-y-2">
              {warnings.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-status-warning/10 border border-status-warning/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-status-warning flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-status-warning mb-1">Warnings</p>
                    <ul className="text-xs text-text-secondary space-y-1">
                      {warnings.map((warning, i) => (
                        <li key={i}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {computedFallbacks.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-brand-primary mb-1">Computed Values</p>
                    <ul className="text-xs text-text-secondary space-y-1">
                      {computedFallbacks.map((fallback, i) => (
                        <li key={i}>• {fallback}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Month KPIs */}
        <motion.div variants={cardAnimationVariants}>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Month to Date
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Year to Date
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
}

