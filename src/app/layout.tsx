
import type { Metadata } from 'next';
import { Inter, Kanit, Josefin_Sans } from 'next/font/google'; // Changed Exo_2 to Kanit
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // For potential toast notifications

const inter = Inter({ 
  variable: '--font-inter', 
  subsets: ['latin'],
  display: 'swap',
});

const kanit = Kanit({ // Added Kanit
  variable: '--font-kanit',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'], // Specify weights, 700 for bold
});

const josefinSans = Josefin_Sans({ // Kept Josefin Sans
  variable: '--font-josefin-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'], 
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
      <body className={`${inter.variable} ${kanit.variable} ${josefinSans.variable} font-sans antialiased`}> {/* Updated font variables */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
