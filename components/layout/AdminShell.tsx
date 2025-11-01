'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  Settings, 
  Inbox,
  Menu,
  X
} from 'lucide-react';

interface AdminShellProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'P&L', href: '/pnl', icon: TrendingUp },
  { name: 'Balances', href: '/balance', icon: Wallet },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 
        bg-gradient-to-b from-slate-900 to-slate-950 
        border-r border-slate-800/50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo / Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AB</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">Accounting Buddy</h1>
              <p className="text-slate-400 text-xs">Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50">
          <div className="text-xs text-slate-500">
            <p>Desktop Analytics Console</p>
            <p className="mt-1">Use mobile app for data entry</p>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-30">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Period selector placeholder */}
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-slate-400">Period:</span>
                <span className="ml-2 text-white font-medium">November 2025</span>
              </div>
            </div>

            {/* User info placeholder */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-white font-medium">Shaun Ducker</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">SD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

