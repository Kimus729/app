
"use client";

import React, { useState } from 'react';
import Image from 'next/image'; // Import next/image
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
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-background overflow-hidden">
       {/* Background Cat Images */}
       <Image
         src="https://picsum.photos/seed/cat1/300/200"
         alt="Background cat image 1"
         width={300}
         height={200}
         className="fixed -z-10 opacity-10 rounded-lg shadow-md top-10 left-10 object-cover"
         data-ai-hint="cat"
         priority
       />
        <Image
         src="https://picsum.photos/seed/cat2/250/350"
         alt="Background cat image 2"
         width={250}
         height={350}
         className="fixed -z-10 opacity-10 rounded-lg shadow-md bottom-5 right-5 object-cover"
         data-ai-hint="cat"
       />
       <Image
         src="https://picsum.photos/seed/cat3/200/200"
         alt="Background cat image 3"
         width={200}
         height={200}
         className="fixed -z-10 opacity-10 rounded-full shadow-md top-1/3 right-20 transform -translate-y-1/2 object-cover"
         data-ai-hint="cat"
       />
        <Image
         src="https://picsum.photos/seed/cat4/400/250"
         alt="Background cat image 4"
         width={400}
         height={250}
         className="fixed -z-10 opacity-10 rounded-lg shadow-md bottom-1/4 left-16 transform translate-y-1/2 object-cover"
         data-ai-hint="cat"
       />

      {/* Main Content - Added z-10 to ensure it's above background images */}
      <div className="relative z-10 w-full max-w-2xl space-y-8">
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
      {/* Toaster remains outside the main content div but inside main */}
      <Toaster />
    </main>
  );
}
