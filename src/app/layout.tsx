
import type { Metadata } from 'next';
import { Inter, Kanit, Genos } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

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

const genos = Genos({
  variable: '--font-genos',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
});

let faviconHref = '/favicon.png'; // Default for local development

if (process.env.NEXT_PUBLIC_GITHUB_ACTIONS === 'true' && process.env.NEXT_PUBLIC_GITHUB_REPOSITORY) {
  const [owner, repoName] = process.env.NEXT_PUBLIC_UNDERSCORE_GITHUB_REPOSITORY ? process.env.NEXT_PUBLIC_UNDERSCORE_GITHUB_REPOSITORY.split('/') : process.env.NEXT_PUBLIC_GITHUB_REPOSITORY.split('/');
  if (owner && repoName) {
    faviconHref = `https://${owner}.github.io/${repoName}/favicon.png`;
  }
}


export const metadata: Metadata = {
  title: 'VOSDECISIONS App',
  description: 'Query MultiversX VM data with ease.',
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
    <html lang="en">
      <body className={`${inter.variable} ${kanit.variable} ${genos.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
