
import type { Metadata } from 'next';
import { Inter, Kanit, GFS_Didot } from 'next/font/google'; // Changed Exo_2 to Kanit, Added GFS_Didot
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

const gfsDidot = GFS_Didot({ // Added GFS_Didot
  variable: '--font-gfs-didot',
  subsets: ['greek'], // GFS Didot typically supports Greek, check subsets if others needed
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
      <body className={`${inter.variable} ${kanit.variable} ${gfsDidot.variable} font-sans antialiased`}> {/* Updated font variables */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
