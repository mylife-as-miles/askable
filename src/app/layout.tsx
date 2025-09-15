import type { Metadata } from 'next';
import { Instrument_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { UserLimitsProvider } from '@/hooks/UserLimitsContext';
import { APP_NAME } from '@/lib/utils';
import PlausibleProvider from 'next-plausible';
import { ThemeProvider } from 'next-themes';

const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: `${APP_NAME}`,
  description: 'Askable — chat with your CSVs using OpenRouter',
  openGraph: {
  images: ['/og.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
  <PlausibleProvider domain='askable.com' />
      </head>
      <body className={`${instrumentSans.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserLimitsProvider>
            {children}
            <Toaster richColors />
          </UserLimitsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
