
"use client";

import React, { useState, useCallback, useEffect, useId } from 'react'; // Import useEffect, useId
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface DropzoneProps {
  onHashCalculated: (hash: string, fileName: string) => void;
  className?: string;
}

export function Dropzone({ onHashCalculated, className }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0); // Progress is simulated for now
  const [inputId, setInputId] = useState<string | undefined>(undefined); // State for input ID

  // Ensure inputId is generated only on the client
  useEffect(() => {
    setInputId(`file-input-${Math.random().toString(36).substring(2, 8)}`);
  }, []);


  const calculateSHA256 = useCallback(async (fileToHash: File): Promise<string> => {
    const buffer = await fileToHash.arrayBuffer();
    // Simulate progress
    setProgress(50);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    // Simulate completion
    setProgress(100);
    return hashHex;
  }, []);

  const handleFile = useCallback(async (droppedFile: File | null) => {
    if (!droppedFile) {
      setError("Aucun fichier fourni.");
      setFile(null);
      setIsCalculating(false);
      setProgress(0);
      return;
    }

    setError(null);
    setFile(droppedFile);
    setIsCalculating(true);
    setProgress(0); // Reset progress

    try {
      const hash = await calculateSHA256(droppedFile);
      onHashCalculated(hash, droppedFile.name);
    } catch (err) {
      console.error("Erreur lors du calcul du hash:", err);
      setError(`Erreur lors du calcul du hash : ${err instanceof Error ? err.message : String(err)}`);
      onHashCalculated('', droppedFile.name); // Clear hash on error
    } finally {
      setIsCalculating(false);
      // Keep progress at 100 or reset if needed based on UX preference
      // setProgress(0);
    }
  }, [calculateSHA256, onHashCalculated]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if the relatedTarget (where the drag is leaving to) is outside the dropzone
     if (e.relatedTarget && (e.relatedTarget as Node).contains(e.currentTarget)) return;
    setIsDragging(false);
  }, []);


  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Ensure the cursor indicates a copy operation
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
    setIsDragging(true); // Keep dragging state active while over
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
     // Reset file input to allow re-uploading the same file
     e.target.value = '';
  }, [handleFile]);


  return (
    <Card
      className={cn(
        'border-2 border-dashed border-primary/50 transition-all duration-300 ease-in-out hover:border-primary',
        'bg-card/80 backdrop-blur-sm', // Added backdrop blur
        isDragging ? 'border-primary bg-accent/90' : '', // Adjusted dragging background
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">Signature Fichier</CardTitle> {/* Updated title */}
        <CardDescription>Déposez un fichier ici ou cliquez pour télécharger</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
         {/* Only render the label and input on the client */}
        {inputId && (
          <label
            htmlFor={inputId}
            className={cn(
              "flex flex-col items-center justify-center w-full h-48 cursor-pointer",
              isDragging ? 'opacity-70' : ''
            )}
          >
            <UploadCloud className="w-16 h-16 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              {isDragging ? 'Déposez le fichier ici' : 'Glissez-déposez un fichier, ou cliquez pour sélectionner'}
            </p>
            <input
              id={inputId}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={isCalculating}
              aria-hidden="true" // Hide from accessibility tree as label handles it
            />
          </label>
        )}
        {file && !isCalculating && !error && (
          <p className="text-sm font-medium">Fichier sélectionné : {file.name}</p>
        )}
        {isCalculating && (
          <div className="w-full space-y-2 text-center">
             <p className="text-sm font-medium">Calcul du hash pour : {file?.name}...</p>
            <Progress value={progress} className="w-full bg-secondary/50" /> {/* Adjusted progress bar background */}
             <p className="text-xs text-muted-foreground">{progress}%</p>
          </div>
        )}
         {error && (
           <Alert variant="destructive" className="w-full bg-destructive/80 text-destructive-foreground"> {/* Adjusted alert style */}
             <Terminal className="h-4 w-4" />
             <AlertTitle>Erreur</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
         )}
      </CardContent>
    </Card>
  );
}
