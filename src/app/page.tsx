
"use client";

import { useState } from 'react';
import VmQueryForm from '@/components/vm-query-form';
import FileHashCalculator from '@/components/file-hash-calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatabaseZap, Hash, ChevronDown, ChevronUp, FunctionSquare } from 'lucide-react';

export default function HomePage() {
  const [showFileHashCalculator, setShowFileHashCalculator] = useState(true);
  const [showVmQueryTool, setShowVmQueryTool] = useState(false); // Hidden by default
  const [hashForQuery, setHashForQuery] = useState<string | null>(null);

  const handleHashCalculated = (newHash: string) => {
    setHashForQuery(newHash);
    if (!showVmQueryTool) {
      setShowVmQueryTool(true); // Automatically show the VM query tool
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background">
      <header className="w-full max-w-3xl mb-12 pt-8 text-center">
        <div className="flex justify-center items-center space-x-3 mb-2">
          <FunctionSquare className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-primary">MultiversX Dev Tools</h1>
        <p className="text-md text-muted-foreground">A collection of useful tools for MultiversX development.</p>
      </header>
      
      <div className="w-full max-w-3xl space-y-8">
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
              <FileHashCalculator onHashCalculated={handleHashCalculated} />
            </CardContent>
          )}
        </Card>

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
          {showVmQueryTool && (
            <CardContent id="vm-query-tool-content">
               <CardDescription className="mb-4 -mt-2">
                Enter SC details to query the devnet. Hash from calculator above will auto-fill first argument.
              </CardDescription>
              <VmQueryForm 
                initialArg0={hashForQuery} 
                onInitialArgConsumed={() => setHashForQuery(null)} 
              />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
