
"use client";

import { useState } from 'react';
import VmQueryForm from '@/components/vm-query-form';
import FileHashCalculator from '@/components/file-hash-calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatabaseZap, Hash, ChevronDown, ChevronUp } from 'lucide-react';

export default function HomePage() {
  const [showFileHashCalculator, setShowFileHashCalculator] = useState(true);
  const [showVmQueryTool, setShowVmQueryTool] = useState(false); // Hidden by default
  const [hashForQuery, setHashForQuery] = useState<string | null>(null);
  const [autoQueryModeActive, setAutoQueryModeActive] = useState(false);

  const handleHashCalculated = (newHash: string) => {
    setHashForQuery(newHash);
    setAutoQueryModeActive(true);
    setShowVmQueryTool(true); // Ensure VmQueryForm is rendered to receive props for auto-query results
  };

  const handleFileCleared = () => {
    setHashForQuery(null);
    setAutoQueryModeActive(false);
    // setShowVmQueryTool(false); // Optionally reset VM tool visibility, or let user control it
  };

  const handleInitialArgConsumed = () => {
    setHashForQuery(null);
    // autoQueryModeActive remains true here, so results-only view persists
    // If we want to switch back to manual mode after results, setAutoQueryModeActive(false) here.
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background">
      <header className="w-full max-w-3xl mb-12 pt-8 text-center">
        <h1 className="text-4xl font-bold text-primary">VOSDECISIONS</h1>
      </header>
      
      <div className="w-full max-w-3xl space-y-8 flex-grow">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center space-x-3">
              <Hash className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">File SHA256 Hash Calculator</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFileHashCalculator(!showFileHashCalculator)}
              aria-expanded={showFileHashCalculator}
              aria-controls="file-hash-calculator-content"
            >
              {showFileHashCalculator ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              <span className="sr-only">{showFileHashCalculator ? 'Hide' : 'Show'} File Hash Calculator</span>
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
          // In autoQueryMode, we render VmQueryForm directly if showVmQueryTool is true
          // showVmQueryTool is set to true in handleHashCalculated to ensure VmQueryForm mounts
          showVmQueryTool && ( 
            <VmQueryForm
              initialArg0={hashForQuery}
              onInitialArgConsumed={handleInitialArgConsumed}
              isAutoMode={true} // Tells VmQueryForm to only show results/errors
            />
          )
        ) : (
          // Manual mode: Display the "VM Query Tool" card, collapsible
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center space-x-3">
                <DatabaseZap className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">VM Query Tool</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVmQueryTool(!showVmQueryTool)}
                aria-expanded={showVmQueryTool}
                aria-controls="vm-query-tool-content"
              >
                {showVmQueryTool ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                <span className="sr-only">{showVmQueryTool ? 'Hide' : 'Show'} VM Query Tool</span>
              </Button>
            </CardHeader>
            {showVmQueryTool && ( // Content is hidden if showVmQueryTool is false
              <CardContent id="vm-query-tool-content">
                 <CardDescription className="mb-4 -mt-2">
                  Enter SC details to query the devnet. Hash from calculator above will auto-fill first argument.
                </CardDescription>
                <VmQueryForm 
                  initialArg0={hashForQuery} // Will be null here initially
                  onInitialArgConsumed={handleInitialArgConsumed}
                  isAutoMode={false} // Tells VmQueryForm to show full form
                />
              </CardContent>
            )}
          </Card>
        )}
      </div>
      <footer className="w-full max-w-3xl mt-12 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; VOSDECISIONS 2025</p>
      </footer>
    </div>
  );
}
