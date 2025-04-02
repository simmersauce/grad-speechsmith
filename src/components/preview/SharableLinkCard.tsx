
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface SharableLinkCardProps {
  sharableLink: string;
  onCopyLink: () => void;
}

const SharableLinkCard = ({ sharableLink, onCopyLink }: SharableLinkCardProps) => {
  return (
    <div className="mb-6">
      <Card className="p-4 bg-primary/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium">Save this link to return later:</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[250px] sm:max-w-[400px]">{sharableLink}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCopyLink} 
            className="flex items-center gap-1 whitespace-nowrap"
          >
            <Share2 className="h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SharableLinkCard;
