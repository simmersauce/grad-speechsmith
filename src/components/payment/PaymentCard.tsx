
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackButtonClick } from "@/utils/clickTracking";

interface PaymentCardProps {
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  formData: any;
  onPaymentStart?: () => void;
}

const PaymentCard = ({ customerEmail, setCustomerEmail, formData, onPaymentStart }: PaymentCardProps) => {
  const { toast } = useToast();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Handle redirect when URL is set
  useEffect(() => {
    if (redirectUrl) {
      const redirectTimer = setTimeout(() => {
        console.log("Redirecting to:", redirectUrl);
        // Call the onPaymentStart callback right before redirecting
        if (onPaymentStart) {
          onPaymentStart();
        }
        window.location.assign(redirectUrl);
      }, 500);

      return () => clearTimeout(redirectTimer);
    }
  }, [redirectUrl, onPaymentStart]);

  // Add timeout to reset loading state in case of stuck processing
  useEffect(() => {
    let timeoutId: number | null = null;
    
    if (isProcessingPayment) {
      timeoutId = window.setTimeout(() => {
        console.log("Payment processing timeout triggered");
        setIsProcessingPayment(false);
        setPaymentError("Payment process timed out. Please try again.");
        toast({
          title: "Processing Timeout",
          description: "The payment process took too long. Please try again.",
          variant: "destructive",
        });
      }, 20000); // 20 second timeout
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isProcessingPayment, toast]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerEmail(e.target.value);
    // Clear any previous payment errors when email changes
    if (paymentError) {
      setPaymentError("");
    }
  };

  const handlePurchase = async () => {
    // Track the unlock speech button click
    trackButtonClick('unlock_speech_button', { 
      email_provided: !!customerEmail,
      from: 'preview_page'
    });
    
    // Clear any previous payment errors and redirect URL
    setPaymentError("");
    setRedirectUrl(null);
    
    if (!customerEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to receive your speech drafts.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    if (!validateEmail(customerEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!formData) {
      toast({
        title: "Error",
        description: "Form data is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      console.log("Starting payment process with email:", customerEmail);
      
      // Call the process-payment edge function to create a Stripe checkout session
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: { 
          formData,
          customerEmail
        }
      });

      if (error) {
        console.error("Payment function error:", error);
        throw new Error(error.message || 'Failed to process payment');
      }

      if (!data || !data.url) {
        console.error("Invalid response from payment function:", data);
        throw new Error('Invalid response from payment service');
      }

      console.log("Payment session created, redirecting to:", data.url);
      
      // Set the redirect URL which will trigger the useEffect
      setRedirectUrl(data.url);
      
    } catch (error: any) {
      console.error("Error processing payment:", error);
      
      // Set specific payment error message
      setPaymentError(error.message || "Failed to process payment. Please try again.");
      
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      
      // Make sure to reset loading state on error
      setIsProcessingPayment(false);
    }
  };
  
  const handleRetry = () => {
    trackButtonClick('retry_payment_button');
    setPaymentError("");
    handlePurchase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-6 sm:mt-8 mb-8 sm:mb-12"
    >
      <Card className="p-4 sm:p-8 text-center max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Unlock your speech</h2>
        <p className="text-primary font-bold text-lg sm:text-xl mb-4 sm:mb-6">29.99 USD</p>
        
        <ul className="space-y-2 sm:space-y-3 text-left max-w-md mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
          {[
            "3 unique AI generated speech drafts",
            "One-time payment",
            "Lifetime access to your drafts",
            "100% money-back guarantee",
            "Delivered to your email in minutes",
            "No sign up required"
          ].map((benefit, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        
        <div className="mb-6">
          <Label htmlFor="email" className="block text-left text-sm font-medium text-gray-700 mb-1">
            Email address (to receive your speeches)
          </Label>
          <Input
            type="email"
            id="email"
            value={customerEmail}
            onChange={handleEmailChange}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="your.email@example.com"
            required
            disabled={isProcessingPayment}
          />
          {paymentError && (
            <div className="mt-2 text-sm text-red-600">
              <p>{paymentError}</p>
              <Button 
                onClick={handleRetry} 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
        
        <Button 
          onClick={handlePurchase}
          disabled={isProcessingPayment}
          className="bg-primary hover:bg-primary/90 w-full py-4 sm:py-6 text-base sm:text-lg"
        >
          {isProcessingPayment ? "Processing..." : "Unlock Speech"}
        </Button>
      </Card>
    </motion.div>
  );
};

export default PaymentCard;
