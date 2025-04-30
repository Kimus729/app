
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image'; // Import next/image
import { Dropzone } from '@/components/dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Terminal, User, Hash, Wallet, Search } from 'lucide-react'; // Added Search icon
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

const DEFAULT_ADDRESS = 'erd1krmnqp7vjy3g2d0xlt355nhhanuft3ev5avneqp6xa9j23g80qesx7g2lj';

export default function Home() {
  const [hash, setHash] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false); // Initially false, load on button click/mount
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inputAddress, setInputAddress] = useState<string>(DEFAULT_ADDRESS); // State for the input field
  const [currentAddress, setCurrentAddress] = useState<string>(DEFAULT_ADDRESS); // State for the address being displayed
  const { toast } = useToast();

  const fetchAccountData = useCallback(async (addressToFetch: string) => {
    if (!addressToFetch) {
      setFetchError("Please enter a MultiversX address.");
       toast({
         variant: "destructive",
         title: "Missing Address",
         description: "Please enter a MultiversX address to fetch data.",
       });
      return;
    }
    setIsLoadingData(true);
    setFetchError(null);
    setAccountData(null); // Clear previous data
    setCurrentAddress(addressToFetch); // Update the address being fetched/displayed

    try {
      const response = await fetch(`https://testnet-api.multiversx.com/accounts/${addressToFetch}`);
      if (!response.ok) {
         if (response.status === 404) {
            throw new Error(`Account not found. Status: ${response.status}`);
         } else if (response.status === 400) {
            throw new Error(`Invalid address format. Status: ${response.status}`);
         } else {
           throw new Error(`HTTP error! status: ${response.status}`);
         }
      }
      const data: AccountData = await response.json();
      setAccountData(data);
       toast({
         title: "Data Fetched Successfully",
         description: `Account data loaded for ${addressToFetch.substring(0, 10)}...`,
       });
    } catch (error) {
      console.error("Failed to fetch account data:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setFetchError(errorMessage);
      setAccountData(null); // Ensure no stale data is shown on error
      toast({
        variant: "destructive",
        title: "API Fetch Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoadingData(false);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // Added toast to dependency array


  // Fetch data for the default address on initial mount
  useEffect(() => {
    fetchAccountData(DEFAULT_ADDRESS);
  }, [fetchAccountData]); // fetchAccountData is memoized and safe here

  const handleFetchClick = () => {
    fetchAccountData(inputAddress);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(event.target.value);
  };


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

  const copyToClipboard = (textToCopy: string | number, type: string) => {
    const text = String(textToCopy); // Ensure text is string
    if (text) {
      navigator.clipboard.writeText(text)
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

  // Helper to format large balance numbers (optional, adjust as needed)
  const formatBalance = (balance: string): string => {
    try {
      const balanceBigInt = BigInt(balance);
      const egldValue = Number(balanceBigInt) / 10**18; // EGLD has 18 decimals
      return `${egldValue.toLocaleString(undefined, { maximumFractionDigits: 6 })} eGLD`;
    } catch (e) {
      return balance; // Fallback to raw string if conversion fails
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
             <CardDescription>Enter an address and click Fetch to load data.</CardDescription>
              {/* Address Input */}
             <div className="flex items-center space-x-2 pt-4">
                 <Label htmlFor="address-input" className="sr-only">MultiversX Address</Label>
                 <Input
                    id="address-input"
                    type="text"
                    placeholder="Enter MultiversX address (e.g., erd1...)"
                    value={inputAddress}
                    onChange={handleInputChange}
                    className="font-mono text-sm flex-grow bg-input/70"
                    aria-label="MultiversX Address Input"
                 />
                 <Button onClick={handleFetchClick} disabled={isLoadingData} aria-label="Fetch account data">
                   {isLoadingData ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                   )}
                   {isLoadingData ? 'Fetching...' : 'Fetch'}
                 </Button>
             </div>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
                 <Skeleton className="h-4 w-2/3" />
              </div>
            ) : fetchError ? (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Fetching Data</AlertTitle>
                <AlertDescription>{fetchError}</AlertDescription>
              </Alert>
            ) : accountData ? (
              <div className="space-y-6">
                {/* Key Account Details */}
                 <h3 className="text-lg font-medium mt-2">Details for: <span className="font-mono text-sm break-all">{currentAddress}</span></h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <Label htmlFor="account-address" className="w-20 shrink-0">Address</Label>
                      <div className="flex items-center space-x-2 flex-grow">
                         <Input
                            id="account-address"
                            type="text"
                            value={accountData.address}
                            readOnly
                            className="font-mono text-xs sm:text-sm flex-grow bg-input/70 h-9"
                            aria-label="Account Address"
                         />
                         <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(accountData.address, 'address')}
                            aria-label="Copy address to clipboard"
                            className="bg-primary/80 hover:bg-primary h-9 w-9"
                         >
                            <Copy className="h-4 w-4" />
                         </Button>
                      </div>
                  </div>
                   {accountData.username && (
                     <div className="flex items-center space-x-2">
                         <User className="h-5 w-5 text-primary" />
                         <Label htmlFor="account-username" className="w-20 shrink-0">Username</Label>
                         <Input
                           id="account-username"
                           type="text"
                           value={accountData.username}
                           readOnly
                           className="font-mono text-sm flex-grow bg-input/70 h-9"
                           aria-label="Account Username"
                         />
                      </div>
                   )}
                   <div className="flex items-center space-x-2">
                     <Hash className="h-5 w-5 text-primary" />
                     <Label htmlFor="account-nonce" className="w-20 shrink-0">Nonce</Label>
                      <Input
                        id="account-nonce"
                        type="number"
                        value={accountData.nonce}
                        readOnly
                        className="text-sm flex-grow bg-input/70 h-9"
                        aria-label="Account Nonce"
                      />
                      <Button
                         variant="outline"
                         size="icon"
                         onClick={() => copyToClipboard(accountData.nonce, 'nonce')}
                         aria-label="Copy nonce to clipboard"
                         className="bg-primary/80 hover:bg-primary h-9 w-9"
                      >
                         <Copy className="h-4 w-4" />
                      </Button>
                   </div>
                   <div className="flex items-center space-x-2">
                     <span className="text-primary font-bold text-lg w-5 text-center shrink-0">$</span>
                     <Label htmlFor="account-balance" className="w-20 shrink-0">Balance</Label>
                      <Input
                         id="account-balance"
                         type="text"
                         value={formatBalance(accountData.balance)}
                         readOnly
                         className="text-sm flex-grow bg-input/70 h-9"
                         aria-label="Account Balance"
                      />
                      <Button
                         variant="outline"
                         size="icon"
                         onClick={() => copyToClipboard(accountData.balance, 'raw balance')}
                         aria-label="Copy raw balance to clipboard"
                         className="bg-primary/80 hover:bg-primary h-9 w-9"
                      >
                         <Copy className="h-4 w-4" />
                      </Button>
                   </div>
                </div>

                {/* Removed Separator and Other Details section */}

              </div>
            ) : (
               <p className="text-sm text-muted-foreground">Enter an address above and click Fetch to view details.</p>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Toaster remains outside the main content div but inside main */}
      <Toaster />
    </main>
  );
}
