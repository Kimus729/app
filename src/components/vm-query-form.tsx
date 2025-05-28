
"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription removed as it's not used here
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'; // ChevronDown, ChevronUp removed

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
    
    const itemLabels = ["Token ID", "Token Name", "Nonce", "NFT Name", "Hash Value", "Transaction ID", "Timestamp"];

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

      return (
        <div key={`group-${groupIndex}`} className="mb-6 p-4 border border-border rounded-lg shadow-sm bg-card/80">
          <h4 className="text-md font-semibold mb-3 text-accent-foreground bg-accent/80 p-2 rounded-md shadow-sm -mt-4 -mx-4 mb-4 rounded-b-none">
            {groupTitle}
          </h4>
          <ul className="space-y-3">
            {group.map((item: string, itemIndexInGroup: number) => {
              const originalIndex = groupIndex * chunkSize + itemIndexInGroup;
              let displayValue = '';
              let hasError = false;
              const itemLabel = itemLabels[itemIndexInGroup] || `Item ${itemIndexInGroup + 1}`;


              if (itemIndexInGroup === 0 || itemIndexInGroup === 2 || itemIndexInGroup === 6) { // 1st, 3rd, 7th
                try {
                  const binaryString = atob(item);
                  const byteArray = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    byteArray[i] = binaryString.charCodeAt(i);
                  }

                  if (byteArray.length === 0) {
                    displayValue = "[Numeric]: 0 (empty data)";
                  } else {
                    let hexString = "";
                    for (let i = 0; i < byteArray.length; i++) {
                      hexString += byteArray[i].toString(16).padStart(2, '0');
                    }
                    const numericValue = BigInt('0x' + (hexString || '0')); 
                    displayValue = `[Numeric]: ${numericValue.toString()}`;
                  }
                } catch (e) {
                  displayValue = `Numeric decoding error (Invalid Base64 or other): ${e instanceof Error ? e.message : String(e)}`;
                  hasError = true;
                }
              } else {
                try {
                  const binaryString = atob(item);
                  const byteArray = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    byteArray[i] = binaryString.charCodeAt(i);
                  }
                  
                  try {
                    displayValue = new TextDecoder('utf-8', { fatal: true }).decode(byteArray);
                    if (displayValue.length === 0 && byteArray.length > 0) { 
                       let hex = "";
                      for(let i = 0; i < byteArray.length; i++) {
                        hex += byteArray[i].toString(16).padStart(2, '0');
                      }
                      displayValue = `[Hex]: ${hex}`;
                    } else if (displayValue.length === 0 && byteArray.length === 0) {
                      displayValue = "[UTF-8]: (empty)";
                    }
                  } catch (utfError) {
                    let hex = "";
                    for(let i = 0; i < byteArray.length; i++) {
                      hex += byteArray[i].toString(16).padStart(2, '0');
                    }
                    if (displayValue.length > 128) displayValue = displayValue.substring(0,128) + "...";
                    displayValue = `[Hex]: ${hex || '(empty)'}`;
                  }
                } catch (e) {
                  displayValue = `Base64 decoding error: ${e instanceof Error ? e.message : String(e)}`;
                  hasError = true;
                }
              }

              return (
                <li 
                  key={originalIndex} 
                  className={`p-3 rounded-lg shadow-sm ${hasError ? 'bg-destructive/10 border-destructive/30' : 'bg-secondary/20 border-secondary/30'}`}
                >
                  <span className="block text-xs font-medium text-muted-foreground mb-1">
                    {itemLabel}
                  </span>
                  <pre className="text-sm font-mono break-all whitespace-pre-wrap">{displayValue}</pre>
                </li>
              );
            })}
          </ul>
        </div>
      );
    });
  };


  return (
    <>
      {!isAutoMode && (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6"> {/* Replaces CardContent for padding form elements */}
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
              <div className="space-y-2">
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
              
              <div className="space-y-3">
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
                  className="text-sm border-dashed hover:bg-accent/10 hover:text-accent"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Argument
                </Button>
              </div>
            </div>
            <CardFooter className="flex flex-col items-start space-y-4 pt-6"> {/* Added pt-6 to CardFooter as it's no longer inside a CardContent */}
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
      )}

      { (isLoading && isAutoMode) && 
        <div className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Querying with file hash...</p>
        </div>
      }
      {error && (
        <div className="p-6 pt-0">
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {result && result.data && result.data.data && Array.isArray(result.data.data.returnData) && (
        <div className="p-6 pt-0"> 
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
    </>
  );
}

    