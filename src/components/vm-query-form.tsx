
"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

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
  const [scAddress, setScAddress] = useState('erd1qqqqqqqqqqqqqpgq209g5ct99dcyjdxetdykgy92yqf0cnxf0qesc2aw9w');
  const [funcName, setFuncName] = useState('getPrintInfoFromHash');
  const [args, setArgs] = useState<string[]>(['']); 
  
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const argsRef = useRef(args);
  useEffect(() => {
    argsRef.current = args;
  }, [args]);
  
  useEffect(() => {
    setError(null);
    if (isAutoMode) { 
        if (!initialArg0) {
            // setResult(null); // Might clear results too aggressively
        }
    }
  }, [scAddress, funcName, args, isAutoMode, initialArg0]);

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
        setError("Smart Contract Address and Function Name are required.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('https://devnet-gateway.multiversx.com/vm-values/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData: QueryResult = await response.json();

      if (!response.ok || responseData.error) {
        setError(responseData.error || `API Error: ${responseData.data?.returnMessage || responseData.returnMessage || response.statusText}`);
        setResult(responseData);
      } else {
        setResult(responseData);
      }
    } catch (e: any) {
      console.error("Query Error:", e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);


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
             setError("Cannot auto-query: Smart Contract Address or Function Name is missing. Please fill them and submit manually or re-upload the file.");
        }

        if (onInitialArgConsumed) {
            onInitialArgConsumed();
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialArg0]); 


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
      return <p className="text-sm text-muted-foreground">No return items to display.</p>;
    }

    const chunkSize = 7; 
    const groupedData: string[][] = [];
    for (let i = 0; i < returnData.length; i += chunkSize) {
      groupedData.push(returnData.slice(i, i + chunkSize));
    }
    
    const itemLabels = ["Token ID", "Token Name", "Nonce", "NFT ID", "NFT Name", "Hash Value", "Transaction ID", "Timestamp"];

    return groupedData.map((group, groupIndex) => {
      let groupTitle = `Group ${groupIndex + 1} (Items ${groupIndex * chunkSize + 1} - ${Math.min((groupIndex + 1) * chunkSize, returnData.length)})`;

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

      // Pre-calculate NFT ID components
      let tokenNameForNftId = '';
      let nonceHexForNftId = '';
      let nftIdValue = '';
      let nftIdError = '';

      // Get Token Name (from group[1])
      if (group.length > 1 && typeof group[1] !== 'undefined') {
        try {
          const binaryString = atob(group[1]);
          const byteArray = new Uint8Array(binaryString.length);
          for (let i = 0; i < byteArray.length; i++) byteArray[i] = binaryString.charCodeAt(i);
          if (byteArray.length === 0) {
            tokenNameForNftId = "(empty)";
          } else {
            tokenNameForNftId = new TextDecoder('utf-8', { fatal: true }).decode(byteArray);
             if (tokenNameForNftId.length === 0 && byteArray.length > 0) { 
                let tempHex = "";
                for (let i = 0; i < byteArray.length; i++) tempHex += byteArray[i].toString(16).padStart(2, '0');
                tokenNameForNftId = tempHex;
            }
          }
        } catch (e) {
          tokenNameForNftId = "Error";
          nftIdError += "Token Name decoding error. ";
        }
      } else {
        nftIdError += "Missing Token Name data for NFT ID. ";
      }

      // Get Nonce and convert to hex (from group[2])
      if (group.length > 2 && typeof group[2] !== 'undefined') {
        try {
          const binaryString = atob(group[2]);
          const byteArray = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) byteArray[i] = binaryString.charCodeAt(i);
          if (byteArray.length === 0) {
            nonceHexForNftId = "00"; // An empty byte array for nonce is typically 0, hex "00" for one byte.
          } else {
            let hexString = "";
            for (let i = 0; i < byteArray.length; i++) hexString += byteArray[i].toString(16).padStart(2, '0');
            nonceHexForNftId = hexString; 
          }
        } catch (e) {
          nonceHexForNftId = "Error";
          nftIdError += "Nonce decoding error. ";
        }
      } else {
        nftIdError += "Missing Nonce data for NFT ID. ";
      }
      
      if (!nftIdError.trim()) {
        nftIdValue = `${tokenNameForNftId}-${nonceHexForNftId}`;
      } else {
        nftIdValue = `Error: ${nftIdError}`;
      }


      return (
        <div key={`group-${groupIndex}`} className="mb-6 p-4 border border-border rounded-lg shadow-sm bg-card/80">
          <h4 className="text-md font-semibold mb-3 text-accent-foreground bg-accent/80 p-2 rounded-md shadow-sm -mt-4 -mx-4 mb-4 rounded-b-none">
            {groupTitle}
          </h4>
          <ul className="space-y-3">
            {itemLabels.map((itemLabel, displayIndex) => {
              let displayValue = '';
              let hasError = false;
              
              let dataItem; 
              let effectiveItemTypeIndex = -1; 

              if (displayIndex === 3) { // This is our new "NFT ID"
                displayValue = nftIdValue;
                hasError = !!nftIdError.trim();
              } else {
                // Map displayIndex to the original data index in the 7-item group
                if (displayIndex < 3) { // Token ID, Token Name, Nonce
                  dataItem = group[displayIndex];
                  effectiveItemTypeIndex = displayIndex;
                } else { // NFT Name, Hash Value, Transaction ID, Timestamp (display indices 4, 5, 6, 7)
                  dataItem = group[displayIndex - 1]; 
                  effectiveItemTypeIndex = displayIndex - 1;
                }

                if (typeof dataItem !== 'undefined') {
                  try {
                    const binaryString = atob(dataItem);
                    const byteArray = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                      byteArray[i] = binaryString.charCodeAt(i);
                    }

                    if (byteArray.length === 0) {
                      if (effectiveItemTypeIndex === 6) { // Timestamp
                        displayValue = new Date(0).toLocaleString(); 
                      } else if (effectiveItemTypeIndex === 0 || effectiveItemTypeIndex === 2) { // Token ID, Nonce
                        displayValue = "0";
                      } else { 
                        displayValue = "(empty)";
                      }
                    } else {
                      let hexString = "";
                      for (let i = 0; i < byteArray.length; i++) {
                        hexString += byteArray[i].toString(16).padStart(2, '0');
                      }

                      if (effectiveItemTypeIndex === 0 || effectiveItemTypeIndex === 2) { // Token ID, Nonce
                          const numericValue = BigInt('0x' + hexString);
                          displayValue = numericValue.toString();
                      } else if (effectiveItemTypeIndex === 6) { // Timestamp (7th item in original data)
                          const numericValue = BigInt('0x' + hexString);
                          try {
                              const timestampSeconds = Number(numericValue);
                              if (isNaN(timestampSeconds)) {
                                  displayValue = `Invalid number for timestamp: ${numericValue.toString()}`;
                                  hasError = true;
                              } else {
                                  const date = new Date(timestampSeconds * 1000); 
                                  if (isNaN(date.getTime())) {
                                      displayValue = `Invalid date from timestamp: ${timestampSeconds}`;
                                      hasError = true;
                                  } else {
                                      displayValue = date.toLocaleString();
                                  }
                              }
                          } catch (dateError: any) {
                              displayValue = `Date conversion error: ${dateError.message || String(dateError)}`;
                              hasError = true;
                          }
                      } else if (effectiveItemTypeIndex === 5) { // Transaction ID (6th item in original data)
                          displayValue = hexString;
                      } else { // Token Name, NFT Name, Hash Value
                          try {
                              displayValue = new TextDecoder('utf-8', { fatal: true }).decode(byteArray);
                              if (displayValue.length === 0 && byteArray.length > 0) { 
                                 displayValue = hexString; 
                              } else if (displayValue.length === 0 && byteArray.length === 0) {
                                 displayValue = "(empty)"; 
                              }
                          } catch (utfError) {
                              if (hexString.length > 128) hexString = hexString.substring(0,128) + "...";
                              displayValue = hexString; 
                          }
                      }
                    }
                  } catch (e) { 
                    displayValue = `Base64 decoding error: ${e instanceof Error ? e.message : String(e)}`;
                    hasError = true;
                  }
                } else {
                  displayValue = "(Data N/A)";
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
                  {(displayIndex === 6 && !hasError && displayValue && displayValue !== "(empty)" && displayValue !== "(Data N/A)") ? ( // This corresponds to the original Transaction ID
                    <a
                      href={`https://devnet-explorer.multiversx.com/transactions/${displayValue}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono break-all whitespace-pre-wrap text-primary hover:underline"
                      title={`View transaction ${displayValue} on Devnet Explorer`}
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
                    <Label htmlFor="scAddress" className="font-semibold">Smart Contract Address</Label>
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
                    <Label htmlFor="funcName" className="font-semibold">Function Name</Label>
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
                    <Label className="font-semibold">Arguments</Label>
                    {args.map((arg, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Input
                        type="text"
                        placeholder={`Argument ${index + 1}`}
                        value={arg}
                        onChange={(e) => handleArgChange(index, e.target.value)}
                        className="text-sm flex-grow"
                        aria-label={`Argument ${index + 1}`}
                        />
                        { (args.length > 1 || (args.length === 1 && args[0] !== "")) ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArgField(index)}
                            aria-label={`Remove argument ${index + 1}`}
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
                    Add Argument
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
                            Querying...
                        </>
                        ) : (
                        'Submit Query'
                        )}
                    </Button>
                </CardFooter>
            </form>
        </div>
      )}

      { (isLoading && isAutoMode) && 
        <div className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Querying with file hash...</p>
        </div>
      }
      {error && (
        <div className="p-6 pt-0"> 
          <Alert variant="destructive" className="w-full mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {result && result.data && result.data.data && Array.isArray(result.data.data.returnData) && (
        <div className="pt-0"> 
          <Card className="w-full mt-2 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-accent">Blockchain Response</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDecodedReturnData()}
            </CardContent>
          </Card>
        </div>
      )}
       {result && !result.data?.data?.returnData && !error && !isLoading && (
        <div className="p-6 text-center text-muted-foreground"> 
            {(isAutoMode && !initialArg0) ? "Awaiting file hash for query..." : "No data returned or an issue occurred."}
        </div>
       )}
    </div>
  );
}
