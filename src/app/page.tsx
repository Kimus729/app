
"use client";

import React, { useState } from 'react';
import { Dropzone } from '@/components/dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [hash, setHash] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const { toast } = useToast();

  const handleHashCalculated = (calculatedHash: string, name: string) => {
    setHash(calculatedHash);
    setFileName(name);
    if (calculatedHash) {
       toast({
         title: "Hash Calculated Successfully",
         description: `SHA-256 hash for ${name} generated.`,
       });
    } else if (name) { // Handle case where hash calculation failed but we have a filename
      toast({
        variant: "destructive",
        title: "Hash Calculation Failed",
        description: `Could not calculate hash for ${name}.`,
      });
    }
  };

  const copyToClipboard = () => {
    if (hash) {
      navigator.clipboard.writeText(hash)
        .then(() => {
          toast({
            title: "Copied to Clipboard!",
            description: "The SHA-256 hash has been copied.",
          });
        })
        .catch(err => {
          console.error('Failed to copy hash: ', err);
           toast({
             variant: "destructive",
             title: "Copy Failed",
             description: "Could not copy the hash to clipboard.",
           });
        });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-background">
      <div className="w-full max-w-2xl space-y-8">
        <Dropzone onHashCalculated={handleHashCalculated} className="w-full" />

        {fileName && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Calculation Result</CardTitle>
              <CardDescription>SHA-256 Hash for: {fileName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hash-output">SHA-256 Hash</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="hash-output"
                    type="text"
                    value={hash || 'Calculating or error...'}
                    readOnly
                    className="font-mono text-sm flex-grow"
                    aria-label="Calculated SHA-256 hash"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    disabled={!hash}
                    aria-label="Copy hash to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {!hash && <p className="text-sm text-destructive">Hash calculation failed or is in progress.</p>}
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster />
    </main>
  );
}
