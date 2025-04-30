
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import next/image
import { Dropzone } from '@/components/dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Terminal } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert

interface AccountData {
  address: string;
  nonce: number;
  balance: string;
  username?: string; // Optional property
  // Add other relevant fields if needed
  [key: string]: any; // Allow for other properties
}


export default function Home() {
  const [hash, setHash] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccountData = async () => {
      setIsLoadingData(true);
      setFetchError(null);
      try {
        const response = await fetch('https://testnet-api.multiversx.com/accounts/erd1krmnqp7vjy3g2d0xlt355nhhanuft3ev5avneqp6xa9j23g80qesx7g2lj');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AccountData = await response.json();
        setAccountData(data);
      } catch (error) {
        console.error("Failed to fetch account data:", error);
        setFetchError(error instanceof Error ? error.message : 'An unknown error occurred');
        toast({
          variant: "destructive",
          title: "API Fetch Failed",
          description: "Could not fetch account data from MultiversX API.",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAccountData();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once on mount

  const handleHashCalculated = (calculatedHash: string, name: string) => {
    setHash(calculatedHash);
    setFileName(name);
    if (calculatedHash) {
       toast({
         title: "Hash Calculated Successfully",
         description: `SHA-256 hash for ${name} generated.`,
       });
    } else if (name) { // Handle case where hash calculation failed but we have a filename
      toast({
        variant: "destructive",
        title: "Hash Calculation Failed",
        description: `Could not calculate hash for ${name}.`,
      });
    }
  };

  const copyToClipboard = (textToCopy: string, type: string) => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          toast({
            title: "Copied to Clipboard!",
            description: `The ${type} has been copied.`,
          });
        })
        .catch(err => {
          console.error(`Failed to copy ${type}: `, err);
           toast({
             variant: "destructive",
             title: "Copy Failed",
             description: `Could not copy the ${type} to clipboard.`,
           });
        });
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-gradient-to-br from-blue-200 to-yellow-200 overflow-hidden"> {/* Updated background gradient */}
       {/* Background Cat Images */}
       <Image
         src="https://picsum.photos/seed/cat1/300/200"
         alt="Background cat image 1"
         width={300}
         height={200}
         className="fixed -z-10 opacity-10 rounded-lg shadow-md top-10 left-10 object-cover"
         data-ai-hint="cat"
         priority
       />
        <Image
         src="https://picsum.photos/seed/cat2/250/350"
         alt="Background cat image 2"
         width={250}
         height={350}
         className="fixed -z-10 opacity-10 rounded-lg shadow-md bottom-5 right-5 object-cover"
         data-ai-hint="cat"
       />
       <Image
         src="https://picsum.photos/seed/cat3/200/200"
         alt="Background cat image 3"
         width={200}
         height={200}
         className="fixed -z-10 opacity-10 rounded-full shadow-md top-1/3 right-20 transform -translate-y-1/2 object-cover"
         data-ai-hint="cat"
       />
        <Image
         src="https://picsum.photos/seed/cat4/400/250"
         alt="Background cat image 4"
         width={400}
         height={250}
         className="fixed -z-10 opacity-10 rounded-lg shadow-md bottom-1/4 left-16 transform translate-y-1/2 object-cover"
         data-ai-hint="cat"
       />

      {/* Main Content - Added z-10 to ensure it's above background images */}
      <div className="relative z-10 w-full max-w-2xl space-y-8">
        <Dropzone onHashCalculated={handleHashCalculated} className="w-full" />

        {fileName && (
          <Card className="w-full bg-card/80 backdrop-blur-sm"> {/* Added backdrop blur for better readability */}
            <CardHeader>
              <CardTitle>Hash Calculation Result</CardTitle>
              <CardDescription>SHA-256 Hash for: {fileName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hash-output">SHA-256 Hash</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="hash-output"
                    type="text"
                    value={hash || 'Calculating or error...'}
                    readOnly
                    className="font-mono text-sm flex-grow bg-input/70" // Slightly transparent input
                    aria-label="Calculated SHA-256 hash"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(hash, 'hash')}
                    disabled={!hash}
                    aria-label="Copy hash to clipboard"
                    className="bg-primary/80 hover:bg-primary" // Adjusted button style
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {!hash && <p className="text-sm text-destructive">Hash calculation failed or is in progress.</p>}
            </CardContent>
          </Card>
        )}

        {/* Account Data Section */}
        <Card className="w-full bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>MultiversX Account Data</CardTitle>
            <CardDescription>Data fetched from testnet API</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : fetchError ? (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Fetching Data</AlertTitle>
                <AlertDescription>{fetchError}</AlertDescription>
              </Alert>
            ) : accountData ? (
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label htmlFor="account-address">Address</Label>
                   <div className="flex items-center space-x-2">
                      <Input
                         id="account-address"
                         type="text"
                         value={accountData.address}
                         readOnly
                         className="font-mono text-sm flex-grow bg-input/70"
                         aria-label="Account Address"
                      />
                      <Button
                         variant="outline"
                         size="icon"
                         onClick={() => copyToClipboard(accountData.address, 'address')}
                         aria-label="Copy address to clipboard"
                          className="bg-primary/80 hover:bg-primary"
                      >
                         <Copy className="h-4 w-4" />
                      </Button>
                   </div>
                 </div>
                <pre className="text-xs bg-muted/50 p-4 rounded-md overflow-x-auto max-h-60 font-mono">
                  {JSON.stringify(accountData, null, 2)}
                </pre>
              </div>
            ) : (
               <p className="text-sm text-muted-foreground">No account data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Toaster remains outside the main content div but inside main */}
      <Toaster />
    </main>
  );
}
