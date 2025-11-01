'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { TrendingUp, TrendingDown, Wallet, DollarSign, Activity } from 'lucide-react';

interface DashboardData {
  pnl: {
    revenue: number;
    expenses: number;
    gop: number;
    ebitdaMargin: number;
  } | null;
  balances: {
    cash: number;
    bank: number;
    total: number;
  } | null;
  recentActivity: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    pnl: null,
    balances: null,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch P&L summary
        const pnlRes = await fetch('/api/pnl');
        const pnlData = await pnlRes.json();

        // Fetch balances
        const balanceRes = await fetch('/api/balance/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const balanceData = await balanceRes.json();

        // Fetch recent inbox items
        const inboxRes = await fetch('/api/inbox');
        const inboxData = await inboxRes.json();

        setData({
          pnl: pnlData.ok ? {
            revenue: pnlData.data?.revenue || 0,
            expenses: (pnlData.data?.overheadExpenses || 0) + (pnlData.data?.propertyPersonCosts || 0),
            gop: pnlData.data?.gop || 0,
            ebitdaMargin: pnlData.data?.ebitdaMargin || 0
          } : null,
          balances: balanceData.ok ? {
            cash: balanceData.data?.find((b: any) => b.bankName === 'Cash')?.balance || 0,
            bank: balanceData.data?.find((b: any) => b.bankName !== 'Cash')?.balance || 0,
            total: balanceData.data?.reduce((sum: number, b: any) => sum + (b.balance || 0), 0) || 0
          } : null,
          recentActivity: inboxData.ok ? (inboxData.data || []).slice(0, 5) : []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your business performance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-slate-400">This Month</span>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Revenue</p>
              {loading ? (
                <div className="h-8 w-32 bg-slate-700/50 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-white">
                  ฿{data.pnl?.revenue.toLocaleString() || '0'}
                </p>
              )}
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-xs text-slate-400">This Month</span>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Expenses</p>
              {loading ? (
                <div className="h-8 w-32 bg-slate-700/50 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-white">
                  ฿{data.pnl?.expenses.toLocaleString() || '0'}
                </p>
              )}
            </div>
          </div>

          {/* GOP Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-xs text-slate-400">This Month</span>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">GOP</p>
              {loading ? (
                <div className="h-8 w-32 bg-slate-700/50 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-white">
                  ฿{data.pnl?.gop.toLocaleString() || '0'}
                </p>
              )}
            </div>
          </div>

          {/* Cash Balance Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-xs text-slate-400">Current</span>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Cash & Bank</p>
              {loading ? (
                <div className="h-8 w-32 bg-slate-700/50 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-white">
                  ฿{data.balances?.total.toLocaleString() || '0'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-700/50 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.detail || 'No description'}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {item.property} • {item.typeOfOperation}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${item.debit > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {item.debit > 0 ? '-' : '+'}฿{(item.debit || item.credit).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.day} {item.month} {item.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No recent activity</p>
              <p className="text-sm text-slate-500 mt-1">Use the mobile app to add transactions</p>
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EBITDA Margin */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">EBITDA Margin</h3>
            {loading ? (
              <div className="h-24 bg-slate-700/50 animate-pulse rounded" />
            ) : (
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {data.pnl?.ebitdaMargin.toFixed(1) || '0'}%
                  </p>
                  <p className="text-slate-400 mt-2">Profitability Ratio</p>
                </div>
              </div>
            )}
          </div>

          {/* Cash Breakdown */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Cash Breakdown</h3>
            {loading ? (
              <div className="h-24 bg-slate-700/50 animate-pulse rounded" />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cash in Hand</span>
                  <span className="text-white font-semibold">฿{data.balances?.cash.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bank Account</span>
                  <span className="text-white font-semibold">฿{data.balances?.bank.toLocaleString() || '0'}</span>
                </div>
                <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                    ฿{data.balances?.total.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

