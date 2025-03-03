
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TEST_MODE, dummyGeneratedSpeech } from "@/utils/testMode";

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [speech, setSpeech] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  
  // Preview character limit constant
  const PREVIEW_CHAR_LIMIT = 400;

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

  // Determine displayed speech content and whether to show blur effect
  const displayedSpeech = speech.substring(0, PREVIEW_CHAR_LIMIT);
  const hasMoreContent = speech.length > PREVIEW_CHAR_LIMIT;

  return (
    <div className="min-h-screen secondary py-8 sm:py-16">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">
                {isLoading ? "Generating your speech" : "Your speech is ready! 🎓"}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {isLoading 
                  ? "This may take a few moments" 
                  : "Your AI-crafted graduation speech is ready to be unlocked below."}
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Sparkles className="w-8 h-8 text-primary animate-pulse mb-4" />
                <p className="text-gray-600">Crafting your perfect speech...</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="prose prose-lg max-w-none"
              >
                <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm">
                  <div className="whitespace-pre-wrap text-sm sm:text-base">
                    {displayedSpeech}
                    {hasMoreContent && (
                      <>
                        <span className="text-gray-400">...</span>
                        <div className="relative mt-4">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-80" />
                          <div className="blur-sm text-gray-400 select-none">
                            {speech.substring(PREVIEW_CHAR_LIMIT, PREVIEW_CHAR_LIMIT + 200)}...
                          </div>
                        </div>
                        <div className="text-center mt-4">
                          <p className="text-primary font-medium text-sm sm:text-base">Unlock the full speech to view more</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-start items-center mt-6 sm:mt-8">
              <Button
                variant="outline"
                onClick={() => navigate("/create", { state: { formData } })}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Your Form
              </Button>
            </div>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 sm:mt-8"
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
              
              <Button 
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Payment integration will be added in the next update!",
                  });
                }}
                className="bg-primary hover:bg-primary/90 w-full py-4 sm:py-6 text-base sm:text-lg"
              >
                Unlock Speech
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Preview;
