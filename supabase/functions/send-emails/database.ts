
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateCustomerReference } from "./utils.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
export const supabase = createClient(supabaseUrl, supabaseKey);

// Determine the customer reference from various sources
export const determineCustomerReference = async (purchaseId: string, providedReference: string | undefined) => {
  let customerReference;
  
  // Use provided reference if available
  if (providedReference && typeof providedReference === 'string' && providedReference.trim() !== '') {
    customerReference = providedReference;
    console.log("Using provided customer reference:", customerReference);
  } 
  // Check if we have a test mode purchase ID
  else if (typeof purchaseId === 'string' && purchaseId.startsWith('test-')) {
    customerReference = `GSW-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    console.log("Test mode detected, generated reference:", customerReference);
  } 
  // Try to get reference from database
  else {
    try {
      const { data, error } = await supabase
        .from('speech_purchases')
        .select('customer_reference')
        .eq('id', purchaseId)
        .single();
        
      if (error) {
        console.error("Error fetching customer reference:", error);
        customerReference = generateCustomerReference();
        console.log("Generated new reference after DB error:", customerReference);
      } else if (data && data.customer_reference) {
        customerReference = data.customer_reference;
        console.log("Retrieved customer reference from database:", customerReference);
      } else {
        customerReference = generateCustomerReference();
        console.log("Generated new reference (no DB data):", customerReference);
      }
    } catch (error) {
      console.error("Could not determine customer reference:", error);
      customerReference = generateCustomerReference();
      console.log("Generated new reference after exception:", customerReference);
    }
  }
  
  if (!customerReference) {
    customerReference = generateCustomerReference();
    console.log("Using fallback generated reference:", customerReference);
  }
  
  return customerReference;
};
