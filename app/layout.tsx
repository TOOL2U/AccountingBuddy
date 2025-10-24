import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Accounting Buddy',
  description: 'AI-powered receipt tracking and P&L automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}

