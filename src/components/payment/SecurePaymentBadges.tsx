
import { Lock } from "lucide-react";

export const SecurePaymentBadges = () => {
  return (
    <div className="mt-4 text-center">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <Lock size={16} className="text-gray-600" />
        <span className="text-xs text-gray-600 font-medium">Secure payment</span>
      </div>
      
      <div className="flex items-center justify-center space-x-3 mb-2">
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
      
      <div className="flex justify-center items-center mt-1">
        <span className="text-xs text-gray-500">Powered by</span>
        <img 
          src="https://res.cloudinary.com/dbiwj2oo8/image/upload/v1694863386/stripe_pxwhok.svg" 
          alt="Stripe" 
          className="h-4 ml-1"
        />
      </div>
    </div>
  );
};

export default SecurePaymentBadges;
