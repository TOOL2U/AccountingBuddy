'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cacheVendorCategory } from '@/utils/vendorCache';

export default function ReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isSending, setIsSending] = useState(false);

  // Form data state - will be populated from URL parameter
  const [formData, setFormData] = useState({
    date: '',
    vendor: '',
    amount: '',
    category: '',
  });

  // Get extracted data from URL parameter
  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const extractedData = JSON.parse(decodeURIComponent(dataParam));
        setFormData({
          date: extractedData.date || '',
          vendor: extractedData.vendor || '',
          amount: extractedData.amount || '',
          category: extractedData.category || 'Uncategorized',
        });
      } catch (error) {
        console.error('Failed to parse extracted data:', error);
        // Keep empty form if parsing fails
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSending) return;

    setIsSending(true);

    try {
      // Call Google Sheets API
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send to Google Sheets');
      }

      // Cache the vendor-category mapping for future use
      if (formData.vendor && formData.vendor.trim() && formData.category && formData.category !== 'Uncategorized') {
        cacheVendorCategory(formData.vendor, formData.category);
        console.log(`Cached category "${formData.category}" for vendor "${formData.vendor}"`);
      }

      // Show success toast
      setToastMessage('✅ Added to Google Sheet successfully!');
      setToastType('success');
      setShowToast(true);

      // Redirect to inbox after 3 seconds
      setTimeout(() => {
        setShowToast(false);
        router.push('/inbox');
      }, 3000);

    } catch (error) {
      console.error('Failed to send to Google Sheets:', error);

      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Failed to send to Google Sheets';
      setToastMessage(`❌ ${errorMessage}`);
      setToastType('error');
      setShowToast(true);

      // Hide error toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);

      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 page-transition">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Review Receipt
          </h1>
          <p className="text-sm text-gray-600">
            Review and edit the AI-extracted information before sending to your sheet
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
              className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-sm flex items-center justify-center"
            >
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Send to Google Sheet'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification (success or error) */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-xl animate-slide-in-right ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white backdrop-blur-sm`}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

