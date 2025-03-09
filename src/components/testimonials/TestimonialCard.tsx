
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  text: string;
  type: string;
}

const TestimonialCard = ({ text, type }: TestimonialCardProps) => (
  <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
    <div className="flex mb-2">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      ))}
    </div>
    <p className="text-sm sm:text-base mb-4 italic">"{text}"</p>
    <p className="text-xs sm:text-sm font-medium text-primary">— {type} Speech</p>
  </Card>
);

export default TestimonialCard;
