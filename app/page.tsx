'use client';

import { ChatPanel } from './components/ChatPanel';

export default function Page() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
          New
          <span className="ml-2 opacity-80">Gemini + Embeddings powered categorization</span>
        </div>
        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Extract and categorize expenses with AI
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Paste receipts or statements and get structured categories instantly. Switch APIs to compare behavior.
        </p>
      </section>

      <ChatPanel />

      <section className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Tip: Visit the Admin panel to manage category taxonomy.
      </section>
    </div>
  );
}
