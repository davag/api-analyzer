'use client';

import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">
            <Link href="/">
              API Specification Quality Analyzer
            </Link>
          </h1>
          {subtitle && <p className="mt-2">{subtitle}</p>}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-6">
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        {children}
      </main>
      
      <footer className="bg-gray-100 p-6 mt-auto">
        <div className="container mx-auto text-center text-gray-700 text-sm">
          <p>© {new Date().getFullYear()} API Specification Quality Analyzer</p>
        </div>
      </footer>
    </div>
  );
} 