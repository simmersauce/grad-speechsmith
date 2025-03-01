
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";

interface TabHeaderProps {
  activeTab: string;
}

const TabHeader = ({ activeTab }: TabHeaderProps) => {
  return (
    <TabsList className="grid grid-cols-3 mb-8">
      <TabsTrigger value="1" className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">
          {activeTab === "1" ? <CheckCircle2 className="w-5 h-5 text-primary" /> : "1"}
        </div>
        <span className="hidden sm:inline">About You</span>
      </TabsTrigger>
      <TabsTrigger value="2" className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">
          {parseInt(activeTab) > 1 ? <CheckCircle2 className="w-5 h-5 text-primary" /> : "2"}
        </div>
        <span className="hidden sm:inline">Speech Details</span>
      </TabsTrigger>
      <TabsTrigger value="3" className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm">
          {parseInt(activeTab) > 2 ? <CheckCircle2 className="w-5 h-5 text-primary" /> : "3"}
        </div>
        <span className="hidden sm:inline">Final Touches</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default TabHeader;
