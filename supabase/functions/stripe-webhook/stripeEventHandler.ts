
import Stripe from "https://esm.sh/stripe@13.3.0?target=deno";
import { processCompletedCheckout, triggerSpeechGeneration } from "./paymentProcessor.ts";
import { createResponse } from "./corsUtils.ts";

/**
 * Handle the checkout.session.completed event
 */
export async function handleCheckoutCompleted(session: any, supabaseUrl: string, supabaseKey: string) {
  console.log("Session details:", JSON.stringify({
    id: session.id,
    customer_email: session.customer_email,
    metadata: session.metadata,
    payment_status: session.payment_status
  }));
  
  try {
    // Process the checkout session with idempotency check
    const result = await processCompletedCheckout(session);
    console.log("Checkout processed successfully. Purchase ID:", result.purchaseId);
    
    if (result.alreadyProcessed) {
      console.log(`Session ${session.id} was already processed - skipping speech generation`);
      return true;
    }
    
    // Use background processing for the heavy work
    EdgeRuntime.waitUntil((async () => {
      try {
        const startTime = Date.now();
        console.log("Starting background speech generation for purchase:", result.purchaseId);
        
        await triggerSpeechGeneration(
          result.purchaseId, 
          result.formData, 
          result.customerEmail, 
          supabaseUrl, 
          supabaseKey,
          result.customerReference
        );
        
        const duration = Date.now() - startTime;
        console.log(`Speech generation completed in background after ${duration}ms for purchase:`, result.purchaseId);
      } catch (bgError) {
        console.error("Error in background speech generation:", bgError);
        console.error("Full error details:", JSON.stringify(bgError));
        // The error is logged but doesn't affect the webhook response
      }
    })());
    
    // Return immediately while background processing continues
    console.log("Webhook handler completed successfully, background processing started");
    return true;
  } catch (error) {
    console.error("Error processing checkout:", error);
    console.error("Full error details:", JSON.stringify(error));
    // We'll still return a 200 to Stripe to acknowledge receipt, but log the error
    return false;
  }
}

/**
 * Parse and validate the Stripe event
 */
export function parseStripeEvent(payload: string): any {
  try {
    return JSON.parse(payload);
  } catch (parseError) {
    console.error("Failed to parse webhook payload:", parseError);
    throw new Error(`Invalid JSON format: ${parseError.message}`);
  }
}

/**
 * Initialize Stripe client
 */
export function initializeStripe(stripeSecretKey: string): Stripe {
  return new Stripe(stripeSecretKey, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: '2023-10-16', // Specify the Stripe API version
  });
}
