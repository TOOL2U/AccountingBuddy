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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
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

  const CORRECT_PIN = '1234';

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setIsUnlocked(true);
      setPinError(false);
      showToast('Access granted!', 'success');
    } else {
      setPinError(true);
      setPin('');
      showToast('Incorrect PIN', 'error');
      setTimeout(() => setPinError(false), 500);
    }
  };

  const handlePinChange = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value);
      setPinError(false);
    }
  };

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

  // Show unlock screen if not unlocked
  if (!isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-status-info/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-status-info/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="p-8">
            {/* Lock Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
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
                <div className="relative bg-gradient-to-br from-brand-primary to-status-info p-5 rounded-2xl shadow-elev-3">
                  <Settings className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-brand-primary via-status-info to-brand-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Admin Access
                </span>
              </h1>
              <p className="text-text-secondary text-sm">
                Enter PIN to continue
              </p>
            </motion.div>

            {/* PIN Form */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handlePinSubmit}
              className="space-y-6"
            >
              {/* PIN Input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3 text-center">
                  4-Digit PIN
                </label>
                <motion.input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••"
                  autoFocus
                  animate={pinError ? {
                    x: [-10, 10, -10, 10, 0],
                    transition: { duration: 0.4 }
                  } : {}}
                  className={`
                    w-full px-6 py-4 text-center text-2xl font-bold tracking-[0.5em]
                    bg-surface-2 border-2 rounded-xl
                    text-text-primary placeholder-text-tertiary
                    focus:outline-none focus:ring-2 focus:ring-brand-primary/50
                    transition-all duration-200
                    ${pinError
                      ? 'border-status-danger ring-2 ring-status-danger/50'
                      : 'border-border-light hover:border-brand-primary/50'}
                  `}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={pin.length !== 4}
                className="w-full bg-gradient-to-r from-brand-primary to-status-info hover:from-brand-primary/90 hover:to-status-info/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Unlock
                </span>
              </Button>
            </motion.form>

            {/* Hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-xs text-text-tertiary mt-6"
            >
              <span className="inline-flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Protected area - authorized access only
              </span>
            </motion.p>
          </Card>
        </motion.div>

        {/* Toast for unlock screen */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className={`
                px-6 py-3 rounded-xl shadow-elev-3 flex items-center gap-3
                ${toast.type === 'success'
                  ? 'bg-status-success text-white'
                  : 'bg-status-danger text-white'}
              `}>
                {toast.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{toast.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

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

      {/* System Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-primary/20 to-transparent rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-5 h-5 text-brand-primary" />
                {isLoadingStats && (
                  <RefreshCw className="w-4 h-4 text-text-tertiary animate-spin" />
                )}
              </div>
              <p className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
                {stats.totalEntries}
              </p>
              <p className="text-xs text-text-secondary">Total Entries</p>
            </div>
          </Card>
        </motion.div>

        {/* Today's Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-status-success/20 to-transparent rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-status-success" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-text-primary mb-1">
                {stats.todayEntries}
              </p>
              <p className="text-xs text-text-secondary">Today's Entries</p>
            </div>
          </Card>
        </motion.div>

        {/* Last Sync */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-status-info/20 to-transparent rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-status-info" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-text-primary mb-1 truncate">
                {stats.lastSync}
              </p>
              <p className="text-xs text-text-secondary">Last Sync</p>
            </div>
          </Card>
        </motion.div>

        {/* Cache Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-status-warning/20 to-transparent rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <Server className="w-5 h-5 text-status-warning" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-text-primary mb-1 capitalize">
                {stats.cacheStatus}
              </p>
              <p className="text-xs text-text-secondary">Cache Status</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Webhook Testing Card */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-brand-primary/20 to-status-info/20 rounded-xl">
              <Zap className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Webhook Testing</h2>
              <p className="text-sm text-text-secondary">Test Google Sheets integration</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              variant="primary"
              className="w-full bg-gradient-to-r from-brand-primary to-status-info hover:from-brand-primary/90 hover:to-status-info/90"
            >
              {isTestingWebhook ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Test Webhook
                </>
              )}
            </Button>

            {webhookResponse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Response:
                </label>
                <pre className="bg-surface-2 border border-border-light rounded-xl p-4 text-xs text-text-primary font-mono overflow-x-auto max-h-64">
                  {webhookResponse}
                </pre>
              </motion.div>
            )}
          </div>
        </Card>

        {/* API Health Check Card */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-status-success/20 to-status-info/20 rounded-xl">
              <Activity className="w-6 h-6 text-status-success" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">API Health</h2>
              <p className="text-sm text-text-secondary">Check endpoint status</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleCheckApiHealth}
              variant="secondary"
              className="w-full"
            >
              <Activity className="w-4 h-4 mr-2" />
              Check All Endpoints
            </Button>

            {apiHealth.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2 mt-4"
              >
                {apiHealth.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-surface-2 border border-border-light rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {check.status === 'checking' && (
                        <RefreshCw className="w-4 h-4 text-text-tertiary animate-spin" />
                      )}
                      {check.status === 'healthy' && (
                        <CheckCircle className="w-4 h-4 text-status-success" />
                      )}
                      {check.status === 'error' && (
                        <XCircle className="w-4 h-4 text-status-danger" />
                      )}
                      <span className="text-sm font-medium text-text-primary">
                        {check.endpoint}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary">
                      {check.message || 'Checking...'}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </Card>
      </div>

      {/* Data Management & Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Named Ranges Discovery */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-status-warning/20 to-status-info/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-status-warning" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">P&L Ranges</h3>
              <p className="text-xs text-text-secondary">View named ranges</p>
            </div>
          </div>
          <Button
            onClick={handleLoadNamedRanges}
            disabled={isLoadingRanges}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            {isLoadingRanges ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                View Ranges
              </>
            )}
          </Button>
        </Card>

        {/* Export Data */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-status-info/20 to-brand-primary/20 rounded-xl">
              <Download className="w-6 h-6 text-status-info" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Export Data</h3>
              <p className="text-xs text-text-secondary">Download as JSON</p>
            </div>
          </div>
          <Button
            onClick={handleExportData}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </Card>

        {/* Refresh Stats */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-status-success/20 to-brand-primary/20 rounded-xl">
              <RefreshCw className="w-6 h-6 text-status-success" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Refresh Stats</h3>
              <p className="text-xs text-text-secondary">Update dashboard</p>
            </div>
          </div>
          <Button
            onClick={loadSystemStats}
            disabled={isLoadingStats}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            {isLoadingStats ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </Card>
      </div>

      {/* Named Ranges Modal */}
      <AnimatePresence>
        {showNamedRanges && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNamedRanges(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-1 border border-border-light rounded-2xl shadow-elev-3 max-w-4xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-border-light">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">P&L Named Ranges</h2>
                    <p className="text-sm text-text-secondary mt-1">
                      {namedRanges.length} ranges found
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNamedRanges(false)}
                    className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-text-secondary" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                {namedRanges.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                    <p className="text-text-secondary">No P&L-related named ranges found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {namedRanges.map((range, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-surface-2 border border-border-light rounded-xl"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-text-primary mb-1">
                              {range.name}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-text-secondary">
                              <span>Sheet: {range.sheet}</span>
                              <span>Cell: {range.a1}</span>
                              <span>Type: {range.type}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-brand-primary">
                              {typeof range.value === 'number'
                                ? range.value.toLocaleString()
                                : range.value || '-'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`
              px-6 py-3 rounded-xl shadow-elev-3 flex items-center gap-3
              ${toast.type === 'success'
                ? 'bg-status-success text-white'
                : 'bg-status-danger text-white'}
            `}>
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

