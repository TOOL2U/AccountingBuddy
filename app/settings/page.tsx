'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import CategoryTable from '@/components/settings/CategoryTable';
import { Settings as SettingsIcon, Info, RefreshCw } from 'lucide-react';

interface OptionsData {
  properties: string[];
  typeOfOperations: string[];
  typeOfPayments: string[];
}

export default function SettingsPage() {
  const [data, setData] = useState<OptionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/options');
      const result = await res.json();

      if (result.ok && result.data) {
        setData(result.data);
        setLastUpdated(result.updatedAt ? new Date(result.updatedAt).toLocaleString() : '');
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-white">Settings</h1>
            </div>
            <button
              onClick={fetchOptions}
              disabled={loading}
              className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50 border border-slate-700/50"
              aria-label="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-slate-400">Manage business categories and configuration</p>
          {lastUpdated && (
            <p className="text-xs text-slate-500 mt-2">
              Last synced from Google Sheets: {lastUpdated}
            </p>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-2">Category Management (Coming Soon)</h3>
              <p className="text-slate-300 text-sm mb-3">
                Changes made here will automatically update your Google Sheet and roll out to both web and mobile apps.
              </p>
              <p className="text-slate-400 text-xs">
                For now, this page displays your current categories in read-only mode. 
                Full editing capabilities will be available in Phase 3.
              </p>
            </div>
          </div>
        </div>

        {/* Category Tables */}
        <div className="space-y-6">
          {/* Properties */}
          <CategoryTable
            title="Properties"
            description="Locations and properties in your business"
            items={data?.properties || []}
            loading={loading}
            icon="🏠"
          />

          {/* Type of Operations */}
          <CategoryTable
            title="Type of Operations"
            description="Revenue and expense categories"
            items={data?.typeOfOperations || []}
            loading={loading}
            icon="💼"
          />

          {/* Type of Payments */}
          <CategoryTable
            title="Type of Payments"
            description="Payment methods and accounts"
            items={data?.typeOfPayments || []}
            loading={loading}
            icon="💳"
          />
        </div>

        {/* Future Features Preview */}
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Coming in Phase 3</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-green-500">✓</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Add New Categories</p>
                <p className="text-slate-400 text-xs mt-1">
                  Create new expense types, properties, or payment methods
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-green-500">✓</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Edit Existing Items</p>
                <p className="text-slate-400 text-xs mt-1">
                  Rename or modify category names
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-green-500">✓</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Archive Categories</p>
                <p className="text-slate-400 text-xs mt-1">
                  Hide unused categories without deleting data
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-green-500">✓</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Auto-Sync to Mobile</p>
                <p className="text-slate-400 text-xs mt-1">
                  Changes instantly available in mobile app dropdowns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

