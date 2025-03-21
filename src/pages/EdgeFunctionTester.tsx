
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, PlayCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";

// A hidden utility page for testing edge functions directly
const EdgeFunctionTester = () => {
  const [functionName, setFunctionName] = useState("process-payment");
  const [requestBody, setRequestBody] = useState(JSON.stringify({
    formData: {
      name: "Test User",
      email: "test@example.com",
      role: "valedictorian",
      institution: "Test University",
      graduationClass: "Class of 2024",
      tone: "inspirational"
    },
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
    "stripe-webhook"
  ];

  // Function to set example request bodies based on selected function
  const setExampleRequestBody = (fn: string) => {
    let exampleBody = {};
    
    switch(fn) {
      case "process-payment":
        exampleBody = {
          formData: {
            name: "Test User",
            email: "test@example.com",
            role: "valedictorian",
            institution: "Test University",
            graduationClass: "Class of 2024",
            tone: "inspirational"
          },
          customerEmail: "test@example.com" // Using customerEmail for clarity
        };
        break;
      case "generate-speeches":
        exampleBody = {
          formData: {
            name: "Test User",
            email: "test@example.com",
            role: "valedictorian",
            institution: "Test University",
            graduationClass: "Class of 2024",
            tone: "inspirational",
            // Add some optional fields to make the speech more interesting
            personalBackground: "Worked hard throughout school while also participating in debate club",
            themes: "Perseverance, Growth, Future opportunities",
            memories: "Late night study sessions, winning the debate championship",
            goalsLessons: "Learning to balance academics and personal growth",
            acknowledgements: "Family, friends, and supportive faculty",
            graduationType: "College graduation"
          },
          // For testing, we'll use a proper UUID string format
          purchaseId: uuidv4(),
          email: "test@example.com",
          customerReference: "GSW-TEST123"
        };
        break;
      case "send-emails":
        exampleBody = {
          // For testing, we'll use a proper UUID string format
          purchaseId: uuidv4(),
          email: "test@example.com",
          formData: {
            name: "Test User",
            role: "valedictorian"
          },
          speechVersions: [
            { id: uuidv4(), content: "This is test speech content 1", versionNumber: 1, tone: "inspirational", versionType: "Version 1" },
            { id: uuidv4(), content: "This is test speech content 2", versionNumber: 2, tone: "inspirational", versionType: "Version 2" }
          ],
          customerReference: "GSW-TEST123"
        };
        break;
      case "stripe-webhook":
        exampleBody = {
          type: "checkout.session.completed",
          data: {
            object: {
              id: "cs_test_" + uuidv4().replace(/-/g, ""),
              customer_email: "test@example.com",
              metadata: {
                formDataId: "123456"
              }
            }
          }
        };
        break;
      default:
        exampleBody = {};
    }
    
    setRequestBody(JSON.stringify(exampleBody, null, 2));
  };

  // Set the example request body when the function name changes
  useEffect(() => {
    setExampleRequestBody(functionName);
  }, [functionName]);

  const handleInvoke = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      toast({
        title: "Invoking Function",
        description: `Calling ${functionName}...`,
      });
      
      console.log(`Invoking ${functionName} with body:`, requestBody);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: JSON.parse(requestBody)
      });
      
      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }
      
      setResult(data);
      console.log("Function result:", data);
      
      toast({
        title: "Success",
        description: `${functionName} executed successfully`,
        variant: "default"
      });
    } catch (err: any) {
      console.error("Error invoking function:", err);
      setError(err.message || "An error occurred");
      
      toast({
        title: "Error",
        description: err.message || "An error occurred while invoking the function",
        variant: "destructive"
      });
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
            onValueChange={(value) => {
              setFunctionName(value);
              setExampleRequestBody(value);
            }}
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
          <div className="flex justify-between items-center">
            <Label htmlFor="request-body">Request Body (JSON)</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setExampleRequestBody(functionName)}
              className="ml-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Example
            </Button>
          </div>
          <Textarea
            id="request-body"
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            rows={10}
            className="font-mono text-sm mt-2"
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
