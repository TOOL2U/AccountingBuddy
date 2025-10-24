'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');

  const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

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

  const handleProcess = () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    // Mock alert for Stage 0
    alert(`Processing file: ${file.name}\n\nIn Stage 1, this will call the OCR API.`);
    
    // Mock navigation to review page
    router.push('/review/mock-id-123');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Receipt
        </h1>
        <p className="text-gray-600">
          Upload a photo or PDF of your receipt to get started
        </p>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
        `}
      >
        {!file ? (
          <div>
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg font-medium text-gray-700 mb-2">
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
              <span className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md px-6 py-3 cursor-pointer transition-colors inline-block">
                Choose File
              </span>
            </label>
            <p className="text-xs text-gray-400 mt-4">
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
                className="max-w-xs mx-auto mb-4 rounded-lg shadow-md"
              />
            )}
            {file.type === 'application/pdf' && (
              <div className="text-6xl mb-4">📑</div>
            )}
            <p className="text-lg font-medium text-gray-700 mb-2">
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
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Remove file
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Process Button */}
      {file && !error && (
        <div className="mt-6 text-center">
          <button
            onClick={handleProcess}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md px-8 py-3 shadow-sm hover:shadow-md transition-all"
          >
            Process Receipt
          </button>
        </div>
      )}
    </div>
  );
}

