'use client';

import { Plus, Trash2 } from 'lucide-react';

interface CategoryTableProps {
  title: string;
  description: string;
  items: string[];
  loading: boolean;
  icon: string;
}

export default function CategoryTable({ title, description, items, loading, icon }: CategoryTableProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {loading ? 'Loading...' : `${items.length} ${items.length === 1 ? 'item' : 'items'}`}
          </p>
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/30 text-slate-500 rounded-lg cursor-not-allowed opacity-50"
            title="Coming in Phase 3"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add New</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-slate-700/50 animate-pulse rounded" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  #
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {items.map((item, idx) => (
                <tr 
                  key={idx}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{item}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      disabled
                      className="p-2 text-slate-600 hover:text-slate-500 cursor-not-allowed opacity-50"
                      title="Coming in Phase 3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-400">No items found</p>
            <p className="text-sm text-slate-500 mt-1">Add your first item to get started</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-900/30 border-t border-slate-700/30">
        <p className="text-xs text-slate-500 text-center">
          Changes will sync to Google Sheets and mobile app • Phase 3 feature
        </p>
      </div>
    </div>
  );
}

