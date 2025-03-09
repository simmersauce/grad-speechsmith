
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Resend
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const resend = new Resend(resendApiKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { purchaseId, email, formData, speechVersions, customerReference } = await req.json();
    
    console.log("Received email request for:", email);
    console.log("Purchase ID:", purchaseId);
    console.log("Customer reference:", customerReference);
    
    let reference;
    
    // Handle the case when we're in test mode (purchaseId is a string starting with "test-")
    if (typeof purchaseId === 'string' && purchaseId.startsWith('test-')) {
      console.log("Test mode detected, using provided customer reference");
      reference = customerReference || `GSW-TEST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    } else {
      // Get the customer reference from the database
      try {
        const { data, error } = await supabase
          .from('speech_purchases')
          .select('customer_reference')
          .eq('id', purchaseId)
          .single();
          
        if (error) {
          console.error("Error fetching customer reference:", error);
          throw new Error("Could not fetch customer reference");
        }
        
        reference = data.customer_reference;
        console.log("Retrieved customer reference from database:", reference);
      } catch (error) {
        // If we can't get the reference from the database and it's provided in the request, use that
        if (customerReference) {
          reference = customerReference;
          console.log("Using provided customer reference:", reference);
        } else {
          console.error("Could not determine customer reference:", error);
          throw new Error("Could not determine customer reference");
        }
      }
    }
    
    if (!reference) {
      throw new Error("No customer reference available");
    }
    
    // Email sending logic would go here
    console.log(`Would send email to ${email} for reference ${reference} with ${speechVersions.length} speeches`);
    
    // For testing purposes, return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Email sending simulation successful",
        customerReference: reference
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error("Error in send-emails function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send emails" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
