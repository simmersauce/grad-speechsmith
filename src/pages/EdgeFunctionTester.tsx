
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// A hidden utility page for testing edge functions directly
const EdgeFunctionTester = () => {
  const [functionName, setFunctionName] = useState("generate-speeches");
  const [requestBody, setRequestBody] = useState(JSON.stringify({
    formData: {
      name: "Test User",
      email: "test@example.com",
      role: "valedictorian",
      institution: "Test University",
      graduationClass: "Class of 2024",
      tone: "inspirational"
    },
    purchaseId: "test-purchase-id",
    email: "test@example.com",
    customerReference: "GSW-TEST123"
  }, null, 2));
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const availableFunctions = [
    "generate-speeches",
    "send-emails",
    "process-payment",
  ];

  const handleInvoke = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      console.log(`Invoking ${functionName} with body:`, requestBody);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: JSON.parse(requestBody)
      });
      
      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }
      
      setResult(data);
      console.log("Function result:", data);
    } catch (err: any) {
      console.error("Error invoking function:", err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto p-4 py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edge Function Tester</h1>
        
        <div className="mb-4">
          <Label htmlFor="function-select">Function Name</Label>
          <Select 
            value={functionName} 
            onValueChange={setFunctionName}
          >
            <SelectTrigger id="function-select" className="w-full">
              <SelectValue placeholder="Select a function" />
            </SelectTrigger>
            <SelectContent>
              {availableFunctions.map(fn => (
                <SelectItem key={fn} value={fn}>{fn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="mb-4">
          <Label htmlFor="request-body">Request Body (JSON)</Label>
          <Textarea
            id="request-body"
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
        </div>
        
        <Button 
          onClick={handleInvoke} 
          disabled={isLoading}
          className="mb-6"
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          {isLoading ? "Invoking..." : "Invoke Function"}
        </Button>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EdgeFunctionTester;
