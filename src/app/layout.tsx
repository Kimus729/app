
import type { Metadata } from 'next';
import { Inter, Kanit, Genos } from 'next/font/google'; // Removed GFS_Didot, Added Genos
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // For potential toast notifications

const inter = Inter({ 
  variable: '--font-inter', 
  subsets: ['latin'],
  display: 'swap',
});

const kanit = Kanit({ // Kept Kanit for now, might be removed if not used elsewhere
  variable: '--font-kanit',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'], 
});

const genos = Genos({ // Added Genos
  variable: '--font-genos',
  subsets: ['latin'], 
  display: 'swap',
  weight: ['400', '700'], // Include weights for normal and bold
});

export const metadata: Metadata = {
  title: 'VOSDECISIONS App',
  description: 'Query MultiversX VM data with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${kanit.variable} ${genos.variable} font-sans antialiased`}> {/* Updated font variables */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
