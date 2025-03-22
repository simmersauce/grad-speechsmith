
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-test-mode',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Get environment variables
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Initialize Supabase client
const supabase = createClient(supabaseUrl || "", supabaseKey || "");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204 
    });
  }

  try {
    console.log("Process payment function called");
    console.log("Request headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));
    
    // Check for test mode
    const testModeHeader = req.headers.get("x-test-mode");
    const isTestMode = testModeHeader === "true";
    
    if (isTestMode) {
      console.log("Running in test mode - bypassing Stripe API call");
      // Get request data
      const requestData = await req.json().catch(error => {
        console.error("Error parsing request JSON:", error);
        throw new Error("Invalid request format");
      });
      
      const { formData, email, customerEmail } = requestData;
      const finalEmail = customerEmail || email;
      
      // Validate request data
      if (!formData) {
        throw new Error("Missing form data");
      }
      
      if (!finalEmail) {
        throw new Error("Missing customer email");
      }
      
      // Return a mock response for test mode
      return new Response(
        JSON.stringify({ 
          sessionId: "test_session_" + Date.now(),
          url: `${req.headers.get("origin") || "https://lovable.dev"}/payment-success?session_id=test_session_id&test_mode=true`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    // Check that required environment variables are set
    if (!stripeSecretKey) {
      console.error("Missing STRIPE_SECRET_KEY");
      throw new Error("Server configuration error: Missing Stripe key");
    }
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      throw new Error("Server configuration error: Missing database credentials");
    }

    // Get request data
    const requestData = await req.json().catch(error => {
      console.error("Error parsing request JSON:", error);
      throw new Error("Invalid request format");
    });
    
    console.log("Request data:", JSON.stringify(requestData));
    
    // Extract data from the request
    const { formData, email, customerEmail } = requestData;
    
    // Use customerEmail or email (for backward compatibility)
    const finalEmail = customerEmail || email;

    // Validate request data
    if (!formData) {
      console.error("Missing form data");
      throw new Error("Missing form data");
    }

    if (!finalEmail) {
      console.error("Missing customer email - not found in either 'customerEmail' or 'email' field");
      throw new Error("Missing customer email");
    }

    console.log("Storing form data for:", finalEmail);

    // Store the form data in Supabase first
    const { data: storedData, error: storeError } = await supabase
      .from('pending_form_data')
      .insert({
        form_data: formData,
        customer_email: finalEmail
      })
      .select();

    if (storeError) {
      console.error("Error storing form data:", storeError);
      throw new Error(`Failed to store form data: ${storeError.message}`);
    }

    if (!storedData || storedData.length === 0) {
      console.error("No data returned after storing form data");
      throw new Error("No data returned after storing form data");
    }

    const formDataId = storedData[0].id;
    console.log("Form data stored with ID:", formDataId);

    // Create a payment session with Stripe using direct API call
    try {
      const origin = req.headers.get("origin") || "https://lovable.dev";
      console.log("Origin for redirect URLs:", origin);
      
      // Create Stripe checkout session using fetch instead of the Stripe library
      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'payment_method_types[]': 'card',
          'line_items[0][price_data][currency]': 'usd',
          'line_items[0][price_data][product_data][name]': 'Graduation Speech Package',
          'line_items[0][price_data][product_data][description]': '3 unique AI-generated speech drafts',
          'line_items[0][price_data][unit_amount]': '2999',
          'line_items[0][quantity]': '1',
          'mode': 'payment',
          'success_url': `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          'cancel_url': `${origin}/preview`,
          'customer_email': finalEmail,
          'metadata[formDataId]': formDataId.toString()
        })
      });

      if (!stripeResponse.ok) {
        const errorData = await stripeResponse.json();
        console.error("Stripe API error:", errorData);
        throw new Error(`Stripe API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const session = await stripeResponse.json();
      console.log("Stripe session created successfully:", session.id);
      console.log("Checkout URL:", session.url);

      if (!session.url) {
        throw new Error("Stripe session created but no redirect URL was provided");
      }

      // Return the session ID and URL for the client to use
      return new Response(
        JSON.stringify({ 
          sessionId: session.id,
          url: session.url
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      throw new Error(`Stripe error: ${stripeError.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Error in process-payment function:", error);
    
    // Return a properly formatted error response
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to process payment" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
