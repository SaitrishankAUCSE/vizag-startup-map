import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vizag Startup Map | Interactive Visakhapatnam Startup Directory',
  description:
    'Free interactive directory and ecosystem map of startups, venture investors, incubators, colleges, and coworking spaces in Visakhapatnam (Vizag), India.',
  keywords: [
    'Vizag startups',
    'Visakhapatnam startup map',
    'Andhra Pradesh startups',
    'Vizag tech ecosystem',
    'Rushikonda IT SEZ',
    'Andhra University startups',
    'GITAM venture',
  ],
  authors: [{ name: 'Vizag Startup Map Community' }],
  openGraph: {
    title: 'Vizag Startup Map - Discover the Tech Ecosystem of Visakhapatnam',
    description:
      'Explore active startups, investors, incubators, universities, and coworking spaces across Vizag on an interactive map.',
    url: 'https://vizagstartupmap.com',
    siteName: 'Vizag Startup Map',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vizag Startup Map',
    description:
      'Interactive map and directory of startups, investors, and hubs in Visakhapatnam.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E4D64',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full`}>
      <body className="h-full flex flex-col font-sans antialiased bg-[#FBF9F5] text-[#13222A]">
        {children}
      </body>
    </html>
  );
}
