'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Inbox as InboxIcon, Sparkles, Trash2, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AdminShell from '@/components/layout/AdminShell';

interface Receipt {
  id: string;
  rowNumber: number;
  day: string;
  month: string;
  year: string;
  property: string;
  typeOfOperation: string;
  typeOfPayment: string;
  detail: string;
  ref: string;
  debit: number;
  credit: number;
  date: string;
  amount: number;
  status: 'sent' | 'pending';
}

export default function InboxPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch receipts from API
  const fetchReceipts = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch('/api/inbox');
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to fetch receipts');
      }

      setReceipts(data.data || []);
    } catch (err: any) {
      console.error('Error fetching receipts:', err);
      setError(err.message || 'Failed to load receipts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load receipts on mount
  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleDelete = async (receipt: Receipt) => {
    if (!confirm(`Are you sure you want to delete this entry?\n\n${receipt.detail} - ${receipt.amount} THB`)) {
      return;
    }

    try {
      const response = await fetch('/api/inbox', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rowNumber: receipt.rowNumber
        })
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to delete entry');
      }

      // Remove from local state
      setReceipts(receipts.filter((r) => r.id !== receipt.id));
    } catch (err: any) {
      console.error('Error deleting receipt:', err);
      alert('Failed to delete entry: ' + err.message);
    }
  };

  return (
    <AdminShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <InboxIcon className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">Inbox</h1>
                <p className="text-slate-400 text-sm mt-1">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    View and manage your processed entries
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchReceipts(true)}
              disabled={isRefreshing}
              className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50 border border-slate-700/50"
            >
              <RefreshCw className={`w-5 h-5 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <Card className="border-status-danger/30 bg-status-danger/10">
              <div className="flex items-center gap-3 text-status-danger">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Error loading receipts</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-4"
            >
              <RefreshCw className="w-12 h-12 text-brand-primary" />
            </motion.div>
            <p className="text-text-secondary">Loading receipts...</p>
          </motion.div>
        </Card>
      )}

      {/* Desktop Table View */}
      {!isLoading && receipts.length > 0 && (
        <div className="hidden sm:block bg-surface-1 border border-border-light rounded-2xl shadow-elev-1 overflow-x-auto">
          <table className="w-full divide-y divide-border-light">
            <thead className="bg-surface-2">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[25%]">
                  Detail
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[12%]">
                  Property
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[15%]">
                  Type
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[12%]">
                  Amount
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[12%]">
                  Date
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[12%]">
                  Status
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider w-[12%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              <AnimatePresence>
                {receipts.map((receipt, index) => (
                  <motion.tr
                    key={receipt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-surface-2 transition-colors group"
                  >
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-text-primary max-w-[280px] truncate">
                        {receipt.detail || '-'}
                      </div>
                      {receipt.ref && (
                        <div className="text-xs text-text-tertiary truncate max-w-[280px]">
                          Ref: {receipt.ref}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-text-secondary truncate max-w-[120px]">{receipt.property || '-'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs">
                        <div className="text-text-primary font-medium truncate max-w-[150px]">{receipt.typeOfOperation || '-'}</div>
                        <div className="text-text-tertiary truncate max-w-[150px]">{receipt.typeOfPayment || '-'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${receipt.debit > 0 ? 'text-status-danger' : 'text-status-success'}`}>
                        {receipt.debit > 0 ? `-${receipt.debit}` : `+${receipt.credit}`} THB
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-secondary">{receipt.date || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant="success">
                        ✓ Synced
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(receipt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden xl:inline">Delete</span>
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Card View */}
      {!isLoading && receipts.length > 0 && (
        <div className="sm:hidden space-y-4">
          <AnimatePresence>
            {receipts.map((receipt, index) => (
              <motion.div
                key={receipt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card hoverable>
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary truncate">{receipt.detail || 'No description'}</p>
                        <p className="text-xs text-text-tertiary">{receipt.property || '-'}</p>
                      </div>
                      <Badge variant="success">
                        ✓ Synced
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Type:</span>
                        <span className="text-text-primary font-medium">{receipt.typeOfOperation || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Payment:</span>
                        <span className="text-text-primary">{receipt.typeOfPayment || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Amount:</span>
                        <span className={`font-bold ${receipt.debit > 0 ? 'text-status-danger' : 'text-status-success'}`}>
                          {receipt.debit > 0 ? `-${receipt.debit}` : `+${receipt.credit}`} THB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Date:</span>
                        <span className="text-text-primary">{receipt.date || '-'}</span>
                      </div>
                      {receipt.ref && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Ref:</span>
                          <span className="text-text-primary text-xs">{receipt.ref}</span>
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(receipt)}
                      className="w-full mt-2 hover:bg-status-danger/10 hover:text-status-danger hover:border-status-danger/30"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Entry
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && receipts.length === 0 && !error && (
        <Card>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-12 text-center"
          >
            {/* Empty icon with animation */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <div className="p-6 bg-gradient-to-br from-surface-2 to-surface-1 rounded-2xl border border-border-light">
                <InboxIcon className="w-16 h-16 text-text-tertiary" />
              </div>
            </motion.div>

            <h3 className="text-xl font-bold text-text-primary mb-2">
              No entries yet
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Your inbox is empty. Upload a receipt or add a manual entry to get started.
            </p>
            <Link href="/upload">
              <Button
                variant="primary"
                className="bg-gradient-to-r from-status-info to-brand-primary hover:from-status-info/90 hover:to-brand-primary/90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </Link>
          </motion.div>
        </Card>
      )}

      {/* Back to Upload Link */}
      {!isLoading && receipts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            href="/upload"
            className="text-brand-primary hover:text-status-info font-medium transition-colors duration-200 inline-flex items-center gap-2 group"
          >
            <motion.span
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ←
            </motion.span>
            <span>Add More Entries</span>
          </Link>
        </motion.div>
      )}
      </motion.div>
    </AdminShell>
  );
}

