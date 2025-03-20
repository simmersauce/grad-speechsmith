
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
