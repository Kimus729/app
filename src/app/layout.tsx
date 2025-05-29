
import type { Metadata } from 'next';
import { Inter, Exo_2 } from 'next/font/google'; // Changed from Playfair_Display
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // For potential toast notifications

const inter = Inter({ 
  variable: '--font-inter', 
  subsets: ['latin'],
  display: 'swap',
});

const exo2 = Exo_2({
  variable: '--font-exo2',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'], // Include weights you might need
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
      <body className={`${inter.variable} ${exo2.variable} font-sans antialiased`}> {/* Updated font variable and base font family */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
