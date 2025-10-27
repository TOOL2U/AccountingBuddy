'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface Receipt {
  id: string;
  name: string;
  vendor: string;
  amount: string;
  date: string;
  status: 'sent' | 'pending';
}

export default function InboxPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: '1',
      name: 'receipt-001.jpg',
      vendor: 'HomePro Samui',
      amount: '1245',
      date: '10/23/2025',
      status: 'sent',
    },
    {
      id: '2',
      name: 'receipt-002.pdf',
      vendor: 'Lotus Supermarket',
      amount: '850',
      date: '10/22/2025',
      status: 'sent',
    },
    {
      id: '3',
      name: 'receipt-003.jpg',
      vendor: 'Thai Watsadu',
      amount: '3200',
      date: '10/20/2025',
      status: 'pending',
    },
  ]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      setReceipts(receipts.filter((r) => r.id !== id));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 py-12"
    >
      <div className="mb-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold gradient-text mb-3"
        >
          📥 Inbox
        </motion.h1>
        <p className="text-text-secondary">
          View and manage your processed receipts
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-surface-1 border border-border-light rounded-2xl shadow-elev-1 overflow-hidden">
        <table className="min-w-full divide-y divide-border-light">
          <thead className="bg-surface-2">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Receipt
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {receipts.map((receipt, index) => (
              <motion.tr
                key={receipt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-surface-2 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-text-primary">
                    {receipt.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-text-secondary">{receipt.vendor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-text-primary font-medium">{receipt.amount} THB</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-text-secondary">{receipt.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={receipt.status === 'sent' ? 'success' : 'warning'}>
                    {receipt.status === 'sent' ? '✓ Sent' : '⏳ Pending'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(receipt.id)}
                    className="text-status-danger hover:text-red-400 active:text-red-500 transition-colors duration-200 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {receipts.map((receipt, index) => (
          <Card
            key={receipt.id}
            hoverable
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{receipt.name}</p>
                  <p className="text-sm text-text-secondary">{receipt.vendor}</p>
                </div>
                <Badge variant={receipt.status === 'sent' ? 'success' : 'warning'}>
                  {receipt.status === 'sent' ? '✓ Sent' : '⏳ Pending'}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Amount:</span>
                <span className="font-medium text-text-primary">{receipt.amount} THB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Date:</span>
                <span className="text-text-primary">{receipt.date}</span>
              </div>
              <Button
                variant="danger"
                onClick={() => handleDelete(receipt.id)}
                className="w-full mt-2"
              >
                Delete
              </Button>
            </motion.div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {receipts.length === 0 && (
        <Card>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-12 text-center"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No receipts yet
            </h3>
            <p className="text-text-secondary mb-6">
              Upload your first receipt to get started
            </p>
            <Link href="/upload">
              <Button variant="primary">
                Upload Receipt
              </Button>
            </Link>
          </motion.div>
        </Card>
      )}

      {/* Back to Upload Link */}
      {receipts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            href="/upload"
            className="text-brand-primary hover:text-blue-400 font-medium transition-colors duration-200 inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Upload</span>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}

