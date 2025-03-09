
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SpeechPreviewProps {
  speech: string;
  isLoading: boolean;
  formData: any;
  previewCharLimit: number;
}

const SpeechPreview = ({ speech, isLoading, formData, previewCharLimit }: SpeechPreviewProps) => {
  const navigate = useNavigate();
  
  // Determine displayed speech content and whether to show blur effect
  const displayedSpeech = speech.substring(0, previewCharLimit);
  const hasMoreContent = speech.length > previewCharLimit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
                      {speech.substring(previewCharLimit, previewCharLimit + 200)}...
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
    </motion.div>
  );
};

export default SpeechPreview;
