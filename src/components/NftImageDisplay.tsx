
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ImageOff, Film } from 'lucide-react'; // Removed ChevronDown, ChevronUp, Code
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Removed Button, Card, CardContent, CardHeader, CardTitle as they were only for raw JSON

interface NftImageDisplayProps {
  nftId: string | null;
}

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

const NftImageDisplay: React.FC<NftImageDisplayProps> = ({ nftId }) => {
  const [actualImageUrl, setActualImageUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mediaLoadError, setMediaLoadError] = useState<boolean>(false);
  // Removed rawNftApiResponse and showRawJson states

  useEffect(() => {
    // Reset states when nftId changes
    setActualImageUrl(null);
    setMediaType('unknown');
    setIsLoading(false);
    setFetchError(null);
    setMediaLoadError(false);
    // Removed rawNftApiResponse reset
    // Removed setShowRawJson reset

    if (!nftId || nftId.startsWith("Error:")) {
      setFetchError(nftId?.startsWith("Error:") ? nftId : "Invalid NFT ID provided for media lookup.");
      return;
    }

    const fetchNftMediaUrl = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://devnet-api.multiversx.com/nfts/${nftId}`);
        const responseData = await response.json().catch(() => ({}));
        // Removed setRawNftApiResponse(responseData); 

        if (!response.ok) {
          throw new Error(`API Error ${response.status}: ${responseData.message || response.statusText}`);
        }
        
        const data = responseData;
        
        let mediaUrl = data.url || data.assets?.url || data.media?.[0]?.url || data.thumbnailUrl || null;
        let determinedMediaType: 'image' | 'video' = 'image';

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
          if (determinedMediaType === 'image' && mediaUrl.toLowerCase().endsWith('.mp4')) {
            determinedMediaType = 'video';
          }
          setActualImageUrl(mediaUrl);
          setMediaType(determinedMediaType);
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
                
                mediaUrl = metaData.image || metaData.image_url || metaData.animation_url || metaData.media?.url;
                if (mediaUrl && typeof mediaUrl === 'string') {
                    if (mediaUrl.startsWith('ipfs://')) {
                        mediaUrl = IPFS_GATEWAY + mediaUrl.substring(7);
                    }
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

  const handleMediaError = () => {
    setMediaLoadError(true);
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
        {/* Raw API Error Response section removed */}
      </Alert>
    );
  }


  if (!actualImageUrl && !fetchError) { 
     return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-lg bg-secondary/10">
        <ImageOff className="h-12 w-12 mb-2" />
        <p className="text-sm">No media to display for this NFT.</p>
         {/* Raw API Response section removed */}
      </div>
    );
  }

  if (mediaLoadError) { 
     return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center text-muted-foreground border rounded-lg">
        <div className="bg-destructive/10 p-3 rounded-md w-full flex flex-col items-center">
          {mediaType === 'video' ? <Film className="h-12 w-12 mb-2 text-destructive" /> : <ImageOff className="h-12 w-12 mb-2 text-destructive" /> }
          <p className="text-sm">Could not load media from URL.</p>
          <p className="text-xs truncate w-full text-center px-2" title={actualImageUrl || "No URL"}>URL: {actualImageUrl || "No URL"}</p>
        </div>
        {/* Raw API Response section removed */}
      </div>
    );
  }
  
  if (!actualImageUrl) { // This case might be redundant now with earlier checks, but kept for safety
    return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-lg bg-secondary/10">
        <ImageOff className="h-12 w-12 mb-2" />
        <p className="text-sm">No media URL available for this NFT.</p>
         {/* Raw API Response section removed */}
      </div>
    );
  }


  return (
    <div className="mt-4 p-2 border rounded-lg bg-card/50 flex flex-col justify-center items-center space-y-2">
      {actualImageUrl && mediaType === 'video' && !mediaLoadError && (
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
      {actualImageUrl && mediaType === 'image' && !mediaLoadError && (
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
      {/* Media source URL display removed */}
      {fetchError && ( 
        <Alert variant="destructive" className="mt-2 w-full text-xs">
          <AlertCircle className="h-3 w-3" />
          <AlertTitle className="text-xs">Partial Error</AlertTitle>
          <AlertDescription className="text-xs">{fetchError}</AlertDescription>
        </Alert>
      )}
      {/* Raw NFT API Response section removed */}
    </div>
  );
};

export default NftImageDisplay;
