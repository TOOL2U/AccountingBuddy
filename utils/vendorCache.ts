/**
 * Vendor-to-Category Cache Utility
 * 
 * Caches AI-extracted vendor-to-category mappings in localStorage
 * to reduce API calls and improve performance for repeat vendors.
 */

interface VendorCacheEntry {
  vendor: string;
  category: string;
  timestamp: number;
}

const CACHE_KEY = 'accounting_buddy_vendor_cache';
const CACHE_EXPIRY_DAYS = 30; // Cache entries expire after 30 days

/**
 * Get cached category for a vendor
 * @param vendor - Vendor name (case-insensitive)
 * @returns Cached category or null if not found/expired
 */
export function getCachedCategory(vendor: string): string | null {
  if (typeof window === 'undefined') return null; // Server-side check
  
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return null;

    const entries: VendorCacheEntry[] = JSON.parse(cache);
    const normalizedVendor = vendor.trim().toLowerCase();
    
    // Find matching vendor
    const entry = entries.find(
      (e) => e.vendor.toLowerCase() === normalizedVendor
    );
    
    if (!entry) return null;
    
    // Check if entry is expired
    const now = Date.now();
    const expiryTime = entry.timestamp + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    
    if (now > expiryTime) {
      // Entry expired, remove it
      removeCachedVendor(vendor);
      return null;
    }
    
    return entry.category;
  } catch (error) {
    console.error('Error reading vendor cache:', error);
    return null;
  }
}

/**
 * Cache a vendor-to-category mapping
 * @param vendor - Vendor name
 * @param category - Category name
 */
export function cacheVendorCategory(vendor: string, category: string): void {
  if (typeof window === 'undefined') return; // Server-side check
  
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    let entries: VendorCacheEntry[] = cache ? JSON.parse(cache) : [];
    
    const normalizedVendor = vendor.trim().toLowerCase();
    
    // Remove existing entry for this vendor (if any)
    entries = entries.filter(
      (e) => e.vendor.toLowerCase() !== normalizedVendor
    );
    
    // Add new entry
    entries.push({
      vendor: vendor.trim(),
      category: category.trim(),
      timestamp: Date.now(),
    });
    
    // Limit cache size to 100 entries (remove oldest)
    if (entries.length > 100) {
      entries.sort((a, b) => b.timestamp - a.timestamp);
      entries = entries.slice(0, 100);
    }
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error writing to vendor cache:', error);
  }
}

/**
 * Remove a vendor from cache
 * @param vendor - Vendor name to remove
 */
export function removeCachedVendor(vendor: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return;

    let entries: VendorCacheEntry[] = JSON.parse(cache);
    const normalizedVendor = vendor.trim().toLowerCase();
    
    entries = entries.filter(
      (e) => e.vendor.toLowerCase() !== normalizedVendor
    );
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error removing from vendor cache:', error);
  }
}

/**
 * Clear all cached vendors
 */
export function clearVendorCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing vendor cache:', error);
  }
}

/**
 * Get all cached vendors
 * @returns Array of cached vendor entries
 */
export function getAllCachedVendors(): VendorCacheEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return [];

    const entries: VendorCacheEntry[] = JSON.parse(cache);
    
    // Filter out expired entries
    const now = Date.now();
    const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    return entries.filter((e) => now - e.timestamp < expiryTime);
  } catch (error) {
    console.error('Error reading vendor cache:', error);
    return [];
  }
}

/**
 * Get cache statistics
 * @returns Object with cache stats
 */
export function getCacheStats(): {
  totalEntries: number;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  const entries = getAllCachedVendors();
  
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }
  
  const timestamps = entries.map((e) => e.timestamp);
  
  return {
    totalEntries: entries.length,
    oldestEntry: Math.min(...timestamps),
    newestEntry: Math.max(...timestamps),
  };
}

