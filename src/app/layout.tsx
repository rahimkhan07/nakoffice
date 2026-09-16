import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'VirtOffice – Your Company, Your Office, Anywhere',
    template: '%s | VirtOffice',
  },
  description:
    'Build a virtual workplace where your team can collaborate, communicate and work together from anywhere.',
  keywords: ['virtual office', 'remote work', 'team collaboration', 'SaaS'],
  openGraph: {
    type: 'website',
    title: 'VirtOffice',
    description: 'Your Company. Your Office. Anywhere.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
