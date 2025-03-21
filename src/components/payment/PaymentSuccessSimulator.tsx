
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";
import { TEST_MODE } from "@/utils/testMode";

const PaymentSuccessSimulator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customerReference, setCustomerReference] = useState(() => {
    return localStorage.getItem('test_customer_reference') || `GSW-TEST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  });

  const handleSimulatePayment = () => {
    // Store reference in localStorage so we can use it in PaymentSuccess page
    localStorage.setItem('test_customer_reference', customerReference);
    
    toast({
      title: "Test Payment Initiated",
      description: "Simulating a successful payment...",
    });
    
    // Navigate to payment success page with test flag
    navigate("/payment-success?test=true");
  };

  // Only show in test mode
  if (!TEST_MODE) return null;

  return (
    <Card className="p-4 sm:p-6 max-w-md mx-auto my-8 bg-amber-50 border-amber-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <CreditCard className="w-5 h-5 mr-2" /> Payment Success Simulator
      </h3>
      <p className="text-sm text-amber-800 mb-4">
        This tool simulates a successful payment and redirects to the payment success page. Only visible in test mode.
      </p>
      
      <div className="mb-4">
        <Label htmlFor="customer-ref" className="block text-sm font-medium mb-1">
          Customer Reference
        </Label>
        <Input
          id="customer-ref"
          value={customerReference}
          onChange={(e) => setCustomerReference(e.target.value)}
          className="w-full font-mono"
        />
      </div>
      
      <Button 
        onClick={handleSimulatePayment}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        Simulate Successful Payment
      </Button>
    </Card>
  );
};

export default PaymentSuccessSimulator;
