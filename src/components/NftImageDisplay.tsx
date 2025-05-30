
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ImageOff, Film } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEnvironment } from '@/contexts/EnvironmentContext';

interface NftImageDisplayProps {
  nftId: string | null;
}

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

const NftImageDisplay: React.FC<NftImageDisplayProps> = ({ nftId }) => {
  const { currentConfig } = useEnvironment(); // Use currentConfig
  const [actualImageUrl, setActualImageUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mediaLoadError, setMediaLoadError] = useState<boolean>(false);

  useEffect(() => {
    setActualImageUrl(null);
    setMediaType('unknown');
    setIsLoading(false);
    setFetchError(null);
    setMediaLoadError(false);

    if (!nftId || nftId.startsWith("Error:")) {
      setFetchError(nftId?.startsWith("Error:") ? nftId : "Invalid NFT ID provided for media lookup.");
      return;
    }

    const fetchNftMediaUrl = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${currentConfig.api}/nfts/${nftId}`); // Use dynamic API URL from currentConfig
        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          throw new Error(`API Error ${response.status}: ${responseData.message || response.statusText}`);
        }
        
        const data = responseData;
        
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
          // If API didn't specify video, but URL ends with .mp4, assume video
          if (determinedMediaType === 'image' && mediaUrl.toLowerCase().endsWith('.mp4')) {
            determinedMediaType = 'video';
          }
          setActualImageUrl(mediaUrl);
          setMediaType(determinedMediaType);
        } else {
          // Fallback to fetching metadata from URIs if no direct media URL
          if (data.uris && data.uris.length > 0 && typeof data.uris[0] === 'string') {
            let metadataUri = data.uris[0];
            if (metadataUri.startsWith('ipfs://')) {
                metadataUri = IPFS_GATEWAY + metadataUri.substring(7);
            }
             try {
                const metaResponse = await fetch(metadataUri);
                if (!metaResponse.ok) throw new Error(`Metadata URI Error ${metaResponse.status}: ${metaResponse.statusText}`);
                const metaData = await metaResponse.json();
                
                // Check various common fields for media URL in metadata
                mediaUrl = metaData.image || metaData.image_url || metaData.animation_url || metaData.media?.url;
                if (mediaUrl && typeof mediaUrl === 'string') {
                    if (mediaUrl.startsWith('ipfs://')) {
                        mediaUrl = IPFS_GATEWAY + mediaUrl.substring(7);
                    }
                    // If API didn't specify video, but metadata URL ends with .mp4, assume video
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
  }, [nftId, currentConfig.api]); // Dependency on currentConfig.api

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
      </Alert>
    );
  }


  if (!actualImageUrl && !fetchError) { 
     return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-lg bg-secondary/10">
        <ImageOff className="h-12 w-12 mb-2" />
        <p className="text-sm">No media to display for this NFT.</p>
      </div>
    );
  }

  if (mediaLoadError) { 
     return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center text-muted-foreground border rounded-lg">
        <div className="bg-destructive/10 p-3 rounded-md w-full flex flex-col items-center">
          {mediaType === 'video' ? <Film className="h-12 w-12 mb-2 text-destructive" /> : <ImageOff className="h-12 w-12 mb-2 text-destructive" /> }
          <p className="text-sm">Could not load media from URL.</p>
          {/* URL display removed as per user request */}
        </div>
      </div>
    );
  }
  
  if (!actualImageUrl) { 
    return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-lg bg-secondary/10">
        <ImageOff className="h-12 w-12 mb-2" />
        <p className="text-sm">No media URL available for this NFT.</p>
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
      {/* Raw JSON display removed as per user request */}
      {fetchError && ( 
        <Alert variant="destructive" className="mt-2 w-full text-xs">
          <AlertCircle className="h-3 w-3" />
          <AlertTitle className="text-xs">Partial Error</AlertTitle>
          <AlertDescription className="text-xs">{fetchError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default NftImageDisplay;
