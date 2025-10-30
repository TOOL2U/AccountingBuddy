'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Upload, Inbox, BarChart3, Settings, Sparkles, Wallet } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { scrollY } = useScroll();

  // Navbar background opacity increases on scroll
  const navOpacity = useTransform(scrollY, [0, 100], [0.8, 0.95]);
  const navBlur = useTransform(scrollY, [0, 100], [12, 20]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navItems = [
    { href: '/upload', label: 'Upload', icon: Upload, color: 'from-brand-primary to-status-info' },
    { href: '/inbox', label: 'Inbox', icon: Inbox, color: 'from-status-info to-brand-primary' },
    { href: '/pnl', label: 'P&L', icon: BarChart3, color: 'from-status-success to-status-info' },
    { href: '/balance', label: 'Balance', icon: Wallet, color: 'from-status-warning to-status-success' },
    { href: '/admin', label: 'Admin', icon: Settings, color: 'from-text-secondary to-text-tertiary' },
  ];

  return (
    <motion.nav
      style={{
        backdropFilter: useTransform(navBlur, (v) => `blur(${v}px)`),
      }}
      className="sticky top-0 z-50 border-b border-slate-700/20 bg-black/60 backdrop-blur-xl"
    >
      {/* Subtle gradient line at top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-500/20 to-transparent"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 100%' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title - Very subtle */}
          <Link href="/upload" className="flex items-center gap-3 group relative">
            {/* Very subtle hover glow */}
            <motion.div
              className="absolute inset-0 bg-slate-400/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ transform: 'scale(1.5)' }}
            />

            {/* Logo icon - minimal color */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <div className="relative p-2 bg-slate-800/30 border border-slate-600/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
              </div>
            </motion.div>

            {/* Title - subtle color */}
            <div className="relative">
              <motion.span
                className="text-lg font-bold text-slate-300 group-hover:text-slate-200 transition-colors"
              >
                Accounting Buddy
              </motion.span>
            </div>
          </Link>

          {/* Navigation Links - Enhanced with icons and effects */}
          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className={`
                      relative px-4 py-2 rounded-xl transition-all duration-300
                      ${active
                        ? 'text-slate-200'
                        : 'text-slate-500 hover:text-slate-300'
                      }
                    `}
                  >
                    {/* Subtle glow on hover only */}
                    {hoveredItem === item.href && !active && (
                      <motion.div
                        className="absolute inset-0 bg-slate-700/10 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}

                    {/* Content */}
                    <span className="relative flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${active ? 'text-slate-300' : ''}`} />
                      <span className="hidden sm:inline text-sm font-medium">
                        {item.label}
                      </span>
                    </span>

                    {/* Active indicator - very subtle underline */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-slate-400/40 rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                      />
                    )}

                    {/* Subtle hover glow */}
                    {hoveredItem === item.href && (
                      <motion.div
                        className="absolute inset-0 shadow-[0_0_12px_rgba(148,163,184,0.06)] rounded-xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subtle bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-700/20" />
    </motion.nav>
  );
}

