
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Loader2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TEST_MODE } from "@/utils/testMode";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [customerReference, setCustomerReference] = useState<string | null>(null);
  
  // Get the session ID from the URL
  const sessionId = searchParams.get("session_id");
  const isTestMode = TEST_MODE && searchParams.get("test") === "true";

  useEffect(() => {
    // Special handling for test mode
    if (isTestMode) {
      const testReference = localStorage.getItem('test_customer_reference');
      if (testReference) {
        setCustomerReference(testReference);
        console.log("Using test customer reference from localStorage:", testReference);
      } else {
        // Generate a fallback reference for test mode
        const fallbackReference = `GSW-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setCustomerReference(fallbackReference);
        console.log("Generated fallback test reference:", fallbackReference);
      }
      
      // Simulate a loading state for a better user experience
      const timer = setTimeout(() => {
        setIsLoading(false);
        
        // Show a success toast
        toast({
          title: "Test Payment Successful!",
          description: "This is a test. Check your email for the speech drafts.",
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // Normal functionality for real payments
    const fetchCustomerReference = async () => {
      if (!sessionId) {
        console.warn("No session ID found in URL parameters");
        return;
      }
      
      try {
        console.log("Fetching customer reference for session:", sessionId);
        
        const { data, error } = await supabase
          .from('speech_purchases')
          .select('customer_reference')
          .eq('stripe_session_id', sessionId)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching customer reference:", error);
          // Generate a fallback reference when there's an error
          const fallbackReference = `GSW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          setCustomerReference(fallbackReference);
          console.log("Generated fallback reference after error:", fallbackReference);
        } else if (data && data.customer_reference) {
          console.log("Found customer reference:", data.customer_reference);
          setCustomerReference(data.customer_reference);
        } else {
          console.warn("No customer reference found for session:", sessionId);
          // Generate a fallback reference when no data is found
          const fallbackReference = `GSW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          setCustomerReference(fallbackReference);
          console.log("Generated fallback reference (no data):", fallbackReference);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
        // Generate a fallback reference on exception
        const fallbackReference = `GSW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setCustomerReference(fallbackReference);
        console.log("Generated fallback reference after exception:", fallbackReference);
      }
    };
    
    // Fetch the customer reference
    fetchCustomerReference();
    
    // Simulate a loading state for a better user experience
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Show a success toast
      toast({
        title: "Payment Successful!",
        description: "Your speech drafts will be delivered to your email shortly.",
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [toast, sessionId, isTestMode]);

  // Copy customer reference to clipboard
  const copyReferenceToClipboard = () => {
    if (customerReference) {
      navigator.clipboard.writeText(customerReference);
      toast({
        title: "Copied to clipboard",
        description: "Reference number has been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 sm:py-16">
      <div className="container max-w-lg mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 sm:p-10 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2">{isTestMode ? "Simulating Payment" : "Processing your payment"}</h2>
                <p className="text-gray-600">{isTestMode ? "Please wait while we simulate a successful payment..." : "Please wait while we confirm your payment..."}</p>
              </div>
            ) : (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  {isTestMode ? "Test Payment Successful!" : "Payment Successful!"}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {isTestMode 
                    ? "This is a test. Check your email for the speech drafts."
                    : "Thank you for your purchase. Your speech drafts are being generated and will be delivered to your email shortly."}
                </p>
                
                {customerReference && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-blue-800 mb-2">Your Reference Number</h3>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{customerReference}</span>
                      <button 
                        onClick={copyReferenceToClipboard}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Copy reference number"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">
                      Please save this reference number for any future inquiries.
                    </p>
                  </div>
                )}
                
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium text-gray-800 mb-2">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Our AI is generating 3 unique speech drafts for you</li>
                    <li>• You'll receive an email with all versions within 5-10 minutes</li>
                    <li>• Each version will have a different tone and approach</li>
                    <li>• You can choose the one you like best or mix elements from all three</li>
                    <li>• Your reference number will be included in your email</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
              </>
            )}
          </Card>
          
          <p className="text-center text-gray-500 text-sm mt-6">
            Order reference: {customerReference || (sessionId ? sessionId.substring(0, 8) + '...' : 'Processing')}
            {isTestMode && " (Test Mode)"}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
