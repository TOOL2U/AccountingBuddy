import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Accounting Buddy',
  description: 'AI-powered receipt tracking and P&L automation',
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Accounting Buddy',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
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
          <div className="max-w-[1100px] mx-auto px-2 sm:px-6 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
