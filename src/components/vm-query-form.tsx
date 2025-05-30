
"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import NftImageDisplay from './NftImageDisplay'; 
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useLocale } from '@/contexts/LocaleContext'; // Import useLocale

interface QueryResult {
  data?: any;
  error?: string;
  returnCode?: string;
  returnMessage?: string;
}

interface VmQueryFormProps {
  initialArg0?: string | null;
  onInitialArgConsumed?: () => void;
  isAutoMode?: boolean;
}

export default function VmQueryForm({ initialArg0, onInitialArgConsumed, isAutoMode = false }: VmQueryFormProps) {
  const { currentConfig } = useEnvironment();
  const { t } = useLocale(); // Get t function
  
  const [scAddress, setScAddress] = useState(currentConfig.defaultScAddress);
  const [funcName, setFuncName] = useState(currentConfig.defaultFuncName);
  const [args, setArgs] = useState<string[]>(['']); 
  
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const argsRef = useRef(args);
  useEffect(() => {
    argsRef.current = args;
  }, [args]);
  
  useEffect(() => {
    setScAddress(currentConfig.defaultScAddress);
    setFuncName(currentConfig.defaultFuncName);
    setResult(null); 
    setError(null);  
  }, [currentConfig]);

  const handleArgChange = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index] = value;
    setArgs(newArgs);
  };

  const addArgField = () => {
    setArgs([...args, '']);
  };

  const removeArgField = (index: number) => {
    const newArgs = args.filter((_, i) => i !== index);
    setArgs(newArgs.length > 0 ? newArgs : ['']); 
  };

  const performQuery = useCallback(async (pScAddress: string, pFuncName: string, pArgs: string[]) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const processedArgs = pArgs.map(arg => arg.trim()).filter(arg => arg !== "");

    const payload = {
      scAddress: pScAddress.trim(),
      funcName: pFuncName.trim(),
      args: processedArgs,
    };

    if (!payload.scAddress || !payload.funcName) {
        setError(t('vmQuery_scAddressAndFuncNameRequiredError'));
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch(`${currentConfig.gateway}/vm-values/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData: QueryResult = await response.json();

      if (!response.ok || responseData.error) {
        setError(responseData.error || `${t('vmQuery_errorTitle')}: ${responseData.data?.returnMessage || responseData.returnMessage || response.statusText}`);
        setResult(responseData);
      } else {
        setResult(responseData);
      }
    } catch (e: any) {
      console.error("Query Error:", e);
      setError(e.message || t('vmQuery_noDataOrIssue'));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConfig.gateway, t]);


  useEffect(() => {
    if (isAutoMode && !initialArg0) {
      // Handled by currentConfig effect
    }
  }, [args, isAutoMode, initialArg0]);

  useEffect(() => {
    if (initialArg0 && initialArg0.trim() !== "") {
        const newArgsArray = [...argsRef.current]; 
        if (newArgsArray.length === 0 || (newArgsArray.length === 1 && newArgsArray[0] === '')) {
            newArgsArray[0] = initialArg0; 
        } else {
             newArgsArray[0] = initialArg0; 
        }
        const finalArgs = newArgsArray.filter((arg, index) => arg.trim() !== '' || index === 0 || newArgsArray.length === 1);
        setArgs(finalArgs.length > 0 ? finalArgs : ['']);

        if (scAddress.trim() && funcName.trim()) {
            performQuery(scAddress, funcName, finalArgs.map(a => a.trim()));
        } else {
             setError(t('vmQuery_cannotAutoQueryError'));
        }

        if (onInitialArgConsumed) {
            onInitialArgConsumed();
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialArg0, performQuery, scAddress, funcName, t]); 


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await performQuery(scAddress, funcName, args);
  };

  const renderDecodedReturnData = () => {
    if (!result || !result.data || !result.data.data || !Array.isArray(result.data.data.returnData)) {
      return null;
    }

    const returnData = result.data.data.returnData;
    if (returnData.length === 0) {
      return <p className="text-sm text-muted-foreground">{t('vmQuery_noReturnItems')}</p>;
    }

    const chunkSize = 7; 
    const groupedData: string[][] = [];
    for (let i = 0; i < returnData.length; i += chunkSize) {
      groupedData.push(returnData.slice(i, i + chunkSize));
    }
    
    const itemLabels = [
      t('vmQuery_tokenIDLabel'), t('vmQuery_tokenNameLabel'), t('vmQuery_nonceLabel'), 
      t('vmQuery_nftIDLabel'), t('vmQuery_nftNameLabel'), t('vmQuery_hashValueLabel'), 
      t('vmQuery_transactionIDLabel'), t('vmQuery_timestampLabel')
    ];

    return groupedData.map((group, groupIndex) => {
      let groupTitle = `${t('vmQuery_groupTitleFallback')} ${groupIndex + 1} (${t('vmQuery_itemsFallback')} ${groupIndex * chunkSize + 1} - ${Math.min((groupIndex + 1) * chunkSize, returnData.length)})`;

      if (group && group.length > 1 && group[1]) { 
        const secondItemBase64 = group[1];
        try {
          const binaryString = atob(secondItemBase64);
          const byteArray = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
          }
          
          let decodedText = '';
          try {
            decodedText = new TextDecoder('utf-8', { fatal: true }).decode(byteArray);
            if (decodedText.trim()) {
              groupTitle = decodedText.trim();
              if (groupTitle.length > 60) {
                groupTitle = groupTitle.substring(0, 57) + "...";
              }
            }
          } catch (utfError) {
            // Not valid UTF-8, default title remains.
          }
        } catch (base64Error) {
          // Not valid Base64, default title remains.
        }
      }

      let tokenNameForNftId = '';
      let nonceHexForNftId = '';
      let nftIdValue = '';
      let nftIdError = '';

      if (group.length > 1 && typeof group[1] !== 'undefined') { 
        try {
          const binaryString = atob(group[1]);
          const byteArray = new Uint8Array(binaryString.length);
          for (let i = 0; i < byteArray.length; i++) byteArray[i] = binaryString.charCodeAt(i);
          if (byteArray.length === 0) {
            tokenNameForNftId = t('vmQuery_emptyText');
          } else {
            tokenNameForNftId = new TextDecoder('utf-8', { fatal: true }).decode(byteArray);
             if (tokenNameForNftId.length === 0 && byteArray.length > 0) { 
                let tempHex = "";
                for (let i = 0; i < byteArray.length; i++) tempHex += byteArray[i].toString(16).padStart(2, '0');
                tokenNameForNftId = tempHex;
            }
          }
        } catch (e) {
          tokenNameForNftId = t('vmQuery_errorDecodingTokenNameText');
          nftIdError += `${t('vmQuery_errorDecodingTokenNameText')} (for NFT ID): ${e instanceof Error ? e.message : String(e)}. `;
        }
      } else {
        tokenNameForNftId = t('vmQuery_missingTokenNameDataText');
        nftIdError += `${t('vmQuery_missingTokenNameDataText')} for NFT ID. `;
      }

      if (group.length > 2 && typeof group[2] !== 'undefined') { 
        try {
          const binaryString = atob(group[2]);
          const byteArray = new Uint8Array(binaryString.length);
          for (let i = 0; i < byteArray.length; i++) byteArray[i] = binaryString.charCodeAt(i);

          if (byteArray.length === 0) {
            nonceHexForNftId = "00"; 
          } else {
            let hexStringFromBytes = "";
            for (let i = 0; i < byteArray.length; i++) {
              hexStringFromBytes += byteArray[i].toString(16).padStart(2, '0');
            }
            nonceHexForNftId = hexStringFromBytes;
          }
        } catch (e) {
          nonceHexForNftId = t('vmQuery_errorDecodingNonceText');
          nftIdError += `${t('vmQuery_errorDecodingNonceText')} (for NFT ID): ${e instanceof Error ? e.message : String(e)}. `;
        }
      } else {
        nonceHexForNftId = t('vmQuery_missingNonceDataText');
        nftIdError += `${t('vmQuery_missingNonceDataText')} for NFT ID. `;
      }
      
      if (!nftIdError.trim() && tokenNameForNftId && nonceHexForNftId && !tokenNameForNftId.startsWith(t('vmQuery_errorDecodingTokenNameText')) && !nonceHexForNftId.startsWith(t('vmQuery_errorDecodingNonceText'))) {
        nftIdValue = `${tokenNameForNftId}-${nonceHexForNftId}`;
      } else {
        nftIdValue = `${t('vmQuery_couldNotConstructNftIdText')} ${nftIdError}`;
      }


      return (
        <div key={`group-${groupIndex}`} className="mb-6 p-4 border border-border rounded-lg shadow-sm bg-card/80">
          <h4 className="text-md font-semibold mb-3 text-primary-foreground bg-blue-950 p-2 rounded-md shadow-sm -mt-4 -mx-4 mb-4 rounded-b-none">
            {groupTitle}
          </h4>
          <ul className="space-y-3">
            {itemLabels.map((itemLabel, displayIndex) => {
              let displayValue = '';
              let hasError = false;
              
              let dataItem; 
              let originalItemIndexInGroup = -1; 

              if (displayIndex === 3) { // NFT ID (Calculated)
                displayValue = nftIdValue;
                hasError = nftIdValue.startsWith(t('vmQuery_errorTitle') + ":") || nftIdValue.startsWith(t('vmQuery_couldNotConstructNftIdText'));
              } else {
                // Adjust index to fetch from original group (0-6)
                if (displayIndex < 3) { // Token ID, Token Name, Nonce
                  originalItemIndexInGroup = displayIndex;
                } else { // NFT Name, Hash Value, Transaction ID, Timestamp
                  originalItemIndexInGroup = displayIndex - 1; 
                }
                dataItem = group[originalItemIndexInGroup];

                if (typeof dataItem !== 'undefined') {
                  try {
                    const binaryString = atob(dataItem);
                    const byteArray = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                      byteArray[i] = binaryString.charCodeAt(i);
                    }

                    if (byteArray.length === 0) {
                      if (originalItemIndexInGroup === 6) { // Timestamp
                         const date = new Date(0); 
                         displayValue = date.toLocaleString();
                      } else if (originalItemIndexInGroup === 0 || originalItemIndexInGroup === 2) { // Token ID, Nonce
                        displayValue = "0";
                      } else { 
                        displayValue = t('vmQuery_emptyText');
                      }
                    } else {
                      let hexString = "";
                      for (let i = 0; i < byteArray.length; i++) {
                        hexString += byteArray[i].toString(16).padStart(2, '0');
                      }

                      if (originalItemIndexInGroup === 0 || originalItemIndexInGroup === 2) { // Token ID, Nonce
                          const numericValue = BigInt('0x' + hexString);
                          displayValue = numericValue.toString();
                      } else if (originalItemIndexInGroup === 6) { // Timestamp
                          const numericValue = BigInt('0x' + hexString);
                          try {
                              const timestampSeconds = Number(numericValue);
                              if (isNaN(timestampSeconds)) {
                                  displayValue = `${t('vmQuery_invalidNumberForTimestampText')} ${numericValue.toString()}`;
                                  hasError = true;
                              } else {
                                  const date = new Date(timestampSeconds * 1000); 
                                  if (isNaN(date.getTime())) {
                                      displayValue = `${t('vmQuery_invalidDateFromTimestampText')} ${timestampSeconds}`;
                                      hasError = true;
                                  } else {
                                      displayValue = date.toLocaleString();
                                  }
                              }
                          } catch (dateError: any) {
                              displayValue = `${t('vmQuery_dateConversionErrorText')} ${dateError.message || String(dateError)}`;
                              hasError = true;
                          }
                      } else if (originalItemIndexInGroup === 5) { // Hash Value or Transaction ID
                          displayValue = hexString;
                      } else { // Token Name, NFT Name
                          try {
                              displayValue = new TextDecoder('utf-8', { fatal: true }).decode(byteArray);
                              if (displayValue.length === 0 && byteArray.length > 0) { 
                                 displayValue = hexString; 
                              } else if (displayValue.length === 0 && byteArray.length === 0) {
                                 displayValue = t('vmQuery_emptyText'); 
                              }
                          } catch (utfError) {
                              if (hexString.length > 128) hexString = hexString.substring(0,128) + "...";
                              displayValue = hexString; 
                          }
                      }
                    }
                  } catch (e) { 
                    displayValue = `${t('vmQuery_base64DecodingErrorText')} ${e instanceof Error ? e.message : String(e)}`;
                    hasError = true;
                  }
                } else {
                  displayValue = t('vmQuery_dataNAText');
                  hasError = true;
                }
              }

              return (
                <li 
                  key={`item-${groupIndex}-${displayIndex}`}
                  className={`p-3 rounded-lg shadow-sm ${hasError ? 'bg-destructive/10 border-destructive/30' : 'bg-secondary/20 border-secondary/30'}`}
                >
                  <span className="block text-xs font-medium text-muted-foreground mb-1">
                    {itemLabel}
                  </span>
                  {(itemLabel === t('vmQuery_transactionIDLabel') && !hasError && displayValue && displayValue !== t('vmQuery_emptyText') && displayValue !== t('vmQuery_dataNAText') && !displayValue.startsWith(t('vmQuery_errorTitle'))) ? (
                    <a
                      href={`${currentConfig.explorer}/transactions/${displayValue}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono break-all whitespace-pre-wrap text-primary hover:underline"
                      title={`${t('vmQuery_viewTransactionTitle')} ${displayValue} on Explorer`}
                    >
                      {displayValue}
                    </a>
                  ) : (itemLabel === t('vmQuery_nftIDLabel') && !hasError && displayValue && !displayValue.startsWith(t('vmQuery_errorTitle')) && displayValue !== t('vmQuery_dataNAText') && !displayValue.startsWith(t('vmQuery_couldNotConstructNftIdText'))) ? (
                    <a
                      href={`${currentConfig.explorer}/nfts/${displayValue}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono break-all whitespace-pre-wrap text-primary hover:underline"
                      title={`${t('vmQuery_viewNFTTitle')} ${displayValue} on Explorer`}
                    >
                      {displayValue}
                    </a>
                  ) : (
                    <pre className="text-sm font-mono break-all whitespace-pre-wrap">{displayValue}</pre>
                  )}
                </li>
              );
            })}
          </ul>
          <NftImageDisplay nftId={nftIdValue} />
        </div>
      );
    });
  };


  return (
    <div className="space-y-6"> 
      {!isAutoMode && (
         <div className="space-y-6">
            <form onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <Label htmlFor="scAddress" className="font-semibold">{t('vmQuery_smartContractAddress')}</Label>
                    <Input
                    id="scAddress"
                    placeholder="erd1..."
                    value={scAddress}
                    onChange={(e) => setScAddress(e.target.value)}
                    required
                    className="text-sm"
                    />
                </div>
                <div className="space-y-2 mt-4">
                    <Label htmlFor="funcName" className="font-semibold">{t('vmQuery_functionName')}</Label>
                    <Input
                    id="funcName"
                    placeholder="getFunction"
                    value={funcName}
                    onChange={(e) => setFuncName(e.target.value)}
                    required
                    className="text-sm"
                    />
                </div>
                
                <div className="space-y-3 mt-4">
                    <Label className="font-semibold">{t('vmQuery_arguments')}</Label>
                    {args.map((arg, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Input
                        type="text"
                        placeholder={`${t('vmQuery_argumentPlaceholder')} ${index + 1}`}
                        value={arg}
                        onChange={(e) => handleArgChange(index, e.target.value)}
                        className="text-sm flex-grow"
                        aria-label={`${t('vmQuery_argumentPlaceholder')} ${index + 1}`}
                        />
                        { (args.length > 1 || (args.length === 1 && args[0] !== "")) ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArgField(index)}
                            aria-label={`${t('vmQuery_removeArgument')} ${index + 1}`}
                            title={`${t('vmQuery_removeArgument')} ${index + 1}`}
                            className="text-destructive hover:text-destructive/90"
                        >
                            <XCircle className="h-5 w-5" />
                        </Button>
                        ) : (
                        <div className="w-10 h-10"></div> 
                        )}
                    </div>
                    ))}
                    <Button
                    type="button"
                    variant="outline"
                    onClick={addArgField}
                    className="text-sm border-dashed hover:bg-accent/10 hover:text-accent mt-2"
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('vmQuery_addArgument')}
                    </Button>
                </div>
                <CardFooter className="flex flex-col items-start space-y-4 pt-6 px-0 pb-0">
                    <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent"
                    >
                        {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('vmQuery_querying')}
                        </>
                        ) : (
                        t('vmQuery_submitQuery')
                        )}
                    </Button>
                </CardFooter>
            </form>
        </div>
      )}

      { (isLoading && isAutoMode) && 
        <div className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('vmQuery_queryingWithFileHash')}</p>
        </div>
      }
      {error && (
        <div className="p-6 pt-0"> 
          <Alert variant="destructive" className="w-full mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('vmQuery_errorTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {result && result.data && result.data.data && Array.isArray(result.data.data.returnData) && (
        <div className="pt-0"> 
          <Card className="w-full mt-2 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-primary">{t('vmQuery_blockchainResponse')}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDecodedReturnData()}
            </CardContent>
          </Card>
        </div>
      )}
       {result && !result.data?.data?.returnData && !error && !isLoading && (
        <div className="p-6 text-center text-muted-foreground"> 
            {(isAutoMode && !initialArg0) ? t('vmQuery_awaitingFileHash') : t('vmQuery_noDataOrIssue')}
        </div>
       )}
    </div>
  );
}
