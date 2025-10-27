'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { cacheVendorCategory } from '@/utils/vendorCache';
import { getOptions } from '@/utils/matchOption';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SectionHeading from '@/components/ui/SectionHeading';
import Toast from '@/components/ui/Toast';

export default function ReviewPage({ params }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isSending, setIsSending] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  const handleCloseToast = () => setShowToast(false);

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
        
        const newFormData = {
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
        };
        
        // SAFETY CHECK: Ensure typeOfPayment is a valid option
        const validPaymentOptions = ['Credit card', 'Bank transfer', 'Cash'];
        if (newFormData.typeOfPayment && !validPaymentOptions.includes(newFormData.typeOfPayment)) {
          console.warn('[REVIEW] Invalid typeOfPayment detected:', newFormData.typeOfPayment);
          console.warn('[REVIEW] Valid options are:', validPaymentOptions);
          newFormData.typeOfPayment = ''; // Reset to empty to show "Select payment type"
        }
        
        setFormData(newFormData);

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
    const { name, value } = e.target;
    
    // Clear category error when user selects a valid category
    if (name === 'typeOfOperation' && value && !['', 'Uncategorized', 'REVENUES', 'Fixed Costs', 'EXPENSES', 'Property'].includes(value)) {
      setCategoryError(false);
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSending) return;

    // Validation: Check if category (typeOfOperation) is selected and not a header
    const headerCategories = ['', 'Uncategorized', 'REVENUES', 'Fixed Costs', 'EXPENSES', 'Property'];
    if (!formData.typeOfOperation || headerCategories.includes(formData.typeOfOperation)) {
      setCategoryError(true);
      setToastMessage('🚨 ERROR: Please select a specific category from "Type of Operation" dropdown before submitting to Google Sheets');
      setToastType('error');
      setShowToast(true);
      
      // Scroll to category field
      const categoryField = document.getElementById('typeOfOperation');
      if (categoryField) {
        categoryField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        categoryField.focus();
      }
      
      // Hide error toast after 8 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 8000);
      
      return;
    }
    
    // Clear any previous category error
    setCategoryError(false);

    // Additional validation: Check required fields
    if (!formData.day || !formData.month || !formData.year) {
      setToastMessage('❌ Please fill in all date fields');
      setToastType('error');
      setShowToast(true);
      
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      
      return;
    }

    if (!formData.property) {
      setToastMessage('❌ Please select a property');
      setToastType('error');
      setShowToast(true);
      
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      
      return;
    }

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto px-4 py-12"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold gradient-text mb-3"
        >
          Review Receipt
        </motion.h1>
        <p className="text-text-secondary">
          Review and edit the AI-extracted information before sending to your sheet
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Fields - Day, Month, Year */}
          <div>
            <SectionHeading
              icon="📅"
              title="Date"
              subtitle="Transaction date"
            />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Input
                label="Day"
                type="text"
                id="day"
                name="day"
                value={formData.day}
                onChange={handleChange}
                placeholder="27"
                required
              />
              <Input
                label="Month"
                type="text"
                id="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                placeholder="Oct"
                required
              />
              <Input
                label="Year"
                type="text"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="2025"
                required
              />
            </div>
          </div>

          {/* Property Field */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="property" className="text-sm font-medium text-text-primary">
                Property
              </label>
              {confidence.property < 0.8 && (
                <Badge variant="warning">⚠️ Needs review</Badge>
              )}
              {confidence.property >= 0.8 && (
                <Badge variant="info">AI: {(confidence.property * 100).toFixed(0)}%</Badge>
              )}
            </div>
            <select
              id="property"
              name="property"
              value={formData.property}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-1 border border-border-light rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
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
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="typeOfOperation" className="text-sm font-medium text-text-primary">
                Type of Operation {categoryError && <span className="text-red-500">*</span>}
              </label>
              {confidence.typeOfOperation < 0.8 && (
                <Badge variant="warning">⚠️ Needs review</Badge>
              )}
              {confidence.typeOfOperation >= 0.8 && (
                <Badge variant="info">AI: {(confidence.typeOfOperation * 100).toFixed(0)}%</Badge>
              )}
              {categoryError && (
                <Badge variant="danger">❌ Required</Badge>
              )}
            </div>
            <select
              id="typeOfOperation"
              name="typeOfOperation"
              value={formData.typeOfOperation}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 bg-surface-1 border rounded-xl text-text-primary focus:outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer ${
                categoryError 
                  ? 'border-red-500 focus:ring-red-500/60 focus:border-red-500 bg-red-50' 
                  : 'border-border-light focus:ring-brand-primary/60 focus:border-transparent'
              }`}
              required
            >
              <option value="">Select operation type</option>
              {options.typeOfOperation.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            {categoryError && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                ⚠️ Please select a specific category from the dropdown (not a header like &quot;EXPENSES&quot;)
              </p>
            )}
          </div>

          {/* Type of Payment Field */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="typeOfPayment" className="text-sm font-medium text-text-primary">
                Type of Payment
              </label>
              {confidence.typeOfPayment < 0.8 && (
                <Badge variant="warning">⚠️ Needs review</Badge>
              )}
              {confidence.typeOfPayment >= 0.8 && (
                <Badge variant="info">AI: {(confidence.typeOfPayment * 100).toFixed(0)}%</Badge>
              )}
            </div>
            <select
              id="typeOfPayment"
              name="typeOfPayment"
              value={formData.typeOfPayment}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-1 border border-border-light rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
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
          <Input
            label="Detail"
            type="text"
            id="detail"
            name="detail"
            value={formData.detail}
            onChange={handleChange}
            placeholder="e.g., Materials purchase"
            required
          />

          {/* Ref Field (Optional) */}
          <Input
            label="Reference / Invoice # (optional)"
            type="text"
            id="ref"
            name="ref"
            value={formData.ref}
            onChange={handleChange}
            placeholder="Invoice or reference number"
          />

          {/* Debit and Credit Fields */}
          <div>
            <SectionHeading
              icon="💰"
              title="Amount"
              subtitle="Enter debit (expense) or credit (income)"
            />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="Debit (Expense)"
                type="number"
                id="debit"
                name="debit"
                value={formData.debit}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <Input
                label="Credit (Income)"
                type="number"
                id="credit"
                name="credit"
                value={formData.credit}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/upload')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSending}
              className="flex-1"
            >
              {isSending ? 'Sending...' : 'Send to Google Sheet'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        variant={toastType}
        isVisible={showToast}
        onClose={handleCloseToast}
        duration={3000}
        position="bottom-right"
      />
    </motion.div>
  );
}

