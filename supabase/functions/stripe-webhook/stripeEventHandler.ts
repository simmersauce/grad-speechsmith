
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
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
    // Process the checkout session
    const { purchaseId, customerEmail, formData, customerReference } = await processCompletedCheckout(session);
    console.log("Checkout processed successfully. Purchase ID:", purchaseId);
    
    // Trigger speech generation without using nextTick or async patterns that rely on Node.js
    try {
      // Use direct await instead of process.nextTick or similar Node.js patterns
      await triggerSpeechGeneration(
        purchaseId, 
        formData, 
        customerEmail, 
        supabaseUrl, 
        supabaseKey,
        customerReference
      );
      console.log("Speech generation triggered successfully for purchase:", purchaseId);
    } catch (generationError) {
      console.error("Error triggering speech generation:", generationError);
      console.error("Full error details:", JSON.stringify(generationError));
      // We still return 200 to Stripe, but log the error in detail
    }
    
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
