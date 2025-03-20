
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

// Initialize Supabase client
const supabase = createClient(supabaseUrl || "", supabaseKey || "");

// Function to generate a customer reference
const generateCustomerReference = () => {
  return `GSW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

// Function to manually verify Stripe webhook signature
async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    // Get timestamp and signatures from the signature header
    const signatureParts = signature.split(',');
    if (signatureParts.length < 2) {
      throw new Error("Invalid signature format");
    }
    
    // Extract the timestamp
    const timestampMatch = signatureParts[0].match(/^t=(\d+)$/);
    if (!timestampMatch) {
      throw new Error("Invalid timestamp in signature");
    }
    const timestamp = timestampMatch[1];
    
    // Extract the signature
    const sigMatch = signatureParts[1].match(/^v1=([a-f0-9]+)$/);
    if (!sigMatch) {
      throw new Error("Invalid signature value");
    }
    const expectedSignature = sigMatch[1];
    
    // Create a string to sign
    const signedPayload = `${timestamp}.${payload}`;
    
    // Decode the webhook secret to a Uint8Array
    const key = new TextEncoder().encode(secret);
    
    // Encode the payload
    const message = new TextEncoder().encode(signedPayload);
    
    // Create HMAC-SHA256
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    // Sign the payload
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      message
    );
    
    // Convert to hex string
    const signatureBytes = new Uint8Array(signatureBuffer);
    const computedSignature = Array.from(signatureBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    // Compare signatures
    return computedSignature === expectedSignature;
  } catch (err) {
    console.error("Error verifying signature:", err);
    return false;
  }
}

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
    
    // Check that required environment variables are set
    if (!stripeSecretKey) {
      console.error("Missing STRIPE_SECRET_KEY");
      throw new Error("Server configuration error: Missing Stripe key");
    }
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials");
      throw new Error("Server configuration error: Missing database credentials");
    }

    // For webhook processing, a signature is required
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      console.error("Missing stripe-signature header");
      throw new Error("Missing Stripe signature");
    }
    
    if (!endpointSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET");
      throw new Error("Server configuration error: Missing webhook secret");
    }
    
    const body = await req.text();
    console.log("Received webhook. Validating signature...");
    
    // Manually verify the webhook signature
    const isValid = await verifyStripeSignature(body, signature, endpointSecret);
    
    if (!isValid) {
      console.error("Webhook signature verification failed");
      return new Response(
        JSON.stringify({ error: "Webhook Error: Signature verification failed" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log("Signature verification succeeded");
    
    // Parse the event data
    const event = JSON.parse(body);
    console.log(`Received Stripe event: ${event.type}`);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log("Processing completed checkout session:", session.id);
      
      // Get the formDataId from the session metadata
      const formDataId = session.metadata?.formDataId;
      
      if (!formDataId) {
        console.error("No formDataId found in session metadata");
        throw new Error("No formDataId found in session metadata");
      }
      
      console.log("Looking up form data with ID:", formDataId);
      
      // Get the form data from our database
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_form_data')
        .select('*')
        .eq('id', formDataId)
        .single();
        
      if (pendingError) {
        console.error("Error retrieving pending form data:", pendingError);
        throw new Error(`Failed to retrieve form data: ${pendingError.message}`);
      }
      
      if (!pendingData) {
        console.error(`No pending form data found with ID: ${formDataId}`);
        throw new Error(`No pending form data found with ID: ${formDataId}`);
      }
      
      const formData = pendingData.form_data;
      const customerEmail = session.customer_email || pendingData.customer_email;
      
      console.log("Customer email:", customerEmail);
      
      // Generate a unique customer reference
      const customerReference = generateCustomerReference();
      console.log("Generated customer reference:", customerReference);
      
      // Save purchase information to database
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('speech_purchases')
        .insert({
          stripe_session_id: session.id,
          payment_status: 'completed',
          customer_email: customerEmail,
          amount_paid: session.amount_total / 100, // Convert from cents
          form_data: formData,
          customer_reference: customerReference,
          speeches_generated: false,
          emails_sent: false
        })
        .select();
          
      if (purchaseError) {
        console.error("Error saving purchase:", purchaseError);
        throw new Error(`Failed to save purchase information: ${purchaseError.message}`);
      }
      
      console.log("Purchase saved successfully:", purchaseData[0].id);
      
      // Update the pending_form_data record to mark it as processed
      const { error: updateError } = await supabase
        .from('pending_form_data')
        .update({ processed: true })
        .eq('id', formDataId);
        
      if (updateError) {
        console.error("Error updating pending form data:", updateError);
        // We'll continue even if this fails as it's not critical
      }
      
      // Generate the speeches using the generate-speeches endpoint
      try {
        console.log("Triggering speech generation for purchase:", purchaseData[0].id);
        
        const generateResponse = await fetch(`${supabaseUrl}/functions/v1/generate-speeches`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            formData,
            purchaseId: purchaseData[0].id,
            email: customerEmail
          })
        });
        
        if (!generateResponse.ok) {
          const errorText = await generateResponse.text();
          console.error("Failed to generate speeches:", errorText);
          throw new Error(`Failed to generate speeches: ${errorText}`);
        } else {
          console.log("Speeches generation triggered successfully");
        }
      } catch (generateError: any) {
        console.error("Error triggering speech generation:", generateError);
        // We'll continue even if speech generation fails, as we can try again later
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error("Error in stripe-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Webhook Error" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
