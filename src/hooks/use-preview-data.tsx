
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TEST_MODE, dummyGeneratedSpeech } from "@/utils/testMode";

export function usePreviewData() {
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

  // When a payment is initiated and we're about to redirect to Stripe
  const handlePaymentRedirect = () => {
    setIsRedirecting(true);
  };

  const handleCopyLink = () => {
    if (sharableLink) {
      navigator.clipboard.writeText(sharableLink);
      toast({
        title: "Link Copied",
        description: "You can share this link to return to your speech later",
      });
    }
  };

  return {
    speech,
    isLoading,
    formData,
    customerEmail,
    setCustomerEmail,
    isRedirecting,
    error,
    sharableLink,
    handlePaymentRedirect,
    handleCopyLink
  };
}
