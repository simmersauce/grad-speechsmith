
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
    
    // Log headers in a more readable way for debugging
    const headerEntries = Object.fromEntries(req.headers.entries());
    const sensitiveHeaders = ['authorization', 'apikey'];
    const safeHeaders = { ...headerEntries };
    
    // Redact sensitive headers in logs
    for (const header of sensitiveHeaders) {
      if (safeHeaders[header]) {
        safeHeaders[header] = safeHeaders[header].substring(0, 4) + '...';
      }
    }
    
    console.log("Headers:", JSON.stringify(safeHeaders));
    
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
    const testModeHeader = req.headers.get("x-test-mode");
    const isTestMode = testModeHeader === "true";
    
    let body;
    let event;
    
    // Special handling for test mode
    if (isTestMode) {
      console.log("Running in test mode - bypassing signature verification");
      body = await req.text();
      try {
        event = JSON.parse(body);
      } catch (parseError) {
        console.error("Failed to parse request body in test mode:", parseError);
        return createResponse({ error: "Invalid JSON format in test mode" }, 400);
      }
    } else {
      // Production mode - require signature
      if (!signature) {
        console.error("Missing stripe-signature header");
        return createResponse({ error: "Missing Stripe signature" }, 400);
      }
      
      if (!endpointSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET");
        return createResponse({ error: "Server configuration error: Missing webhook secret" }, 500);
      }
      
      body = await req.text();
      console.log("Received webhook payload length:", body.length);
      console.log("Payload first 100 chars:", body.substring(0, 100));
      console.log("Stripe signature length:", signature.length);
      console.log("Signature first chars:", signature.substring(0, 20));
      console.log("Webhook secret length:", endpointSecret.length);
      console.log("Webhook secret first/last chars:", 
        endpointSecret.substring(0, 3) + "..." + endpointSecret.slice(-3));
      
      // Manually verify the webhook signature
      try {
        const isValid = await verifyStripeSignature(body, signature, endpointSecret);
        
        if (!isValid) {
          console.error("Webhook signature verification failed");
          console.error("- Signature from header:", signature);
          console.error("- Secret ends with:", endpointSecret.slice(-4));
          console.error("- Payload length:", body.length);
          return createResponse({ error: "Webhook Error: Signature verification failed" }, 400);
        }
        
        console.log("Signature verification succeeded");
      } catch (verificationError: any) {
        console.error("Error during signature verification:", verificationError.message);
        return createResponse({ 
          error: `Webhook Error: Signature verification error: ${verificationError.message}` 
        }, 400);
      }
      
      // Parse the event data
      try {
        event = JSON.parse(body);
      } catch (parseError: any) {
        console.error("Failed to parse webhook payload:", parseError);
        return createResponse({ error: `Invalid JSON format: ${parseError.message}` }, 400);
      }
    }
    
    console.log(`Received Stripe event: ${event.type}`);

    // Initialize Supabase client
    try {
      initializeSupabase(supabaseUrl, supabaseKey);
    } catch (initError: any) {
      console.error("Failed to initialize Supabase client:", initError);
      return createResponse({ error: `Database initialization error: ${initError.message}` }, 500);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log("Session details:", JSON.stringify({
        id: session.id,
        customer_email: session.customer_email,
        metadata: session.metadata,
        payment_status: session.payment_status
      }));
      
      try {
        // Process the checkout session
        const { purchaseId, customerEmail, formData, customerReference } = await processCompletedCheckout(session);
        console.log("Checkout processed successfully. Purchase ID:", purchaseId);
        
        // Generate the speeches
        try {
          await triggerSpeechGeneration(
            purchaseId, 
            formData, 
            customerEmail, 
            supabaseUrl, 
            supabaseKey,
            customerReference
          );
          console.log("Speech generation triggered successfully for purchase:", purchaseId);
        } catch (generationError: any) {
          console.error("Error triggering speech generation:", generationError);
          console.error("Full error details:", JSON.stringify(generationError));
          // We still return 200 to Stripe, but log the error in detail
        }
      } catch (error: any) {
        console.error("Error processing checkout:", error);
        console.error("Full error details:", JSON.stringify(error));
        // We'll still return a 200 to Stripe to acknowledge receipt, but log the error
      }
    } else {
      console.log("Event type not handled:", event.type);
    }

    // Return a 200 response to acknowledge receipt of the event
    return createResponse({ received: true });
  } catch (error: any) {
    console.error("Critical error in stripe-webhook function:", error);
    console.error("Stack trace:", error.stack || "No stack trace available");
    return createResponse({ error: error.message || "Webhook Error" }, 400);
  }
});
