
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createResponse, generateSpeechPrompt } from "./utils.ts";
import { supabase, saveSpeechVersion, updatePurchaseStatus } from "./database.ts";
import { generateSpeechWithOpenAI } from "./openai.ts";
import { sendEmailNotification } from "./emailNotifier.ts";

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
    }
    
    // Check OpenAI API key is available
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      console.error("Missing OPENAI_API_KEY");
      return createResponse({ error: "Server configuration error: Missing OpenAI API key" }, 500);
    }

    let reqData;
    try {
      reqData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request JSON:", parseError);
      return createResponse({ error: "Invalid JSON in request body" }, 400);
    }
    
    const { formData, purchaseId, email, customerReference } = reqData;
    
    // Validate required fields
    if (!formData) {
      console.error("Missing form data in request");
      return createResponse({ error: "Missing form data in request" }, 400);
    }
    
    // For testing, allow missing purchaseId
    const finalPurchaseId = purchaseId || `test-${new Date().getTime()}`;
    
    console.log("Generating speeches for purchase:", finalPurchaseId);
    console.log("Using customer reference:", customerReference || "No reference provided");
    console.log("Using form data:", JSON.stringify(formData, null, 2));
    
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
        // Continue with other versions
      }
    }
    
    if (speechVersions.length === 0) {
      throw new Error("Failed to generate any speech versions");
    }

    // Update purchase record to mark speeches as generated
    await updatePurchaseStatus(finalPurchaseId, { speeches_generated: true });

    // Only call send-emails if we have an email
    if (email) {
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
    } else {
      console.log("No email provided, skipping email notification");
    }

    return createResponse({ 
      success: true,
      speechVersions
    });
  } catch (error) {
    console.error("Error in generate-speeches function:", error);
    return createResponse({ 
      error: error.message || "Failed to generate speeches" 
    }, 500);
  }
});
