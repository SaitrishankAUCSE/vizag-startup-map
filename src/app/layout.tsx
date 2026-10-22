import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dmsans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vizag Startup Map | Visakhapatnam Startup & Tech Ecosystem',
  description:
    'An editorial living directory and map of startups, investors, incubators, campuses, and coworking spaces in Visakhapatnam (Vizag), India.',
  icons: {
    icon: '/favicon.svg',
  },
  authors: [{ name: 'Vizag Startup Map' }],
  openGraph: {
    title: 'Vizag Startup Map — An Ecosystem Mapped',
    description:
      'Every startup, investor, campus, and workspace in Visakhapatnam on one living map.',
    url: 'https://vizagstartupmap.com',
    siteName: 'Vizag Startup Map',
    locale: 'en_IN',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#3A0F34',
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
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col font-sans bg-[#DDE3E8] text-[#3A0F34]">
        {children}
      </body>
    </html>
  );
}
