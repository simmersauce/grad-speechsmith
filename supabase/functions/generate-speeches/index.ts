
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createResponse, generateSpeechPrompt } from "./utils.ts";
import { supabase, saveSpeechVersion, updatePurchaseStatus } from "./database.ts";
import { generateSpeechWithOpenAI } from "./openai.ts";
import { sendEmailNotification } from "./emailNotifier.ts";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";
import { initSentry } from "../shared/sentry.ts";

// Initialize Sentry
const Sentry = initSentry("generate-speeches");

// Add a test error to verify Sentry is working (will be removed in production)
setTimeout(() => {
  try {
    throw new Error("Test Sentry error from generate-speeches function");
  } catch (error) {
    Sentry.captureException(error);
    console.log("Test error sent to Sentry");
  }
}, 1000);

// Initialize Supabase URL for function calls
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Generate-speeches function called");
    console.log("Request headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));
    
    // Authentication is optional for testing purposes
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("apikey");
    
    // Only log a warning instead of returning an error for missing authentication
    if (!authHeader && !apiKey) {
      console.log("Warning: No authentication headers provided. Proceeding for testing purposes.");
      Sentry.setTag("auth_missing", "true");
    }
    
    // Check OpenAI API key is available
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      console.error("Missing OPENAI_API_KEY");
      Sentry.captureException(new Error("Server configuration error: Missing OpenAI API key"));
      return createResponse({ error: "Server configuration error: Missing OpenAI API key" }, 500);
    }

    let reqData;
    try {
      reqData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      Sentry.captureException(parseError);
      return createResponse({ error: "Invalid JSON in request body" }, 400);
    }
    
    const { formData, purchaseId, email, customerReference } = reqData;
    
    // Set request context in Sentry
    Sentry.setContext("request_data", {
      hasPurchaseId: !!purchaseId,
      hasEmail: !!email,
      hasCustomerReference: !!customerReference,
      formDataFields: formData ? Object.keys(formData) : []
    });
    
    // Validate required fields
    if (!formData) {
      console.error("Missing form data in request");
      const error = new Error("Missing form data in request");
      Sentry.captureException(error);
      return createResponse({ error: error.message }, 400);
    }
    
    // Generate a valid UUID for testing
    const finalPurchaseId = purchaseId ? 
      (purchaseId.startsWith('test-') ? uuidv4() : purchaseId) : 
      uuidv4();
    
    console.log("Generating speeches for purchase:", finalPurchaseId);
    console.log("Using customer reference:", customerReference || "No reference provided");
    console.log("Using form data:", JSON.stringify(formData, null, 2));
    
    Sentry.setTag("purchase_id", finalPurchaseId);
    if (customerReference) {
      Sentry.setTag("customer_reference", customerReference);
    }
    
    // Generate 3 different speeches with the same tone
    const speechVersions = [];
    const tone = formData.tone || "inspirational"; // Default to inspirational if no tone provided

    for (let i = 0; i < 3; i++) {
      const versionNumber = i + 1;
      console.log(`Generating speech version ${versionNumber} with tone: ${tone}`);
      
      try {
        // Generate the prompt for this version
        const customizedPrompt = generateSpeechPrompt(formData, tone, versionNumber);

        // Call OpenAI API to generate the speech
        const generatedSpeech = await generateSpeechWithOpenAI(customizedPrompt);
        
        // Save the speech version to the database
        const savedSpeech = await saveSpeechVersion(finalPurchaseId, generatedSpeech, versionNumber, tone);
        
        speechVersions.push({
          id: savedSpeech.id,
          content: generatedSpeech,
          versionNumber: versionNumber,
          tone: tone,
          versionType: `Version ${versionNumber}`
        });
        
        console.log(`Successfully generated and saved speech version ${versionNumber}`);
      } catch (versionError) {
        console.error(`Error generating speech version ${versionNumber}:`, versionError);
        Sentry.setContext("version_error", {
          versionNumber,
          errorMessage: versionError.message,
        });
        Sentry.captureException(versionError);
        // Continue with other versions
      }
    }
    
    if (speechVersions.length === 0) {
      const error = new Error("Failed to generate any speech versions");
      Sentry.captureException(error);
      throw error;
    }

    // Update purchase record to mark speeches as generated
    try {
      await updatePurchaseStatus(finalPurchaseId, { speeches_generated: true });
    } catch (updateError) {
      console.error("Error updating purchase status:", updateError);
      Sentry.captureException(updateError);
      // Continue execution even if update fails
    }

    // Only call send-emails if we have an email
    if (email) {
      try {
        console.log(`Sending email notification to ${email}`);
        // Call the send-emails function to deliver the speeches
        await sendEmailNotification(
          supabaseUrl, 
          supabaseKey, 
          finalPurchaseId, 
          email, 
          formData, 
          speechVersions
        );
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        Sentry.captureException(emailError);
        // Continue execution even if email sending fails
      }
    } else {
      console.log("No email provided, skipping email notification");
    }

    return createResponse({ 
      success: true,
      speechVersions
    });
  } catch (error) {
    console.error("Error in generate-speeches function:", error);
    
    // Capture the error in Sentry
    const eventId = Sentry.captureException(error);
    console.log(`Error tracked in Sentry with event ID: ${eventId}`);
    
    return createResponse({ 
      error: error.message || "Failed to generate speeches",
      sentryEventId: eventId
    }, 500);
  }
});
