import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'KAAMSETU — Right People. Right Place. Right Work.',
  description: 'India\'s digital workforce platform connecting local skilled workers, customers, contractors, and companies with real GPS dispatch and transparent payments.',
  keywords: 'kaamsetu, electrician, plumber, mason, carpenter, painter, labour, tenders, contractor hiring, workforce, india',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-bg text-text-primary antialiased selection:bg-lime selection:text-forest">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
