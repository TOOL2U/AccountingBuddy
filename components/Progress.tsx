'use client';

interface ProgressProps {
  value: number; // 0-100
  label?: string;
  className?: string;
}

export default function Progress({ value, label, className = '' }: ProgressProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-secondary">{label}</span>
          <span className="text-text-meta">{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

