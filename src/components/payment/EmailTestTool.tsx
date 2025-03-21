
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail } from "lucide-react";
import { TEST_MODE, dummyFormData, dummyGeneratedSpeech } from "@/utils/testMode";

const EmailTestTool = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerReference, setCustomerReference] = useState(`GSW-TEST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testOption, setTestOption] = useState<"direct_email" | "full_flow">("direct_email");

  // Create mock speech versions based on the dummy generated speech
  const createMockSpeechVersions = () => {
    const tones = ["inspirational", "formal", "humorous"];
    const types = ["primary", "alternative", "creative"];
    
    return Array.from({ length: 3 }, (_, i) => ({
      id: `mock-speech-${i+1}`,
      content: dummyGeneratedSpeech,
      versionNumber: i+1,
      tone: tones[i],
      versionType: types[i]
    }));
  };

  const handleSendTestEmail = async () => {
    // Reset error state
    setError(null);
    setDebugInfo(null);
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to receive the test speeches.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate customer reference format
    if (!customerReference || customerReference.trim() === "") {
      setCustomerReference(`GSW-TEST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
      toast({
        title: "Reference Generated",
        description: "A new customer reference has been generated.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending test email to:", email);
      console.log("Using customer reference:", customerReference);
      console.log("Test option:", testOption);
      
      if (testOption === "direct_email") {
        // Direct email option - just send emails
        const mockPurchaseId = `test-${Date.now()}`;
        const mockSpeechVersions = createMockSpeechVersions();
        
        toast({
          title: "Preparing Email",
          description: "Sending your test graduation speech drafts directly...",
        });
        
        // Store the customer reference in localStorage for the payment success simulator
        localStorage.setItem('test_customer_reference', customerReference);
        
        // Directly call the send-emails function
        const { data, error } = await supabase.functions.invoke('send-emails', {
          body: {
            email,
            formData: dummyFormData,
            speechVersions: mockSpeechVersions,
            purchaseId: mockPurchaseId,
            customerReference: customerReference
          }
        });

        if (error) {
          console.error("Error invoking send-emails function:", error);
          throw new Error(error.message || 'Failed to send test email');
        }

        console.log("Send emails response:", data);
        setDebugInfo(data);
        
        toast({
          title: "Test Email Sent",
          description: `Email with test speech drafts has been sent to ${email}. Reference number: ${customerReference}`,
        });
      } else {
        // Full flow option - simulates the complete process
        // 1. Create a test purchase record
        toast({
          title: "Testing Full Flow",
          description: "Step 1: Creating purchase record...",
        });
        
        // First, store the dummy form data
        const { data: pendingData, error: pendingError } = await supabase
          .from('pending_form_data')
          .insert({
            form_data: dummyFormData,
            customer_email: email,
            processed: false
          })
          .select();
          
        if (pendingError) {
          throw new Error(`Failed to store form data: ${pendingError.message}`);
        }
        
        console.log("Pending form data created:", pendingData);
        
        // 2. Create a purchase record
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('speech_purchases')
          .insert({
            stripe_session_id: `test-session-${Date.now()}`,
            payment_status: 'completed',
            customer_email: email,
            amount_paid: 29.99,
            form_data: dummyFormData,
            customer_reference: customerReference,
            speeches_generated: false,
            emails_sent: false
          })
          .select();
          
        if (purchaseError) {
          throw new Error(`Failed to create purchase record: ${purchaseError.message}`);
        }
        
        console.log("Purchase record created:", purchaseData);
        toast({
          title: "Testing Full Flow",
          description: "Step 2: Generating speeches...",
        });
        
        // 3. Call generate-speeches function
        const purchaseId = purchaseData[0].id;
        const { data: generateData, error: generateError } = await supabase.functions.invoke('generate-speeches', {
          body: {
            formData: dummyFormData,
            purchaseId,
            email
          }
        });
        
        if (generateError) {
          throw new Error(`Failed to generate speeches: ${generateError.message}`);
        }
        
        console.log("Generate speeches response:", generateData);
        setDebugInfo(generateData);
        
        toast({
          title: "Full Test Completed",
          description: "The full workflow test has been completed successfully. Check your email.",
        });
      }
    } catch (error: any) {
      console.error("Error in test process:", error);
      
      setError(error.message || "Failed to run test. Please try again.");
      
      toast({
        title: "Test Process Error",
        description: "Something went wrong. Check the error details below.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only show in test mode
  if (!TEST_MODE) return null;

  return (
    <Card className="p-4 sm:p-6 max-w-md mx-auto my-8 bg-amber-50 border-amber-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Mail className="w-5 h-5 mr-2" /> Email Testing Tool
      </h3>
      <p className="text-sm text-amber-800 mb-4">
        This tool lets you test email delivery of speech drafts with a customer reference number. Only visible in test mode.
      </p>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Option</label>
        <div className="grid grid-cols-2 gap-2">
          <div 
            className={`border rounded-md p-3 cursor-pointer ${testOption === "direct_email" ? "border-primary bg-primary/10" : "border-gray-200"}`}
            onClick={() => setTestOption("direct_email")}
          >
            <div className="text-sm font-medium">Direct Email</div>
            <div className="text-xs text-gray-500">Just send test emails</div>
          </div>
          <div 
            className={`border rounded-md p-3 cursor-pointer ${testOption === "full_flow" ? "border-primary bg-primary/10" : "border-gray-200"}`}
            onClick={() => setTestOption("full_flow")}
          >
            <div className="text-sm font-medium">Full Flow</div>
            <div className="text-xs text-gray-500">Test entire process</div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <Label htmlFor="customer-reference" className="block text-sm font-medium mb-1">
          Customer Reference
        </Label>
        <Input
          id="customer-reference"
          value={customerReference}
          onChange={(e) => setCustomerReference(e.target.value)}
          className="w-full font-mono"
        />
      </div>
      
      <div className="mb-4">
        <Label htmlFor="test-email" className="block text-sm font-medium mb-1">
          Email Address
        </Label>
        <Input
          type="email"
          id="test-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="w-full"
        />
      </div>
      
      <div className="mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="debug-mode"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
            className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
          />
          <label htmlFor="debug-mode" className="ml-2 block text-sm text-gray-700">
            Show Debug Information
          </label>
        </div>
      </div>
      
      <Button 
        onClick={handleSendTestEmail}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Processing..." : testOption === "direct_email" ? "Send Test Email with Speeches" : "Test Full Process"}
      </Button>
      
      {debugMode && debugInfo && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <h4 className="text-sm font-medium mb-2">Debug Information:</h4>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
};

export default EmailTestTool;
