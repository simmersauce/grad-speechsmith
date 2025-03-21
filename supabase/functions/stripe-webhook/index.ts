
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { corsHeaders, createResponse } from "../send-emails/utils.ts";
import { verifyStripeSignature } from "./signatureVerification.ts";
import { 
  initializeSupabase, 
  processCompletedCheckout, 
  triggerSpeechGeneration 
} from "./paymentProcessor.ts";

// Get environment variables
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

// Initialize Stripe
const stripe = new Stripe(stripeSecretKey || "", {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16', // Specify the Stripe API version
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204 
    });
  }

  try {
    console.log("Webhook endpoint called");
    console.log("HTTP Method:", req.method);
    console.log("Headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));
    
    // Check that required environment variables are set
    if (!stripeSecretKey) {
      console.error("Missing STRIPE_SECRET_KEY");
      return createResponse({ error: "Server configuration error: Missing Stripe key" }, 500);
    }
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      return createResponse({ error: "Server configuration error: Missing database credentials" }, 500);
    }

    // For webhook processing, a signature is required
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      console.error("Missing stripe-signature header");
      return createResponse({ error: "Missing Stripe signature" }, 400);
    }
    
    if (!endpointSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET");
      return createResponse({ error: "Server configuration error: Missing webhook secret" }, 500);
    }
    
    const body = await req.text();
    console.log("Received webhook payload. Validating signature...");
    
    // Manually verify the webhook signature
    const isValid = await verifyStripeSignature(body, signature, endpointSecret);
    
    if (!isValid) {
      console.error("Webhook signature verification failed");
      console.error("Signature:", signature);
      console.error("Secret ends with:", endpointSecret.slice(-4));
      return createResponse({ error: "Webhook Error: Signature verification failed" }, 400);
    }
    
    console.log("Signature verification succeeded");
    
    // Parse the event data
    const event = JSON.parse(body);
    console.log(`Received Stripe event: ${event.type}`);

    // Initialize Supabase client
    initializeSupabase(supabaseUrl, supabaseKey);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      try {
        // Process the checkout session
        const { purchaseId, customerEmail, formData, customerReference } = await processCompletedCheckout(session);
        console.log("Checkout processed successfully. Purchase ID:", purchaseId);
        
        // Generate the speeches
        await triggerSpeechGeneration(
          purchaseId, 
          formData, 
          customerEmail, 
          supabaseUrl, 
          supabaseKey,
          customerReference
        );
      } catch (error: any) {
        console.error("Error processing checkout:", error);
        // We'll still return a 200 to Stripe to acknowledge receipt, but log the error
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    return createResponse({ received: true });
  } catch (error: any) {
    console.error("Error in stripe-webhook function:", error);
    return createResponse({ error: error.message || "Webhook Error" }, 400);
  }
});
