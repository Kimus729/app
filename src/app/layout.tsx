import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google'; // Use Geist_Mono
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // For potential toast notifications

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
      <body className={`${geistMono.variable} font-mono antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
