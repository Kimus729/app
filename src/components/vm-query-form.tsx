
"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusCircle, XCircle, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface QueryResult {
  data?: any;
  error?: string;
  returnCode?: string;
  returnMessage?: string;
}

export default function VmQueryForm() {
  const [scAddress, setScAddress] = useState('erd1qqqqqqqqqqqqqpgq209g5ct99dcyjdxetdykgy92yqf0cnxf0qesc2aw9w');
  const [funcName, setFuncName] = useState('getPrintInfoFromHash');
  const [args, setArgs] = useState<string[]>(['3486f3dda9ffec7a8e416e00c2634f02e798dab3cf728cf5214bc8f7e4ca69a5']);
  
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(true);
  
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    // setShowRawJson(true); // Removed this line to persist visibility state

    const processedArgs = args.map(arg => arg.trim()).filter(arg => arg !== "");

    const payload = {
      scAddress: scAddress.trim(),
      funcName: funcName.trim(),
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

            // Check if the item is the 1st (index 0), 3rd (index 2), or 7th (index 6) in the current group
            if (itemIndexInGroup === 0 || itemIndexInGroup === 2 || itemIndexInGroup === 6) {
              // Numeric decoding logic
              try {
                const binaryString = atob(item);
                const byteArray = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  byteArray[i] = binaryString.charCodeAt(i);
                }

                if (byteArray.length === 0) {
                  displayValue = "[Numeric]: (empty)";
                } else {
                  let hexString = "";
                  for (let i = 0; i < byteArray.length; i++) {
                    hexString += byteArray[i].toString(16).padStart(2, '0');
                  }
                  // Handle case where byteArray might be all zeros but not empty
                  if (hexString === "" && byteArray.length > 0) hexString = "0".repeat(byteArray.length * 2);
                  else if (hexString === "") hexString = "0"; // For truly empty valid base64 resulting in empty byte array
                  
                  const numericValue = BigInt('0x' + hexString);
                  displayValue = `[Numeric]: ${numericValue.toString()}`;
                }
              } catch (e) {
                displayValue = `Erreur de décodage numérique (Base64 invalide ou autre): ${e instanceof Error ? e.message : String(e)}`;
                hasError = true;
              }
            } else {
              // Existing UTF-8/Hex decoding logic
              try {
                const binaryString = atob(item);
                const byteArray = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  byteArray[i] = binaryString.charCodeAt(i);
                }
                
                try {
                  displayValue = new TextDecoder('utf-8', { fatal: true }).decode(byteArray);
                } catch (utfError) {
                  let hex = "";
                  for(let i = 0; i < byteArray.length; i++) {
                    hex += byteArray[i].toString(16).padStart(2, '0');
                  }
                  displayValue = hex;
                  if (displayValue.length > 128) displayValue = displayValue.substring(0,128) + "...";
                  displayValue = `[Hex]: ${displayValue}`;
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

          {result && (
            <>
              <div className="w-full pt-4 mt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-primary">Query Result (Raw JSON):</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRawJson(!showRawJson)}
                    aria-expanded={showRawJson}
                    aria-controls="raw-json-content"
                    aria-pressed={showRawJson} 
                    role="button"
                  >
                    {showRawJson ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" />
                        Hide Raw JSON
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Show Raw JSON
                      </>
                    )}
                  </Button>
                </div>
                {showRawJson && (
                  <div id="raw-json-content" className="bg-muted/50 p-4 rounded-md shadow">
                    <pre className="text-xs whitespace-pre-wrap break-all overflow-x-auto max-h-96">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {result.data && result.data.data && Array.isArray(result.data.data.returnData) && (
                <Card className="w-full mt-6 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-xl text-accent">Éléments de retour VM (décodés)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderDecodedReturnData()}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
    

    
