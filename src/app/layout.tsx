
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Playfair_Display
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // For potential toast notifications

const inter = Inter({ // Changed from playfairDisplay
  variable: '--font-inter', // New CSS variable
  subsets: ['latin'],
  display: 'swap',
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
      <body className={`${inter.variable} font-sans antialiased`}> {/* Updated font variable and base font family */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
