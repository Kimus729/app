
"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
}

export default function VmQueryForm({ initialArg0, onInitialArgConsumed }: VmQueryFormProps) {
  const [scAddress, setScAddress] = useState('erd1qqqqqqqqqqqqqpgq209g5ct99dcyjdxetdykgy92yqf0cnxf0qesc2aw9w');
  const [funcName, setFuncName] = useState('getPrintInfoFromHash');
  const [args, setArgs] = useState<string[]>(['']); // Default to one empty arg field for manual input
  
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to hold the latest args to avoid stale closures in useEffect
  const argsRef = useRef(args);
  useEffect(() => {
    argsRef.current = args;
  }, [args]);
  
  useEffect(() => {
    setError(null);
  }, [scAddress, funcName, args]);

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
        const finalArgs = newArgsArray.filter((arg, index) => arg !== '' || index === 0 || newArgsArray.length === 1);
        setArgs(finalArgs.length > 0 ? finalArgs : ['']); 

        if (scAddress.trim() && funcName.trim()) {
            performQuery(scAddress, funcName, finalArgs);
        } else {
             setError("Cannot auto-query: Smart Contract Address or Function Name is missing. Please fill them and submit manually or re-upload the file.");
        }

        if (onInitialArgConsumed) {
            onInitialArgConsumed();
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialArg0, scAddress, funcName, performQuery, onInitialArgConsumed]);


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
      return <p className="text-sm text-muted-foreground">Aucun élément de retour à afficher.</p>;
    }

    const chunkSize = 7;
    const groupedData: string[][] = [];
    for (let i = 0; i < returnData.length; i += chunkSize) {
      groupedData.push(returnData.slice(i, i + chunkSize));
    }

    return groupedData.map((group, groupIndex) => (
      <div key={`group-${groupIndex}`} className="mb-6 p-4 border border-border rounded-lg shadow-sm bg-card/80">
        <h4 className="text-md font-semibold mb-3 text-accent-foreground bg-accent/80 p-2 rounded-md shadow-sm -mt-4 -mx-4 mb-4 rounded-b-none">
          Group {groupIndex + 1} (Items {groupIndex * chunkSize + 1} - {Math.min((groupIndex + 1) * chunkSize, returnData.length)})
        </h4>
        <ul className="space-y-3">
          {group.map((item: string, itemIndexInGroup: number) => {
            const originalIndex = groupIndex * chunkSize + itemIndexInGroup;
            let displayValue = '';
            let hasError = false;
            const originalItemPreview = item.length > 30 ? item.substring(0, 27) + '...' : item;

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
                displayValue = `Erreur de décodage numérique (Base64 invalide ou autre): ${e instanceof Error ? e.message : String(e)}`;
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
                displayValue = `Erreur de décodage Base64: ${e instanceof Error ? e.message : String(e)}`;
                hasError = true;
              }
            }

            return (
              <li 
                key={originalIndex} 
                className={`p-3 rounded-lg shadow-sm ${hasError ? 'bg-destructive/10 border-destructive/30' : 'bg-secondary/20 border-secondary/30'}`}
              >
                <span className="block text-xs font-medium text-muted-foreground mb-1">
                  Élément {originalIndex + 1} (Original Base64: {originalItemPreview})
                </span>
                <pre className="text-sm font-mono break-all whitespace-pre-wrap">{displayValue}</pre>
              </li>
            );
          })}
        </ul>
      </div>
    ));
  };


  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Query VM Values</CardTitle>
        <CardDescription>
          Enter the Smart Contract details and arguments to query the MultiversX devnet.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
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
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
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

          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && result.data && result.data.data && Array.isArray(result.data.data.returnData) && (
            <Card className="w-full mt-6 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-accent">Éléments de retour VM (décodés)</CardTitle>
              </CardHeader>
              <CardContent>
                {renderDecodedReturnData()}
              </CardContent>
            </Card>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
