'use client';

import { useRouter } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import { Smartphone, ArrowRight, Camera, Zap } from 'lucide-react';

export default function UploadRedirectPage() {
  const router = useRouter();

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Smartphone className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center border-4 border-slate-900">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Data Entry Has Moved to Mobile
          </h1>

          <p className="text-slate-300 text-lg mb-6">
            The webapp is now your <span className="text-blue-400 font-semibold">analytics dashboard</span>.
          </p>
          <p className="text-slate-400 mb-8">
            To add new transactions, receipts, or balances, please use the <strong>Accounting Buddy mobile app</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <Camera className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Quick Capture</p>
              <p className="text-slate-500 text-xs mt-1">Snap receipts on the go</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white text-sm font-medium">AI Extraction</p>
              <p className="text-slate-500 text-xs mt-1">Auto-fill from photos</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <Smartphone className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Mobile First</p>
              <p className="text-slate-500 text-xs mt-1">Designed for field use</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-slate-500 text-xs mt-8">
            This webapp is now focused on analytics, reporting, and settings management.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
