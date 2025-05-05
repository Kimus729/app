
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image'; // Import next/image
import { Dropzone } from '@/components/dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Terminal, User, Hash, Wallet, Search, AlertCircle } from 'lucide-react'; // Added Search and AlertCircle icons
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
const ADDRESS_LENGTH = 62;
const ADDRESS_PREFIX = 'erd1';

// Basic validation function for MultiversX address
const isValidMultiversXAddress = (address: string): boolean => {
  return address.startsWith(ADDRESS_PREFIX) && address.length === ADDRESS_LENGTH;
};


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
    // Basic check - although handleFetchClick does a more specific one
    if (!addressToFetch) {
      setFetchError("Veuillez entrer une adresse MultiversX.");
       toast({
         variant: "destructive",
         title: "Adresse Manquante",
         description: "Veuillez entrer une adresse MultiversX pour récupérer les données.",
       });
      return;
    }
    setIsLoadingData(true);
    setFetchError(null);
    setAccountData(null); // Clear previous data
    setCurrentAddress(addressToFetch); // Update the address being fetched/displayed

    try {
      // Use template literal for URL construction
      const response = await fetch(`https://testnet-api.multiversx.com/accounts/${addressToFetch}`);
      if (!response.ok) {
         // Handle specific known error codes from the API
         if (response.status === 404) {
            throw new Error(`Compte non trouvé pour l'adresse fournie.`);
         } else if (response.status === 400) {
            // This specific error is often due to invalid address format
            throw new Error(`Format d'adresse invalide ou requête incorrecte.`);
         } else {
           // Generic error for other HTTP issues
           throw new Error(`Erreur API ! Statut : ${response.status}`);
         }
      }
      const data: AccountData = await response.json();
      setAccountData(data);
       toast({
         title: "Données Récupérées avec Succès",
         description: `Données du compte chargées pour ${addressToFetch.substring(0, 10)}...`,
       });
    } catch (error) {
      console.error("Échec de la récupération des données du compte:", error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      setFetchError(errorMessage);
      setAccountData(null); // Ensure no stale data is shown on error
      toast({
        variant: "destructive",
        title: "Échec de la Récupération API",
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
     // Add client-side validation before making the API call
     if (!isValidMultiversXAddress(inputAddress)) {
       const validationError = `Format d'adresse invalide. Doit commencer par '${ADDRESS_PREFIX}' et avoir ${ADDRESS_LENGTH} caractères.`;
       setFetchError(validationError);
       setAccountData(null); // Clear any previous data
       setCurrentAddress(inputAddress); // Show the invalid address attempted
       toast({
         variant: "destructive",
         title: "Format d'Adresse Invalide",
         description: validationError,
       });
       return; // Stop execution if validation fails
     }
     // If validation passes, proceed with fetching
    fetchAccountData(inputAddress);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(event.target.value);
     // Optionally clear error when user types
     if (fetchError) {
        setFetchError(null);
     }
  };


  const handleHashCalculated = (calculatedHash: string, name: string) => {
    setHash(calculatedHash);
    setFileName(name);
    if (calculatedHash) {
       toast({
         title: "Hash Calculé avec Succès",
         description: `Hash SHA-256 pour ${name} généré.`,
       });
    } else if (name) { // Handle case where hash calculation failed but we have a filename
      toast({
        variant: "destructive",
        title: "Échec du Calcul du Hash",
        description: `Impossible de calculer le hash pour ${name}.`,
      });
    }
  };

  const copyToClipboard = (textToCopy: string | number, type: string) => {
    const text = String(textToCopy); // Ensure text is string
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast({
            title: "Copié dans le Presse-papiers !",
            description: `Le ${type} a été copié.`, // Use French type here
          });
        })
        .catch(err => {
          console.error(`Échec de la copie ${type}: `, err);
           toast({
             variant: "destructive",
             title: "Échec de la Copie",
             description: `Impossible de copier le ${type} dans le presse-papiers.`, // Use French type here
           });
        });
    }
  };

  // Helper to format large balance numbers (optional, adjust as needed)
  const formatBalance = (balance: string): string => {
    try {
      const balanceBigInt = BigInt(balance);
      const egldValue = Number(balanceBigInt) / 10**18; // EGLD has 18 decimals
      // Use French locale for number formatting
      return `${egldValue.toLocaleString('fr-FR', { maximumFractionDigits: 6 })} eGLD`;
    } catch (e) {
      console.warn("Échec du formatage du solde :", e); // Log warning instead of failing silently
      return balance; // Fallback to raw string if conversion fails
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-gradient-to-br from-red-300 to-purple-400 overflow-hidden"> {/* Updated gradient to red-violet */}
       {/* Background Cat Images */}
       <Image
         src="https://picsum.photos/seed/cat1/300/200"
         alt="Image de chat en arrière-plan 1" // French alt text
         width={300}
         height={200}
         className="fixed -z-10 opacity-10 rounded-lg shadow-md top-10 left-10 object-cover"
         data-ai-hint="cat"
         priority
       />
        <Image
         src="https://picsum.photos/seed/cat2/250/350"
         alt="Image de chat en arrière-plan 2" // French alt text
         width={250}
         height={350}
         className="fixed -z-10 opacity-10 rounded-lg shadow-md bottom-5 right-5 object-cover"
         data-ai-hint="cat"
       />
       <Image
         src="https://picsum.photos/seed/cat3/200/200"
         alt="Image de chat en arrière-plan 3" // French alt text
         width={200}
         height={200}
         className="fixed -z-10 opacity-10 rounded-full shadow-md top-1/3 right-20 transform -translate-y-1/2 object-cover"
         data-ai-hint="cat"
       />
        <Image
         src="https://picsum.photos/seed/cat4/400/250"
         alt="Image de chat en arrière-plan 4" // French alt text
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
              <CardTitle>Résultat du Calcul de Hash</CardTitle>
              <CardDescription>Hash SHA-256 pour : {fileName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hash-output">Hash SHA-256</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="hash-output"
                    type="text"
                    value={hash || 'Calcul en cours ou erreur...'}
                    readOnly
                    className="font-mono text-sm flex-grow bg-input/70" // Slightly transparent input
                    aria-label="Hash SHA-256 calculé"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(hash, 'hash')}
                    disabled={!hash}
                    aria-label="Copier le hash dans le presse-papiers"
                    className="bg-primary/80 hover:bg-primary" // Adjusted button style
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {!hash && fileName && <p className="text-sm text-destructive">Le calcul du hash a échoué ou est en cours.</p>}
            </CardContent>
          </Card>
        )}

        {/* Account Data Section */}
        <Card className="w-full bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Données du Compte MultiversX</CardTitle>
             <CardDescription>Entrez une adresse et cliquez sur Récupérer pour charger les données.</CardDescription>
              {/* Address Input */}
             <div className="flex items-center space-x-2 pt-4">
                 <Label htmlFor="address-input" className="sr-only">Adresse MultiversX</Label>
                 <Input
                    id="address-input"
                    type="text"
                    placeholder="Entrez l'adresse MultiversX (ex: erd1...)"
                    value={inputAddress}
                    onChange={handleInputChange}
                    className="font-mono text-sm flex-grow bg-input/70"
                    aria-label="Champ de saisie de l'adresse MultiversX"
                    aria-invalid={!!fetchError} // Indicate invalid state based on fetchError
                    aria-describedby={fetchError ? "address-error-alert" : undefined} // Link to error message if present
                 />
                 <Button onClick={handleFetchClick} disabled={isLoadingData} aria-label="Récupérer les données du compte">
                   {isLoadingData ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                   )}
                   {isLoadingData ? 'Récupération...' : 'Récupérer'}
                 </Button>
             </div>
          </CardHeader>
          <CardContent>
             {/* Display Error Alert Above Skeleton/Data */}
            {fetchError && (
              <Alert variant="destructive" className="mb-4" id="address-error-alert">
                <AlertCircle className="h-4 w-4" /> {/* Use AlertCircle for errors */}
                <AlertTitle>Erreur</AlertTitle> {/* Simplified title */}
                <AlertDescription>{fetchError}</AlertDescription>
              </Alert>
            )}

            {isLoadingData ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
                 <Skeleton className="h-4 w-2/3" />
              </div>
             // Removed redundant error display here, now handled above
            ) : accountData ? (
              <div className="space-y-6">
                {/* Key Account Details */}
                 <h3 className="text-lg font-medium mt-2">Détails pour : <span className="font-mono text-sm break-all">{currentAddress}</span></h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <Label htmlFor="account-address" className="w-20 shrink-0">Adresse</Label>
                      <div className="flex items-center space-x-2 flex-grow">
                         <Input
                            id="account-address"
                            type="text"
                            value={accountData.address}
                            readOnly
                            className="font-mono text-xs sm:text-sm flex-grow bg-input/70 h-9"
                            aria-label="Adresse du Compte"
                         />
                         <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(accountData.address, 'adresse')}
                            aria-label="Copier l'adresse dans le presse-papiers"
                            className="bg-primary/80 hover:bg-primary h-9 w-9"
                         >
                            <Copy className="h-4 w-4" />
                         </Button>
                      </div>
                  </div>
                   {accountData.username && (
                     <div className="flex items-center space-x-2">
                         <User className="h-5 w-5 text-primary" />
                         <Label htmlFor="account-username" className="w-20 shrink-0">Nom d'utilisateur</Label>
                         <Input
                           id="account-username"
                           type="text"
                           value={accountData.username}
                           readOnly
                           className="font-mono text-sm flex-grow bg-input/70 h-9"
                           aria-label="Nom d'utilisateur du Compte"
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
                        aria-label="Nonce du Compte"
                      />
                      <Button
                         variant="outline"
                         size="icon"
                         onClick={() => copyToClipboard(accountData.nonce, 'nonce')}
                         aria-label="Copier le nonce dans le presse-papiers"
                         className="bg-primary/80 hover:bg-primary h-9 w-9"
                      >
                         <Copy className="h-4 w-4" />
                      </Button>
                   </div>
                   <div className="flex items-center space-x-2">
                     <span className="text-primary font-bold text-lg w-5 text-center shrink-0">$</span> {/* Using $ icon placeholder */}
                     <Label htmlFor="account-balance" className="w-20 shrink-0">Solde</Label>
                      <Input
                         id="account-balance"
                         type="text"
                         value={formatBalance(accountData.balance)}
                         readOnly
                         className="text-sm flex-grow bg-input/70 h-9"
                         aria-label="Solde du Compte"
                      />
                      <Button
                         variant="outline"
                         size="icon"
                         onClick={() => copyToClipboard(accountData.balance, 'solde brut')}
                         aria-label="Copier le solde brut dans le presse-papiers"
                         className="bg-primary/80 hover:bg-primary h-9 w-9"
                      >
                         <Copy className="h-4 w-4" />
                      </Button>
                   </div>
                </div>

                {/* Removed Separator and Other Details section */}

              </div>
            ) : (
               // Show this message only if there's no error and no data yet (initial state before default load finishes)
              !fetchError && <p className="text-sm text-muted-foreground">Entrez une adresse ci-dessus et cliquez sur Récupérer pour voir les détails.</p>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Toaster remains outside the main content div but inside main */}
      <Toaster />
    </main>
  );
}
