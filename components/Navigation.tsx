'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Receipt } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <nav
      className="sticky top-0 z-40 glass border-b border-white/10"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <Link
            href="/upload"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-dark-base rounded-lg px-2 py-1"
            aria-label="Accounting Buddy home"
          >
            <div className="relative">
              {/* Icon background glow */}
              <div className="absolute inset-0 bg-accent-primary/20 rounded-lg blur-md group-hover:bg-accent-primary/30 transition-all" aria-hidden="true" />
              {/* Icon */}
              <div className="relative w-9 h-9 bg-gradient-to-br from-accent-primary to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Receipt className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-lg font-bold text-text-primary hidden sm:inline group-hover:text-accent-primary transition-colors">
              Accounting Buddy
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/upload"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-dark-base
                ${isActive('/upload')
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }
              `}
              aria-label="Upload receipts"
              aria-current={isActive('/upload') ? 'page' : undefined}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="hidden sm:inline">Upload</span>
            </Link>
            <Link
              href="/inbox"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-dark-base
                ${isActive('/inbox')
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }
              `}
              aria-label="View inbox"
              aria-current={isActive('/inbox') ? 'page' : undefined}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <span className="hidden sm:inline">Inbox</span>
            </Link>
            <Link
              href="/pnl"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-dark-base
                ${isActive('/pnl')
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }
              `}
              aria-label="P&L Dashboard"
              aria-current={isActive('/pnl') ? 'page' : undefined}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">P&L</span>
            </Link>
            <Link
              href="/balance"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-dark-base
                ${isActive('/balance')
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }
              `}
              aria-label="Balance Management"
              aria-current={isActive('/balance') ? 'page' : undefined}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="hidden sm:inline">Balance</span>
            </Link>
            <Link
              href="/admin"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:ring-offset-2 focus:ring-offset-dark-base
                ${isActive('/admin')
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }
              `}
              aria-label="Admin panel"
              aria-current={isActive('/admin') ? 'page' : undefined}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

