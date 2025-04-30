import type {Metadata} from 'next';
// Correctly import fonts from next/font/google
import { Inter } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster" // Import Toaster

// Initialize the font with subsets
const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: 'Signature de Fichier', // Update title to French
  description: 'Calculez le hash SHA-256 des fichiers locaux par glisser-déposer.', // Update description to French
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">{/* Change lang to fr */}
      {/* Apply the font class to the body */}
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
