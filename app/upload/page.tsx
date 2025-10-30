'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getCachedCategory, cacheVendorCategory } from '@/utils/vendorCache';
import { compressImage, shouldCompress, formatFileSize } from '@/utils/imageCompression';
import { parseManualCommand, getCommandHistory, saveCommandToHistory } from '@/utils/manualParse';
import { getOptions } from '@/utils/matchOption';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { Zap, Camera, Upload, FileText, Sparkles, ArrowRight, CheckCircle2, Search, X } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [comment, setComment] = useState<string>('');

  // Manual entry state
  const [manualCommand, setManualCommand] = useState<string>('');
  const [isManualProcessing, setIsManualProcessing] = useState(false);
  const [manualError, setManualError] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  // Category and payment selection state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');

  // Search state for filtering (only category)
  const [categorySearch, setCategorySearch] = useState<string>('');

  const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  // Get dropdown options
  const options = getOptions();

  // Load command history on mount
  useEffect(() => {
    setCommandHistory(getCommandHistory());
  }, []);

  // Filter categories based on search
  const filteredCategories = options.typeOfOperation
    .filter(op => !['FIXED COSTS', 'Fixed Costs', 'EXPENSES', 'REVENUES', 'Property'].includes(op))
    .filter(op => categorySearch.trim() === '' || op.toLowerCase().includes(categorySearch.toLowerCase()));



  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (!acceptedTypes.includes(selectedFile.type)) {
      setError('❌ Unsupported file type. Please upload JPG, PNG, or PDF.');
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // PDF preview placeholder
      setPreview('/pdf-placeholder.png');
    }
  };

  const handleManualParse = async () => {
    if (!manualCommand.trim()) {
      setManualError('Please enter a command first.');
      return;
    }

    // CRITICAL VALIDATION: Check if payment type is selected
    if (!selectedPayment) {
      setManualError('🚨 Please select a "Type of Payment" before parsing. This field is required.');
      // Scroll to payment field
      const paymentField = document.querySelector('[data-payment-search]');
      if (paymentField) {
        paymentField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (paymentField as HTMLInputElement).focus();
      }
      return;
    }

    setIsManualProcessing(true);
    setManualError('');

    try {
      // Step 1: Try client-side parsing
      const parseResult = parseManualCommand(manualCommand);

      let dataToPass = parseResult.data || {};
      
      // CRITICAL: Always preserve original user input in detail field (never let AI modify this)
      dataToPass.detail = manualCommand;
      console.log(`[MANUAL] Preserving user input as detail: "${manualCommand}"`);

      // Step 2: If confidence is low, call AI fallback
      if (!parseResult.ok || parseResult.confidence < 0.75) {
        console.log('[MANUAL] Low confidence, calling AI fallback...');

        const extractResponse = await fetch('/api/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: manualCommand,
            comment: '"Quick Entry"',
            preparse: parseResult.data
          }),
        });

        const extractData = await extractResponse.json();

        if (extractData && !extractData.error) {
          // Merge AI results with parsed data, preserving AI confidence scores
          // But preserve the original manual command as detail
          const originalDetail = dataToPass.detail; // Already set to manualCommand above
          dataToPass = { ...parseResult.data, ...extractData };
          dataToPass.detail = originalDetail; // Always keep original user input
        }
      }

      // CRITICAL: Add selected category from search box AFTER AI processing (should never be overridden)
      // If user selected a Type of Operation → Use it 100% (ignore AI)
      // If user didn't select → Use AI result (which may be empty if AI not confident)
      if (selectedCategory) {
        console.log(`[MANUAL] ✅ User selected Type of Operation: ${selectedCategory} (100% priority - ignoring AI)`);
        dataToPass.typeOfOperation = selectedCategory;
      } else {
        console.log(`[MANUAL] ℹ️ No Type of Operation selected by user - using AI result: "${dataToPass.typeOfOperation || '(empty - will show Select operation type)'}"`);
      }

      // CRITICAL: Add selected payment type from search box (REQUIRED)
      if (selectedPayment) {
        console.log(`[MANUAL] Setting payment type from search box: ${selectedPayment}`);
        dataToPass.typeOfPayment = selectedPayment;
      }

      // CRITICAL: Auto-detect Revenue categories and ensure they use credit
      if (dataToPass.typeOfOperation && dataToPass.typeOfOperation.startsWith('Revenue')) {
        const totalAmount = (dataToPass.debit || 0) + (dataToPass.credit || 0);
        if (totalAmount > 0 && (dataToPass.debit || 0) > 0) {
          console.log(`[MANUAL AUTO-CREDIT] Revenue category detected: "${dataToPass.typeOfOperation}" - Moving amount ${totalAmount} to credit`);
          dataToPass.credit = totalAmount;
          dataToPass.debit = 0;
        }
      } 
      // CRITICAL: Auto-detect EXP categories and ensure they use debit
      else if (dataToPass.typeOfOperation && dataToPass.typeOfOperation.startsWith('EXP')) {
        const totalAmount = (dataToPass.debit || 0) + (dataToPass.credit || 0);
        if (totalAmount > 0 && (dataToPass.credit || 0) > 0) {
          console.log(`[MANUAL AUTO-DEBIT] Expense category detected: "${dataToPass.typeOfOperation}" - Moving amount ${totalAmount} to debit`);
          dataToPass.debit = totalAmount;
          dataToPass.credit = 0;
        }
      } 
      else {
        // CRITICAL: Ensure amount defaults to debit unless explicitly credit (only for non-Revenue/non-EXP)
        if ((dataToPass.credit ?? 0) > 0 && (dataToPass.debit ?? 0) === 0) {
          // Only allow credit if there are explicit credit/income keywords in the original input
          const creditKeywords = /(credit|income|revenue|sales|rental|deposit|received)/i;
          if (!creditKeywords.test(manualCommand)) {
            console.log(`[MANUAL] Moving amount from credit to debit (no credit keywords found): ${dataToPass.credit}`);
            dataToPass.debit = dataToPass.credit ?? 0;
            dataToPass.credit = 0;
          }
        }
      }

      // Save to history
      saveCommandToHistory(manualCommand);
      setCommandHistory(getCommandHistory());

      // Navigate to review page
      const manualId = `manual-${Date.now()}`;
      const encodedData = encodeURIComponent(JSON.stringify(dataToPass));
      
      // Clear the selected category and payment after processing
      setSelectedCategory('');
      setSelectedPayment('');
      
      router.push(`/review/${manualId}?data=${encodedData}`);
    } catch (err) {
      console.error('[MANUAL] Processing error:', err);
      setManualError('❌ Failed to parse command. Please try again or use the receipt upload.');
      setIsManualProcessing(false);
    }
  };

  const handleManualKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to submit (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleManualParse();
      return;
    }

    // Up arrow - navigate backwards through history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setManualCommand(commandHistory[newIndex]);
      }
      return;
    }

    // Down arrow - navigate forwards through history
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setManualCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setManualCommand('');
      }
      return;
    }
  };

  const handleProcess = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Step 0: Compress image if needed (reduces API costs)
      let fileToUpload = file;
      if (shouldCompress(file)) {
        console.log(`Compressing image before OCR: ${formatFileSize(file.size)}`);
        fileToUpload = await compressImage(file);
        console.log(`Compressed to: ${formatFileSize(fileToUpload.size)}`);
      }

      // Step 1: Call OCR API
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      const ocrData = await ocrResponse.json();

      if (!ocrResponse.ok) {
        throw new Error(ocrData.error || 'OCR processing failed');
      }

      // Check if OCR returned an error (graceful failure)
      if (ocrData.error) {
        setError(`⚠️ ${ocrData.error}`);
        setIsProcessing(false);
        return;
      }

      // Step 2: Call Extract API with OCR text and optional comment
      const extractResponse = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: ocrData.text,
          comment: comment.trim() || undefined
        }),
      });

      const extractData = await extractResponse.json();

      // Even if extraction fails, we still have fallback data
      if (extractData.error) {
        console.warn('AI extraction failed, using fallback data:', extractData.error);
      }

      // Get extracted data
      const dataToPass = extractData.data || extractData;

      // CRITICAL: Preserve user comment in detail field if provided (takes priority over OCR text)
      if (comment.trim()) {
        console.log(`[FILE UPLOAD] Using user comment as detail: ${comment.trim()}`);
        dataToPass.detail = comment.trim();
      }
      
      // CRITICAL: Add selected category from search box AFTER AI processing (should never be overridden)
      if (selectedCategory) {
        console.log(`[FILE UPLOAD] OVERRIDING with search box selection: ${selectedCategory}`);
        dataToPass.typeOfOperation = selectedCategory;
      }

      // CRITICAL: Auto-detect Revenue categories and ensure they use credit
      if (dataToPass.typeOfOperation && dataToPass.typeOfOperation.startsWith('Revenue')) {
        const totalAmount = (dataToPass.debit || 0) + (dataToPass.credit || 0);
        if (totalAmount > 0 && (dataToPass.debit || 0) > 0) {
          console.log(`[FILE AUTO-CREDIT] Revenue category detected: "${dataToPass.typeOfOperation}" - Moving amount ${totalAmount} to credit`);
          dataToPass.credit = totalAmount;
          dataToPass.debit = 0;
        }
      } 
      // CRITICAL: Auto-detect EXP categories and ensure they use debit
      else if (dataToPass.typeOfOperation && dataToPass.typeOfOperation.startsWith('EXP')) {
        const totalAmount = (dataToPass.debit || 0) + (dataToPass.credit || 0);
        if (totalAmount > 0 && (dataToPass.credit || 0) > 0) {
          console.log(`[FILE AUTO-DEBIT] Expense category detected: "${dataToPass.typeOfOperation}" - Moving amount ${totalAmount} to debit`);
          dataToPass.debit = totalAmount;
          dataToPass.credit = 0;
        }
      } 
      else {
        // CRITICAL: Ensure amount defaults to debit unless explicitly credit (only for non-Revenue/non-EXP)
        if ((dataToPass.credit ?? 0) > 0 && (dataToPass.debit ?? 0) === 0) {
          // Only allow credit if there are explicit credit/income keywords in the OCR text or user comment
          const textToCheck = `${ocrData.text} ${comment}`.toLowerCase();
          const creditKeywords = /(credit|income|revenue|sales|rental|deposit|received)/i;
          if (!creditKeywords.test(textToCheck)) {
            console.log(`[FILE UPLOAD] Moving amount from credit to debit (no credit keywords found): ${dataToPass.credit}`);
            dataToPass.debit = dataToPass.credit ?? 0;
            dataToPass.credit = 0;
          }
        }
      }

      // Check cache for detail-typeOfOperation mapping (similar to vendor-category)
      // Note: We're using detail as the key (like vendor) and typeOfOperation as the value (like category)
      if (dataToPass.detail && dataToPass.detail.trim()) {
        const cachedOperation = getCachedCategory(dataToPass.detail);
        if (cachedOperation) {
          console.log(`Using cached operation type "${cachedOperation}" for detail "${dataToPass.detail}"`);
          dataToPass.typeOfOperation = cachedOperation;
        } else if (dataToPass.typeOfOperation && dataToPass.typeOfOperation !== '') {
          // Cache the AI-extracted operation type for future use
          cacheVendorCategory(dataToPass.detail, dataToPass.typeOfOperation);
          console.log(`Cached operation type "${dataToPass.typeOfOperation}" for detail "${dataToPass.detail}"`);
        }
      }

      // Navigate to review page with extracted data
      const encodedData = encodeURIComponent(JSON.stringify(dataToPass));
      
      // Clear the selected category after processing
      setSelectedCategory('');
      
      router.push(`/review/${ocrData.id}?data=${encodedData}`);
    } catch (err) {
      console.error('Processing error:', err);
      setError('❌ Failed to process receipt. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="page-transition pb-24 md:pb-8 relative"
    >
      {/* Animated background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-status-info/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="max-w-4xl mx-auto px-2 md:px-8">
      {/* Header with stunning logo and animations */}
      <div className="text-center mb-8 md:mb-12 relative z-10">
        {/* Logo/Icon with glow effect - Hidden on mobile */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
          className="hidden md:inline-block mb-4"
        >
          <div className="relative">
            {/* Glow ring */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="absolute inset-0 bg-gradient-to-r from-brand-primary via-status-info to-brand-primary rounded-full blur-xl opacity-50"
            />

            {/* Icon container */}
            <div className="relative bg-gradient-to-br from-brand-primary to-status-info p-4 rounded-2xl shadow-elev-3">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Title with gradient and animation */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl md:text-5xl font-extrabold mb-3 relative"
        >
          <span className="bg-gradient-to-r from-brand-primary via-status-info to-brand-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Accounting Buddy
          </span>

          {/* Sparkle decorations */}

        </motion.h1>

        {/* Subtitle with typing effect feel */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-text-secondary text-sm md:text-base font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-primary" />
            Lightning-fast receipt processing
          </span>
        </motion.p>
      </div>

      {/* Quick Entry - Stunning design with glow effects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
        className="mb-6 relative"
      >
        {/* Glow effect behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-status-info/20 rounded-2xl blur-xl opacity-50" />

        <Card className="relative border-brand-primary/30 hover:border-brand-primary/50 transition-all duration-300">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="p-2 bg-gradient-to-br from-brand-primary to-status-info rounded-xl"
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                Quick Entry
                <span className="text-xs px-2 py-0.5 bg-brand-primary/20 text-brand-primary rounded-full border border-brand-primary/30">
                  Fastest
                </span>
              </h3>
              <p className="text-xs text-text-tertiary">Type once, done in seconds</p>
            </div>
          </div>

          {/* Textarea with enhanced styling */}
          <div className="relative">
            <Textarea
              value={manualCommand}
              onChange={(e) => {
                setManualCommand(e.target.value);
                setHistoryIndex(-1);
                setManualError('');
              }}
              onKeyDown={handleManualKeyDown}
              placeholder="Example: alesia - 2000 - debit - cash - landscaping"
              rows={2}
              className="text-base bg-surface-2 border-border-light focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 transition-all"
            />
            {manualCommand && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-2 right-2"
              >
                <CheckCircle2 className="w-5 h-5 text-status-success" />
              </motion.div>
            )}
            
          </div>

          {/* Category Selection - Optional */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-text-primary">Category</span>
              <span className="text-xs px-2 py-0.5 bg-status-info/20 text-status-info rounded-full border border-status-info/30">
                Optional
              </span>
            </div>

            {/* Search input */}
            <div className="relative mb-2">
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories... e.g. 'construction', 'electric', 'salary'"
                className="w-full px-4 py-2.5 text-sm bg-surface-2 border border-border-light rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 transition-all"
              />
              {categorySearch && (
                <button
                  onClick={() => setCategorySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results count - only show when searching */}
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

            {/* Show filtered results as clickable list - only when searching */}
            {categorySearch && filteredCategories.length > 0 && (
              <div className="max-h-64 overflow-y-auto bg-surface-2 border border-border-light rounded-xl">
                {filteredCategories.map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(op);
                      setCategorySearch('');
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-1 active:bg-brand-primary/20 transition-colors border-b border-border-light last:border-b-0"
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}

            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/20 text-brand-primary text-xs rounded-full border border-brand-primary/30"
              >
                <CheckCircle2 className="w-3 h-3" />
                Selected: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-1 hover:text-brand-primary/70 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Help message for category selection */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3"
          >
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <div className="w-1.5 h-1.5 bg-brand-primary rounded-full shrink-0"></div>
              <span>
                Can&apos;t find the right category? Use <span className="text-brand-primary font-medium">&quot;EXP - Other Expenses&quot;</span>
              </span>
            </div>
          </motion.div>

          {/* Type of Payment - REQUIRED */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-status-danger" />
              <span className="text-sm font-medium text-text-primary">Type of Payment</span>
              <span className="text-xs px-2 py-0.5 bg-status-danger/20 text-status-danger rounded-full border border-status-danger/30 font-semibold">
                Required *
              </span>
            </div>

            <select
              id="typeOfPayment"
              name="typeOfPayment"
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-2 border border-border-light rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
              required
            >
              <option value="">Select payment type</option>
              {options.typeOfPayment.map((payment) => (
                <option key={payment} value={payment}>
                  {payment}
                </option>
              ))}
            </select>

            {selectedPayment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-status-success/20 text-status-success text-xs rounded-full border border-status-success/30"
              >
                <CheckCircle2 className="w-3 h-3" />
                Selected: {selectedPayment}
                <button
                  onClick={() => setSelectedPayment('')}
                  className="ml-1 hover:text-status-success/70 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}

            {/* Requirement notice */}
            <div className="flex items-start gap-2 text-xs text-text-tertiary mt-3">
              <div className="w-1.5 h-1.5 bg-status-danger rounded-full shrink-0 mt-1"></div>
              <span>
                You must select a payment type before parsing
              </span>
            </div>
          </motion.div>

          {/* Hints with icons */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-start gap-2 text-xs text-text-tertiary">
              <Sparkles className="w-3 h-3 text-brand-primary mt-0.5 flex-shrink-0" />
              
            </div>
          </div>

          {/* Action button with gradient */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Button
              onClick={handleManualParse}
              disabled={isManualProcessing || !manualCommand.trim()}
              isLoading={false}
              size="md"
              className="w-full mt-4 bg-gradient-to-r from-brand-primary to-status-info hover:from-brand-primary/90 hover:to-status-info/90 shadow-lg shadow-brand-primary/25 text-white"
            >
              {isManualProcessing ? (
                <span className="flex items-center gap-2 text-white">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 1, -1, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  <span className="font-semibold">
                    Parse & Review
                  </span>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </span>
              )}
            </Button>
          </motion.div>

          {/* Error message with animation */}
          <AnimatePresence>
            {manualError && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mt-4 p-3 bg-status-danger/20 border border-status-danger/30 rounded-xl overflow-hidden"
              >
                <p className="text-sm text-status-danger flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  {manualError}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Divider with gradient line */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="relative my-8"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border-light to-transparent"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 py-1 bg-surface-0 text-text-tertiary text-xs font-medium uppercase tracking-wider border border-border-light rounded-full">
            or upload receipt
          </span>
        </div>
      </motion.div>

      {/* Upload Drop Zone - Stunning design with animations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
        className="relative"
      >
        {/* Glow effect when dragging */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-brand-primary/30 to-status-info/30 rounded-2xl blur-2xl"
          />
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300
            ${isDragging
              ? 'border-brand-primary bg-brand-primary/10 scale-105'
              : 'border-border-light hover:border-brand-primary/50 bg-surface-1 hover:bg-surface-2'
            }
          `}
        >
          {!file ? (
            <div>
              {/* Animated upload icon */}
              <motion.div
                animate={{
                  y: isDragging ? [0, -10, 0] : [0, -5, 0],
                  rotate: isDragging ? [0, 5, -5, 0] : 0
                }}
                transition={{
                  duration: isDragging ? 0.5 : 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="inline-block mb-4"
              >
                <div className="relative">
                  {/* Glow ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/30 to-status-info/30 rounded-full blur-xl" />

                  {/* Icon */}
                  <div className="relative p-6 bg-gradient-to-br from-surface-2 to-surface-1 rounded-2xl border border-border-light">
                    <Upload className="w-12 h-12 md:w-16 md:h-16 text-brand-primary" />
                  </div>
                </div>
              </motion.div>

              <motion.p
                animate={{ opacity: isDragging ? 1 : 0.9 }}
                className="text-base md:text-lg font-semibold text-text-primary mb-2"
              >
                {isDragging ? (
                  <span className="text-brand-primary">Drop it here! 🎯</span>
                ) : (
                  <>
                    <span className="hidden md:inline">Drag and drop your receipt</span>
                    <span className="md:hidden">Upload your receipt</span>
                  </>
                )}
              </motion.p>

              <p className="text-sm text-text-tertiary mb-6 hidden md:block">
                or choose from your device
              </p>

              {/* Action buttons with icons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                {/* Camera Button (Mobile Only) */}
                <label className="inline-block cursor-pointer sm:hidden w-full max-w-xs group">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <motion.span
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-primary to-status-info text-white font-semibold rounded-xl shadow-lg shadow-brand-primary/30 transition-all duration-200 min-h-[48px] w-full group-hover:shadow-xl group-hover:shadow-brand-primary/40"
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </motion.span>
                </label>

                {/* Choose File Button */}
                <label className="inline-block cursor-pointer w-full max-w-xs sm:w-auto group">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <motion.span
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-2 hover:bg-surface-1 border-2 border-border-light hover:border-brand-primary/50 text-text-primary font-semibold rounded-xl shadow-elev-1 hover:shadow-elev-2 transition-all duration-200 min-h-[48px] w-full sm:bg-gradient-to-r sm:from-brand-primary sm:to-status-info sm:text-white sm:border-0 sm:shadow-lg sm:shadow-brand-primary/30 sm:hover:shadow-xl sm:hover:shadow-brand-primary/40 sm:w-auto"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="sm:hidden">Choose File</span>
                    <span className="hidden sm:inline">Choose File</span>
                  </motion.span>
                </label>
              </div>

              {/* Supported formats with icons */}
              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-text-tertiary">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-status-success" />
                  JPG
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-status-success" />
                  PNG
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-status-success" />
                  PDF
                </span>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {/* Success indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-status-success/20 border border-status-success/30 rounded-full mb-4"
              >
                <CheckCircle2 className="w-4 h-4 text-status-success" />
                <span className="text-sm font-medium text-status-success">File uploaded</span>
              </motion.div>

              {/* File Preview */}
              {preview && file.type.startsWith('image/') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative inline-block mb-4"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-status-info/20 rounded-xl blur-xl" />

                  <Image
                    src={preview}
                    alt="Receipt preview"
                    width={300}
                    height={400}
                    className="relative max-w-xs mx-auto rounded-xl shadow-elev-3 border-2 border-border-light"
                  />
                </motion.div>
              )}

              {file.type === 'application/pdf' && (
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-4"
                >
                  <div className="inline-block p-6 bg-gradient-to-br from-surface-2 to-surface-1 rounded-2xl border border-border-light">
                    <FileText className="w-16 h-16 text-status-danger" />
                  </div>
                </motion.div>
              )}

              {/* File info */}
              <div className="mb-6">
                <p className="text-base font-semibold text-text-primary mb-1 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  {file.name}
                </p>
                <p className="text-sm text-text-tertiary">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>

              {/* Remove button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setError('');
                }}
                className="hover:bg-status-danger/10 hover:text-status-danger hover:border-status-danger/30"
              >
                Remove file
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Comment Field (Optional) - More compact */}
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Add context (optional)
            </label>
            <Textarea
              id="comment"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., 'Materials for wall construction'"
              rows={2}
              helperText="💡 Helps AI categorize better"
            />
          </Card>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-status-danger/20 border border-status-danger/30 rounded-xl"
        >
          <p className="text-sm text-status-danger">{error}</p>
        </motion.div>
      )}

      {/* Process Button - Sticky on mobile for easy access */}
      {file && !error && (
        <>
          {/* Desktop: Centered button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 hidden md:flex justify-center"
          >
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              isLoading={isProcessing}
              size="lg"
            >
              {isProcessing ? 'Processing...' : 'Process Receipt'}
            </Button>
          </motion.div>

          {/* Mobile: Sticky bottom button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-surface-0/95 backdrop-blur-xl border-t border-border-light md:hidden z-40"
          >
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              isLoading={isProcessing}
              size="lg"
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Process Receipt'}
            </Button>
          </motion.div>
        </>
      )}

      </div>
    </motion.div>
  );
}

