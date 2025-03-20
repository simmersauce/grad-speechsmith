import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateCustomerReference } from "./utils.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Determine the customer reference (use provided one or get from database)
export async function determineCustomerReference(purchaseId: string, providedReference: string | null): Promise<string> {
  console.log("Determining customer reference. Purchase ID:", purchaseId);
  console.log("Provided reference:", providedReference);
  
  // If a reference is provided, use it
  if (providedReference) {
    console.log("Using provided customer reference:", providedReference);
    return providedReference;
  }
  
  try {
    // Otherwise, get it from the purchase record
    console.log("Fetching customer reference from database for purchase:", purchaseId);
    
    const { data, error } = await supabase
      .from('speech_purchases')
      .select('customer_reference')
      .eq('id', purchaseId)
      .maybeSingle();
      
    if (error) {
      console.error("Error retrieving customer reference:", error);
      throw new Error(`Failed to retrieve customer reference: ${error.message}`);
    }
    
    if (data?.customer_reference) {
      console.log("Found customer reference in database:", data.customer_reference);
      return data.customer_reference;
    }
    
    // Generate a fallback reference if none is found
    console.log("No customer reference found, generating a new one");
    const fallbackReference = generateCustomerReference();
    console.log("Generated fallback reference:", fallbackReference);
    
    return fallbackReference;
  } catch (error) {
    console.error("Error in determineCustomerReference:", error);
    
    // Generate a fallback reference in case of error
    const fallbackReference = generateCustomerReference();
    console.log("Generated fallback reference after error:", fallbackReference);
    
    return fallbackReference;
  }
}

// Update the purchase record to mark emails as sent
export async function updatePurchaseEmailStatus(purchaseId: string, sent: boolean = true): Promise<void> {
  console.log(`Updating purchase ${purchaseId} email status to ${sent}`);
  
  try {
    const { error } = await supabase
      .from('speech_purchases')
      .update({ emails_sent: sent })
      .eq('id', purchaseId);
      
    if (error) {
      console.error("Error updating purchase email status:", error);
      throw new Error(`Failed to update purchase email status: ${error.message}`);
    }
    
    console.log("Purchase email status updated successfully");
  } catch (error) {
    console.error("Error in updatePurchaseEmailStatus:", error);
    throw error;
  }
}
