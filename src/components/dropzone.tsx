
"use client";

import React, { useState, useCallback, useMemo } from 'react';
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
      setError("No file provided.");
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
      console.error("Error calculating hash:", err);
      setError(`Error calculating hash: ${err instanceof Error ? err.message : String(err)}`);
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
  }, [handleFile]);

  const inputId = useMemo(() => `file-input-${Math.random().toString(36).substring(7)}`, []);

  return (
    <Card
      className={cn(
        'border-2 border-dashed border-primary/50 transition-all duration-300 ease-in-out hover:border-primary',
        isDragging ? 'border-primary bg-accent' : '',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">HashDrop</CardTitle>
        <CardDescription>Drop a file here or click to upload</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
        <label
          htmlFor={inputId}
          className={cn(
            "flex flex-col items-center justify-center w-full h-48 cursor-pointer",
             isDragging ? 'opacity-70' : ''
          )}
        >
          <UploadCloud className="w-16 h-16 text-primary mb-4" />
          <p className="text-sm text-muted-foreground">
            {isDragging ? 'Drop the file here' : 'Drag & drop a file, or click to select'}
          </p>
          <input
            id={inputId}
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={isCalculating}
          />
        </label>
        {file && !isCalculating && !error && (
          <p className="text-sm font-medium">Selected file: {file.name}</p>
        )}
        {isCalculating && (
          <div className="w-full space-y-2 text-center">
             <p className="text-sm font-medium">Calculating hash for: {file?.name}...</p>
            <Progress value={progress} className="w-full" />
             <p className="text-xs text-muted-foreground">{progress}%</p>
          </div>
        )}
         {error && (
           <Alert variant="destructive" className="w-full">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
           </Alert>
         )}
      </CardContent>
    </Card>
  );
}
