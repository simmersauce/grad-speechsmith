
import { Lock } from "lucide-react";

export const SecurePaymentBadges = () => {
  return (
    <div className="mt-4 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Secure payment banner */}
        <div className="w-full max-w-md rounded-lg overflow-hidden">
          <img 
            src="/lovable-uploads/3f422b18-c60a-4fed-86db-02f3029de0c5.png" 
            alt="Guaranteed safe & secure checkout" 
            className="w-full"
          />
        </div>
        
        {/* Original badges as fallback if needed */}
        <div className="flex items-center justify-center space-x-3 mt-2 opacity-0 h-0">
          <img 
            src="https://res.cloudinary.com/dbiwj2oo8/image/upload/v1694863386/visa_vyxm2p.svg" 
            alt="Visa" 
            className="h-6"
          />
          <img 
            src="https://res.cloudinary.com/dbiwj2oo8/image/upload/v1694863386/mastercard_fbfeea.svg" 
            alt="Mastercard" 
            className="h-6"
          />
          <img 
            src="https://res.cloudinary.com/dbiwj2oo8/image/upload/v1694863385/amex_eawzp1.svg" 
            alt="American Express" 
            className="h-6"
          />
        </div>
      </div>
    </div>
  );
};

export default SecurePaymentBadges;
