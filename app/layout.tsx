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
      <body className="bg-black text-white relative">
        <Navigation />
        <main className="min-h-screen relative z-10">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
