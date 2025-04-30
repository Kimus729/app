import type {Metadata} from 'next';
// Correctly import fonts from next/font/google
import { Inter } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster" // Import Toaster

// Initialize the font with subsets
const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: 'signature fichier', // Update title
  description: 'Calculate SHA-256 hash of local files via drag and drop.', // Update description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       {/* Apply the font class to the body */}
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
