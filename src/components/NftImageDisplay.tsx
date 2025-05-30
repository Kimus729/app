
"use client";

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ImageOff, Film, Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/LocaleContext'; // Import useLocale

interface NftImageDisplayProps {
  nftId: string | null;
}

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

const NftImageDisplay: React.FC<NftImageDisplayProps> = ({ nftId }) => {
  const { currentConfig } = useEnvironment();
  const { t } = useLocale(); // Get t function
  const [actualImageUrl, setActualImageUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mediaLoadError, setMediaLoadError] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true); 
  const [isMuted, setIsMuted] = useState(true);     

  useEffect(() => {
    setActualImageUrl(null);
    setMediaType('unknown');
    setIsLoading(false);
    setFetchError(null);
    setMediaLoadError(false);
    setIsPlaying(true); 
    setIsMuted(true);   

    if (!nftId || nftId.startsWith("Error:")) {
      setFetchError(nftId?.startsWith("Error:") ? nftId : t('nftDisplay_invalidNftIdError'));
      return;
    }

    const fetchNftMediaUrl = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${currentConfig.api}/nfts/${nftId}`);
        const responseData = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          throw new Error(`${t('nftDisplay_apiError')} ${response.status}: ${responseData.message || response.statusText}`);
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
                if (!metaResponse.ok) throw new Error(`${t('nftDisplay_metadataUriError')} ${metaResponse.status}: ${metaResponse.statusText}`);
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
                    setFetchError(t('nftDisplay_noMediaUrlInMetaError'));        
                }
             } catch (e: any) {
                setFetchError(`${t('nftDisplay_errorFetchingMetaError')} ${e.message}`);
             }
          } else {
            setFetchError(t('nftDisplay_noDirectMediaOrMetaUriError'));
          }
        }
      } catch (e: any) {
        setFetchError(e.message || t('nftDisplay_failedToFetchInfoError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNftMediaUrl();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftId, currentConfig.api, t]);

  const handleMediaError = () => {
    setMediaLoadError(true);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleDownload = () => {
    if (actualImageUrl) {
      const link = document.createElement('a');
      link.href = actualImageUrl;
      link.download = nftId ? `${nftId}_media.${actualImageUrl.split('.').pop() || 'mp4'}` : `media.${actualImageUrl.split('.').pop() || 'mp4'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleVolumeChange = () => setIsMuted(video.muted);
      video.addEventListener('volumechange', handleVolumeChange);
      setIsPlaying(!video.paused);
      setIsMuted(video.muted);
      return () => {
        video.removeEventListener('volumechange', handleVolumeChange);
      };
    }
  }, [mediaType, actualImageUrl]);


  if (isLoading) {
    return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center h-48">
        <Skeleton className="h-36 w-full rounded-md" />
        <p className="text-sm text-muted-foreground mt-2">{t('nftDisplay_loadingMedia')}</p>
      </div>
    );
  }

  if (fetchError && !actualImageUrl) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('nftDisplay_mediaFetchErrorTitle')}</AlertTitle>
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    );
  }

  if (!actualImageUrl && !fetchError) { 
     return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-lg bg-secondary/10">
        <ImageOff className="h-12 w-12 mb-2" />
        <p className="text-sm">{t('nftDisplay_noMediaToDisplay')}</p>
      </div>
    );
  }

  if (mediaLoadError) { 
     return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center text-muted-foreground border rounded-lg">
        <div className="bg-destructive/10 p-3 rounded-md w-full flex flex-col items-center">
          {mediaType === 'video' ? <Film className="h-12 w-12 mb-2 text-destructive" /> : <ImageOff className="h-12 w-12 mb-2 text-destructive" /> }
          <p className="text-sm">{t('nftDisplay_couldNotLoadMedia')}</p>
        </div>
      </div>
    );
  }
  
  if (!actualImageUrl) { 
    return (
      <div className="mt-4 p-3 flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-lg bg-secondary/10">
        <ImageOff className="h-12 w-12 mb-2" />
        <p className="text-sm">{t('nftDisplay_noMediaUrlAvailable')}</p>
      </div>
    );
  }

  return (
    <div 
      className="mt-4 p-2 border rounded-lg bg-card/50 flex flex-col justify-center items-center space-y-2 relative"
      onMouseEnter={() => mediaType === 'video' && setIsHovering(true)}
      onMouseLeave={() => mediaType === 'video' && setIsHovering(false)}
    >
      {actualImageUrl && mediaType === 'video' && !mediaLoadError && (
        <div className="relative w-full max-w-md mx-auto">
          <video
            ref={videoRef}
            src={actualImageUrl}
            autoPlay
            muted={isMuted} 
            loop
            playsInline
            className="rounded-md object-contain max-h-60 w-full block" 
            onError={handleMediaError}
            onClick={togglePlayPause}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            data-ai-hint="nft video"
          />
          {isHovering && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-2 bg-black/50 flex items-center justify-center space-x-2 transition-opacity duration-300 rounded-md">
              <Button variant="ghost" size="icon" onClick={togglePlayPause} className="text-white hover:text-gray-300 h-8 w-8">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:text-gray-300 h-8 w-8">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white hover:text-gray-300 h-8 w-8" title={t('nftDisplay_downloadButtonLabel')}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      {actualImageUrl && mediaType === 'image' && !mediaLoadError && (
        <Image
          src={actualImageUrl}
          alt={nftId ? `${t('nftDisplay_mediaForAlt')} ${nftId}` : t('nftDisplay_nftMediaAlt')}
          width={300}
          height={200}
          className="rounded-md object-contain max-h-60 w-auto"
          onError={handleMediaError}
          unoptimized={true} 
          data-ai-hint="nft image"
        />
      )}
      {fetchError && ( 
        <Alert variant="destructive" className="mt-2 w-full text-xs">
          <AlertCircle className="h-3 w-3" />
          <AlertTitle className="text-xs">{t('nftDisplay_partialErrorTitle')}</AlertTitle>
          <AlertDescription className="text-xs">{fetchError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default NftImageDisplay;
