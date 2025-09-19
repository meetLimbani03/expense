'use client';

import { ChatPanel } from './components/ChatPanel';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Chat Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Powered by Google Gemini + Embeddings • Smart expense extraction!
          </p>
        </div>

        <ChatPanel />

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <a
            href="/admin/categories"
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            ⚙️ Manage Categories
          </a>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Built with Next.js, AI SDK, and Google Gemini
          </div>
        </div>
      </div>
    </div>
  );
}
