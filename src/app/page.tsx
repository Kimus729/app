
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import VmQueryForm from '@/components/vm-query-form';
import FileHashCalculator from '@/components/file-hash-calculator';
import EnvironmentSwitcher from '@/components/EnvironmentSwitcher';
import LocaleSwitcher from '@/components/LocaleSwitcher'; // Import LocaleSwitcher
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext'; // Import useLocale


export default function HomePage() {
  const { t, locale } = useLocale(); // Get t function and current locale
  const [showFileHashCalculator, setShowFileHashCalculator] = useState(true);
  const [showVmQueryTool, setShowVmQueryTool] = useState(false);
  const [hashForQuery, setHashForQuery] = useState<string | null>(null);
  const [autoQueryModeActive, setAutoQueryModeActive] = useState(false);

  const handleHashCalculated = (newHash: string) => {
    setHashForQuery(newHash);
    setAutoQueryModeActive(true);
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

  // Dynamically update document lang attribute when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-5xl flex justify-end items-center space-x-2 mb-2 mt-2 pr-2 md:pr-0">
        <LocaleSwitcher />
        <EnvironmentSwitcher />
      </div>
      <header className="w-full max-w-3xl mb-12 pt-4 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src={logoSrc}
            alt="VOSDECISIONS Logo" // Consider translating if logo has text, or use a generic alt
            width={80}
            height={80}
            data-ai-hint="abstract square root database"
            unoptimized={process.env.NEXT_PUBLIC_GITHUB_ACTIONS === 'true'}
          />
        </div>
        <h1 className="text-4xl text-blue-950 font-genos">{t('pageTitle')}</h1>
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
        <p>{t('footerCopyright')}</p>
      </footer>
    </div>
  );
}
