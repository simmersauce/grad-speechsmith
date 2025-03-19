
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createResponse } from "./utils.ts";
import { determineCustomerReference } from "./database.ts";
import { sendAllEmails } from "./emailSender.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { purchaseId, email, formData, speechVersions, customerReference: providedReference } = await req.json();
    
    console.log("Received email request for:", email);
    console.log("Purchase ID:", purchaseId);
    console.log("Provided customer reference:", providedReference);
    console.log("Speech versions count:", speechVersions?.length || 0);
    
    if (!email) {
      throw new Error("Email address is required");
    }
    
    if (!speechVersions || !Array.isArray(speechVersions) || speechVersions.length === 0) {
      throw new Error("Speech versions are required");
    }
    
    // Determine the customer reference
    const customerReference = await determineCustomerReference(purchaseId, providedReference);
    
    // Send all emails (summary and individual speeches)
    const emailResults = await sendAllEmails(email, formData, speechVersions, customerReference);
    
    return createResponse({ 
      success: true,
      message: "Emails sent successfully",
      customerReference,
      emailResults
    });
    
  } catch (error: any) {
    console.error("Error in send-emails function:", error);
    
    return createResponse({ 
      error: error.message || "Failed to send emails" 
    }, 500);
  }
});
