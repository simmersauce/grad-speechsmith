
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TEST_MODE, dummyGeneratedSpeech, testSentryError } from "@/utils/testMode";
import SpeechPreview from "@/components/speech/SpeechPreview";
import PaymentCard from "@/components/payment/PaymentCard";
import TestimonialSection from "@/components/testimonials/TestimonialSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Preview character limit constant
const PREVIEW_CHAR_LIMIT = 400;

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [speech, setSpeech] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSentryTestOpen, setIsSentryTestOpen] = useState(false);
  const [sentryTestResult, setSentryTestResult] = useState<{ success?: boolean; eventId?: string; error?: string } | null>(null);
  const [isTestingError, setIsTestingError] = useState(false);

  useEffect(() => {
    // Get formData from location state or sessionStorage
    let data;
    if (location.state?.formData) {
      data = location.state.formData;
      // Store in sessionStorage for persistence
      sessionStorage.setItem('speechFormData', JSON.stringify(data));
    } else {
      // Try to retrieve from sessionStorage
      const storedData = sessionStorage.getItem('speechFormData');
      if (storedData) {
        data = JSON.parse(storedData);
      }
    }

    if (!data) {
      navigate("/create");
      return;
    }

    setFormData(data);
    // Use email from form data if available
    if (data.email) {
      setCustomerEmail(data.email);
    }

    const generateSpeech = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // If in test mode, use dummy speech after a slight delay to simulate API call
        if (TEST_MODE) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          setSpeech(dummyGeneratedSpeech);
          setIsLoading(false);
          return;
        }
        
        // Call the Supabase Edge Function
        const { data: responseData, error } = await supabase.functions.invoke('generate-speech', {
          body: { formData: data }
        });

        if (error) {
          console.error("Edge function error:", error);
          throw new Error(error.message || 'Failed to generate speech');
        }

        setSpeech(responseData.speech);
      } catch (error: any) {
        console.error("Error generating speech:", error);
        setError(error.message || "An unknown error occurred");
        toast({
          title: "Error",
          description: "Failed to generate speech. Please try again.",
          variant: "destructive",
        });
        // Set a placeholder message when generation fails
        setSpeech("We couldn't generate your speech at this time. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    generateSpeech();
  }, [navigate, toast, location.state]);

  // Handler for the Test Sentry button
  const handleTestSentry = async () => {
    try {
      setIsTestingError(true);
      setSentryTestResult(null);
      
      // Call the testSentryError function to trigger a test error
      const result = await testSentryError("Manual test error from Preview page");
      
      setSentryTestResult(result);
      
      if (result.success) {
        toast({
          title: "Sentry Test Successful",
          description: `Error sent to Sentry${result.eventId ? ` with event ID: ${result.eventId}` : ''}`,
        });
      } else {
        toast({
          title: "Sentry Test Failed",
          description: result.error || "No error was triggered",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setSentryTestResult({
        success: false,
        error: error.message
      });
      
      toast({
        title: "Error",
        description: "Failed to test Sentry. " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsTestingError(false);
    }
  };

  if (!formData) return null;

  // When a payment is initiated and we're about to redirect to Stripe
  const handlePaymentRedirect = () => {
    setIsRedirecting(true);
  };

  return (
    <div className="min-h-screen secondary py-8 sm:py-16">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {TEST_MODE && (
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setIsSentryTestOpen(true)}
                className="flex items-center gap-2 bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                <Bug className="h-4 w-4" />
                Test Sentry Error Reporting
              </Button>
            </div>
          )}

          <Card className="p-4 sm:p-8 mb-6">
            <SpeechPreview 
              speech={speech} 
              isLoading={isLoading && !isRedirecting} 
              formData={formData} 
              previewCharLimit={PREVIEW_CHAR_LIMIT}
            />
          </Card>

          {/* Show payment card and testimonials when speech is loaded */}
          {!isLoading || isRedirecting ? (
            <>
              <PaymentCard 
                customerEmail={customerEmail} 
                setCustomerEmail={setCustomerEmail} 
                formData={formData}
                onPaymentStart={handlePaymentRedirect}
              />
              <TestimonialSection />
            </>
          ) : (
            // Show testimonials while loading
            <TestimonialSection />
          )}
        </motion.div>
      </div>

      {/* Sentry Test Dialog */}
      <Dialog open={isSentryTestOpen} onOpenChange={setIsSentryTestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Test Sentry Error Reporting</DialogTitle>
            <DialogDescription>
              This will trigger a test error and send it to Sentry to verify error reporting is working correctly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            {sentryTestResult && (
              <Alert variant={sentryTestResult.success ? "default" : "destructive"} className="mb-4">
                <AlertTitle>{sentryTestResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  {sentryTestResult.success 
                    ? `Error successfully sent to Sentry.${sentryTestResult.eventId ? ` Event ID: ${sentryTestResult.eventId}` : ''}`
                    : sentryTestResult.error || "Unknown error occurred"}
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleTestSentry} 
              disabled={isTestingError}
              className="w-full"
            >
              {isTestingError ? "Sending Test Error..." : "Send Test Error to Sentry"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Preview;
