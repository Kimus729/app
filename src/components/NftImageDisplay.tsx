
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ImageOff, ChevronDown, ChevronUp, Code } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added Card for JSON

interface NftImageDisplayProps {
  nftId: string | null;
}

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

const NftImageDisplay: React.FC<NftImageDisplayProps> = ({ nftId }) => {
  const [actualImageUrl, setActualImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [rawNftApiResponse, setRawNftApiResponse] = useState<any | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  useEffect(() => {
    // Reset states when nftId changes
    setActualImageUrl(null);
    setIsLoading(false);
    setFetchError(null);
    setImageLoadError(false);
    setRawNftApiResponse(null);
    setShowRawJson(false);

    if (!nftId || nftId.startsWith("Error:")) {
      setFetchError(nftId?.startsWith("Error:") ? nftId : "Invalid NFT ID provided for media lookup.");
      return;
    }

    const fetchNftMediaUrl = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://devnet-api.multiversx.com/nfts/${nftId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setRawNftApiResponse(errorData); // Store error response too
          throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        setRawNftApiResponse(data);
        
        let mediaUrl = data.url || data.assets?.url || data.media?.[0]?.url || data.thumbnailUrl || null;

        if (mediaUrl && typeof mediaUrl === 'string') {
          if (mediaUrl.startsWith('ipfs://')) {
            mediaUrl = IPFS_GATEWAY + mediaUrl.substring(7);
          }
          setActualImageUrl(mediaUrl);
        } else {
          if (data.uris && data.uris.length > 0 && typeof data.uris[0] === 'string') {
            let metadataUri = data.uris[0];
            if (metadataUri.startsWith('ipfs://')) {
                metadataUri = IPFS_GATEWAY + metadataUri.substring(7);
            }
             try {
                const metaResponse = await fetch(metadataUri);
                if (!metaResponse.ok) throw new Error(`Metadata URI Error ${metaResponse.status}: ${metaResponse.statusText}`);
                const metaData = await metaResponse.json();
                // Potentially store metaData if needed for raw display too, for now just nft API
                mediaUrl = metaData.image || metaData.image_url || metaData.animation_url || metaData.media?.url;
                if (mediaUrl && typeof mediaUrl === 'string') {
                    if (mediaUrl.startsWith('ipfs://')) {
                        mediaUrl = IPFS_GATEWAY + mediaUrl.substring(7);
                    }
                    setActualImageUrl(mediaUrl);
                } else {
                    setFetchError('No media URL found in NFT metadata fetched from URI.');        
                }
             } catch (e: any) {
                setFetchError(`Error fetching/parsing metadata from URI: ${e.message}`);
             }
          } else {
            setFetchError('No direct media URL or metadata URI found in NFT API response.');
          }
        }
      } catch (e: any) {
        setFetchError(e.message || 'Failed to fetch NFT media information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNftMediaUrl();
  }, [nftId]);

  const handleImageError = () => {
    setImageLoadError(true);
  };

  if (isLoading) {
    return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center h-48">
        <Skeleton className="h-36 w-full rounded-md" />
        <p className="text-sm text-muted-foreground mt-2">Loading media...</p>
      </div>
    );
  }

  if (fetchError && !actualImageUrl) { // Only show top-level fetch error if no image could be loaded
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Media Fetch Error</AlertTitle>
        <AlertDescription>{fetchError}</AlertDescription>
        {rawNftApiResponse && (
           <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs"
            >
              {showRawJson ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
              {showRawJson ? 'Hide' : 'Show'} Raw API Error Response
            </Button>
            {showRawJson && (
              <Card className="mt-2">
                <CardContent className="p-0">
                  <pre className="mt-1 p-2 text-xs bg-muted rounded-md max-h-60 overflow-auto">
                    {JSON.stringify(rawNftApiResponse, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Alert>
    );
  }


  if (!actualImageUrl && !fetchError) { // If no error but also no image URL
     return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-lg bg-secondary/10">
        <ImageOff className="h-12 w-12 mb-2" />
        <p className="text-sm">No media to display for this NFT.</p>
         {rawNftApiResponse && (
           <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs"
            >
              {showRawJson ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
              {showRawJson ? 'Hide' : 'Show'} Raw API Response
            </Button>
            {showRawJson && (
              <Card className="mt-2">
                <CardContent className="p-0">
                  <pre className="mt-1 p-2 text-xs bg-muted rounded-md max-h-60 overflow-auto">
                    {JSON.stringify(rawNftApiResponse, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  if (imageLoadError) { // Specific error for image failing to load from a valid URL
     return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center text-muted-foreground border rounded-lg">
        <div className="bg-destructive/10 p-3 rounded-md w-full flex flex-col items-center">
          <ImageOff className="h-12 w-12 mb-2 text-destructive" />
          <p className="text-sm">Could not load media from URL.</p>
          <p className="text-xs truncate w-full text-center px-2" title={actualImageUrl || "No URL"}>URL: {actualImageUrl || "No URL"}</p>
        </div>
        {rawNftApiResponse && (
          <div className="mt-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs w-full"
            >
              {showRawJson ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
              {showRawJson ? 'Hide' : 'Show'} Raw API Response
            </Button>
            {showRawJson && (
              <Card className="mt-2">
                <CardContent className="p-0">
                  <pre className="mt-1 p-2 text-xs bg-muted rounded-md max-h-60 overflow-auto">
                    {JSON.stringify(rawNftApiResponse, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Fallback for when actualImageUrl is null but no specific error triggered above for it
  if (!actualImageUrl) {
    return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-lg bg-secondary/10">
        <ImageOff className="h-12 w-12 mb-2" />
        <p className="text-sm">No media URL available for this NFT.</p>
         {rawNftApiResponse && (
           <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs"
            >
              {showRawJson ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
              {showRawJson ? 'Hide' : 'Show'} Raw API Response
            </Button>
            {showRawJson && (
              <Card className="mt-2">
                <CardContent className="p-0">
                  <pre className="mt-1 p-2 text-xs bg-muted rounded-md max-h-60 overflow-auto">
                    {JSON.stringify(rawNftApiResponse, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }


  return (
    <div className="mt-4 p-2 border rounded-lg bg-card/50 flex flex-col justify-center items-center space-y-2">
      <Image
        src={actualImageUrl}
        alt={nftId ? `Media for ${nftId}` : 'NFT Media'}
        width={300}
        height={200}
        className="rounded-md object-contain max-h-60 w-auto"
        onError={handleImageError}
        unoptimized={true} 
        data-ai-hint="nft media"
      />
      <p className="text-xs text-muted-foreground truncate w-full text-center px-2" title={actualImageUrl}>
        <span className="font-semibold">Source:</span> {actualImageUrl}
      </p>
      {fetchError && ( // Display fetch error here as well if an image was attempted
        <Alert variant="destructive" className="mt-2 w-full text-xs">
          <AlertCircle className="h-3 w-3" />
          <AlertTitle className="text-xs">Partial Error</AlertTitle>
          <AlertDescription className="text-xs">{fetchError}</AlertDescription>
        </Alert>
      )}
      {rawNftApiResponse && (
        <div className="w-full mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRawJson(!showRawJson)}
            className="text-xs w-full flex items-center justify-center"
          >
            <Code className="mr-2 h-3 w-3" />
            {showRawJson ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
            {showRawJson ? 'Hide' : 'Show'} Raw NFT API Response
          </Button>
          {showRawJson && (
             <Card className="mt-2 w-full">
                <CardHeader className="p-2">
                    <CardTitle className="text-sm">NFT API Full Response</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <pre className="mt-1 p-2 text-xs bg-muted rounded-md max-h-60 overflow-auto">
                    {JSON.stringify(rawNftApiResponse, null, 2)}
                    </pre>
                </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default NftImageDisplay;
