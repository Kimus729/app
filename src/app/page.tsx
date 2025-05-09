
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image'; // Import next/image
import { Dropzone } from '@/components/dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Search, AlertCircle, ImageIcon, Wallet, User } from 'lucide-react'; // Added Wallet, User icons
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert

interface AccountData {
  address: string;
  balance: string;
  username?: string; // Optional property
  [key: string]: any; // Allow for other properties
}

interface NftMediaItem {
  url: string;
  originalUrl?: string;
  thumbnailUrl?: string;
  fileType?: string;
  fileSize?: number;
}

interface NftItem {
  identifier: string;
  collection?: string;
  name?: string;
  description?: string;
  url?: string;
  media?: NftMediaItem[];
  royalties?: number;
  creator?: string;
  type?: string;
  metadata?: {
    description?: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
  };
  [key: string]: any;
}


const DEFAULT_ADDRESS = 'erd1krmnqp7vjy3g2d0xlt355nhhanuft3ev5avneqp6xa9j23g80qesx7g2lj';
const ADDRESS_LENGTH = 62;
const ADDRESS_PREFIX = 'erd1';

const isValidMultiversXAddress = (address: string): boolean => {
  return address.startsWith(ADDRESS_PREFIX) && address.length === ADDRESS_LENGTH;
};


export default function Home() {
  const [hash, setHash] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inputAddress, setInputAddress] = useState<string>(DEFAULT_ADDRESS);
  const [currentAddress, setCurrentAddress] = useState<string>(DEFAULT_ADDRESS);

  const [nfts, setNfts] = useState<NftItem[] | null>(null);
  const [isLoadingNfts, setIsLoadingNfts] = useState<boolean>(false);
  const [nftFetchError, setNftFetchError] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchNftsForAccount = useCallback(async (address: string): Promise<NftItem[]> => {
    const response = await fetch(`https://testnet-api.multiversx.com/accounts/${address}/nfts`);
    if (!response.ok) {
      let errorMessage = `Erreur API NFT ! Statut : ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Failed to parse error JSON, use default message
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      if (response.status === 404 || (typeof data === 'object' && Object.keys(data).length === 0)) {
        return []; // Treat 404 or empty object as no NFTs
      }
      console.warn("NFT API did not return an array:", data);
      throw new Error("La réponse de l'API NFT n'était pas dans le format attendu.");
    }
    return data;
  }, []);


  const loadDataForAddress = useCallback(async (addressToFetch: string) => {
    if (!isValidMultiversXAddress(addressToFetch)) {
      const validationError = `Format d'adresse invalide. Doit commencer par '${ADDRESS_PREFIX}' et avoir ${ADDRESS_LENGTH} caractères.`;
      setFetchError(validationError);
      setAccountData(null);
      setNfts(null);
      setCurrentAddress(addressToFetch);
      toast({
        variant: "destructive",
        title: "Format d'Adresse Invalide",
        description: validationError,
      });
      return;
    }

    setIsLoadingData(true);
    setIsLoadingNfts(true);
    setFetchError(null);
    setNftFetchError(null);
    // setAccountData(null); // Keep previous data visible while loading new
    // setNfts(null); // Keep previous data visible while loading new
    setCurrentAddress(addressToFetch);

    try {
      // Fetch account data
      const accountResponse = await fetch(`https://testnet-api.multiversx.com/accounts/${addressToFetch}`);
      if (!accountResponse.ok) {
        if (accountResponse.status === 404) {
          throw new Error(`Compte non trouvé pour l'adresse ${addressToFetch}.`);
        } else if (accountResponse.status === 400) {
           const errorData = await accountResponse.json();
           const apiMessage = errorData?.message || "Requête incorrecte.";
          throw new Error(`Format d'adresse invalide ou requête incorrecte (compte): ${apiMessage}`);
        } else {
          throw new Error(`Erreur API Compte ! Statut : ${accountResponse.status}`);
        }
      }
      const accountJson: AccountData = await accountResponse.json();
      setAccountData(accountJson);
      toast({
        title: "Données du Compte Récupérées",
        description: `Données du compte chargées pour ${addressToFetch.substring(0, 10)}...`,
      });

      // Fetch NFT data
      try {
        const nftData = await fetchNftsForAccount(addressToFetch);
        setNfts(nftData);
        if (nftData.length > 0) {
          toast({
            title: "NFTs Récupérés",
            description: `${nftData.length} NFTs chargés pour ${addressToFetch.substring(0, 10)}...`,
          });
        } else {
          toast({
            title: "Aucun NFT Trouvé",
            description: `Aucun NFT pour ${addressToFetch.substring(0, 10)}...`,
          });
        }
      } catch (nftApiErrorInstance) {
        const errorMessage = nftApiErrorInstance instanceof Error ? nftApiErrorInstance.message : 'Erreur inconnue lors de la récupération des NFTs.';
        console.error("Échec de la récupération des NFTs:", nftApiErrorInstance);
        setNftFetchError(errorMessage);
        setNfts([]); // Set to empty array on error
        toast({
          variant: "destructive",
          title: "Échec de la Récupération des NFTs",
          description: errorMessage,
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue (compte).';
      console.error("Échec de la récupération des données du compte:", error);
      setFetchError(errorMessage);
      setAccountData(null); // Clear account data on error
      setNfts(null); // Clear NFTs on account error
      setNftFetchError("La récupération des données du compte a échoué, les NFTs n'ont pas pu être chargés.");
      toast({
        variant: "destructive",
        title: "Échec de la Récupération API Compte",
        description: errorMessage,
      });
    } finally {
      setIsLoadingData(false);
      setIsLoadingNfts(false);
    }
  }, [toast, fetchNftsForAccount]);

  useEffect(() => {
    if (DEFAULT_ADDRESS) { 
      loadDataForAddress(DEFAULT_ADDRESS);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleFetchClick = () => {
    loadDataForAddress(inputAddress);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(event.target.value);
     if (fetchError) {
        setFetchError(null);
     }
     if (nftFetchError) {
        setNftFetchError(null);
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
    } else if (name) {
      toast({
        variant: "destructive",
        title: "Échec du Calcul du Hash",
        description: `Impossible de calculer le hash pour ${name}.`,
      });
    }
  };

  const copyToClipboard = (textToCopy: string | number, type: string) => {
    const text = String(textToCopy);
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast({
            title: "Copié dans le Presse-papiers !",
            description: `${type} a été copié.`,
          });
        })
        .catch(err => {
          console.error(`Échec de la copie ${type}: `, err);
           toast({
             variant: "destructive",
             title: "Échec de la Copie",
             description: `Impossible de copier ${type} dans le presse-papiers.`,
           });
        });
    }
  };

  const formatBalance = (balance: string): string => {
    try {
      const balanceBigInt = BigInt(balance);
      const egldValue = Number(balanceBigInt) / 10**18;
      return `${egldValue.toLocaleString('fr-FR', { maximumFractionDigits: 6 })} eGLD`;
    } catch (e) {
      console.warn("Échec du formatage du solde :", e);
      return balance; // Return original balance string on error
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-gradient-to-br from-red-500 via-purple-500 to-pink-500 overflow-hidden">
       <Image
         src="https://picsum.photos/seed/bgcat1/300/200"
         alt="Image de chat en arrière-plan 1"
         width={300}
         height={200}
         className="fixed -z-10 opacity-10 rounded-lg shadow-md top-10 left-10 object-cover"
         data-ai-hint="cat playful"
         priority
       />
        <Image
         src="https://picsum.photos/seed/bgcat2/250/350"
         alt="Image de chat en arrière-plan 2"
         width={250}
         height={350}
         className="fixed -z-10 opacity-10 rounded-lg shadow-md bottom-5 right-5 object-cover"
         data-ai-hint="cat curious"
       />
       <Image
         src="https://picsum.photos/seed/bgcat3/200/200"
         alt="Image de chat en arrière-plan 3"
         width={200}
         height={200}
         className="fixed -z-10 opacity-10 rounded-full shadow-md top-1/3 right-20 transform -translate-y-1/2 object-cover"
         data-ai-hint="cat sleeping"
       />
        <Image
         src="https://picsum.photos/seed/bgcat4/400/250"
         alt="Image de chat en arrière-plan 4"
         width={400}
         height={250}
         className="fixed -z-10 opacity-10 rounded-lg shadow-md bottom-1/4 left-16 transform translate-y-1/2 object-cover"
         data-ai-hint="cat abstract"
       />

      <div className="relative z-10 w-full max-w-4xl space-y-8">
        <Dropzone onHashCalculated={handleHashCalculated} className="w-full" />

        {fileName && (
          <Card className="w-full bg-card/80 backdrop-blur-sm">
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
                    className="font-mono text-sm flex-grow bg-input/70"
                    aria-label="Hash SHA-256 calculé"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(hash, 'hash')}
                    disabled={!hash}
                    aria-label="Copier le hash dans le presse-papiers"
                    className="bg-primary/80 hover:bg-primary"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {!hash && fileName && <p className="text-sm text-destructive">Le calcul du hash a échoué ou est en cours.</p>}
            </CardContent>
          </Card>
        )}

        <Card className="w-full bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Données du Compte MultiversX</CardTitle>
             <CardDescription>Entrez une adresse et cliquez sur Récupérer pour charger les données.</CardDescription>
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
                    aria-invalid={!!fetchError} // Only address error for this input
                    aria-describedby={fetchError ? "address-error-alert" : undefined}
                 />
                 <Button onClick={handleFetchClick} disabled={isLoadingData || isLoadingNfts} aria-label="Récupérer les données du compte">
                   {(isLoadingData || isLoadingNfts) ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                   )}
                   {(isLoadingData || isLoadingNfts) ? 'Récupération...' : 'Récupérer'}
                 </Button>
             </div>
          </CardHeader>
          <CardContent>
            {fetchError && !isLoadingData && (
              <Alert variant="destructive" className="mb-4" id="address-error-alert">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur Compte</AlertTitle>
                <AlertDescription>{fetchError}</AlertDescription>
              </Alert>
            )}

            {isLoadingData && !accountData && ( // Show skeletons only if no previous data
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            )}
            {accountData && ( // Always show data if available, even while loading new
              <div className="space-y-6">
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
                         <Label htmlFor="account-username" className="w-20 shrink-0">Pseudo</Label>
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
                     <span className="text-primary font-bold text-lg w-5 text-center shrink-0">$</span>
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
              </div>
            )}
             {!isLoadingData && !accountData && !fetchError && <p className="text-sm text-muted-foreground">Entrez une adresse ci-dessus et cliquez sur Récupérer pour voir les détails.</p>}
          </CardContent>
        </Card>

        {/* NFT Data Section */}
        <Card className="w-full bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>NFTs du Compte</CardTitle>
            <CardDescription>
              {currentAddress ? `NFTs associés à : ${currentAddress.substring(0, 10)}...` : "Aucune adresse sélectionnée."}
            </CardDescription>
          </CardHeader>
          <CardContent id="nft-section">
             {nftFetchError && !isLoadingNfts && (
              <Alert variant="destructive" id="nft-error-alert" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur NFTs</AlertTitle>
                <AlertDescription>{nftFetchError}</AlertDescription>
              </Alert>
            )}
            {isLoadingNfts && (!nfts || nfts.length === 0) && ( // Show skeletons if no previous NFT data
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="overflow-hidden bg-muted/30">
                    <Skeleton className="h-40 w-full aspect-square" />
                    <CardContent className="p-3 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
           
            {nfts && nfts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {nfts.map((nft) => {
                  let displayImageUrl = '';
                  if (nft.media && nft.media.length > 0) {
                    const imageMedia = nft.media.find(m => m.fileType?.startsWith('image/'));
                    displayImageUrl = imageMedia?.thumbnailUrl || imageMedia?.url || '';
                  }
                  if (!displayImageUrl) { 
                     if (nft.metadata?.image) displayImageUrl = nft.metadata.image;
                     else if (nft.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)) displayImageUrl = nft.url;
                  }

                  const explorerUrl = `https://testnet-explorer.multiversx.com/nfts/${nft.identifier}`;

                  return (
                    <Card key={nft.identifier} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col group bg-card/90">
                      <div className="relative w-full aspect-square bg-muted/50 overflow-hidden">
                        {displayImageUrl ? (
                          <Image
                            src={displayImageUrl}
                            alt={nft.name || nft.identifier}
                            width={300} // Provide width and height for non-fill layouts
                            height={300}
                            style={{ objectFit: 'cover' }} // Use style for objectFit with width/height
                            className="transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              // Fallback to a generic placeholder image
                              target.srcset = ''; 
                              target.src = `https://picsum.photos/seed/${nft.identifier}/300/300`;
                              target.dataset.aiHint = "abstract digital";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/70">
                             <ImageIcon className="w-16 h-16 text-muted-foreground/50" data-ai-hint="placeholder image" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 flex-grow flex flex-col justify-between space-y-2">
                        <div>
                          <h4 className="text-sm font-semibold mb-0.5 truncate" title={nft.name || nft.identifier}>
                            {nft.name || nft.identifier}
                          </h4>
                          {nft.collection && (
                            <p className="text-xs text-muted-foreground truncate" title={nft.collection}>
                              Collection: {nft.collection}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground truncate" title={nft.identifier}>
                            ID: {nft.identifier.length > 20 ? `${nft.identifier.substring(0,17)}...` : nft.identifier}
                          </p>
                        </div>
                        <Button variant="link" size="sm" asChild className="mt-1 self-start p-0 h-auto text-xs">
                          <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                            Voir sur l'explorateur
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
             !isLoadingNfts && !nftFetchError && <p className="text-sm text-muted-foreground">
                {currentAddress && !isLoadingData ? "Aucun NFT trouvé pour ce compte." : "Chargez les données d'un compte pour voir les NFTs."}
              </p>
            )}
          </CardContent>
        </Card>

      </div>
      <Toaster />
    </main>
  );
}
