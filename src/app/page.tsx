
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import VmQueryForm from '@/components/vm-query-form';
import FileHashCalculator from '@/components/file-hash-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';


export default function HomePage() {
  const [showFileHashCalculator, setShowFileHashCalculator] = useState(true);
  const [showVmQueryTool, setShowVmQueryTool] = useState(false);
  const [hashForQuery, setHashForQuery] = useState<string | null>(null);
  const [autoQueryModeActive, setAutoQueryModeActive] = useState(false);

  const handleHashCalculated = (newHash: string) => {
    setHashForQuery(newHash);
    setAutoQueryModeActive(true);
    // setShowVmQueryTool(true); // User requested this to be hidden initially even in auto mode.
  };

  const handleFileCleared = () => {
    setHashForQuery(null);
    setAutoQueryModeActive(false);
    setShowVmQueryTool(false);
  };

  const handleInitialArgConsumed = () => {
    setHashForQuery(null);
  };

  let logoSrc = "/vosdecisions-logo.png";

  if (process.env.NEXT_PUBLIC_GITHUB_ACTIONS === 'true' && process.env.NEXT_PUBLIC_GITHUB_REPOSITORY) {
    const [owner, repoName] = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY.split('/');
    if (owner && repoName) {
      logoSrc = `https://${owner}.github.io/${repoName}/vosdecisions-logo.png`;
    }
  } else {
    logoSrc = "/vosdecisions-logo.png";
  }


  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background">
      <header className="w-full max-w-3xl mb-12 pt-8 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src={logoSrc}
            alt="VOSDECISIONS Logo"
            width={80}
            height={80}
            data-ai-hint="abstract square root database"
            unoptimized={process.env.NEXT_PUBLIC_GITHUB_ACTIONS === 'true'}
          />
        </div>
        <h1 className="text-4xl font-bold text-blue-950 font-scope-one">VOSDECISIONS</h1>
      </header>

      <div className="w-full max-w-3xl space-y-8 flex-grow">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-2xl">Check File</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFileHashCalculator(!showFileHashCalculator)}
              aria-expanded={showFileHashCalculator}
              aria-controls="file-hash-calculator-content"
              aria-pressed={showFileHashCalculator}
              role="button"
            >
              {showFileHashCalculator ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              <span className="sr-only">{showFileHashCalculator ? 'Hide' : 'Show'} Check File</span>
            </Button>
          </CardHeader>
          {showFileHashCalculator && (
            <CardContent id="file-hash-calculator-content">
              <FileHashCalculator
                onHashCalculated={handleHashCalculated}
                onFileCleared={handleFileCleared}
              />
            </CardContent>
          )}
        </Card>

        {autoQueryModeActive ? (
            <VmQueryForm
              initialArg0={hashForQuery}
              onInitialArgConsumed={handleInitialArgConsumed}
              isAutoMode={true}
            />

        ) : (
          showVmQueryTool ? (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-2xl">VM Query Tool</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVmQueryTool(!showVmQueryTool)}
                  aria-expanded={showVmQueryTool}
                  aria-controls="vm-query-tool-content"
                  aria-pressed={showVmQueryTool}
                  role="button"
                >
                  {showVmQueryTool ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  <span className="sr-only">{showVmQueryTool ? 'Hide' : 'Show'} VM Query Tool</span>
                </Button>
              </CardHeader>
              {showVmQueryTool && (
                <CardContent id="vm-query-tool-content">
                    <VmQueryForm
                      initialArg0={null}
                      onInitialArgConsumed={handleInitialArgConsumed}
                      isAutoMode={false}
                    />
                </CardContent>
              )}
            </Card>
          ) : null
        )}
      </div>
      <footer className="w-full max-w-3xl mt-12 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; VOSDECISIONS 2025</p>
      </footer>
    </div>
  );
}
