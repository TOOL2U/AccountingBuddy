'use client';

import { useState } from 'react';

interface ConfidenceBadgeProps {
  confidence: number; // 0-1
  rationale?: string;
  keywords?: string[];
  className?: string;
}

export default function ConfidenceBadge({
  confidence,
  rationale,
  keywords,
  className = '',
}: ConfidenceBadgeProps) {
  const [showDrawer, setShowDrawer] = useState(false);

  const getConfidenceLevel = () => {
    if (confidence >= 0.9) return { label: 'High', color: 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' };
    if (confidence >= 0.75) return { label: 'Medium', color: 'bg-accent-warn/20 text-accent-warn border-accent-warn/30' };
    return { label: 'Needs review', color: 'bg-accent-danger/20 text-accent-danger border-accent-danger/30' };
  };

  const level = getConfidenceLevel();
  const hasDetails = rationale || (keywords && keywords.length > 0);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => hasDetails && setShowDrawer(!showDrawer)}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
          ${level.color}
          ${hasDetails ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
          transition-opacity duration-150
        `}
        disabled={!hasDetails}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {level.label}
        {confidence < 1 && (
          <span className="text-[10px] opacity-70">
            {Math.round(confidence * 100)}%
          </span>
        )}
        {hasDetails && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {/* Rationale Drawer */}
      {showDrawer && hasDetails && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setShowDrawer(false)}
          />
          
          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up md:absolute md:top-full md:left-0 md:right-auto md:mt-2 md:w-80">
            <div className="glass rounded-t-2xl md:rounded-2xl p-4 border-t border-white/10 md:border">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-semibold text-text-primary">Match Details</h4>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="text-text-meta hover:text-text-secondary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-text-meta mb-1">Confidence Score</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          confidence >= 0.9 ? 'bg-accent-primary' :
                          confidence >= 0.75 ? 'bg-accent-warn' :
                          'bg-accent-danger'
                        }`}
                        style={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-text-secondary">
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                </div>

                {keywords && keywords.length > 0 && (
                  <div>
                    <div className="text-xs text-text-meta mb-2">Matched Keywords</div>
                    <div className="flex flex-wrap gap-1.5">
                      {keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-text-secondary"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {rationale && (
                  <div>
                    <div className="text-xs text-text-meta mb-1">Rationale</div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {rationale}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

