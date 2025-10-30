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
  Sparkles,
  BarChart3,
  Server,
  Eye
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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

  // OCR Test
  const [isTestingOCR, setIsTestingOCR] = useState(false);
  const [ocrResponse, setOcrResponse] = useState('');
  const [ocrFile, setOcrFile] = useState<File | null>(null);

  // AI Extraction Test
  const [isTestingExtraction, setIsTestingExtraction] = useState(false);
  const [extractionResponse, setExtractionResponse] = useState('');
  const [extractionText, setExtractionText] = useState('');

  // Balance Tests
  const [isTestingBalance, setIsTestingBalance] = useState(false);
  const [balanceResponse, setBalanceResponse] = useState('');
  const [balanceFile, setBalanceFile] = useState<File | null>(null);

  // Property/Person Test
  const [isTestingPropertyPerson, setIsTestingPropertyPerson] = useState(false);
  const [propertyPersonResponse, setPropertyPersonResponse] = useState('');
  const [propertyPersonPeriod, setPropertyPersonPeriod] = useState<'month' | 'year'>('month');

  // Delete Entry Test
  const [isTestingDelete, setIsTestingDelete] = useState(false);
  const [deleteResponse, setDeleteResponse] = useState('');
  const [deleteRowNumber, setDeleteRowNumber] = useState('');

  // Overhead Expenses Test
  const [isTestingOverhead, setIsTestingOverhead] = useState(false);
  const [overheadResponse, setOverheadResponse] = useState('');
  const [overheadPeriod, setOverheadPeriod] = useState<'month' | 'year'>('month');

  // Running Balance Test
  const [isTestingRunningBalance, setIsTestingRunningBalance] = useState(false);
  const [runningBalanceResponse, setRunningBalanceResponse] = useState('');

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
        property: 'Lanna House',
        typeOfOperation: 'EXP - Other Expenses',
        typeOfPayment: 'Cash',
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

  // OCR Test Handler
  const handleTestOCR = async () => {
    if (!ocrFile) {
      showToast('Please select an image file', 'error');
      return;
    }

    setIsTestingOCR(true);
    setOcrResponse('Testing OCR...');

    try {
      const formData = new FormData();
      formData.append('file', ocrFile);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setOcrResponse(JSON.stringify(data, null, 2));

      if (data.text) {
        showToast('OCR test successful!', 'success');
      } else {
        showToast('OCR test completed with warnings', 'error');
      }
    } catch (error) {
      console.error('OCR test error:', error);
      setOcrResponse(`Error: ${error}`);
      showToast('OCR test failed', 'error');
    } finally {
      setIsTestingOCR(false);
    }
  };

  // AI Extraction Test Handler
  const handleTestExtraction = async () => {
    if (!extractionText.trim()) {
      showToast('Please enter OCR text to extract', 'error');
      return;
    }

    setIsTestingExtraction(true);
    setExtractionResponse('Testing AI extraction...');

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractionText }),
      });

      const data = await response.json();
      setExtractionResponse(JSON.stringify(data, null, 2));

      if (data.day && data.typeOfOperation) {
        showToast('AI extraction test successful!', 'success');
      } else {
        showToast('AI extraction completed with warnings', 'error');
      }
    } catch (error) {
      console.error('Extraction test error:', error);
      setExtractionResponse(`Error: ${error}`);
      showToast('AI extraction test failed', 'error');
    } finally {
      setIsTestingExtraction(false);
    }
  };

  // Balance Save Test Handler
  const handleTestBalanceSave = async () => {
    setIsTestingBalance(true);
    setBalanceResponse('Testing balance save...');

    try {
      const testData = {
        bankBalance: 50000,
        cashBalance: 5000,
        note: 'Admin panel test - ' + new Date().toISOString(),
      };

      const response = await fetch('/api/balance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      setBalanceResponse(JSON.stringify(data, null, 2));

      if (data.success) {
        showToast('Balance save test successful!', 'success');
      } else {
        showToast('Balance save test failed', 'error');
      }
    } catch (error) {
      console.error('Balance save test error:', error);
      setBalanceResponse(`Error: ${error}`);
      showToast('Balance save test failed', 'error');
    } finally {
      setIsTestingBalance(false);
    }
  };

  // Balance Get Test Handler
  const handleTestBalanceGet = async () => {
    setIsTestingBalance(true);
    setBalanceResponse('Testing balance get...');

    try {
      const response = await fetch('/api/balance/get', {
        method: 'POST',
      });

      const data = await response.json();
      setBalanceResponse(JSON.stringify(data, null, 2));

      if (data.bankBalance !== undefined) {
        showToast('Balance get test successful!', 'success');
      } else {
        showToast('Balance get test failed', 'error');
      }
    } catch (error) {
      console.error('Balance get test error:', error);
      setBalanceResponse(`Error: ${error}`);
      showToast('Balance get test failed', 'error');
    } finally {
      setIsTestingBalance(false);
    }
  };

  // Balance OCR Test Handler
  const handleTestBalanceOCR = async () => {
    if (!balanceFile) {
      showToast('Please select a bank screenshot', 'error');
      return;
    }

    setIsTestingBalance(true);
    setBalanceResponse('Testing balance OCR...');

    try {
      const formData = new FormData();
      formData.append('file', balanceFile);

      const response = await fetch('/api/balance/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setBalanceResponse(JSON.stringify(data, null, 2));

      if (data.balance !== undefined) {
        showToast('Balance OCR test successful!', 'success');
      } else {
        showToast('Balance OCR test completed with warnings', 'error');
      }
    } catch (error) {
      console.error('Balance OCR test error:', error);
      setBalanceResponse(`Error: ${error}`);
      showToast('Balance OCR test failed', 'error');
    } finally {
      setIsTestingBalance(false);
    }
  };

  // Property/Person Test Handler
  const handleTestPropertyPerson = async () => {
    setIsTestingPropertyPerson(true);
    setPropertyPersonResponse('Testing property/person details...');

    try {
      const response = await fetch('/api/pnl/property-person', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: propertyPersonPeriod }),
      });

      const data = await response.json();
      setPropertyPersonResponse(JSON.stringify(data, null, 2));

      if (data.ok) {
        showToast('Property/Person test successful!', 'success');
      } else {
        showToast('Property/Person test failed', 'error');
      }
    } catch (error) {
      console.error('Property/Person test error:', error);
      setPropertyPersonResponse(`Error: ${error}`);
      showToast('Property/Person test failed', 'error');
    } finally {
      setIsTestingPropertyPerson(false);
    }
  };

  // Delete Entry Test Handler
  const handleTestDelete = async () => {
    if (!deleteRowNumber.trim()) {
      showToast('Please enter a row number', 'error');
      return;
    }

    const rowNum = parseInt(deleteRowNumber);
    if (isNaN(rowNum) || rowNum < 2) {
      showToast('Please enter a valid row number (>= 2)', 'error');
      return;
    }

    setIsTestingDelete(true);
    setDeleteResponse('Testing delete entry...');

    try {
      const response = await fetch('/api/inbox', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowNumber: rowNum }),
      });

      const data = await response.json();
      setDeleteResponse(JSON.stringify(data, null, 2));

      if (data.ok) {
        showToast('Delete test successful!', 'success');
      } else {
        showToast('Delete test failed', 'error');
      }
    } catch (error) {
      console.error('Delete test error:', error);
      setDeleteResponse(`Error: ${error}`);
      showToast('Delete test failed', 'error');
    } finally {
      setIsTestingDelete(false);
    }
  };

  // Overhead Expenses Test Handler
  const handleTestOverhead = async () => {
    setIsTestingOverhead(true);
    setOverheadResponse('Testing overhead expenses details...');

    try {
      const response = await fetch('/api/pnl/overhead-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: overheadPeriod }),
      });

      const data = await response.json();
      setOverheadResponse(JSON.stringify(data, null, 2));

      if (data.ok) {
        showToast('Overhead expenses test successful!', 'success');
      } else {
        showToast('Overhead expenses test failed', 'error');
      }
    } catch (error) {
      console.error('Overhead expenses test error:', error);
      setOverheadResponse(`Error: ${error}`);
      showToast('Overhead expenses test failed', 'error');
    } finally {
      setIsTestingOverhead(false);
    }
  };

  // Running Balance Test Handler
  const handleTestRunningBalance = async () => {
    setIsTestingRunningBalance(true);
    setRunningBalanceResponse('Testing running balance calculation...');

    try {
      const response = await fetch('/api/balance/by-property', {
        method: 'POST',
      });

      const data = await response.json();
      setRunningBalanceResponse(JSON.stringify(data, null, 2));

      if (data.ok) {
        showToast('Running balance test successful!', 'success');
      } else {
        showToast('Running balance test failed', 'error');
      }
    } catch (error) {
      console.error('Running balance test error:', error);
      setRunningBalanceResponse(`Error: ${error}`);
      showToast('Running balance test failed', 'error');
    } finally {
      setIsTestingRunningBalance(false);
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
      className="max-w-7xl mx-auto px-4 py-12 page-admin"
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
              <p className="text-xs text-text-secondary">Today&apos;s Entries</p>
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

      {/* New Test Cards Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-brand-primary" />
          Feature Tests
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OCR Test Card */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-status-info/20 to-brand-primary/20 rounded-xl">
                <Eye className="w-6 h-6 text-status-info" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">OCR Test</h3>
                <p className="text-xs text-text-secondary">Test Google Vision API</p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setOcrFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer"
              />
              <Button
                onClick={handleTestOCR}
                disabled={isTestingOCR || !ocrFile}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                {isTestingOCR ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Test OCR
                  </>
                )}
              </Button>
              {ocrResponse && (
                <pre className="text-xs bg-surface-2 p-3 rounded-lg overflow-auto max-h-40 text-text-secondary">
                  {ocrResponse}
                </pre>
              )}
            </div>
          </Card>

          {/* AI Extraction Test Card */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-status-success/20 to-brand-primary/20 rounded-xl">
                <Zap className="w-6 h-6 text-status-success" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">AI Extraction Test</h3>
                <p className="text-xs text-text-secondary">Test OpenAI GPT-4o</p>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                value={extractionText}
                onChange={(e) => setExtractionText(e.target.value)}
                placeholder="Paste OCR text here..."
                className="w-full h-24 px-3 py-2 bg-surface-2 border border-border-light rounded-lg text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
              <Button
                onClick={handleTestExtraction}
                disabled={isTestingExtraction || !extractionText.trim()}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                {isTestingExtraction ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Test Extraction
                  </>
                )}
              </Button>
              {extractionResponse && (
                <pre className="text-xs bg-surface-2 p-3 rounded-lg overflow-auto max-h-40 text-text-secondary">
                  {extractionResponse}
                </pre>
              )}
            </div>
          </Card>

          {/* Balance Tests Card */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-status-warning/20 to-brand-primary/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-status-warning" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Balance Tests</h3>
                <p className="text-xs text-text-secondary">Test balance feature</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleTestBalanceSave}
                  disabled={isTestingBalance}
                  variant="secondary"
                  size="sm"
                >
                  {isTestingBalance ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Save'
                  )}
                </Button>
                <Button
                  onClick={handleTestBalanceGet}
                  disabled={isTestingBalance}
                  variant="secondary"
                  size="sm"
                >
                  {isTestingBalance ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Get'
                  )}
                </Button>
              </div>

              <div>
                <label className="text-xs text-text-secondary mb-2 block">Bank Screenshot OCR:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBalanceFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer mb-2"
                />
                <Button
                  onClick={handleTestBalanceOCR}
                  disabled={isTestingBalance || !balanceFile}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  {isTestingBalance ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Test OCR
                    </>
                  )}
                </Button>
              </div>

              {balanceResponse && (
                <pre className="text-xs bg-surface-2 p-3 rounded-lg overflow-auto max-h-40 text-text-secondary">
                  {balanceResponse}
                </pre>
              )}
            </div>
          </Card>

          {/* Property/Person Test Card */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-brand-primary/20 to-status-info/20 rounded-xl">
                <Activity className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Property/Person Test</h3>
                <p className="text-xs text-text-secondary">Test expense breakdown</p>
              </div>
            </div>

            <div className="space-y-3">
              <select
                value={propertyPersonPeriod}
                onChange={(e) => setPropertyPersonPeriod(e.target.value as 'month' | 'year')}
                className="w-full px-3 py-2 bg-surface-2 border border-border-light rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              >
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
              <Button
                onClick={handleTestPropertyPerson}
                disabled={isTestingPropertyPerson}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                {isTestingPropertyPerson ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Test
                  </>
                )}
              </Button>
              {propertyPersonResponse && (
                <pre className="text-xs bg-surface-2 p-3 rounded-lg overflow-auto max-h-40 text-text-secondary">
                  {propertyPersonResponse}
                </pre>
              )}
            </div>
          </Card>

          {/* Delete Entry Test Card */}
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-status-danger/20 to-brand-primary/20 rounded-xl">
                <XCircle className="w-6 h-6 text-status-danger" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Delete Entry Test</h3>
                <p className="text-xs text-text-secondary">Test entry deletion (use with caution)</p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="number"
                value={deleteRowNumber}
                onChange={(e) => setDeleteRowNumber(e.target.value)}
                placeholder="Row number (e.g., 10)"
                min="2"
                className="w-full px-3 py-2 bg-surface-2 border border-border-light rounded-lg text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
              <Button
                onClick={handleTestDelete}
                disabled={isTestingDelete || !deleteRowNumber.trim()}
                variant="danger"
                size="sm"
                className="w-full"
              >
                {isTestingDelete ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Test Delete
                  </>
                )}
              </Button>
              {deleteResponse && (
                <pre className="text-xs bg-surface-2 p-3 rounded-lg overflow-auto max-h-40 text-text-secondary">
                  {deleteResponse}
                </pre>
              )}
            </div>
          </Card>

          {/* Overhead Expenses Test Card */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-status-warning/20 to-brand-primary/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-status-warning" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Overhead Expenses Test</h3>
                <p className="text-xs text-text-secondary">Test overhead expenses breakdown (V7.1)</p>
              </div>
            </div>

            <div className="space-y-3">
              <select
                value={overheadPeriod}
                onChange={(e) => setOverheadPeriod(e.target.value as 'month' | 'year')}
                className="w-full px-3 py-2 bg-surface-2 border border-border-light rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              >
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
              <Button
                onClick={handleTestOverhead}
                disabled={isTestingOverhead}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                {isTestingOverhead ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Test Overhead
                  </>
                )}
              </Button>
              {overheadResponse && (
                <pre className="text-xs bg-surface-2 p-3 rounded-lg overflow-auto max-h-40 text-text-secondary">
                  {overheadResponse}
                </pre>
              )}
            </div>
          </Card>

          {/* Running Balance Test Card */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-status-success/20 to-brand-primary/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-status-success" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Running Balance Test</h3>
                <p className="text-xs text-text-secondary">Test automatic balance calculation</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleTestRunningBalance}
                disabled={isTestingRunningBalance}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                {isTestingRunningBalance ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Test Running Balance
                  </>
                )}
              </Button>
              {runningBalanceResponse && (
                <pre className="text-xs bg-surface-2 p-3 rounded-lg overflow-auto max-h-40 text-text-secondary">
                  {runningBalanceResponse}
                </pre>
              )}
            </div>
          </Card>
        </div>
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

