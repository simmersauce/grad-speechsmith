import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface FormNavigationProps {
  activeTab: string;
  handlePrevious: () => void;
  handleNext: () => void;
  onFinalSubmit: () => void;
}

const FormNavigation = ({ activeTab, handlePrevious, handleNext, onFinalSubmit }: FormNavigationProps) => {
  return (
    <div className="flex justify-between mt-8">
      {activeTab !== "1" ? (
        <Button type="button" variant="outline" onClick={handlePrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
      ) : (
        <div></div>
      )}

      {activeTab !== "3" ? (
        <Button type="button" onClick={handleNext}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button type="button" onClick={onFinalSubmit}>
          Review Speech <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default FormNavigation;
