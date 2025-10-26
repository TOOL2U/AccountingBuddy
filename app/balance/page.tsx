'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Toast, { ToastType } from '@/components/Toast';
import { formatTHB } from '@/utils/currency';

const CORRECT_PIN = '1234';
const PIN_SESSION_KEY = 'ab_pin_ok';

interface BalanceData {
  latest: {
    timestamp: string;
    bankBalance: number;
    cashBalance: number;
  };
  reconcile: {
    monthNetCash: number;
    yearNetCash: number;
  };
  history?: Array<{
    timestamp: string;
    bankBalance: number;
    cashBalance: number;
  }>;
}

export default function BalancePage() {
  const router = useRouter();
  
  // PIN gate state
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Balance data state
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [bankBalanceInput, setBankBalanceInput] = useState('');
  const [cashBalanceInput, setCashBalanceInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // OCR state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedBalance, setExtractedBalance] = useState<number | null>(null);
  const [ocrConfidence, setOcrConfidence] = useState<string>('');
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // Check PIN on mount
  useEffect(() => {
    const pinOk = sessionStorage.getItem(PIN_SESSION_KEY);
    if (pinOk === '1') {
      setIsPinUnlocked(true);
      fetchBalanceData();
    } else {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch balance data
  const fetchBalanceData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/balance/get');
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance data');
      }
      
      const data = await response.json();
      setBalanceData(data);
      
      // Pre-fill inputs with current values
      setBankBalanceInput(data.latest.bankBalance.toString());
      setCashBalanceInput(data.latest.cashBalance.toString());
      
    } catch (error) {
      console.error('Error fetching balance:', error);
      setToast({
        message: 'Failed to load balance data. Please refresh the page.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle PIN submission
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pinInput === CORRECT_PIN) {
      sessionStorage.setItem(PIN_SESSION_KEY, '1');
      setIsPinUnlocked(true);
      setPinError('');
      fetchBalanceData();
    } else {
      setPinError('Incorrect PIN. Try again.');
      setPinInput('');
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setExtractedBalance(null);
      setOcrConfidence('');
    }
  };
  
  // Handle OCR extraction
  const handleExtract = async () => {
    if (!selectedFile) return;
    
    try {
      setIsExtracting(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/balance/ocr', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.error) {
        setToast({ message: data.error, type: 'warning' });
        return;
      }
      
      setExtractedBalance(data.bankBalance);
      setOcrConfidence(data.confidence);
      
      if (data.bankBalance > 0) {
        setToast({
          message: `Balance detected: ${formatTHB(data.bankBalance)}`,
          type: 'success',
        });
      } else {
        setToast({
          message: 'No balance detected. Please try a clearer image.',
          type: 'warning',
        });
      }
      
    } catch (error) {
      console.error('OCR error:', error);
      setToast({ message: 'Failed to extract balance. Please try again.', type: 'error' });
    } finally {
      setIsExtracting(false);
    }
  };
  
  // Use extracted balance
  const handleUseExtracted = () => {
    if (extractedBalance !== null) {
      setBankBalanceInput(extractedBalance.toString());
      setToast({ message: 'Balance value applied', type: 'success' });
    }
  };
  
  // Save bank balance
  const handleSaveBankBalance = async () => {
    const value = parseFloat(bankBalanceInput);
    
    if (isNaN(value) || value < 0) {
      setToast({ message: 'Please enter a valid bank balance', type: 'error' });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/balance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankBalance: value }),
      });
      
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to save');
      }
      
      setToast({ message: 'Bank balance saved successfully', type: 'success' });
      
      // Refresh data
      await fetchBalanceData();
      
      // Clear OCR state
      setSelectedFile(null);
      setPreviewUrl(null);
      setExtractedBalance(null);
      
    } catch (error: any) {
      console.error('Save error:', error);
      setToast({ message: error.message || 'Failed to save bank balance', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save cash balance
  const handleSaveCashBalance = async () => {
    const value = parseFloat(cashBalanceInput);
    
    if (isNaN(value) || value < 0) {
      setToast({ message: 'Please enter a valid cash balance', type: 'error' });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/balance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashBalance: value }),
      });
      
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to save');
      }
      
      setToast({ message: 'Cash balance saved successfully', type: 'success' });
      
      // Refresh data
      await fetchBalanceData();
      
    } catch (error: any) {
      console.error('Save error:', error);
      setToast({ message: error.message || 'Failed to save cash balance', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Calculate variance
  const calculateVariance = (type: 'month' | 'year') => {
    if (!balanceData) return 0;
    
    const totalBalance = balanceData.latest.bankBalance + balanceData.latest.cashBalance;
    const netCash = type === 'month' 
      ? balanceData.reconcile.monthNetCash 
      : balanceData.reconcile.yearNetCash;
    
    return totalBalance - netCash;
  };
  
  // Get variance color
  const getVarianceColor = (variance: number) => {
    const abs = Math.abs(variance);
    if (abs <= 100) return 'text-accent-success';
    if (abs <= 1000) return 'text-accent-warn';
    return 'text-accent-danger';
  };
  
  // PIN gate UI
  if (!isPinUnlocked) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Balance Page</h1>
          <p className="text-text-secondary mb-6">Enter PIN to access</p>
          
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-text-secondary mb-2">
                4-Digit PIN
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-xl text-text-primary text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="••••"
                autoFocus
              />
              {pinError && (
                <p className="mt-2 text-sm text-accent-danger">{pinError}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={pinInput.length !== 4}
              className="w-full py-3 bg-accent-primary hover:bg-accent-hover text-dark-base font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Unlock
            </button>
          </form>
          
          <p className="mt-4 text-xs text-text-meta text-center">
            Convenience lock only (not secure)
          </p>
        </Card>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-base p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-48" />
            <div className="h-64 bg-white/10 rounded-2xl" />
            <div className="h-64 bg-white/10 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-base p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">Balance</h1>
          <button
            onClick={() => router.push('/')}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Bank Balance Card */}
        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Bank Balance</h2>

          {balanceData && (
            <div className="mb-6">
              <div className="text-3xl md:text-4xl font-bold text-accent-primary">
                {formatTHB(balanceData.latest.bankBalance)}
              </div>
              <div className="text-sm text-text-meta mt-1">
                Last updated: {new Date(balanceData.latest.timestamp).toLocaleString()}
              </div>
            </div>
          )}

          {/* Screenshot Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Upload Bank Screenshot
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileSelect}
                className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-primary file:text-dark-base hover:file:bg-accent-hover file:cursor-pointer"
              />
            </div>

            {previewUrl && (
              <div className="space-y-3">
                <img
                  src={previewUrl}
                  alt="Bank screenshot preview"
                  className="w-full max-h-64 object-contain rounded-lg border border-dark-border"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleExtract}
                    disabled={isExtracting}
                    className="flex-1 py-2 bg-accent-primary hover:bg-accent-hover text-dark-base font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isExtracting ? 'Extracting...' : 'Extract Balance'}
                  </button>

                  {extractedBalance !== null && (
                    <button
                      onClick={handleUseExtracted}
                      className="flex-1 py-2 bg-accent-success hover:bg-accent-success/80 text-white font-semibold rounded-lg transition-colors"
                    >
                      Use {formatTHB(extractedBalance)}
                    </button>
                  )}
                </div>

                {ocrConfidence && (
                  <div className="text-xs text-text-meta">
                    Confidence: {ocrConfidence}
                  </div>
                )}
              </div>
            )}

            {/* Manual Input */}
            <div>
              <label htmlFor="bankBalance" className="block text-sm font-medium text-text-secondary mb-2">
                Or Enter Manually
              </label>
              <div className="flex gap-3">
                <input
                  id="bankBalance"
                  type="number"
                  step="0.01"
                  min="0"
                  value={bankBalanceInput}
                  onChange={(e) => setBankBalanceInput(e.target.value)}
                  className="flex-1 px-4 py-2 bg-dark-elevated border border-dark-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="0.00"
                />
                <button
                  onClick={handleSaveBankBalance}
                  disabled={isSaving}
                  className="px-6 py-2 bg-accent-primary hover:bg-accent-hover text-dark-base font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Cash Balance Card */}
        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Cash in Hand</h2>

          {balanceData && (
            <div className="mb-6">
              <div className="text-3xl md:text-4xl font-bold text-accent-success">
                {formatTHB(balanceData.latest.cashBalance)}
              </div>
              <div className="text-sm text-text-meta mt-1">
                Last updated: {new Date(balanceData.latest.timestamp).toLocaleString()}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="cashBalance" className="block text-sm font-medium text-text-secondary mb-2">
              Enter Cash Amount
            </label>
            <div className="flex gap-3">
              <input
                id="cashBalance"
                type="number"
                step="0.01"
                min="0"
                value={cashBalanceInput}
                onChange={(e) => setCashBalanceInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-dark-elevated border border-dark-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="0.00"
              />
              <button
                onClick={handleSaveCashBalance}
                disabled={isSaving}
                className="px-6 py-2 bg-accent-primary hover:bg-accent-hover text-dark-base font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Card>

        {/* Reconciliation Card */}
        {balanceData && (
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Reconciliation</h2>

            <div className="space-y-4">
              {/* Total Balance */}
              <div className="p-4 bg-dark-elevated rounded-lg">
                <div className="text-sm text-text-secondary mb-1">Total Balance (Bank + Cash)</div>
                <div className="text-2xl font-bold text-text-primary">
                  {formatTHB(balanceData.latest.bankBalance + balanceData.latest.cashBalance)}
                </div>
              </div>

              {/* Month Reconciliation */}
              <div className="p-4 bg-dark-elevated rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm text-text-secondary">Month Net Cash (P&L)</div>
                    <div className="text-lg font-semibold text-text-primary">
                      {formatTHB(balanceData.reconcile.monthNetCash)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-text-secondary">Variance</div>
                    <div className={`text-lg font-semibold ${getVarianceColor(calculateVariance('month'))}`}>
                      {formatTHB(calculateVariance('month'))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Year Reconciliation */}
              <div className="p-4 bg-dark-elevated rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm text-text-secondary">Year Net Cash (P&L)</div>
                    <div className="text-lg font-semibold text-text-primary">
                      {formatTHB(balanceData.reconcile.yearNetCash)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-text-secondary">Variance</div>
                    <div className={`text-lg font-semibold ${getVarianceColor(calculateVariance('year'))}`}>
                      {formatTHB(calculateVariance('year'))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-text-meta">
                <p>• Green: variance ≤ ฿100</p>
                <p>• Amber: variance ≤ ฿1,000</p>
                <p>• Red: variance &gt; ฿1,000</p>
              </div>
            </div>
          </Card>
        )}

        {/* History Card */}
        {balanceData?.history && balanceData.history.length > 0 && (
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Recent History</h2>

            <div className="space-y-3">
              {balanceData.history.map((entry, index) => (
                <div
                  key={index}
                  className="p-3 bg-dark-elevated rounded-lg flex justify-between items-center"
                >
                  <div className="text-sm text-text-meta">
                    {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Bank: </span>
                      <span className="text-text-primary font-semibold">{formatTHB(entry.bankBalance)}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Cash: </span>
                      <span className="text-text-primary font-semibold">{formatTHB(entry.cashBalance)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

