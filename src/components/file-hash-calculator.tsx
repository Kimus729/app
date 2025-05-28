
"use client";

import { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, FileText, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileHashCalculatorProps {
  onHashCalculated?: (hash: string) => void;
}

export default function FileHashCalculator({ onHashCalculated }: FileHashCalculatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateSHA256 = async (inputFile: File): Promise<string> => {
    const buffer = await inputFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const processFile = async (selectedFile: File | null) => {
    if (!selectedFile) {
      clearFile();
      return;
    }

    setFile(selectedFile);
    setHash(null);
    setError(null);
    setIsLoading(true);

    try {
      const calculatedHash = await calculateSHA256(selectedFile);
      setHash(calculatedHash);
      if (onHashCalculated) {
        onHashCalculated(calculatedHash);
      }
    } catch (e: any) {
      console.error("Hashing Error:", e);
      setError(e.message || 'An unexpected error occurred during hashing.');
      setFile(null); // Clear file on error to prevent inconsistent state
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      await processFile(droppedFile);
      event.dataTransfer.clearData();
    }
  }, [processFile]);

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      await processFile(event.target.files[0]);
    } else {
      await processFile(null); // Clear if no file selected
    }
  };

  const clearFile = () => {
    setFile(null);
    setHash(null);
    setError(null);
    setIsLoading(false);
    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Reset the file input
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">File SHA256 Hash Calculator</CardTitle>
        <CardDescription>
          Upload a file to calculate its SHA256 hash locally. The hash can then be used to query the VM.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={cn(
            "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-accent hover:bg-accent/5",
            error ? "border-destructive bg-destructive/5" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload-input')?.click()}
          role="button"
          tabIndex={0}
          aria-label="File upload drop zone"
        >
          <UploadCloud className={cn("h-12 w-12 mb-4", isDragging ? "text-primary" : "text-muted-foreground")} />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">Any file type</p>
          <Input
            id="file-upload-input"
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {file && !error && (
          <div className="p-4 border rounded-md bg-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0"> {/* Added min-w-0 for truncation */}
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm font-medium truncate" title={file.name}>{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024).toFixed(2)} KB)</span>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile} aria-label="Clear file" className="text-muted-foreground hover:text-destructive shrink-0">
                    <XCircle className="h-5 w-5" />
                </Button>
            </div>
            
            {isLoading && (
              <div className="flex items-center text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Calculating hash...
              </div>
            )}

            {hash && !isLoading && (
              <div>
                <p className="text-sm font-semibold text-primary mb-1">SHA256 Hash:</p>
                <pre className="text-xs font-mono bg-muted/80 p-3 rounded-md break-all overflow-x-auto select-all">
                  {hash}
                </pre>
              </div>
            )}
          </div>
        )}
         {!file && !error && !isLoading && (
          <div className="text-center text-sm text-muted-foreground py-4">
            No file selected.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
