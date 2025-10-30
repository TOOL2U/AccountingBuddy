'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Banknote, 
  Camera, 
  Upload, 
  Save, 
  Lock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  History,
} from 'lucide-react';
import { formatTHB, formatVariance } from '@/utils/currency';

export default function BalancePage() {
  // PIN gate state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Balance state
  const [bankBalance, setBankBalance] = useState<number | null>(null);
  const [cashBalance, setCashBalance] = useState<number | null>(null);
  const [monthNetCash, setMonthNetCash] = useState<number>(0);
  const [yearNetCash, setYearNetCash] = useState<number>(0);

  // Property balances state
  const [propertyBalances, setPropertyBalances] = useState<any[]>([]);
  const [loadingPropertyBalances, setLoadingPropertyBalances] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // OCR state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedBalance, setExtractedBalance] = useState<number | null>(null);

  // Manual input state
  const [bankInput, setBankInput] = useState('');
  const [cashInput, setCashInput] = useState('');
  const [selectedBank, setSelectedBank] = useState('Bank Transfer - Bangkok Bank - Shaun Ducker');

  const CORRECT_PIN = '1234';

  // Available banks (from options.json)
  const AVAILABLE_BANKS = [
    'Bank Transfer - Bangkok Bank - Shaun Ducker',
    'Bank Transfer - Bangkok Bank - Maria Ren',
    'Bank transfer - Krung Thai Bank - Family Account',
    'Cash',
  ];

  // Check session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pinOk = sessionStorage.getItem('ab_balance_pin_ok');
      if (pinOk === '1') {
        setIsUnlocked(true);
        loadBalances();
        loadPropertyBalances();
      }
    }
  }, []);

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Handle PIN submission
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setIsUnlocked(true);
      setPinError(false);
      sessionStorage.setItem('ab_balance_pin_ok', '1');
      showToast('Access granted!', 'success');
      loadBalances();
      loadPropertyBalances();
    } else {
      setPinError(true);
      setPin('');
      showToast('Incorrect PIN', 'error');
      setTimeout(() => setPinError(false), 500);
    }
  };

  // Load balances from API
  const loadBalances = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/balance/get', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to load balances');
      }

      const data = await response.json();

      if (data.ok && data.latest) {
        setBankBalance(data.latest.bankBalance || 0);
        setCashBalance(data.latest.cashBalance || 0);
        setBankInput(String(data.latest.bankBalance || 0));
        setCashInput(String(data.latest.cashBalance || 0));
      }

      if (data.ok && data.reconcile) {
        setMonthNetCash(data.reconcile.monthNetCash || 0);
        setYearNetCash(data.reconcile.yearNetCash || 0);
      }
    } catch (error) {
      console.error('Load balances error:', error);
      showToast('Failed to load balances', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load property-specific balances
  const loadPropertyBalances = async () => {
    setLoadingPropertyBalances(true);
    try {
      const response = await fetch('/api/balance/by-property', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to load property balances');
      }

      const data = await response.json();

      if (data.ok && data.propertyBalances) {
        setPropertyBalances(data.propertyBalances);
      }
    } catch (error) {
      console.error('Load property balances error:', error);
      showToast('Failed to load property balances', 'error');
    } finally {
      setLoadingPropertyBalances(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setExtractedBalance(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Extract balance from screenshot
  const handleExtract = async () => {
    if (!selectedFile) return;

    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/balance/ocr', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.bankBalance !== null && data.bankBalance !== undefined) {
        setExtractedBalance(data.bankBalance);
        showToast(`Detected balance: ${formatTHB(data.bankBalance)}`, 'success');
      } else {
        showToast(data.error || 'Could not detect balance', 'error');
      }
    } catch (error) {
      console.error('Extract error:', error);
      showToast('Failed to extract balance', 'error');
    } finally {
      setExtracting(false);
    }
  };

  // Use extracted balance
  const handleUseExtracted = () => {
    if (extractedBalance !== null) {
      setBankInput(String(extractedBalance));
      setSelectedFile(null);
      setPreview(null);
      setExtractedBalance(null);
    }
  };

  // Save bank balance (NEW: uses bankName + balance format)
  const handleSaveBank = async () => {
    const value = parseFloat(bankInput);
    if (isNaN(value) || value < 0) {
      showToast('Invalid bank balance', 'error');
      return;
    }

    console.log('💰 [SAVE BANK] Preparing to save:', {
      selectedBank,
      value,
      bankInput
    });

    setSaving(true);
    try {
      const payload = {
        bankName: selectedBank,
        balance: value,
        note: 'Manual entry',
      };

      console.log('📤 [SAVE BANK] Sending payload:', payload);

      const response = await fetch('/api/balance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('📥 [SAVE BANK] Response:', data);

      if (data.ok) {
        setBankBalance(value);
        console.log('✅ [SAVE BANK] Success! Saved:', selectedBank, '=', value);
        showToast(`${selectedBank} balance saved!`, 'success');
        await loadBalances();
        await loadPropertyBalances(); // Refresh running balances
        setBankInput(''); // Clear input
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('❌ [SAVE BANK] Error:', error);
      showToast('Failed to save bank balance', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save cash balance (NEW: uses bankName + balance format)
  const handleSaveCash = async () => {
    const value = parseFloat(cashInput);
    if (isNaN(value) || value < 0) {
      showToast('Invalid cash balance', 'error');
      return;
    }

    console.log('💵 [SAVE CASH] Preparing to save:', {
      value,
      cashInput
    });

    setSaving(true);
    try {
      const payload = {
        bankName: 'Cash',
        balance: value,
        note: 'Manual entry',
      };

      console.log('📤 [SAVE CASH] Sending payload:', payload);

      const response = await fetch('/api/balance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('📥 [SAVE CASH] Response:', data);

      if (data.ok) {
        setCashBalance(value);
        console.log('✅ [SAVE CASH] Success! Saved: Cash =', value);
        showToast('Cash balance saved!', 'success');
        await loadBalances();
        await loadPropertyBalances(); // Refresh running balances
        setCashInput(''); // Clear input
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('❌ [SAVE CASH] Error:', error);
      showToast('Failed to save cash balance', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Calculate variances
  const totalBalance = (bankBalance || 0) + (cashBalance || 0);
  const monthVariance = totalBalance - monthNetCash;
  const yearVariance = totalBalance - yearNetCash;

  const monthVarianceFormatted = formatVariance(monthVariance);
  const yearVarianceFormatted = formatVariance(yearVariance);

  // PIN gate UI
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-surface-1 border border-border-light rounded-2xl p-8 shadow-elev-2">
            {/* Lock icon */}
            <motion.div
              className="flex justify-center mb-6"
              animate={pinError ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-brand-primary" />
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-brand-primary to-status-info bg-clip-text text-transparent">
              Balance Manager
            </h1>
            <p className="text-text-secondary text-center mb-6">
              Enter PIN to access
            </p>

            {/* PIN form */}
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4-digit PIN"
                className="w-full px-4 py-3 bg-surface-2 border border-border-light rounded-xl text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-primary"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-brand-primary to-status-info text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Unlock
              </button>
            </form>

            {/* Note */}
            <p className="text-xs text-text-tertiary text-center mt-4">
              Convenience lock only (not secure)
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main balance UI
  return (
    <div className="min-h-screen bg-surface-0 pb-24 page-balance">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-0/80 backdrop-blur-xl border-b border-border-light">
        <div className="max-w-4xl mx-auto px-2 md:px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-brand-primary to-status-info bg-clip-text text-transparent">
                Balance Manager
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                Track bank & cash balances
              </p>
            </div>
            <button
              onClick={() => {
                loadBalances();
                loadPropertyBalances();
              }}
              disabled={loading || loadingPropertyBalances}
              className="p-2 hover:bg-surface-1 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading || loadingPropertyBalances ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-2 md:px-4 py-6 space-y-6">
        {/* Bank Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-1 border border-border-light rounded-2xl p-6 shadow-elev-1"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Bank Balance</h2>
              <p className="text-text-secondary text-sm">From bank app screenshot</p>
            </div>
          </div>

          {/* Current balance display */}
          <div className="mb-6">
            <div className="text-3xl md:text-4xl font-bold text-brand-primary">
              {bankBalance !== null ? formatTHB(bankBalance) : '฿0.00'}
            </div>
          </div>

          {/* Screenshot upload */}
          {!preview && (
            <div className="mb-4">
              <label className="block">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border-light rounded-xl p-6 text-center cursor-pointer hover:border-brand-primary transition-colors">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
                  <p className="text-sm text-text-secondary">
                    Upload bank app screenshot
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Preview and extract */}
          {preview && (
            <div className="mb-4 space-y-3">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleExtract}
                  disabled={extracting}
                  className="flex-1 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {extracting ? 'Extracting...' : 'Extract Balance'}
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    setExtractedBalance(null);
                  }}
                  className="px-4 py-2 bg-surface-2 rounded-lg hover:bg-surface-3 transition-colors"
                >
                  Cancel
                </button>
              </div>
              {extractedBalance !== null && (
                <button
                  onClick={handleUseExtracted}
                  className="w-full py-2 bg-status-success text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Use {formatTHB(extractedBalance)}
                </button>
              )}
            </div>
          )}

          {/* Manual input */}
          <div className="space-y-3">
            {/* Bank selector */}
            <label className="block">
              <span className="text-sm text-text-secondary mb-1 block">
                Select bank account
              </span>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-4 py-3 bg-surface-2 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {AVAILABLE_BANKS.filter(b => b !== 'Cash').map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </label>

            {/* Balance input */}
            <label className="block">
              <span className="text-sm text-text-secondary mb-1 block">
                Enter balance amount
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={bankInput}
                onChange={(e) => setBankInput(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-surface-2 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </label>
            <button
              onClick={handleSaveBank}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-brand-primary to-status-info text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Bank Balance'}
            </button>
          </div>
        </motion.div>

        {/* Cash Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-1 border border-border-light rounded-2xl p-6 shadow-elev-1"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-status-success/10 flex items-center justify-center">
              <Banknote className="w-6 h-6 text-status-success" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Cash in Hand</h2>
              <p className="text-text-secondary text-sm">Manual entry</p>
            </div>
          </div>

          {/* Current balance display */}
          <div className="mb-6">
            <div className="text-3xl md:text-4xl font-bold text-status-success">
              {cashBalance !== null ? formatTHB(cashBalance) : '฿0.00'}
            </div>
          </div>

          {/* Manual input */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-text-secondary mb-1 block">
                Enter cash amount
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-surface-2 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-status-success"
              />
            </label>
            <button
              onClick={handleSaveCash}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-status-success to-status-info text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Cash Balance'}
            </button>
          </div>
        </motion.div>

        {/* Property Balances Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-1 border border-border-light rounded-2xl p-6 shadow-elev-1"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-status-warning/10 flex items-center justify-center">
                <History className="w-6 h-6 text-status-warning" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Running Balances</h2>
                <p className="text-text-secondary text-sm">Uploaded balance + revenues - expenses</p>
              </div>
            </div>
            <button
              onClick={loadPropertyBalances}
              disabled={loadingPropertyBalances}
              className="p-2 hover:bg-surface-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPropertyBalances ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingPropertyBalances ? (
            <div className="text-center py-8 text-text-secondary">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Loading property balances...</p>
            </div>
          ) : propertyBalances.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <p>No balance uploads found</p>
              <p className="text-sm mt-1">Upload bank screenshots or enter cash balances to start tracking</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {propertyBalances.map((pb, index) => {
                const isPositive = pb.balance >= 0;
                const isCash = pb.property.toLowerCase() === 'cash';
                const hasVariance = pb.variance !== undefined && pb.variance !== 0;
                const variancePositive = (pb.variance || 0) >= 0;

                return (
                  <motion.div
                    key={pb.property}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-surface-2 rounded-xl border border-border-light hover:border-brand-primary/30 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {isCash ? (
                          <Banknote className="w-5 h-5 text-status-success" />
                        ) : (
                          <Wallet className="w-5 h-5 text-brand-primary" />
                        )}
                        <h3 className="font-semibold text-sm">{pb.property}</h3>
                      </div>
                      {pb.transactionCount > 0 && (
                        <span className="text-xs text-text-tertiary">
                          {pb.transactionCount} txn{pb.transactionCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Current Balance */}
                    <div className="mb-3">
                      <div className="text-xs text-text-secondary mb-1">Current Balance</div>
                      <div className={`text-2xl font-bold ${isPositive ? 'text-status-success' : 'text-status-danger'}`}>
                        {formatTHB(pb.balance)}
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2 pt-3 border-t border-border-light">
                      {/* Uploaded Balance */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-tertiary">Uploaded Balance</span>
                        <span className="font-medium">{formatTHB(pb.uploadedBalance || 0)}</span>
                      </div>

                      {/* Revenues */}
                      {pb.totalRevenue > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-text-tertiary">+ Revenues</span>
                          <span className="font-medium text-status-success">+{formatTHB(pb.totalRevenue)}</span>
                        </div>
                      )}

                      {/* Expenses */}
                      {pb.totalExpense > 0 && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-text-tertiary">- Expenses</span>
                          <span className="font-medium text-status-danger">-{formatTHB(pb.totalExpense)}</span>
                        </div>
                      )}

                      {/* Variance */}
                      {hasVariance && (
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-border-light">
                          <span className="text-text-tertiary">Change</span>
                          <span className={`font-semibold ${variancePositive ? 'text-status-success' : 'text-status-danger'}`}>
                            {variancePositive ? '+' : ''}{formatTHB(pb.variance)}
                          </span>
                        </div>
                      )}

                      {/* Upload Date */}
                      {pb.uploadedDate && (
                        <div className="text-xs text-text-tertiary pt-1">
                          Last upload: {new Date(pb.uploadedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Reconciliation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-1 border border-border-light rounded-2xl p-6 shadow-elev-1"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-status-info/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-status-info" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Reconciliation</h2>
              <p className="text-text-secondary text-sm">vs P&L net cash movement</p>
            </div>
          </div>

          {/* Total Balance */}
          <div className="mb-6 p-4 bg-surface-2 rounded-xl">
            <div className="text-sm text-text-secondary mb-1">Total Balance</div>
            <div className="text-2xl font-bold text-brand-primary">
              {formatTHB(totalBalance)}
            </div>
            <div className="text-xs text-text-tertiary mt-1">
              Bank + Cash
            </div>
          </div>

          {/* Month Variance */}
          <div className="mb-4 p-4 bg-surface-2 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-text-secondary">Month Net Cash (P&L)</div>
              <div className="text-sm font-semibold">{formatTHB(monthNetCash)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Variance (Month)</div>
              <div className={`text-lg font-bold ${monthVarianceFormatted.className}`}>
                {monthVarianceFormatted.formatted}
              </div>
            </div>
            {monthVarianceFormatted.color === 'success' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-status-success">
                <CheckCircle2 className="w-3 h-3" />
                <span>Within tolerance (±฿100)</span>
              </div>
            )}
            {monthVarianceFormatted.color === 'warning' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-status-warning">
                <AlertCircle className="w-3 h-3" />
                <span>Review recommended (±฿1,000)</span>
              </div>
            )}
            {monthVarianceFormatted.color === 'danger' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-status-danger">
                <AlertCircle className="w-3 h-3" />
                <span>Significant variance (&gt;฿1,000)</span>
              </div>
            )}
          </div>

          {/* Year Variance */}
          <div className="p-4 bg-surface-2 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-text-secondary">Year Net Cash (P&L)</div>
              <div className="text-sm font-semibold">{formatTHB(yearNetCash)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Variance (Year)</div>
              <div className={`text-lg font-bold ${yearVarianceFormatted.className}`}>
                {yearVarianceFormatted.formatted}
              </div>
            </div>
            {yearVarianceFormatted.color === 'success' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-status-success">
                <CheckCircle2 className="w-3 h-3" />
                <span>Within tolerance (±฿100)</span>
              </div>
            )}
            {yearVarianceFormatted.color === 'warning' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-status-warning">
                <AlertCircle className="w-3 h-3" />
                <span>Review recommended (±฿1,000)</span>
              </div>
            )}
            {yearVarianceFormatted.color === 'danger' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-status-danger">
                <AlertCircle className="w-3 h-3" />
                <span>Significant variance (&gt;฿1,000)</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className={`px-6 py-3 rounded-xl shadow-elev-3 flex items-center gap-3 ${
                toast.type === 'success'
                  ? 'bg-status-success text-white'
                  : 'bg-status-danger text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-semibold">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

