
import type { Metadata } from 'next';
import { Inter, Kanit, Exo_2 } from 'next/font/google'; // Added Exo_2, removed DM_Serif_Display
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

const exo2 = Exo_2({ // Instantiated Exo_2
  variable: '--font-exo2',
  subsets: ['latin'],
  weight: ['400', '700'], // Exo 2 offers various weights
  display: 'swap',
});

let faviconHref = '/favicon.png'; // Default for local development

if (process.env.NEXT_PUBLIC_GITHUB_ACTIONS === 'true' && process.env.NEXT_PUBLIC_GITHUB_REPOSITORY) {
  const [owner, repoName] = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY.split('/');
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
      <body className={`${inter.variable} ${kanit.variable} ${exo2.variable} font-sans antialiased`}> {/* Added exo2.variable */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
