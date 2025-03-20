
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to create consistent response objects
export const createResponse = (data: any, status = 200) => {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
};

// Generate a customer reference number
export const generateCustomerReference = (): string => {
  const prefix = 'GSW-';
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}${randomPart}`;
};

// Helper to extract and validate the Stripe signature
export const extractSignatureComponents = (signature: string): { timestamp: string, signatures: string[] } => {
  const components: { timestamp: string, signatures: string[] } = {
    timestamp: '',
    signatures: []
  };
  
  const parts = signature.split(',');
  for (const part of parts) {
    if (part.startsWith('t=')) {
      components.timestamp = part.substring(2);
    } else if (part.startsWith('v1=')) {
      components.signatures.push(part.substring(3));
    }
  }
  
  return components;
};
