
import type { Metadata } from 'next';
import { Inter, Kanit, DM_Serif_Display } from 'next/font/google'; 
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { EnvironmentProvider } from '@/contexts/EnvironmentContext';
import { LocaleProvider } from '@/contexts/LocaleContext'; // Import LocaleProvider
import { translations, DEFAULT_LOCALE } from '@/config/locales';


const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const kanit = Kanit({
  variable: '--font-kanit',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'], 
});

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif-display',
  subsets: ['latin'],
  weight: ['400'], 
  display: 'swap',
});


let faviconHref = '/favicon.png';

if (process.env.NEXT_PUBLIC_GITHUB_ACTIONS === 'true' && process.env.NEXT_PUBLIC_GITHUB_REPOSITORY) {
  const [owner, repoName] = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY.split('/');
  if (owner && repoName) {
    faviconHref = `https://${owner}.github.io/${repoName}/favicon.png`;
  }
}

export const metadata: Metadata = {
  title: translations.appMetaTitle[DEFAULT_LOCALE],
  description: translations.appMetaDescription[DEFAULT_LOCALE],
  icons: {
    icon: faviconHref,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&family=Genos:ital,wght@0,100..900;1,100..900&family=Scope+One&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${kanit.variable} ${dmSerifDisplay.variable} font-sans antialiased`}>
        <EnvironmentProvider>
          <LocaleProvider> {/* Wrap with LocaleProvider */}
            {children}
          </LocaleProvider>
        </EnvironmentProvider>
        <Toaster />
      </body>
    </html>
  );
}
