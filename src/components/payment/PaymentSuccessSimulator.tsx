
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEST_MODE } from "@/utils/testMode";

const PaymentSuccessSimulator = () => {
  const navigate = useNavigate();
  const [customerReference, setCustomerReference] = useState(`GSW-TEST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
  
  if (!TEST_MODE) return null;
  
  const goToPaymentSuccess = () => {
    // Create a dummy session ID for testing
    const sessionId = `cs_test_${Math.random().toString(36).substring(2, 15)}`;
    
    // Store the test reference in localStorage for PaymentSuccess to retrieve
    localStorage.setItem('test_customer_reference', customerReference);
    
    // Navigate to the payment success page with the test session ID
    navigate(`/payment-success?session_id=${sessionId}&test=true`);
  };
  
  return (
    <Card className="p-4 sm:p-6 max-w-md mx-auto my-4 bg-green-50 border-green-200">
      <h3 className="text-lg font-semibold mb-4">Payment Success Simulator</h3>
      <p className="text-sm text-green-800 mb-4">
        Test the payment success page with a custom reference number.
      </p>
      
      <div className="mb-4">
        <Label htmlFor="customer-reference" className="block text-sm font-medium mb-1">
          Customer Reference
        </Label>
        <Input
          id="customer-reference"
          value={customerReference}
          onChange={(e) => setCustomerReference(e.target.value)}
          className="w-full font-mono"
        />
      </div>
      
      <Button 
        onClick={goToPaymentSuccess}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        Simulate Successful Payment
      </Button>
    </Card>
  );
};

export default PaymentSuccessSimulator;
