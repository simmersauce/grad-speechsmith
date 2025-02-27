
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [speech, setSpeech] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { formData } = location.state || {};

  useEffect(() => {
    if (!formData) {
      navigate("/create");
      return;
    }

    const generateSpeech = async () => {
      try {
        setIsLoading(true);
        const prompt = `Generate an inspiring graduation speech for ${formData.name} who is graduating from ${
          formData.school
        } (${formData.graduationType}). Include their key achievements: ${
          formData.keyAchievements
        }, future aspirations: ${formData.futureAspirations}, and memorable experience: ${
          formData.memorableExperience
        }. Also mention special thanks to: ${
          formData.thanksTo
        }. The speech should be motivational, personal, and around 3-4 paragraphs long.`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert speechwriter who creates inspiring graduation speeches.",
              },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate speech");
        }

        const data = await response.json();
        setSpeech(data.choices[0].message.content);
      } catch (error) {
        console.error("Error generating speech:", error);
        toast({
          title: "Error",
          description: "Failed to generate speech. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateSpeech();
  }, [formData, navigate, toast]);

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
              <h2 className="text-2xl font-bold mb-4">Your Generated Speech</h2>
              <p className="text-gray-600">
                Preview your AI-generated graduation speech below
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

            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={() => navigate("/review")}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Review
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Payment integration will be added in the next update!",
                  });
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Purchase Speech ($19.99)
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Preview;
