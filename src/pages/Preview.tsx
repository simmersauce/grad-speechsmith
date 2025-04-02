import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TEST_MODE, dummyGeneratedSpeech } from "@/utils/testMode";
import SpeechPreview from "@/components/speech/SpeechPreview";
import PaymentCard from "@/components/payment/PaymentCard";
import TestimonialSection from "@/components/testimonials/TestimonialSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Preview character limit constant
const PREVIEW_CHAR_LIMIT = 400;

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { toast } = useToast();
  const [speech, setSpeech] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharableLink, setSharableLink] = useState<string | null>(null);

  useEffect(() => {
    const loadFormData = () => {
      // Check if preview ID is in the URL
      if (params.previewId) {
        const previewId = params.previewId;
        const storedPreviewData = sessionStorage.getItem(`preview_${previewId}`);
        
        if (storedPreviewData) {
          try {
            const parsedData = JSON.parse(storedPreviewData);
            setFormData(parsedData.formData);
            
            // Use email from form data if available
            if (parsedData.formData && typeof parsedData.formData === 'object' && parsedData.formData.email) {
              setCustomerEmail(parsedData.formData.email);
            }
            
            // Set sharable link
            setSharableLink(`${window.location.origin}/preview/${previewId}`);
            
            return parsedData.formData;
          } catch (e) {
            console.error("Error parsing stored preview data:", e);
          }
        }
      }
      
      // Try to get form data from location state
      if (location.state?.formData) {
        const stateData = location.state.formData;
        setFormData(stateData);
        
        // Use email from form data if available
        if (stateData && typeof stateData === 'object' && stateData.email) {
          setCustomerEmail(stateData.email);
        }
        
        return stateData;
      }
      
      // If we reach here, no data was found
      navigate("/create");
      return null;
    };

    const data = loadFormData();
    if (!data) return;

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
  }, [navigate, toast, location.state, params.previewId]);

  const handleCopyLink = () => {
    if (sharableLink) {
      navigator.clipboard.writeText(sharableLink);
      toast({
        title: "Link Copied",
        description: "You can share this link to return to your speech later",
      });
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

          {sharableLink && (
            <div className="mb-6">
              <Card className="p-4 bg-primary/10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Save this link to return later:</h3>
                    <p className="text-xs text-muted-foreground truncate max-w-[250px] sm:max-w-[400px]">{sharableLink}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyLink} 
                    className="flex items-center gap-1 whitespace-nowrap"
                  >
                    <Share2 className="h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              </Card>
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
            <TestimonialSection />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Preview;
