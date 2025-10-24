'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cacheVendorCategory } from '@/utils/vendorCache';
import { getOptions } from '@/utils/matchOption';

export default function ReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isSending, setIsSending] = useState(false);

  // Get dropdown options
  const options = getOptions();

  // Form data state - expanded schema for Accounting Buddy P&L 2025
  const [formData, setFormData] = useState({
    day: '',
    month: '',
    year: '',
    property: '',
    typeOfOperation: '',
    typeOfPayment: '',
    detail: '',
    ref: '',
    debit: '',
    credit: '',
  });

  // Confidence scores for dropdown fields
  const [confidence, setConfidence] = useState({
    property: 1.0,
    typeOfOperation: 1.0,
    typeOfPayment: 1.0,
  });

  // Get extracted data from URL parameter
  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const extractedData = JSON.parse(decodeURIComponent(dataParam));
        setFormData({
          day: extractedData.day || '',
          month: extractedData.month || '',
          year: extractedData.year || '',
          property: extractedData.property || 'Sia Moon',
          typeOfOperation: extractedData.typeOfOperation || 'Uncategorized',
          typeOfPayment: extractedData.typeOfPayment || '',
          detail: extractedData.detail || '',
          ref: extractedData.ref || '',
          debit: String(extractedData.debit || ''),
          credit: String(extractedData.credit || ''),
        });

        // Extract confidence scores if available
        if (extractedData.confidence) {
          setConfidence({
            property: extractedData.confidence.property || 1.0,
            typeOfOperation: extractedData.confidence.typeOfOperation || 1.0,
            typeOfPayment: extractedData.confidence.typeOfPayment || 1.0,
          });
        }
      } catch (error) {
        console.error('Failed to parse extracted data:', error);
        // Keep empty form if parsing fails
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      // Cache the property-typeOfOperation mapping for future use
      // Note: We're caching based on detail (vendor-like) and typeOfOperation (category-like)
      if (formData.detail && formData.detail.trim() && formData.typeOfOperation && formData.typeOfOperation !== 'Uncategorized') {
        cacheVendorCategory(formData.detail, formData.typeOfOperation);
        console.log(`Cached operation type "${formData.typeOfOperation}" for detail "${formData.detail}"`);
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
          {/* Date Fields - Day, Month, Year */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="day"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Day
              </label>
              <input
                type="text"
                id="day"
                name="day"
                value={formData.day}
                onChange={handleChange}
                placeholder="27"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label
                htmlFor="month"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Month
              </label>
              <input
                type="text"
                id="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                placeholder="Oct"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Year
              </label>
              <input
                type="text"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Property Field */}
          <div>
            <label
              htmlFor="property"
              className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              Property
              {confidence.property < 0.8 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  ⚠️ Needs review
                </span>
              )}
            </label>
            <select
              id="property"
              name="property"
              value={formData.property}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            >
              <option value="">Select property</option>
              {options.properties.map((prop) => (
                <option key={prop} value={prop}>
                  {prop}
                </option>
              ))}
            </select>
          </div>

          {/* Type of Operation Field */}
          <div>
            <label
              htmlFor="typeOfOperation"
              className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              Type of Operation
              {confidence.typeOfOperation < 0.8 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  ⚠️ Needs review
                </span>
              )}
            </label>
            <select
              id="typeOfOperation"
              name="typeOfOperation"
              value={formData.typeOfOperation}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            >
              <option value="">Select operation type</option>
              {options.typeOfOperation.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          {/* Type of Payment Field */}
          <div>
            <label
              htmlFor="typeOfPayment"
              className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              Type of Payment
              {confidence.typeOfPayment < 0.8 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  ⚠️ Needs review
                </span>
              )}
            </label>
            <select
              id="typeOfPayment"
              name="typeOfPayment"
              value={formData.typeOfPayment}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            >
              <option value="">Select payment type</option>
              {options.typeOfPayment.map((payment) => (
                <option key={payment} value={payment}>
                  {payment}
                </option>
              ))}
            </select>
          </div>

          {/* Detail Field */}
          <div>
            <label
              htmlFor="detail"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Detail
            </label>
            <input
              type="text"
              id="detail"
              name="detail"
              value={formData.detail}
              onChange={handleChange}
              placeholder="e.g., Materials purchase"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Ref Field (Optional) */}
          <div>
            <label
              htmlFor="ref"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Reference / Invoice # <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              id="ref"
              name="ref"
              value={formData.ref}
              onChange={handleChange}
              placeholder="Invoice or reference number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Debit and Credit Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="debit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Debit (Expense)
              </label>
              <input
                type="number"
                id="debit"
                name="debit"
                value={formData.debit}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="credit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Credit (Income)
              </label>
              <input
                type="number"
                id="credit"
                name="credit"
                value={formData.credit}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
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

