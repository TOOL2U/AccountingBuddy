'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  // Mock data pre-filled
  const [formData, setFormData] = useState({
    date: '10/23/2025',
    vendor: 'HomePro Samui',
    amount: '1245',
    category: 'EXP - Construction - Structure',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mock alert for Stage 0
    alert(
      `Sending to Google Sheet:\n\n` +
      `Date: ${formData.date}\n` +
      `Vendor: ${formData.vendor}\n` +
      `Amount: ${formData.amount}\n` +
      `Category: ${formData.category}\n\n` +
      `In Stage 3, this will call the Sheets webhook API.`
    );

    // Show success toast (mock)
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push('/inbox');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Review Receipt
          </h1>
          <p className="text-sm text-gray-600">
            Review and edit the extracted information before sending to your sheet
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Field */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Date
            </label>
            <input
              type="text"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="MM/DD/YYYY"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Vendor Field */}
          <div>
            <label
              htmlFor="vendor"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Vendor
            </label>
            <input
              type="text"
              id="vendor"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              placeholder="Vendor name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Amount Field */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Amount
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Category Field */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., EXP - Construction - Structure"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/upload')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all"
            >
              Send to Google Sheet
            </button>
          </div>
        </form>
      </div>

      {/* Success Toast (hidden by default) */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg animate-slide-up">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✅</span>
            <span className="font-medium">Added to Google Sheet successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}

