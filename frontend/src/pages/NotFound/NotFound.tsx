import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm max-w-md w-full">
        <FileQuestion className="w-16 h-16 text-brand-500 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">404</h1>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">Page Not Found</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
          The requested page path does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-xl shadow transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
