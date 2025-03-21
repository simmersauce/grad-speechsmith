
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
    console.log("Send-emails function called");
    console.log("Request headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));
    
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("apikey");
    
    if (!authHeader && !apiKey) {
      console.error("Missing authentication headers");
      return createResponse({ error: "Missing authorization header" }, 401);
    }
    
    let reqData;
    try {
      reqData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return createResponse({ error: "Invalid JSON in request body" }, 400);
    }
    
    const { purchaseId, email, formData, speechVersions, customerReference: providedReference } = reqData;
    
    console.log("Received email request for:", email);
    console.log("Purchase ID:", purchaseId);
    console.log("Provided customer reference:", providedReference);
    console.log("Speech versions count:", speechVersions?.length || 0);
    console.log("Request data:", JSON.stringify({
      email,
      purchaseId,
      customerReference: providedReference,
      speechVersionsCount: speechVersions?.length || 0,
      formDataExists: !!formData
    }));
    
    // Check if Resend API key is set
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set in environment variables");
      throw new Error("Email service configuration error: Missing API key");
    } else {
      console.log("Resend API key is configured (ending with):", resendApiKey.slice(-4));
    }
    
    if (!email) {
      throw new Error("Email address is required");
    }
    
    if (!speechVersions || !Array.isArray(speechVersions) || speechVersions.length === 0) {
      throw new Error("Speech versions are required");
    }
    
    // Determine the customer reference
    const customerReference = await determineCustomerReference(purchaseId, providedReference);
    console.log("Using customer reference for emails:", customerReference);
    
    // Send all emails (summary and individual speeches)
    console.log("Calling sendAllEmails function...");
    const emailResults = await sendAllEmails(email, formData, speechVersions, customerReference);
    console.log("Email sending completed with results:", JSON.stringify(emailResults));
    
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
