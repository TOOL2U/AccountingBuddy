import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <Link href="/upload" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-500">📊</div>
            <span className="text-xl font-semibold text-gray-900">
              Accounting Buddy
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-1 sm:space-x-4">
            <Link
              href="/upload"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-500 hover:bg-gray-50 transition-colors"
            >
              Upload
            </Link>
            <Link
              href="/inbox"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-500 hover:bg-gray-50 transition-colors"
            >
              Inbox
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

