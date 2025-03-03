import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [speech, setSpeech] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20 py-16">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4">Your speech is ready! 🎓</h2>
              <p className="text-gray-600">
                Your AI-crafted graduation speech is ready to be unlocked below.
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
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
                <div className="bg-white p-8 rounded-lg shadow-sm">
                  <div className="whitespace-pre-wrap">{speech}</div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-start items-center mt-8">
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
            className="mt-8"
          >
            <Card className="p-8 text-center max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-2">Unlock your speech</h2>
              <p className="text-primary font-bold text-xl mb-6">29.99 USD</p>
              
              <ul className="space-y-3 text-left max-w-md mx-auto mb-8">
                {[
                  "3 unique AI generated speech drafts",
                  "One-time payment",
                  "Lifetime access to your drafts",
                  "100% money-back guarantee",
                  "Delivered to your email in minutes",
                  "No sign up required"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
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
                className="bg-primary hover:bg-primary/90 w-full py-6 text-lg"
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
