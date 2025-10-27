'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Upload, Inbox, BarChart3, Settings, Sparkles } from 'lucide-react';
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
    { href: '/admin', label: 'Admin', icon: Settings, color: 'from-text-secondary to-text-tertiary' },
  ];

  return (
    <motion.nav
      style={{
        backdropFilter: useTransform(navBlur, (v) => `blur(${v}px)`),
      }}
      className="sticky top-0 z-50 border-b border-border-light/50 bg-surface-0/80 backdrop-blur-xl"
    >
      {/* Animated gradient line at top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary to-transparent"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 100%' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title - Enhanced with glow */}
          <Link href="/upload" className="flex items-center gap-3 group relative">
            {/* Glow effect on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-status-info/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ transform: 'scale(1.5)' }}
            />

            {/* Logo icon with animation */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-status-info rounded-lg blur-md opacity-50" />
              <div className="relative p-2 bg-gradient-to-br from-brand-primary to-status-info rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </motion.div>

            {/* Title with gradient */}
            <div className="relative">
              <motion.span
                className="text-lg font-extrabold bg-gradient-to-r from-brand-primary via-status-info to-brand-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
              >
                Accounting Buddy
              </motion.span>

              {/* Sparkle decoration */}
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-1 -right-3 text-xs"
              >
                ✨
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
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative px-4 py-2 rounded-xl transition-all duration-200
                      ${active
                        ? 'bg-surface-2 text-text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-1'
                      }
                    `}
                  >
                    {/* Glow effect on hover */}
                    {(hoveredItem === item.href || active) && (
                      <motion.div
                        layoutId={active ? 'activeGlow' : 'hoverGlow'}
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-xl blur-sm`}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Content */}
                    <span className="relative flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${active ? 'text-brand-primary' : ''}`} />
                      <span className="hidden sm:inline text-sm font-medium">
                        {item.label}
                      </span>
                    </span>

                    {/* Active indicator - animated underline */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={`absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r ${item.color} rounded-full`}
                        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                      />
                    )}

                    {/* Hover shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl"
                      animate={hoveredItem === item.href ? {
                        x: ['-100%', '100%'],
                      } : {}}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />
    </motion.nav>
  );
}

