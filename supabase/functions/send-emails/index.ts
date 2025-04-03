
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createResponse } from "./utils.ts";
import { determineCustomerReference } from "./database.ts";
import { sendEmailWithAttachments } from "./emailSender.ts";
import { initSentry } from "../shared/sentry.ts";

// Initialize Sentry for function
const sentry = initSentry("send-emails");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Send-emails function called");
    console.log("Request headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));
    
    // Add request context to Sentry
    sentry.setContext("request", {
      method: req.method,
      url: req.url,
    });
    
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("apikey");
    
    if (!authHeader && !apiKey) {
      console.error("Missing authentication headers");
      const error = new Error("Missing authorization header");
      sentry.captureException(error);
      return createResponse({ error: error.message }, 401);
    }
    
    let reqData;
    try {
      reqData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      sentry.captureException(parseError);
      return createResponse({ error: "Invalid JSON in request body" }, 400);
    }
    
    const { purchaseId, email, formData, speechVersions, customerReference: providedReference } = reqData;
    
    // Set request data in Sentry for context
    sentry.setContext("request_data", {
      purchaseId,
      email,
      providedReference,
      speechVersionsCount: speechVersions?.length || 0,
      formDataExists: !!formData
    });
    
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
      const error = new Error("Email service configuration error: Missing API key");
      sentry.captureException(error);
      throw error;
    } else {
      console.log("Resend API key is configured (ending with):", resendApiKey.slice(-4));
    }
    
    if (!email) {
      const error = new Error("Email address is required");
      sentry.captureException(error);
      throw error;
    }
    
    if (!speechVersions || !Array.isArray(speechVersions) || speechVersions.length === 0) {
      const error = new Error("Speech versions are required");
      sentry.captureException(error);
      throw error;
    }
    
    // Determine the customer reference
    const customerReference = await determineCustomerReference(purchaseId, providedReference);
    console.log("Using customer reference for emails:", customerReference);
    sentry.setTag("customer_reference", customerReference);
    
    // Send a single email with all speeches as PDF attachments
    console.log("Calling sendEmailWithAttachments function...");
    const emailResult = await sendEmailWithAttachments(email, formData, speechVersions, customerReference);
    console.log("Email sending completed with results:", JSON.stringify(emailResult));
    
    return createResponse({ 
      success: true,
      message: "Email with all speeches sent successfully",
      customerReference,
      emailResult
    });
    
  } catch (error) {
    console.error("Error in send-emails function:", error);
    
    // Capture the exception in Sentry
    const eventId = sentry.captureException(error);
    console.log(`Error tracked in Sentry with event ID: ${eventId}`);
    
    return createResponse({ 
      error: error.message || "Failed to send emails",
      sentryEventId: eventId
    }, 500);
  }
});
