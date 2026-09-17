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
    default: 'NAK Digital Office',
    template: '%s | NAK Digital',
  },
  description:
    'NAK Digital internal virtual office - collaborate, communicate and manage projects from anywhere.',
  keywords: ['NAK Digital', 'virtual office', 'team collaboration', 'remote work', 'digital agency'],
  authors: [{ name: 'NAK Digital' }],
  creator: 'NAK Digital',
  openGraph: {
    type:        'website',
    title:       'NAK Digital Office',
    description: 'Your team. Your office. Anywhere.',
    siteName:    'NAK Digital Office',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'NAK Digital Office',
    description: 'Your team. Your office. Anywhere.',
  },
  icons: {
    icon: '/favicon.ico',
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
