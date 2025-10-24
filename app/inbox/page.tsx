'use client';

import { useState } from 'react';
import Link from 'next/link';

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
    <div className="max-w-6xl mx-auto px-4 py-12 page-transition">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inbox</h1>
        <p className="text-gray-600">
          View and manage your processed receipts
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receipt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {receipt.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{receipt.vendor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{receipt.amount} THB</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{receipt.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      receipt.status === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {receipt.status === 'sent' ? '✓ Sent' : '⏳ Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(receipt.id)}
                    className="text-red-600 hover:text-red-900 active:text-red-950 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {receipts.map((receipt) => (
          <div
            key={receipt.id}
            className="bg-white rounded-lg shadow-sm p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{receipt.name}</p>
                <p className="text-sm text-gray-600">{receipt.vendor}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  receipt.status === 'sent'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {receipt.status === 'sent' ? '✓ Sent' : '⏳ Pending'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium text-gray-900">{receipt.amount} THB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-900">{receipt.date}</span>
            </div>
            <button
              onClick={() => handleDelete(receipt.id)}
              className="w-full mt-2 px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {receipts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No receipts yet
          </h3>
          <p className="text-gray-600 mb-6">
            Upload your first receipt to get started
          </p>
          <Link
            href="/upload"
            className="inline-block bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium rounded-md px-6 py-3 shadow-sm hover:shadow-md transition-all duration-200"
          >
            Upload Receipt
          </Link>
        </div>
      )}

      {/* Back to Upload Link */}
      {receipts.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            href="/upload"
            className="text-blue-500 hover:text-blue-600 active:text-blue-700 font-medium transition-colors duration-200"
          >
            ← Back to Upload
          </Link>
        </div>
      )}
    </div>
  );
}

