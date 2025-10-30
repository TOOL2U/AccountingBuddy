/**
 * SkeletonCard Component
 * 
 * Loading skeleton for inbox receipt cards with shimmer animation.
 * Respects prefers-reduced-motion for accessibility.
 */

export default function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-4 animate-pulse" role="status" aria-label="Loading receipt">
      <div className="flex gap-4">
        {/* Thumbnail placeholder */}
        <div className="flex-shrink-0 w-16 h-16 bg-white/10 rounded-lg shimmer" />
        
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Vendor name */}
          <div className="h-5 bg-white/10 rounded w-3/4 shimmer" />
          
          {/* Amount and date */}
          <div className="flex gap-4">
            <div className="h-4 bg-white/10 rounded w-20 shimmer" />
            <div className="h-4 bg-white/10 rounded w-24 shimmer" />
          </div>
        </div>
        
        {/* Status pill placeholder */}
        <div className="flex-shrink-0 h-6 w-16 bg-white/10 rounded-full shimmer" />
      </div>
      
      <span className="sr-only">Loading receipt information...</span>
    </div>
  );
}

