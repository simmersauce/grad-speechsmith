
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { trackButtonClick } from "@/utils/clickTracking";

interface FormNavigationProps {
  activeTab: string;
  handlePrevious: () => void;
  handleNext: () => void;
  onFinalSubmit: () => void;
  isSubmitting?: boolean;
}

const FormNavigation = ({ 
  activeTab, 
  handlePrevious, 
  handleNext, 
  onFinalSubmit,
  isSubmitting = false
}: FormNavigationProps) => {
  
  const handleNextClick = () => {
    trackButtonClick('next_button', { tab: activeTab, form: 'speech_creation' });
    handleNext();
  };
  
  const handlePreviousClick = () => {
    trackButtonClick('previous_button', { tab: activeTab, form: 'speech_creation' });
    handlePrevious();
  };
  
  const handleFinalSubmitClick = () => {
    trackButtonClick('review_speech_button', { form: 'speech_creation' });
    onFinalSubmit();
  };
  
  return (
    <div className="flex justify-between mt-8">
      {activeTab !== "1" ? (
        <Button type="button" variant="outline" onClick={handlePreviousClick} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
      ) : (
        <div></div>
      )}

      {activeTab !== "3" ? (
        <Button type="button" onClick={handleNextClick} disabled={isSubmitting}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button 
          type="button" 
          onClick={handleFinalSubmitClick} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Review Speech <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default FormNavigation;
