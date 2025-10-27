'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Database,
  Activity,
  Zap,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Sparkles,
  BarChart3,
  Inbox,
  Upload,
  Server,
  Eye,
  Trash2
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface SystemStats {
  totalEntries: number;
  todayEntries: number;
  lastSync: string;
  cacheStatus: 'active' | 'expired' | 'empty';
}

interface ApiHealthCheck {
  endpoint: string;
  status: 'healthy' | 'error' | 'checking';
  responseTime?: number;
  message?: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<SystemStats>({
    totalEntries: 0,
    todayEntries: 0,
    lastSync: 'Never',
    cacheStatus: 'empty'
  });
  const [apiHealth, setApiHealth] = useState<ApiHealthCheck[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<string>('');
  const [namedRanges, setNamedRanges] = useState<any[]>([]);
  const [showNamedRanges, setShowNamedRanges] = useState(false);
  const [isLoadingRanges, setIsLoadingRanges] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load system stats
  useEffect(() => {
    loadSystemStats();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSystemStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch('/api/inbox');
      const data = await response.json();

      if (data.ok) {
        const entries = data.data || [];
        const today = new Date().toDateString();
        const todayCount = entries.filter((e: any) => {
          const entryDate = new Date(`${e.month} ${e.day}, ${e.year}`);
          return entryDate.toDateString() === today;
        }).length;

        setStats({
          totalEntries: entries.length,
          todayEntries: todayCount,
          lastSync: data.cached ? 'Cached' : 'Just now',
          cacheStatus: data.cached ? 'active' : 'empty'
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookResponse('');

    try {
      const testPayload = {
        day: new Date().getDate().toString(),
        month: new Date().toLocaleString('en-US', { month: 'short' }),
        year: new Date().getFullYear().toString(),
        property: 'Test Property',
        typeOfOperation: 'TEST - Admin Panel',
        typeOfPayment: 'Test',
        detail: 'Admin panel webhook test',
        ref: 'ADMIN-TEST-' + Date.now(),
        debit: 100,
        credit: 0
      };

      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      const data = await response.json();
      setWebhookResponse(JSON.stringify(data, null, 2));

      if (data.ok) {
        showToast('Webhook test successful! Check your Google Sheet.', 'success');
        await loadSystemStats(); // Refresh stats
      } else {
        showToast('Webhook test failed: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setWebhookResponse(JSON.stringify({ error: errorMessage }, null, 2));
      showToast('Webhook test failed: ' + errorMessage, 'error');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleCheckApiHealth = async () => {
    const endpoints = [
      { name: 'Inbox API', url: '/api/inbox' },
      { name: 'P&L API', url: '/api/pnl' },
      { name: 'Sheets Webhook', url: '/api/sheets' }
    ];

    const checks: ApiHealthCheck[] = endpoints.map(e => ({
      endpoint: e.name,
      status: 'checking'
    }));
    setApiHealth(checks);

    for (let i = 0; i < endpoints.length; i++) {
      const start = Date.now();
      try {
        const response = await fetch(endpoints[i].url);
        const responseTime = Date.now() - start;

        checks[i] = {
          endpoint: endpoints[i].name,
          status: response.ok ? 'healthy' : 'error',
          responseTime,
          message: response.ok ? `${responseTime}ms` : `HTTP ${response.status}`
        };
      } catch (error) {
        checks[i] = {
          endpoint: endpoints[i].name,
          status: 'error',
          message: 'Failed to connect'
        };
      }
      setApiHealth([...checks]);
    }
  };

  const handleLoadNamedRanges = async () => {
    setIsLoadingRanges(true);
    try {
      const response = await fetch('/api/pnl/namedRanges');
      const data = await response.json();

      if (data.ok) {
        setNamedRanges(data.pnlRelated || []);
        setShowNamedRanges(true);
        showToast(`Found ${data.pnlRelatedCount} P&L-related named ranges`, 'success');
      } else {
        showToast('Failed to load named ranges', 'error');
      }
    } catch (error) {
      showToast('Error loading named ranges', 'error');
    } finally {
      setIsLoadingRanges(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/inbox');
      const data = await response.json();

      if (data.ok) {
        const jsonStr = JSON.stringify(data.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accounting-buddy-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Data exported successfully!', 'success');
      }
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 py-12"
    >
      {/* Header with stunning design */}
      <div className="mb-8 text-center relative">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
          className="inline-block mb-4 relative z-10"
        >
          <div className="relative">
            {/* Glow ring */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="absolute inset-0 bg-gradient-to-r from-brand-primary via-status-info to-brand-primary rounded-full blur-xl opacity-50"
            />

            {/* Icon container */}
            <div className="relative bg-gradient-to-br from-brand-primary to-status-info p-4 rounded-2xl shadow-elev-3">
              <Settings className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl md:text-5xl font-extrabold mb-3 relative z-10"
        >
          <span className="bg-gradient-to-r from-brand-primary via-status-info to-brand-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Admin Panel
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-text-secondary text-sm md:text-base font-medium mb-4 relative z-10"
        >
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            System management and monitoring
          </span>
        </motion.p>
      </div>

      {/* Webhook Testing Card */}
      <motion.div className="glass rounded-2xl p-6 mb-6" variants={cardAnimationVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
            <Webhook className="w-5 h-5 text-accent-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            Webhook Testing
          </h2>
        </div>

        <p className="text-text-secondary mb-4 text-sm">
          Test the Google Sheets webhook integration and view the response.
        </p>

        <div className="flex gap-3 mb-4">
          <button
            onClick={handleTestWebhook}
            disabled={isTestingWebhook}
            className="flex-1 sm:flex-none bg-accent-primary hover:bg-accent-hover text-white font-medium rounded-xl px-6 py-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-dark-base"
          >
            {isTestingWebhook ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Webhook className="w-4 h-4" />
                Test Webhook
              </>
            )}
          </button>

          <button
            onClick={handleCopyDebugJSON}
            className="glass glass-hover text-text-primary font-medium rounded-xl px-6 py-2.5 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-dark-base"
          >
            <Copy className="w-4 h-4" />
            Copy Debug JSON
          </button>
        </div>

        {/* Response Block */}
        {webhookResponse && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Response:
            </label>
            <pre className="bg-black/30 border border-white/10 rounded-lg p-4 text-xs text-text-primary font-mono overflow-x-auto">
              {webhookResponse}
            </pre>
          </div>
        )}
      </motion.div>

      {/* Recent Events Card */}
      <motion.div className="glass rounded-2xl p-6" variants={cardAnimationVariants}>
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Recent Events
        </h2>

        {events.length === 0 ? (
          <p className="text-text-meta text-sm text-center py-8">
            No events yet. Test the webhook to see events here.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getStatusIcon(event.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium">
                      {event.message}
                    </p>
                    <p className="text-xs text-text-meta mt-1">
                      {event.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {events.length > 0 && (
          <button
            onClick={() => {
              setEvents([]);
              localStorage.removeItem('webhook_events');
            }}
            className="mt-4 w-full text-sm text-accent-danger hover:text-red-400 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-danger/50 focus:ring-offset-2 focus:ring-offset-dark-base rounded px-2 py-1"
          >
            Clear All Events
          </button>
        )}
      </motion.div>

      {/* Copied Toast */}
      {copiedToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-accent-success text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
        >
          <CheckCircle className="w-5 h-5" />
          Copied to clipboard!
        </motion.div>
      )}
    </motion.div>
  );
}

