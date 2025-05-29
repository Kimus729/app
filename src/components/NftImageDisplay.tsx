
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ImageOff, ChevronDown, ChevronUp, Code, Film } from 'lucide-react'; // Added Film
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NftImageDisplayProps {
  nftId: string | null;
}

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

const NftImageDisplay: React.FC<NftImageDisplayProps> = ({ nftId }) => {
  const [actualImageUrl, setActualImageUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false); // Re-using for general media load error
  const [rawNftApiResponse, setRawNftApiResponse] = useState<any | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  useEffect(() => {
    // Reset states when nftId changes
    setActualImageUrl(null);
    setMediaType('unknown');
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
        const responseData = await response.json().catch(() => ({})); // Catch potential JSON parse error
        setRawNftApiResponse(responseData); 

        if (!response.ok) {
          throw new Error(`API Error ${response.status}: ${responseData.message || response.statusText}`);
        }
        
        const data = responseData; // data is now responseData
        
        let mediaUrl = data.url || data.assets?.url || data.media?.[0]?.url || data.thumbnailUrl || null;
        let determinedMediaType: 'image' | 'video' = 'image'; // Default to image

        if (data.media && data.media.length > 0) {
            const mainMediaItem = data.media[0];
            const fileType = mainMediaItem.fileType?.toLowerCase();
            const contentType = mainMediaItem.contentType?.toLowerCase();
            if (fileType?.includes('mp4') || contentType?.includes('video/mp4')) {
                determinedMediaType = 'video';
            }
        }
        
        if (mediaUrl && typeof mediaUrl === 'string') {
          if (mediaUrl.startsWith('ipfs://')) {
            mediaUrl = IPFS_GATEWAY + mediaUrl.substring(7);
          }
           // If type not determined from data.media, check URL extension
          if (determinedMediaType === 'image' && mediaUrl.toLowerCase().endsWith('.mp4')) {
            determinedMediaType = 'video';
          }
          setActualImageUrl(mediaUrl);
          setMediaType(determinedMediaType);
        } else {
          // Try to fetch from metadata URI if no direct media URL
          if (data.uris && data.uris.length > 0 && typeof data.uris[0] === 'string') {
            let metadataUri = data.uris[0];
            if (metadataUri.startsWith('ipfs://')) {
                metadataUri = IPFS_GATEWAY + metadataUri.substring(7);
            }
             try {
                const metaResponse = await fetch(metadataUri);
                if (!metaResponse.ok) throw new Error(`Metadata URI Error ${metaResponse.status}: ${metaResponse.statusText}`);
                const metaData = await metaResponse.json();
                
                mediaUrl = metaData.image || metaData.image_url || metaData.animation_url || metaData.media?.url;
                if (mediaUrl && typeof mediaUrl === 'string') {
                    if (mediaUrl.startsWith('ipfs://')) {
                        mediaUrl = IPFS_GATEWAY + mediaUrl.substring(7);
                    }
                    // Check extension from metadata URL if type not already video
                    if (determinedMediaType === 'image' && mediaUrl.toLowerCase().endsWith('.mp4')) {
                        determinedMediaType = 'video';
                    }
                    setActualImageUrl(mediaUrl);
                    setMediaType(determinedMediaType);
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

  const handleMediaError = () => { // Renamed from handleImageError
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

  if (fetchError && !actualImageUrl) {
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


  if (!actualImageUrl && !fetchError) { 
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

  if (imageLoadError) { 
     return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center text-muted-foreground border rounded-lg">
        <div className="bg-destructive/10 p-3 rounded-md w-full flex flex-col items-center">
          {mediaType === 'video' ? <Film className="h-12 w-12 mb-2 text-destructive" /> : <ImageOff className="h-12 w-12 mb-2 text-destructive" /> }
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
      {actualImageUrl && mediaType === 'video' && !imageLoadError && (
        <video
          src={actualImageUrl}
          controls
          autoPlay
          muted
          loop
          playsInline
          className="rounded-md object-contain max-h-60 w-auto"
          onError={handleMediaError}
          data-ai-hint="nft video"
        />
      )}
      {actualImageUrl && mediaType === 'image' && !imageLoadError && (
        <Image
          src={actualImageUrl}
          alt={nftId ? `Media for ${nftId}` : 'NFT Media'}
          width={300}
          height={200}
          className="rounded-md object-contain max-h-60 w-auto"
          onError={handleMediaError}
          unoptimized={true} 
          data-ai-hint="nft image"
        />
      )}
      <p className="text-xs text-muted-foreground truncate w-full text-center px-2" title={actualImageUrl}>
        <span className="font-semibold">Source:</span> {actualImageUrl}
      </p>
      {fetchError && ( 
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

    