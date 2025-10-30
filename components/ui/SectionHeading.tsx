import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: boolean;
}

export default function SectionHeading({
  title,
  subtitle,
  icon,
  gradient = false,
}: SectionHeadingProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className="text-2xl">{icon}</span>}
        <h2
          className={`text-2xl font-bold ${
            gradient ? 'gradient-text' : 'text-text-primary'
          }`}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-text-secondary text-sm ml-11">{subtitle}</p>
      )}
    </div>
  );
}

