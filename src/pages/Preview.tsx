
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TEST_MODE, dummyGeneratedSpeech } from "@/utils/testMode";
import SpeechPreview from "@/components/speech/SpeechPreview";
import PaymentCard from "@/components/payment/PaymentCard";
import TestimonialSection from "@/components/testimonials/TestimonialSection";

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
          throw new Error(error.message || 'Failed to generate speech');
        }

        setSpeech(responseData.speech);
      } catch (error) {
        console.error("Error generating speech:", error);
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
    </div>
  );
};

export default Preview;
