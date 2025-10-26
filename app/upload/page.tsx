'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCachedCategory, cacheVendorCategory } from '@/utils/vendorCache';
import { compressImage, shouldCompress, formatFileSize } from '@/utils/imageCompression';
import { parseManualCommand, getCommandHistory, saveCommandToHistory } from '@/utils/manualParse';

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

  const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  // Load command history on mount
  useEffect(() => {
    setCommandHistory(getCommandHistory());
  }, []);

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

    setIsManualProcessing(true);
    setManualError('');

    try {
      // Step 1: Try client-side parsing
      const parseResult = parseManualCommand(manualCommand);

      console.log('[MANUAL] Parse result:', parseResult);

      let dataToPass = parseResult.data || {};

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
            comment: 'manual-command',
            preparse: parseResult.data
          }),
        });

        const extractData = await extractResponse.json();

        if (extractData.data) {
          // Merge AI results with parsed data
          dataToPass = { ...parseResult.data, ...extractData.data };
        }
      }

      // Save to history
      saveCommandToHistory(manualCommand);
      setCommandHistory(getCommandHistory());

      // Navigate to review page
      const manualId = `manual-${Date.now()}`;
      const encodedData = encodeURIComponent(JSON.stringify(dataToPass));
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

      // Check cache for detail-typeOfOperation mapping (similar to vendor-category)
      // Note: We're using detail as the key (like vendor) and typeOfOperation as the value (like category)
      if (dataToPass.detail && dataToPass.detail.trim()) {
        const cachedOperation = getCachedCategory(dataToPass.detail);
        if (cachedOperation) {
          console.log(`Using cached operation type "${cachedOperation}" for detail "${dataToPass.detail}"`);
          dataToPass.typeOfOperation = cachedOperation;
        } else if (dataToPass.typeOfOperation && dataToPass.typeOfOperation !== 'Uncategorized') {
          // Cache the AI-extracted operation type for future use
          cacheVendorCategory(dataToPass.detail, dataToPass.typeOfOperation);
          console.log(`Cached operation type "${dataToPass.typeOfOperation}" for detail "${dataToPass.detail}"`);
        }
      }

      // Navigate to review page with extracted data
      const encodedData = encodeURIComponent(JSON.stringify(dataToPass));
      router.push(`/review/${ocrData.id}?data=${encodedData}`);
    } catch (err) {
      console.error('Processing error:', err);
      setError('❌ Failed to process receipt. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 page-transition">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Receipt
        </h1>
        <p className="text-gray-600">
          Upload a photo or PDF of your receipt to get started
        </p>
      </div>

      {/* Quick Entry (Manual Command) */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            ⚡ Quick Entry
          </h2>
          <p className="text-sm text-gray-600">
            Type a one-line command to quickly add an entry
          </p>
        </div>

        <textarea
          value={manualCommand}
          onChange={(e) => {
            setManualCommand(e.target.value);
            setHistoryIndex(-1);
            setManualError('');
          }}
          onKeyDown={handleManualKeyDown}
          placeholder="Example: alesia - 2000 - debit - cash"
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none font-mono text-sm"
        />

        <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="text-xs text-gray-500 space-y-1 flex-1">
            <p>💡 <span className="font-mono text-gray-700">debit 2000 salaries cash</span> • <span className="font-mono text-gray-700">credit 5000 rent bank</span></p>
            <p>⌨️ <strong className="text-gray-700">Enter</strong> to submit • <strong className="text-gray-700">Shift+Enter</strong> for new line • <strong className="text-gray-700">↑/↓</strong> for history</p>
          </div>

          <button
            onClick={handleManualParse}
            disabled={isManualProcessing || !manualCommand.trim()}
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium rounded-md px-6 py-2 shadow-sm hover:shadow-md transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-sm flex items-center justify-center whitespace-nowrap sm:self-start"
          >
            {isManualProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Parsing…
              </>
            ) : (
              'Parse & Review'
            )}
          </button>
        </div>

        {/* Manual Error Message */}
        {manualError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{manualError}</p>
          </div>
        )}
      </div>

      {/* OR Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-gray-50 text-gray-500 font-medium uppercase tracking-wider">or</span>
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          bg-white rounded-lg shadow-sm border-2 border-dashed p-12 text-center transition-all
          ${isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        {!file ? (
          <div>
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drag and drop your receipt here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium rounded-md px-6 py-2.5 cursor-pointer transition-colors inline-block shadow-sm hover:shadow-md">
                Choose File
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: JPG, PNG, PDF
            </p>
          </div>
        ) : (
          <div>
            {/* File Preview */}
            {preview && file.type.startsWith('image/') && (
              <img
                src={preview}
                alt="Receipt preview"
                className="max-w-xs mx-auto mb-4 rounded-lg shadow-sm border border-gray-200"
              />
            )}
            {file.type === 'application/pdf' && (
              <div className="text-6xl mb-4">📑</div>
            )}
            <p className="text-base font-medium text-gray-900 mb-1">
              {file.name}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setError('');
              }}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Remove file
            </button>
          </div>
        )}
      </div>

      {/* Comment Field (Optional) */}
      {file && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Comment (optional)
            <span className="text-gray-500 font-normal ml-1">
              — Help the AI categorize this receipt
            </span>
          </label>
          <textarea
            id="comment"
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g., 'Materials for wall construction' or 'Staff salary payment'"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Add context like "wall construction", "salaries", or "Villa 1" to improve category accuracy
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Process Button */}
      {file && !error && (
        <div className="mt-6 text-center">
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium rounded-md px-8 py-3 shadow-sm hover:shadow-md transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-sm flex items-center justify-center mx-auto"
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing…
              </>
            ) : (
              'Process Receipt'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

