
// CORS and response utility functions for Stripe webhook

// CORS headers for the webhook
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-test-mode',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Creates a standardized response with proper headers
 */
export function createResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

/**
 * Handles OPTIONS requests for CORS preflight
 */
export function handleCorsOptions() {
  return new Response(null, { 
    headers: corsHeaders,
    status: 204 
  });
}
