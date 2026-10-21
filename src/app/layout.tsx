import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/lib/redux/provider';
import QueryProvider from '@/lib/query-provider';
import { Suspense } from 'react';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sociality',
  description: 'Connect, share, and engage with your community on Sociality.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='en'
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='min-h-full flex flex-col'>
        <Suspense fallback={null}>
          <ReduxProvider>
            <QueryProvider>{children}</QueryProvider>
          </ReduxProvider>
        </Suspense>
      </body>
    </html>
  );
}
