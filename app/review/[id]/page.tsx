'use client';

import { useState, useEffect, useRef } from 'react';
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
import { X } from 'lucide-react';

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isSending, setIsSending] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  // Search state for filtering
  const [categorySearch, setCategorySearch] = useState<string>('');

  // Refs for select elements
  const categorySelectRef = useRef<HTMLSelectElement>(null);

  const handleCloseToast = () => setShowToast(false);

  // Get dropdown options
  const options = getOptions();

  // Filter categories based on search
  const filteredCategories = options.typeOfOperation
    .filter(op => !['FIXED COSTS', 'Fixed Costs', 'EXPENSES', 'REVENUES', 'Property'].includes(op))
    .filter(op => categorySearch.trim() === '' || op.toLowerCase().includes(categorySearch.toLowerCase()));

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
          typeOfOperation: extractedData.typeOfOperation || '',
          typeOfPayment: extractedData.typeOfPayment || '',
          detail: extractedData.detail || '',
          ref: extractedData.ref || '',
          debit: String(extractedData.debit || ''),
          credit: String(extractedData.credit || ''),
        };
        
        // SAFETY CHECK: Ensure typeOfPayment is a valid option from options.json
        if (newFormData.typeOfPayment && !options.typeOfPayment.includes(newFormData.typeOfPayment)) {
          console.warn('[REVIEW] Invalid typeOfPayment detected:', newFormData.typeOfPayment);
          console.warn('[REVIEW] Valid options are:', options.typeOfPayment);
          newFormData.typeOfPayment = ''; // Reset to empty to show "Select payment type"
        } else if (newFormData.typeOfPayment) {
          console.log('[REVIEW] ✓ Valid typeOfPayment received from quick entry:', newFormData.typeOfPayment);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // options is from getOptions() which returns a stable reference

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear category error when user selects a valid category
    if (name === 'typeOfOperation' && value && value !== '') {
      setCategoryError(false);
      
      // AUTOMATIC CREDIT DETECTION: If Revenue option selected, automatically use credit
      if (value.startsWith('Revenue')) {
        const currentAmount = parseFloat(formData.debit || formData.credit || '0');
        console.log(`[AUTO] Revenue detected: "${value}" - Moving amount to credit: ${currentAmount}`);
        setFormData({
          ...formData,
          [name]: value,
          credit: currentAmount.toString(),
          debit: '0',
        });
        return; // Exit early to avoid double state update
      }
      
      // AUTOMATIC DEBIT DETECTION: If EXP option selected, automatically use debit
      if (value.startsWith('EXP')) {
        const currentAmount = parseFloat(formData.debit || formData.credit || '0');
        console.log(`[AUTO] Expense detected: "${value}" - Moving amount to debit: ${currentAmount}`);
        setFormData({
          ...formData,
          [name]: value,
          debit: currentAmount.toString(),
          credit: '0',
        });
        return; // Exit early to avoid double state update
      }
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

    // Validation: Check if category (typeOfOperation) is selected and not invalid
    const invalidCategories = [''];
    console.log('[VALIDATION] Checking category:', formData.typeOfOperation);
    if (!formData.typeOfOperation || invalidCategories.includes(formData.typeOfOperation)) {
      console.error('[VALIDATION] Invalid category detected:', formData.typeOfOperation);
      setCategoryError(true);
      setToastMessage('🚨 ERROR: Please select a valid category from "Type of Operation" dropdown before submitting to Google Sheets');
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
      if (formData.detail && formData.detail.trim() && formData.typeOfOperation && formData.typeOfOperation !== '') {
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
      className="max-w-2xl mx-auto px-2 md:px-4 py-12 page-upload"
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
              {options.properties.map((property) => (
                <option key={property} value={property}>
                  {property}
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

            {/* Search input */}
            <div className="relative mb-2">
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories... e.g. 'construction', 'electric', 'salary'"
                className="w-full px-4 py-2.5 text-sm bg-surface-1 border border-border-light rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 transition-all"
              />
              {categorySearch && (
                <button
                  type="button"
                  onClick={() => setCategorySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results count */}
            {categorySearch && (
              <div className="text-xs text-text-tertiary mb-2">
                {filteredCategories.length > 0 ? (
                  <span className="text-brand-primary">
                    {filteredCategories.length} {filteredCategories.length === 1 ? 'result' : 'results'} found - tap to select
                  </span>
                ) : (
                  <span className="text-status-warning">No results found</span>
                )}
              </div>
            )}

            {/* Show filtered results as clickable list when searching */}
            {categorySearch && filteredCategories.length > 0 && (
              <div className="mb-2 max-h-64 overflow-y-auto bg-surface-1 border border-border-light rounded-xl">
                {filteredCategories.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, typeOfOperation: op });
                      setCategorySearch('');
                      setCategoryError(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-2 active:bg-brand-primary/20 transition-colors border-b border-border-light last:border-b-0"
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}

            {/* Native select (hidden when searching, shown when not searching) */}
            {!categorySearch && (
              <select
                ref={categorySelectRef}
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
                {filteredCategories.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            )}

            {categoryError && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                ⚠️ Please select a specific category from the dropdown (not a header like &quot;EXPENSES&quot;)
              </p>
            )}
          </div>

          {/* Type of Payment Field - Read-only (already selected in quick entry) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="typeOfPayment" className="text-sm font-medium text-text-primary">
                Type of Payment
              </label>
              <Badge variant="success">✓ From quick entry</Badge>
            </div>

            {/* Display selected payment type as read-only */}
            <div className="w-full px-4 py-2.5 bg-surface-1 border border-border-light rounded-xl text-text-primary">
              {formData.typeOfPayment || 'Not specified'}
            </div>

            {/* Hidden input to ensure value is submitted */}
            <input
              type="hidden"
              name="typeOfPayment"
              value={formData.typeOfPayment}
            />
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
              {isSending ? 'Sending...' : 'Send'}
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

