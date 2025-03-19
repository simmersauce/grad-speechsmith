
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a unique customer reference if one isn't provided
export const generateCustomerReference = () => {
  return `GSW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
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
