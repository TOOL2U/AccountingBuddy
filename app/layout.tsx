import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Accounting Buddy',
  description: 'AI-powered receipt tracking and P&L automation',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-0 text-text-primary">
        <Navigation />
        <main className="min-h-screen">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

