"use client";

import { useState, useEffect } from 'react';
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

export default function VmQueryForm() {
  const [scAddress, setScAddress] = useState('erd1qqqqqqqqqqqqqpgq209g5ct99dcyjdxetdykgy92yqf0cnxf0qesc2aw9w');
  const [funcName, setFuncName] = useState('getPrintInfoFromHash');
  const [args, setArgs] = useState<string[]>(['3486f3dda9ffec7a8e416e00c2634f02e798dab3cf728cf5214bc8f7e4ca69a5']);
  
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Effect to clear error when inputs change, to avoid stale error messages
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
    // Ensure at least one argument field remains
    setArgs(newArgs.length > 0 ? newArgs : ['']); 
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Filter out empty or whitespace-only arguments before sending
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
        setError(responseData.error || `API Error: ${responseData.returnMessage || response.statusText}`);
        setResult(responseData); // Still set result to show partial error info from API
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
                { (args.length > 1 || (args.length === 1 && args[0] !== "")) ? ( // Show remove if more than one arg, or if it's the single arg and it's not empty (to allow clearing the first one)
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
                  <div className="w-10 h-10"></div> // Placeholder to keep alignment if remove button is hidden
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
            <div className="w-full pt-4 mt-4 border-t">
              <h3 className="text-lg font-semibold mb-2 text-primary">Query Result:</h3>
              <div className="bg-muted/50 p-4 rounded-md shadow">
                <pre className="text-xs whitespace-pre-wrap break-all overflow-x-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
