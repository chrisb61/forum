import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/layout/Providers';
import Navbar from '@/components/layout/Navbar';
import Vera from '@/components/vera/Vera';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'ESG Intelligence Network', template: '%s | ESG Intelligence Network' },
  description: 'A private intelligence network for non-executive directors, board advisors, and sustainability professionals.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container py-6">{children}</main>
            <footer className="border-t py-4 text-center text-sm text-muted-foreground">
              <p>ESG Intelligence Network &copy; {new Date().getFullYear()}</p>
            </footer>
            <Vera />
          </div>
        </Providers>
      </body>
    </html>
  );
}
