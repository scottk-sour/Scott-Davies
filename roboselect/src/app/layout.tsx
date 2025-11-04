import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'RoboSelect - Find the Perfect Robot for Your Business',
    template: '%s | RoboSelect',
  },
  description:
    'Find the perfect service robot for your UK business in 2 minutes. Compare delivery robots, cleaning robots, and reception robots with instant quotes and demos.',
  keywords: [
    'service robots UK',
    'restaurant robots',
    'hotel robots',
    'delivery robots',
    'cleaning robots',
    'Pudu robots',
    'Keenon robots',
  ],
  authors: [{ name: 'RoboSelect' }],
  creator: 'RoboSelect',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'RoboSelect - Find the Perfect Robot for Your Business',
    description: 'Find the perfect service robot for your UK business in 2 minutes',
    siteName: 'RoboSelect',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoboSelect - Find the Perfect Robot for Your Business',
    description: 'Find the perfect service robot for your UK business in 2 minutes',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
