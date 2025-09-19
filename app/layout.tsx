import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeToggle from "./components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense AI",
  description: "Smart expense extraction and categorization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}> 
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center space-x-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">EA</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Expense AI</span>
              </Link>
              <nav className="flex items-center gap-2">
                <Link href="/admin/categories" className="hidden sm:inline-flex px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition">Categories</Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto max-w-5xl px-4 py-6 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between">
              <div>
                <span className="font-medium">Expense AI</span> · Built with Next.js and AI SDK
              </div>
              <div className="space-x-4">
                <a href="/admin/categories" className="hover:underline">Admin</a>
                <a href="https://nextjs.org" target="_blank" rel="noreferrer" className="hover:underline">Next.js</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
