'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { Wallet, TrendingUp, TrendingDown, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface Balance {
  bankName: string;
  balance: number;
  uploadedBalance?: number;
  uploadedDate?: string;
  totalRevenue?: number;
  totalExpense?: number;
  transactionCount?: number;
  variance?: number;
  timestamp?: string;
}

export default function BalanceAnalyticsPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchBalances = async () => {
    setLoading(true);
    try {
      // Use the running balance endpoint that tracks expenses
      const res = await fetch('/api/balance/by-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();

      if (data.ok && data.propertyBalances) {
        // Map propertyBalances to Balance format
        const balancesArray = data.propertyBalances.map((pb: any) => ({
          bankName: pb.property,
          balance: pb.balance || pb.uploadedBalance, // Use current balance, fallback to uploaded
          uploadedBalance: pb.uploadedBalance,
          uploadedDate: pb.uploadedDate,
          totalRevenue: pb.totalRevenue,
          totalExpense: pb.totalExpense,
          transactionCount: pb.transactionCount,
          variance: pb.variance,
          timestamp: pb.uploadedDate
        }));
        setBalances(balancesArray);
        setLastUpdated(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const totalBalance = balances.reduce((sum, b) => sum + (b.balance || 0), 0);
  const cashBalance = balances.find(b => b.bankName === 'Cash')?.balance || 0;
  const bankBalance = balances.filter(b => b.bankName !== 'Cash').reduce((sum, b) => sum + (b.balance || 0), 0);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Cash & Bank Balances</h1>
            <p className="text-slate-400 mt-1">Monitor your cash flow and bank accounts</p>
            {lastUpdated && (
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
          <button
            onClick={fetchBalances}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50 border border-slate-700/50"
            aria-label="Refresh balances"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-slate-300 text-sm">Refresh</span>
          </button>
        </div>

        {/* Total Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <span className="text-white/80 text-sm">Total Available</span>
          </div>
          {loading ? (
            <div className="h-12 w-48 bg-white/20 animate-pulse rounded" />
          ) : (
            <div>
              <p className="text-5xl font-bold text-white mb-2">
                ฿{totalBalance.toLocaleString()}
              </p>
              <p className="text-white/80 text-sm">
                Cash + Bank Accounts
              </p>
            </div>
          )}
        </div>

        {/* Cash vs Bank Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cash Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Cash in Hand</p>
                <p className="text-xs text-slate-500">Physical currency</p>
              </div>
            </div>
            {loading ? (
              <div className="h-10 w-32 bg-slate-700/50 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-white">
                ฿{cashBalance.toLocaleString()}
              </p>
            )}
          </div>

          {/* Bank Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Bank Accounts</p>
                <p className="text-xs text-slate-500">Total in all banks</p>
              </div>
            </div>
            {loading ? (
              <div className="h-10 w-32 bg-slate-700/50 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-white">
                ฿{bankBalance.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Individual Account Balances */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Account Details</h2>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-700/50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : balances.length > 0 ? (
            <div className="space-y-3">
              {balances.map((balance, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      balance.bankName === 'Cash' 
                        ? 'bg-green-500/10' 
                        : 'bg-blue-500/10'
                    }`}>
                      <Wallet className={`w-5 h-5 ${
                        balance.bankName === 'Cash' 
                          ? 'text-green-500' 
                          : 'text-blue-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{balance.bankName}</p>
                      {balance.timestamp && (
                        <p className="text-xs text-slate-500 mt-1">
                          Updated: {new Date(balance.timestamp).toLocaleDateString()}
                        </p>
                      )}
                      {balance.transactionCount !== undefined && balance.transactionCount > 0 && (
                        <p className="text-xs text-slate-400 mt-1">
                          {balance.transactionCount} transaction{balance.transactionCount !== 1 ? 's' : ''} 
                          {balance.totalExpense! > 0 && ` • -฿${balance.totalExpense!.toLocaleString()} expenses`}
                          {balance.totalRevenue! > 0 && ` • +฿${balance.totalRevenue!.toLocaleString()} revenue`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      ฿{balance.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No balance data available</p>
              <p className="text-sm text-slate-500 mt-1">Use the mobile app to upload balances</p>
            </div>
          )}
        </div>

        {/* Balance History Preview (Placeholder for future) */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Balance Trend</h2>
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Historical trend coming soon</p>
            <p className="text-sm text-slate-500 mt-1">
              Track balance changes over time
            </p>
          </div>
        </div>

        {/* Warnings Section */}
        <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border border-yellow-700/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-white">Alerts & Warnings</h2>
          </div>
          <div className="space-y-2">
            {cashBalance < 10000 && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <p>Cash balance is below ฿10,000</p>
              </div>
            )}
            {!lastUpdated && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <p>No recent balance updates</p>
              </div>
            )}
            {cashBalance >= 10000 && lastUpdated && (
              <p className="text-slate-400 text-sm">No warnings at this time</p>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

