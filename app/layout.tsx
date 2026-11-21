import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B1F3A',
};

export const metadata: Metadata = {
  title: "DigiWork | India's Digital Workforce & Hiring Platform",
  description: "DigiWork connects workers, skilled professionals, contractors and hiring partners through a digital platform for work opportunities, workforce discovery, project management and professional services.",
  keywords: 'DigiWork, digital workforce, indian workforce, electrician, plumber, mason, carpenter, painter, labour, tenders, contractor hiring, professional services, india',
  authors: [{ name: 'DigiWork Technologies' }],
  creator: 'DigiWork Technologies',
  publisher: 'DigiWork Technologies',
  metadataBase: new URL('https://digiwork.in'),
  openGraph: {
    title: "DigiWork | India's Digital Workforce & Hiring Platform",
    description: "DigiWork connects workers, skilled professionals, contractors and hiring partners through a digital platform for work opportunities, workforce discovery, project management and professional services.",
    siteName: 'DigiWork',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'DigiWork - Digital Workforce Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "DigiWork | India's Digital Workforce & Hiring Platform",
    description: "DigiWork connects workers, skilled professionals, contractors and hiring partners through a digital platform for work opportunities, workforce discovery, project management and professional services.",
    images: ['/logo.svg'],
  },
  icons: {
    icon: '/logo-icon.svg',
    shortcut: '/logo-icon.svg',
    apple: '/logo-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F5F8FC] text-[#0B1F3A] antialiased selection:bg-[#2563EB] selection:text-white">
        <Navbar />
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
