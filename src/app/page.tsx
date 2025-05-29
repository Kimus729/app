
"use client";

import { useState } from 'react';
import Image from 'next/image'; // Import next/image
import VmQueryForm from '@/components/vm-query-form';
import FileHashCalculator from '@/components/file-hash-calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    setShowVmQueryTool(false); // Hide VM query tool when file is cleared
  };

  const handleInitialArgConsumed = () => {
    setHashForQuery(null);
  };

  let logoSrc = "vosdecisions-logo.png"; // Default for local, relative to public folder

  if (process.env.NEXT_PUBLIC_GITHUB_ACTIONS === 'true' && process.env.NEXT_PUBLIC_GITHUB_REPOSITORY) {
    const [owner, repoName] = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY.split('/');
    if (owner && repoName) {
      // Construct absolute URL for GitHub Pages
      logoSrc = `https://${owner}.github.io/${repoName}/vosdecisions-logo.png`;
    }
  } else {
    // For local development, Next.js handles /public paths correctly.
    // If basePath is set for local dev (it isn't in current config), this might need adjustment
    // but current config makes basePath undefined locally.
    logoSrc = "/vosdecisions-logo.png";
  }


  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background">
      <header className="w-full max-w-3xl mb-12 pt-8 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src={logoSrc} // Use the dynamically constructed src
            alt="VOSDECISIONS Logo"
            width={80}
            height={80}
          />
        </div>
        <h1 className="text-4xl font-bold text-primary font-[var(--font-exo2)]">VOSDECISIONS</h1>
      </header>
      
      <div className="w-full max-w-3xl space-y-8 flex-grow">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center space-x-3">
              {/* Icon removed as per previous request */}
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
          ( // When auto query is active, render VmQueryForm directly for results
            <VmQueryForm
              initialArg0={hashForQuery}
              onInitialArgConsumed={handleInitialArgConsumed}
              isAutoMode={true}
            />
          )
        ) : (
          // Only render the manual VM Query Tool Card if showVmQueryTool is true
          showVmQueryTool && ( 
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-2xl">VM Query Tool</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVmQueryTool(!showVmQueryTool)} // This button now only toggles its own card's content
                  aria-expanded={showVmQueryTool}
                  aria-controls="vm-query-tool-content"
                  aria-pressed={showVmQueryTool}
                  role="button"
                >
                  {showVmQueryTool ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  <span className="sr-only">{showVmQueryTool ? 'Hide' : 'Show'} VM Query Tool</span>
                </Button>
              </CardHeader>
              {showVmQueryTool && ( // Content of the manual tool card
                <CardContent id="vm-query-tool-content">
                  <CardDescription className="mb-4 -mt-2">
                    Enter SC details to query the devnet. Hash from calculator above will auto-fill first argument.
                  </CardDescription>
                  <VmQueryForm
                    initialArg0={null} // No initialArg for manual mode from here
                    onInitialArgConsumed={handleInitialArgConsumed}
                    isAutoMode={false}
                  />
                </CardContent>
              )}
            </Card>
          )
        )}
      </div>
      <footer className="w-full max-w-3xl mt-12 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; VOSDECISIONS 2025</p>
      </footer>
    </div>
  );
}
