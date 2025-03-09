
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEST_MODE, dummyFormData, dummyGeneratedSpeech } from "@/utils/testMode";

const EmailTestTool = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
          purchaseId: mockPurchaseId
        }
      });

      if (error) {
        console.error("Error invoking send-emails function:", error);
        throw new Error(error.message || 'Failed to send test email');
      }

      console.log("Send emails response:", data);
      
      toast({
        title: "Test Email Sent",
        description: `Email with test speech drafts and PDF attachments has been sent to ${email}. Please check your inbox.`,
      });
    } catch (error: any) {
      console.error("Error sending test email:", error);
      
      toast({
        title: "Email Sending Error",
        description: error.message || "Failed to send test email. Please try again.",
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
      <h3 className="text-lg font-semibold mb-4">Email Testing Tool</h3>
      <p className="text-sm text-amber-800 mb-4">
        This tool will send a test email with dummy speech drafts and PDF attachments. Only visible in test mode.
      </p>
      
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
