
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

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
  return (
    <div className="flex justify-between mt-8">
      {activeTab !== "1" ? (
        <Button type="button" variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
      ) : (
        <div></div>
      )}

      {activeTab !== "3" ? (
        <Button type="button" onClick={handleNext} disabled={isSubmitting}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button 
          type="button" 
          onClick={onFinalSubmit} 
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
