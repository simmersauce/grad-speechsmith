
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

    setIsLoading(true);

    try {
      console.log("Sending test email to:", email);
      
      // Create mock data
      const mockPurchaseId = `test-${Date.now()}`;
      const mockSpeechVersions = createMockSpeechVersions();
      
      toast({
        title: "Generating PDFs",
        description: "Creating PDF attachments for your speech drafts...",
      });
      
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
      
      toast({
        title: "Test Email Sent",
        description: `Email with test speech drafts has been sent to ${email}. Reference number: ${customerReference}`,
      });
    } catch (error: any) {
      console.error("Error sending test email:", error);
      
      setError(error.message || "Failed to send test email. Please try again.");
      
      toast({
        title: "Email Sending Error",
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
        This tool will send a test email with dummy speech drafts, PDF attachments, and a customer reference number. Only visible in test mode.
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
      
      <Button 
        onClick={handleSendTestEmail}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Sending..." : "Send Test Email with PDFs"}
      </Button>
    </Card>
  );
};

export default EmailTestTool;
