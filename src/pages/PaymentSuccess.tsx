
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the session ID from the URL
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
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
  }, [toast]);

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
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Processing your payment</h2>
                <p className="text-gray-600">Please wait while we confirm your payment...</p>
              </div>
            ) : (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Payment Successful!</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Thank you for your purchase. Your speech drafts are being generated and will be delivered to your email shortly.
                </p>
                
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium text-gray-800 mb-2">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Our AI is generating 3 unique speech drafts for you</li>
                    <li>• You'll receive an email with all versions within 5-10 minutes</li>
                    <li>• Each version will have a different tone and approach</li>
                    <li>• You can choose the one you like best or mix elements from all three</li>
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
            Order reference: {sessionId ? sessionId.substring(0, 8) + '...' : 'Processing'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
