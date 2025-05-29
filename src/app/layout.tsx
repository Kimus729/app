import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google'; // Changed from Geist_Mono
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // For potential toast notifications

const playfairDisplay = Playfair_Display({ // Changed from geistMono
  variable: '--font-playfair-display', // New CSS variable
  subsets: ['latin'],
  display: 'swap', // Optional: Improves font loading behavior
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
      <body className={`${playfairDisplay.variable} font-serif antialiased`}> {/* Updated font variable and base font family */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
