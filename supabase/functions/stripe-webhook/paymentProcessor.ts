
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client
let supabase = null;

/**
 * Initialize the Supabase client
 * @param supabaseUrl Supabase URL
 * @param supabaseKey Supabase service role key
 */
export function initializeSupabase(supabaseUrl, supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Generate a unique customer reference
 * @returns A formatted customer reference string
 */
export const generateCustomerReference = () => {
  return `GSW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

/**
 * Process a completed checkout session
 * @param session The Stripe checkout session object
 * @returns The result of the processing operation
 */
export async function processCompletedCheckout(session) {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }
  
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
  
  return {
    purchaseId: purchaseData[0].id,
    customerEmail,
    formData,
    customerReference
  };
}

/**
 * Trigger speech generation for a purchase
 * @param purchaseId The ID of the purchase
 * @param formData The form data for generating speeches
 * @param email The customer's email
 * @param supabaseUrl The Supabase URL for the function endpoint
 * @param supabaseKey The Supabase service role key
 */
export async function triggerSpeechGeneration(
  purchaseId,
  formData,
  email,
  supabaseUrl,
  supabaseKey,
  customerReference
) {
  try {
    console.log("Triggering speech generation for purchase:", purchaseId);
    console.log("Using customer reference:", customerReference);
    
    // Fix the authorization header format by using proper bearer token format
    const generateResponse = await fetch(`${supabaseUrl}/functions/v1/generate-speeches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey  // Add apikey header as a fallback
      },
      body: JSON.stringify({
        formData,
        purchaseId,
        email,
        customerReference
      })
    });
    
    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error(`Failed to generate speeches: Status ${generateResponse.status}, Response: ${errorText}`);
      throw new Error(`Failed to generate speeches: ${generateResponse.status} - ${errorText}`);
    } else {
      const responseData = await generateResponse.json();
      console.log("Speeches generation response:", JSON.stringify(responseData));
    }
  } catch (generateError) {
    console.error("Error triggering speech generation:", generateError);
    // Log the error but continue
  }
}
