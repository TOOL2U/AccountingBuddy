/**
 * Image Compression Utility
 * 
 * Compresses images before OCR to reduce API costs and improve performance.
 * Only compresses images larger than a threshold size.
 */

const MAX_WIDTH = 1920; // Max width in pixels
const MAX_HEIGHT = 1920; // Max height in pixels
const QUALITY = 0.85; // JPEG quality (0-1)
const SIZE_THRESHOLD = 1024 * 1024; // 1MB - only compress files larger than this

/**
 * Compress an image file if it exceeds the size threshold
 * @param file - The image file to compress
 * @returns Promise<File> - The compressed file or original if no compression needed
 */
export async function compressImage(file: File): Promise<File> {
  // Only compress images (not PDFs)
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Only compress if file is larger than threshold
  if (file.size <= SIZE_THRESHOLD) {
    console.log(`Image size (${(file.size / 1024).toFixed(2)} KB) is below threshold, skipping compression`);
    return file;
  }

  try {
    console.log(`Compressing image: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

    // Create an image element
    const img = await loadImage(file);

    // Calculate new dimensions while maintaining aspect ratio
    let { width, height } = img;
    
    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const aspectRatio = width / height;
      
      if (width > height) {
        width = MAX_WIDTH;
        height = Math.round(width / aspectRatio);
      } else {
        height = MAX_HEIGHT;
        width = Math.round(height * aspectRatio);
      }
    }

    // Create canvas and draw resized image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Draw image with high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Convert canvas to blob
    const blob = await canvasToBlob(canvas, file.type, QUALITY);

    // Create new file from blob
    const compressedFile = new File([blob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });

    const originalSize = (file.size / 1024).toFixed(2);
    const compressedSize = (compressedFile.size / 1024).toFixed(2);
    const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1);

    console.log(`Compression complete: ${originalSize} KB → ${compressedSize} KB (${savings}% reduction)`);

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed, using original:', error);
    return file;
  }
}

/**
 * Load an image file into an HTMLImageElement
 * @param file - The image file to load
 * @returns Promise<HTMLImageElement>
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert canvas to blob
 * @param canvas - The canvas element
 * @param type - MIME type
 * @param quality - Quality (0-1)
 * @returns Promise<Blob>
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      type,
      quality
    );
  });
}

/**
 * Get image dimensions without loading the full image
 * @param file - The image file
 * @returns Promise<{width: number, height: number}>
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return {
    width: img.width,
    height: img.height,
  };
}

/**
 * Check if a file should be compressed
 * @param file - The file to check
 * @returns boolean
 */
export function shouldCompress(file: File): boolean {
  return file.type.startsWith('image/') && file.size > SIZE_THRESHOLD;
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

