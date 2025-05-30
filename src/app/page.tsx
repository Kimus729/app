
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import VmQueryForm from '@/components/vm-query-form';
import FileHashCalculator from '@/components/file-hash-calculator';
import EnvironmentSwitcher from '@/components/EnvironmentSwitcher';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';


export default function HomePage() {
  const { t, locale } = useLocale();
  const [showFileHashCalculator, setShowFileHashCalculator] = useState(true);
  const [showVmQueryTool, setShowVmQueryTool] = useState(false);
  const [hashForQuery, setHashForQuery] = useState<string | null>(null);
  const [autoQueryModeActive, setAutoQueryModeActive] = useState(false);

  const handleHashCalculated = (newHash: string) => {
    setHashForQuery(newHash);
    setAutoQueryModeActive(true);
    // setShowVmQueryTool(true); // Keep VM Query tool hidden by default on auto-query
  };

  const handleFileCleared = () => {
    setHashForQuery(null);
    setAutoQueryModeActive(false);
    setShowVmQueryTool(false);
  };

  const handleInitialArgConsumed = () => {
    setHashForQuery(null);
  };

  let logoSrc = "/vosdecisions-logo.png"; // Default for local dev

  if (process.env.NEXT_PUBLIC_GITHUB_ACTIONS === 'true') {
    const repoFullName = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY; // e.g., Kimus729/app
    if (repoFullName) {
      const [owner, repoName] = repoFullName.split('/');
      if (repoName) { // Construct path for GitHub Pages subdirectory
        logoSrc = `/${repoName}/vosdecisions-logo.png`;
      } else { // Fallback or custom domain root case
        logoSrc = "/vosdecisions-logo.png";
      }
    } else { // Fallback if GITHUB_REPOSITORY is not set
      logoSrc = "/vosdecisions-logo.png";
    }
  }
  // If on a custom domain pointing to the root of GitHub Pages, basePath in next.config.js handles this.
  // For vosdecisions.fr which points to the root, next.config.ts sets basePath to "" or undefined
  // So, logoSrc should be "/vosdecisions-logo.png" for the custom domain.
  // The above logic is more for when deploying to username.github.io/reponame
  // For a custom domain setup like vosdecisions.fr, next.config.ts now sets basePath to undefined.
  // So, the image path should be absolute from the root.
  if (typeof window !== 'undefined' && window.location.hostname === 'vosdecisions.fr') {
    logoSrc = "/vosdecisions-logo.png";
  }


  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-3xl flex justify-end items-center space-x-2 mb-4 mt-2 px-1 md:px-0">
        <LocaleSwitcher />
        <EnvironmentSwitcher />
      </div>
      <header className="w-full max-w-3xl mb-8 pt-4 md:pt-8 md:mb-12 text-center">
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
        <h1 className="text-4xl text-blue-950 font-genos font-normal">VOSDECISIONS</h1>
      </header>

      <div className="w-full max-w-3xl space-y-8 flex-grow">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-2xl">{t('checkFileTitle')}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFileHashCalculator(!showFileHashCalculator)}
              aria-expanded={showFileHashCalculator}
              aria-controls="file-hash-calculator-content"
              aria-pressed={showFileHashCalculator}
              role="button"
              title={showFileHashCalculator ? t('hideText') : t('showText')}
            >
              {showFileHashCalculator ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              <span className="sr-only">{showFileHashCalculator ? t('hideText') : t('showText')} {t('checkFileTitle')}</span>
            </Button>
          </CardHeader>
          {showFileHashCalculator && (
            <CardContent id="file-hash-calculator-content" className="pt-6">
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
                  <CardTitle className="text-2xl">{t('vmQueryToolTitle')}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVmQueryTool(!showVmQueryTool)}
                  aria-expanded={showVmQueryTool}
                  aria-controls="vm-query-tool-content"
                  aria-pressed={showVmQueryTool}
                  role="button"
                  title={showVmQueryTool ? t('hideText') : t('showText')}
                >
                  {showVmQueryTool ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  <span className="sr-only">{showVmQueryTool ? t('hideText') : t('showText')} {t('vmQueryToolTitle')}</span>
                </Button>
              </CardHeader>
              {showVmQueryTool && (
                <CardContent id="vm-query-tool-content" className="pt-6">
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
        <p>{t('footerCopyright')}</p>
      </footer>
    </div>
  );
}
