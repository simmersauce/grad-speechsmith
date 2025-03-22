
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Beaker, ZapIcon } from "lucide-react";
import { getTestModeState, setTestModeState } from "@/utils/testMode";

interface TestModeSwitcherProps {
  onSubmitForm?: () => void;
}

const TestModeSwitcher = ({ onSubmitForm }: TestModeSwitcherProps) => {
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    // Load test mode state on component mount
    setIsTestMode(getTestModeState());
  }, []);

  const toggleTestMode = (enabled: boolean) => {
    setIsTestMode(enabled);
    setTestModeState(enabled);
    
    // Force reload to apply test mode changes
    window.location.reload();
  };

  return (
    <Card className="fixed bottom-4 right-4 p-4 z-50 bg-amber-50 border-amber-200 shadow-md w-auto flex flex-col space-y-3">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2">
          <Beaker className="h-4 w-4 text-amber-600" />
          <Label htmlFor="test-mode" className="font-medium text-amber-800">
            Test Mode
          </Label>
        </div>
        <Switch 
          id="test-mode" 
          checked={isTestMode} 
          onCheckedChange={toggleTestMode}
        />
      </div>
      
      {isTestMode && onSubmitForm && (
        <Button 
          size="sm" 
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={onSubmitForm}
        >
          <ZapIcon className="h-4 w-4 mr-2" />
          Quick Submit
        </Button>
      )}
    </Card>
  );
};

export default TestModeSwitcher;
