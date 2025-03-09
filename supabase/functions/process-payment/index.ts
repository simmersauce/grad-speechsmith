
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Get environment variables
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Initialize Stripe
const stripe = new Stripe(stripeSecretKey || "", {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16', // Specify the Stripe API version
});

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
    
    const { formData, customerEmail } = requestData;

    // Validate request data
    if (!formData) {
      console.error("Missing form data");
      throw new Error("Missing form data");
    }

    if (!customerEmail) {
      console.error("Missing customer email");
      throw new Error("Missing customer email");
    }

    console.log("Storing form data for:", customerEmail);

    // Store the form data in Supabase first
    const { data: storedData, error: storeError } = await supabase
      .from('pending_form_data')
      .insert({
        form_data: formData,
        customer_email: customerEmail
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

    // Create a payment session with Stripe
    try {
      const origin = req.headers.get("origin") || "https://lovable.dev";
      console.log("Origin for redirect URLs:", origin);
      
      // Create Stripe checkout session with explicit success and cancel URLs
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Graduation Speech Package',
                description: '3 unique AI-generated speech drafts',
              },
              unit_amount: 2999, // $29.99 in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/preview`,
        customer_email: customerEmail,
        metadata: {
          formDataId: formDataId.toString()
        }
      });

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
    } catch (stripeError: any) {
      console.error("Stripe error:", stripeError);
      throw new Error(`Stripe error: ${stripeError.message}`);
    }
  } catch (error: any) {
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
