import { UserProvider } from '@/components/auth/user-provider';
import Header from '@/components/layout/header';
import { getUser } from '@/lib/db/data';
import type { Metadata } from 'next';
import { Merriweather } from 'next/font/google';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import './globals.css';

const satoshi = localFont({
  src: './fonts/Satoshi-Variable.woff2',
  display: 'swap',
  variable: '--font-satoshi',
});
const merriweather = Merriweather({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: {
    default: 'Critix',
    template: '%s | Critix',
  },
  description: 'A movie review website',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userPromise = getUser();

  return (
    <html lang="en">
      <body
        className={`${satoshi.variable} ${merriweather.variable} antialiased tracking-tight`}
      >
        <Suspense fallback={null}>
          <UserProvider userPromise={userPromise}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 flex flex-col items-center gap-8">
                {children}
              </main>
            </div>
          </UserProvider>
        </Suspense>
      </body>
    </html>
  );
}
